import "server-only";
import { prisma } from "../db/prisma";
import { getEnv } from "../config/env";
import { tooManyRequests, unauthorized } from "../http/errors";
import { writeAudit } from "../services/audit";
import { verifyAgainstDummy, verifyPassword } from "./password";
import { createSession, type SessionUser } from "./session";

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const GENERIC_FAILURE = "Invalid email or password";

/**
 * Brute-force defence, database-backed so it holds across serverless instances.
 *  - Per account: N failures inside the window locks that email until the
 *    window passes. A successful login resets the count.
 *  - Per IP: a higher ceiling that slows credential stuffing across accounts.
 * While locked we do not record further attempts, so an attacker cannot extend
 * the lock indefinitely.
 *
 * Known trade-off: per-account lockout lets an attacker temporarily lock a
 * known email. Accepted for an admin tool with few accounts; the lock is short
 * and every attempt is audit logged.
 */
async function assertNotLocked(email: string, ip: string): Promise<void> {
  const { LOGIN_MAX_FAILURES: max, LOGIN_LOCKOUT_MINUTES: minutes } = getEnv();
  const windowMs = minutes * 60_000;
  const since = new Date(Date.now() - windowMs);

  const lastSuccess = await prisma.loginAttempt.findFirst({
    where: { email, success: true, createdAt: { gt: since } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const from = lastSuccess?.createdAt ?? since;

  const [recentFailures, ipFailures] = await Promise.all([
    prisma.loginAttempt.findMany({
      where: { email, success: false, createdAt: { gt: from } },
      orderBy: { createdAt: "desc" },
      take: max,
      select: { createdAt: true },
    }),
    prisma.loginAttempt.count({ where: { ip, success: false, createdAt: { gt: since } } }),
  ]);

  if (recentFailures.length >= max) {
    throw tooManyRequests((recentFailures[0].createdAt.getTime() + windowMs - Date.now()) / 1000);
  }
  if (ipFailures >= max * 4) throw tooManyRequests(windowMs / 1000);
}

export interface LoginResult {
  user: Omit<SessionUser, "sessionId">;
  token: string;
  maxAgeSeconds: number;
}

export async function login(input: {
  email: string;
  password: string;
  ip: string;
  userAgent: string | null;
  requestId?: string;
}): Promise<LoginResult> {
  const email = normalizeEmail(input.email);
  await assertNotLocked(email, input.ip);

  const user = await prisma.user.findUnique({ where: { email } });
  const usable = user && user.isActive && !user.deletedAt ? user : null;

  let valid = false;
  if (usable) valid = await verifyPassword(usable.passwordHash, input.password);
  else await verifyAgainstDummy(input.password); // equalise timing

  if (!usable || !valid) {
    await prisma.loginAttempt.create({ data: { email, ip: input.ip, success: false } });
    await writeAudit(prisma, {
      actor: { id: null, email },
      action: "login_failed",
      entity: "Session",
      ip: input.ip,
      requestId: input.requestId,
    });
    throw unauthorized(GENERIC_FAILURE);
  }

  const session = await createSession(usable.id, { ip: input.ip, userAgent: input.userAgent });
  await prisma.$transaction([
    prisma.user.update({ where: { id: usable.id }, data: { lastLoginAt: new Date() } }),
    prisma.loginAttempt.create({ data: { email, ip: input.ip, success: true } }),
  ]);
  await writeAudit(prisma, {
    actor: { id: usable.id, email: usable.email },
    action: "login",
    entity: "Session",
    ip: input.ip,
    requestId: input.requestId,
  });

  // Opportunistic housekeeping (indexed deletes; cheap).
  void prisma.loginAttempt
    .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 7 * 86_400_000) } } })
    .catch(() => undefined);
  void prisma.session
    .deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 7 * 86_400_000) } } })
    .catch(() => undefined);

  return {
    user: { id: usable.id, email: usable.email, name: usable.name, role: usable.role },
    token: session.token,
    maxAgeSeconds: session.maxAgeSeconds,
  };
}

import "server-only";
import type { Role } from "@prisma/client";
import { prisma } from "../db/prisma";
import { getEnv } from "../config/env";
import { generateToken, hashToken } from "./tokens";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  sessionId: string;
}

const TOUCH_INTERVAL_MS = 60_000; // avoid a write on every single request

export async function createSession(
  userId: string,
  meta: { ip?: string; userAgent?: string | null },
): Promise<{ token: string; expiresAt: Date; maxAgeSeconds: number }> {
  const env = getEnv();
  const token = generateToken();
  const maxAgeSeconds = env.SESSION_ABSOLUTE_HOURS * 3600;
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ip: meta.ip?.slice(0, 64),
      userAgent: meta.userAgent?.slice(0, 255) ?? null,
    },
  });
  return { token, expiresAt, maxAgeSeconds };
}

/** Resolve a raw cookie token to a live user, or null. Never throws on bad input. */
export async function getSessionUser(token: string): Promise<SessionUser | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;

  const now = Date.now();
  const idleMs = getEnv().SESSION_IDLE_MINUTES * 60_000;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() <= now) return null;
  if (now - session.lastUsedAt.getTime() > idleMs) return null;

  const { user } = session;
  if (!user.isActive || user.deletedAt) return null;

  if (now - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
    // Best effort; failing to bump activity must not fail the request.
    await prisma.session
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date(now) } })
      .catch(() => undefined);
  }

  return { id: user.id, email: user.email, name: user.name, role: user.role, sessionId: session.id };
}

export async function revokeSessionByToken(token: string): Promise<void> {
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessionsForUser(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

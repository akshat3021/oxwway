import "server-only";
import type { Role } from "@prisma/client";
import { prisma } from "../db/prisma";
import { normalizeEmail } from "../auth/login";
import { hashPassword, passwordProblems, verifyPassword } from "../auth/password";
import { revokeAllSessionsForUser } from "../auth/session";
import { conflict, forbidden, notFound, unauthorized, validationFailed } from "../http/errors";
import type { PageMeta } from "../http/response";
import type { ListQuery } from "../validation/common";
import { writeAudit } from "./audit";
import type { Ctx } from "./content";

/** The only user fields that ever leave the server. passwordHash never does. */
const PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

function assertPasswordAcceptable(password: string, email: string): void {
  const problems = passwordProblems(password, { email });
  if (problems.length > 0) {
    throw validationFailed(problems.map((message) => ({ path: "password", message })));
  }
}

export async function listUsers(query: ListQuery) {
  const where = {
    deletedAt: null,
    ...(query.q
      ? { OR: [{ email: { contains: query.q, mode: "insensitive" as const } }, { name: { contains: query.q, mode: "insensitive" as const } }] }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.user.findMany({ where, select: PUBLIC_SELECT, orderBy: { createdAt: "asc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
    prisma.user.count({ where }),
  ]);
  const meta: PageMeta = { page: query.page, pageSize: query.pageSize, total, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
  return { rows, meta };
}

export async function createUser(
  ctx: Ctx,
  input: { email: string; name: string; role: Role; password: string },
) {
  const email = normalizeEmail(input.email);
  assertPasswordAcceptable(input.password, email);
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw conflict("A user with this email already exists");
  }
  const passwordHash = await hashPassword(input.password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, name: input.name, role: input.role, passwordHash },
      select: PUBLIC_SELECT,
    });
    await writeAudit(tx, { actor: ctx.actor, action: "user_create", entity: "User", entityId: user.id, metadata: { role: user.role }, ip: ctx.ip, requestId: ctx.requestId });
    return user;
  });
}

/** Refuse any change that would leave the system with no active administrator. */
async function assertNotLastAdmin(targetId: string): Promise<void> {
  const others = await prisma.user.count({
    where: { role: "admin", isActive: true, deletedAt: null, id: { not: targetId } },
  });
  if (others === 0) throw conflict("This is the last active administrator and cannot be removed or demoted");
}

export async function updateUser(
  ctx: Ctx,
  id: string,
  input: { name?: string; role?: Role; isActive?: boolean },
) {
  const target = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!target) throw notFound();

  const isSelf = ctx.actor.id === id;
  if (isSelf && (input.role !== undefined || input.isActive !== undefined)) {
    throw forbidden("You cannot change your own role or active status");
  }
  const losesAdmin =
    target.role === "admin" && target.isActive && (input.role === "editor" || input.isActive === false);
  if (losesAdmin) await assertNotLastAdmin(id);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id }, data: input, select: PUBLIC_SELECT });
    await writeAudit(tx, { actor: ctx.actor, action: "user_update", entity: "User", entityId: id, metadata: { fields: Object.keys(input) }, ip: ctx.ip, requestId: ctx.requestId });
    return user;
  }).then(async (user) => {
    // Role change or deactivation must take effect immediately.
    if (input.role !== undefined || input.isActive === false) await revokeAllSessionsForUser(id);
    return user;
  });
}

export async function resetUserPassword(ctx: Ctx, id: string, newPassword: string): Promise<void> {
  const target = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!target) throw notFound();
  assertPasswordAcceptable(newPassword, target.email);
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { passwordHash, passwordChangedAt: new Date() } });
    await writeAudit(tx, { actor: ctx.actor, action: "password_reset", entity: "User", entityId: id, ip: ctx.ip, requestId: ctx.requestId });
  });
  await revokeAllSessionsForUser(id);
}

export async function changeOwnPassword(ctx: Ctx, currentPassword: string, newPassword: string): Promise<void> {
  const me = await prisma.user.findUnique({ where: { id: ctx.actor.id } });
  if (!me || !(await verifyPassword(me.passwordHash, currentPassword))) {
    throw unauthorized("Current password is incorrect");
  }
  assertPasswordAcceptable(newPassword, me.email);
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: me.id }, data: { passwordHash, passwordChangedAt: new Date() } });
    // Sign out every OTHER device; keep the one making this request.
    await tx.session.updateMany({
      where: { userId: me.id, revokedAt: null, id: { not: ctx.actor.sessionId } },
      data: { revokedAt: new Date() },
    });
    await writeAudit(tx, { actor: ctx.actor, action: "password_change", entity: "User", entityId: me.id, ip: ctx.ip, requestId: ctx.requestId });
  });
}

/**
 * Account erasure (privacy): the account is deactivated and its personal data
 * removed, but the row stays so audit history keeps referential meaning.
 * The actor's email is also scrubbed from past audit entries.
 */
export async function eraseUser(ctx: Ctx, id: string): Promise<void> {
  if (ctx.actor.id === id) throw forbidden("You cannot delete your own account");
  const target = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!target) throw notFound();
  if (target.role === "admin" && target.isActive) await assertNotLastAdmin(id);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        email: `erased-${id}@invalid.local`,
        name: "Deleted user",
        passwordHash: "!",
      },
    });
    await tx.auditLog.updateMany({ where: { actorId: id }, data: { actorEmail: "[erased]" } });
    await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    await writeAudit(tx, { actor: ctx.actor, action: "user_erase", entity: "User", entityId: id, ip: ctx.ip, requestId: ctx.requestId });
  });
}

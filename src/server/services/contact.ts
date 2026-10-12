import "server-only";
import { prisma } from "../db/prisma";
import { notFound } from "../http/errors";
import type { PageMeta } from "../http/response";
import type { ListQuery } from "../validation/common";
import { writeAudit } from "./audit";
import type { Ctx } from "./content";

export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
  website?: string;
}): Promise<void> {
  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (input.website && input.website.trim() !== "") return;
  await prisma.contactMessage.create({
    data: { name: input.name, email: input.email, message: input.message },
  });
}

export async function listMessages(query: ListQuery) {
  const where =
    query.status === "unread" ? { readAt: null } : query.status === "read" ? { readAt: { not: null } } : {};
  const [rows, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
    prisma.contactMessage.count({ where }),
  ]);
  const meta: PageMeta = { page: query.page, pageSize: query.pageSize, total, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
  return { rows, meta };
}

export async function setMessageRead(ctx: Ctx, id: number, read: boolean) {
  const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw notFound();
  const row = await prisma.contactMessage.update({ where: { id }, data: { readAt: read ? new Date() : null } });
  await writeAudit(prisma, { actor: ctx.actor, action: read ? "message_read" : "message_unread", entity: "ContactMessage", entityId: id, ip: ctx.ip, requestId: ctx.requestId });
  return row;
}

/** Hard delete: honours erasure requests for the sender's personal data. */
export async function deleteMessage(ctx: Ctx, id: number): Promise<void> {
  const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw notFound();
  await prisma.$transaction(async (tx) => {
    await tx.contactMessage.delete({ where: { id } });
    await writeAudit(tx, { actor: ctx.actor, action: "delete", entity: "ContactMessage", entityId: id, ip: ctx.ip, requestId: ctx.requestId });
  });
}

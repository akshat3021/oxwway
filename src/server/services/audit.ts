import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";

type Db = Pick<PrismaClient, "auditLog"> | Prisma.TransactionClient;

export interface AuditActor {
  id: string | null;
  email: string;
}

export interface AuditEvent {
  actor: AuditActor;
  action: string;
  entity: string;
  entityId?: string | number | null;
  /** Field NAMES or counts only. Never put values, PII or secrets here. */
  metadata?: Prisma.InputJsonValue;
  ip?: string;
  requestId?: string;
}

/**
 * Append an audit record. Pass a transaction client to make the entry commit
 * atomically with the change it describes.
 */
export async function writeAudit(db: Db, event: AuditEvent): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: event.actor.id,
      actorEmail: event.actor.email.slice(0, 254),
      action: event.action,
      entity: event.entity,
      entityId: event.entityId == null ? null : String(event.entityId),
      metadata: event.metadata,
      ip: event.ip?.slice(0, 64),
      requestId: event.requestId,
    },
  });
}

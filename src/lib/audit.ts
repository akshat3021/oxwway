// src/lib/audit.ts
// Simple helper to record audit log entries for admin actions.

import { prisma } from '@/lib/prisma';

export async function logAction(userEmail: string | null, action: string, model: string, recordId: number) {
  await prisma.auditLog.create({
    data: {
      userId: userEmail,
      action,
      model,
      recordId,
    },
  });
}

/**
 * Data-retention job. Run daily (cron / Vercel Cron / GitHub Actions schedule):
 *
 *   npm run db:prune
 *
 * Deletes only data that has outlived its purpose:
 *   - login attempts   older than 7 days   (brute-force window is minutes)
 *   - expired sessions older than 7 days
 *   - audit entries    older than AUDIT_RETENTION_DAYS (default 365)
 * Set AUDIT_RETENTION_DAYS=0 to keep the audit log forever.
 */
import "dotenv/config";
import { prisma } from "@/server/db/prisma";

const DAY = 86_400_000;

async function main(): Promise<void> {
  const now = Date.now();
  const retention = Number(process.env.AUDIT_RETENTION_DAYS ?? 365);

  const attempts = await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(now - 7 * DAY) } } });
  const sessions = await prisma.session.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date(now - 7 * DAY) } }, { revokedAt: { lt: new Date(now - 7 * DAY) } }] },
  });
  const audit =
    Number.isFinite(retention) && retention > 0
      ? await prisma.auditLog.deleteMany({ where: { createdAt: { lt: new Date(now - retention * DAY) } } })
      : { count: 0 };

  console.log(JSON.stringify({ prunedLoginAttempts: attempts.count, prunedSessions: sessions.count, prunedAuditEntries: audit.count, auditRetentionDays: retention || "forever" }));
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect().then(() => process.exit()));

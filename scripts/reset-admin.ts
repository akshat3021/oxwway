/**
 * Break-glass recovery when every administrator is locked out or has lost
 * their password. Requires shell access to the deployment's environment, so it
 * is only as available as your infrastructure access.
 *
 *   ADMIN_EMAIL=you@company.com NEW_PASSWORD='long passphrase here' npm run admin:reset
 *
 * Sets the password, re-activates the account, restores the admin role,
 * revokes all of the account's sessions, and writes an audit entry.
 */
import "dotenv/config";
import { normalizeEmail } from "@/server/auth/login";
import { hashPassword, passwordProblems } from "@/server/auth/password";
import { prisma } from "@/server/db/prisma";
import { writeAudit } from "@/server/services/audit";

async function main(): Promise<void> {
  const email = normalizeEmail(process.env.ADMIN_EMAIL ?? "");
  const password = process.env.NEW_PASSWORD ?? "";
  const problems = passwordProblems(password, { email });
  if (problems.length > 0) throw new Error(`NEW_PASSWORD is not acceptable: ${problems.join("; ")}`);

  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  if (!user) throw new Error(`No active-or-disabled account found for ${email}. (Erased accounts cannot be restored.)`);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password), passwordChangedAt: new Date(), isActive: true, role: "admin" },
    });
    await tx.session.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await tx.loginAttempt.deleteMany({ where: { email } }); // clear any lockout
    await writeAudit(tx, { actor: { id: null, email: "cli:reset-admin" }, action: "admin_reset", entity: "User", entityId: user.id });
  });
  console.log(`Password reset for ${email}. Account is active, role admin, all sessions revoked, lockout cleared.`);
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect().then(() => process.exit()));

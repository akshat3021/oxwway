/**
 * Creates the first administrator. Safe to run repeatedly: it never modifies
 * or overwrites an existing account.
 *
 *   SEED_ADMIN_EMAIL=you@company.com SEED_ADMIN_PASSWORD='long passphrase here' npm run db:seed
 */
import "dotenv/config";
import { hashPassword, passwordProblems } from "@/server/auth/password";
import { normalizeEmail } from "@/server/auth/login";
import { prisma } from "@/server/db/prisma";

async function main(): Promise<void> {
  if (process.env.APP_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "true") {
    throw new Error("Refusing to seed with APP_ENV=production. Set SEED_ALLOW_PRODUCTION=true if you really mean it.");
  }

  const email = normalizeEmail(process.env.SEED_ADMIN_EMAIL ?? "");
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";
  const name = (process.env.SEED_ADMIN_NAME ?? "Administrator").trim() || "Administrator";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("SEED_ADMIN_EMAIL is missing or not a valid email");
  const problems = passwordProblems(password, { email });
  if (problems.length > 0) throw new Error(`SEED_ADMIN_PASSWORD is not acceptable: ${problems.join("; ")}`);

  const existing = await prisma.user.count({ where: { deletedAt: null } });
  if (existing > 0) {
    console.log(`Skipped: ${existing} user(s) already exist. Manage users in Admin → Users.`);
    return;
  }

  await prisma.user.create({
    data: { email, name, role: "admin", passwordHash: await hashPassword(password) },
  });
  console.log(`Created administrator ${email}. Remove SEED_ADMIN_PASSWORD from your environment now.`);
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect().then(() => process.exit()));

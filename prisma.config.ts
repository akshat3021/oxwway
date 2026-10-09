import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration (migrate, generate, db execute).
 *
 * This file is for the Prisma CLI only. Application code must NOT import
 * it; the runtime client lives in src/lib/prisma.ts.
 *
 * `prisma generate` does not connect to a database, so DATABASE_URL is
 * allowed to be absent here (e.g. during `npm install` / `next build` on
 * a fresh CI machine). Commands that do need a database (migrate, db
 * execute) will fail with a clear connection error if it is missing.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    path: "prisma/migrations",
  },
});

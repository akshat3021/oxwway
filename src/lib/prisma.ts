import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma runtime client (singleton).
 *
 * This is the ONLY place the PrismaClient is created. API routes and
 * server code import `prisma` from "@/lib/prisma".
 *
 * Prisma CLI configuration (migrate, generate) lives separately in the
 * root-level prisma.config.ts — never import that file from app code.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  // Pool does not connect until the first query, so a missing URL at
  // build time (when Next.js imports route modules) will not crash the
  // build; it only surfaces as an error if a query actually runs.
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000, max: 5 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { logger } from "../logging/logger";

/**
 * Prisma runtime client (singleton). The ONLY place a PrismaClient is created.
 * The Prisma CLI (migrate/generate) is configured separately in the root
 * prisma.config.ts; never import that from application code.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  // Pool does not connect until the first query, so a missing URL at build
  // time cannot crash module evaluation; it surfaces on first use instead.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    max: Number(process.env.DB_POOL_MAX ?? 5),
  });
  // An idle client erroring (e.g. DB restart) must not crash the process.
  pool.on("error", (err) => logger.error({ err }, "idle database client error"));
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

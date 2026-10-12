import { prisma } from "@/server/db/prisma";
import { json } from "@/server/http/response";
import { publicRoute } from "@/server/http/route";
import { AppError } from "@/server/http/errors";

/** Readiness: dependencies are reachable. Use this for load-balancer checks. */
export const GET = publicRoute({}, async ({ log }) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    log.error({ err }, "readiness check failed");
    throw new AppError(503, "NOT_READY", "Database is not reachable");
  }
  return json({ status: "ready" });
});

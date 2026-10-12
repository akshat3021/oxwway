/**
 * Runs once when the server starts. Fails fast on bad configuration so a
 * misconfigured deployment never serves traffic, instead of failing on the
 * first request.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // `next build` imports this too; configuration is only required at runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { getEnv } = await import("@/server/config/env");
  const { logger } = await import("@/server/logging/logger");
  const env = getEnv(); // throws with a readable message if invalid
  logger.info({ appEnv: env.APP_ENV, nodeEnv: env.NODE_ENV }, "server starting");
}

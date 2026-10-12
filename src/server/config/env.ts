import "server-only";
import { z } from "zod";

/**
 * Single, validated source of truth for configuration.
 * Secrets come from the environment only; nothing here has a secret default.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Deployment tier. Distinct from NODE_ENV (staging runs NODE_ENV=production). */
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /** Canonical public origin, e.g. https://oxway.io. Used for CSRF origin checks. */
  APP_ORIGIN: z.string().url().optional(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  /** Sign the user out after this much inactivity. */
  SESSION_IDLE_MINUTES: z.coerce.number().int().min(5).max(7 * 24 * 60).default(240),
  /** Hard cap on session lifetime regardless of activity. */
  SESSION_ABSOLUTE_HOURS: z.coerce.number().int().min(1).max(24 * 30).default(12),
  LOGIN_MAX_FAILURES: z.coerce.number().int().min(3).max(20).default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().min(1).max(1440).default(15),
  /** Trust X-Forwarded-For (true behind Vercel / a reverse proxy). */
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${problems}`);
  }
  cached = parsed.data;
  return cached;
}

/** Test helper: force re-read of process.env. */
export function resetEnvForTests(): void {
  cached = undefined;
}

export const isProduction = (): boolean => process.env.NODE_ENV === "production";

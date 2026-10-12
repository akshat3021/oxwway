import "server-only";
import pino, { type Logger } from "pino";

/**
 * Structured JSON logger: one JSON object per line, ingestible by any log
 * platform unchanged. Sensitive keys are redacted at the logger level as a
 * safety net on top of never logging them in the first place.
 */
export const logger: Logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "test" ? "silent" : "info"),
  base: { service: "oxway", env: process.env.APP_ENV ?? process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: { level: (label) => ({ level: label }) },
  redact: {
    paths: [
      "password",
      "*.password",
      "currentPassword",
      "newPassword",
      "token",
      "*.token",
      "passwordHash",
      "*.passwordHash",
      "headers.cookie",
      "headers.authorization",
    ],
    censor: "[redacted]",
  },
});

export type { Logger };

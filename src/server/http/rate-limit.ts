import "server-only";
import { tooManyRequests } from "./errors";

/**
 * In-memory sliding-window limiter for low-risk public endpoints
 * (e.g. the contact form).
 *
 * TRADE-OFF: state is per server instance. On serverless each instance counts
 * separately, so this is a speed bump rather than a hard global guarantee.
 * Login throttling does NOT use this: it is database-backed (auth/login.ts).
 * Swap for Redis/Upstash if strict global limits are needed.
 */
const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): void {
  const windowStart = now - windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (recent.length >= limit) {
    hits.set(key, recent);
    throw tooManyRequests((recent[0] + windowMs - now) / 1000);
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_KEYS) {
    for (const [k, v] of hits) {
      if (v.every((t) => t <= windowStart)) hits.delete(k);
      if (hits.size <= MAX_KEYS / 2) break;
    }
  }
}

export function resetRateLimitsForTests(): void {
  hits.clear();
}

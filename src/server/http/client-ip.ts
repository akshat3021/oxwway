import "server-only";

/**
 * Best-effort client IP. Forwarded headers are only trusted behind a proxy
 * that overwrites them (Vercel does). Used for rate limiting and audit
 * context, never as an authentication factor.
 */
export function getClientIp(req: Request, trustProxy = true): string {
  if (trustProxy) {
    const first = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
    const real = req.headers.get("x-real-ip")?.trim();
    if (real) return real.slice(0, 64);
  }
  return "unknown";
}

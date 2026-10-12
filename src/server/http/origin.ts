import "server-only";
import { forbidden } from "./errors";
import { getEnv } from "../config/env";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const isUnsafeMethod = (method: string): boolean => !SAFE_METHODS.has(method.toUpperCase());

function configuredHost(): string | undefined {
  try {
    const o = getEnv().APP_ORIGIN;
    return o ? new URL(o).host : undefined;
  } catch {
    return undefined;
  }
}

/**
 * CSRF defence for cookie-authenticated endpoints, on top of SameSite=Lax
 * cookies: state-changing requests must originate from our own site.
 * Browsers always send `Origin` on non-GET fetches and page script cannot
 * forge it.
 */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");

  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      throw forbidden("Cross-site request blocked");
    }
    const allowed = new Set<string>();
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host) allowed.add(host);
    const configured = configuredHost();
    if (configured) allowed.add(configured);
    if (allowed.has(originHost)) return;
    throw forbidden("Cross-site request blocked");
  }

  // No Origin header: accept only if the browser itself attests same-origin.
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "none") return;
  throw forbidden("Cross-site request blocked");
}

import "server-only";
import { isProduction } from "../config/env";

/**
 * Production uses the `__Host-` prefix: browsers then enforce Secure, Path=/
 * and no Domain, which blocks subdomain cookie-fixation attacks.
 */
export const sessionCookieName = (): string =>
  isProduction() ? "__Host-oxway_session" : "oxway_session";

function attributes(maxAgeSeconds: number): string {
  const parts = ["Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAgeSeconds}`];
  if (isProduction()) parts.push("Secure");
  return parts.join("; ");
}

export const buildSessionCookie = (token: string, maxAgeSeconds: number): string =>
  `${sessionCookieName()}=${token}; ${attributes(maxAgeSeconds)}`;

export const buildClearedSessionCookie = (): string => `${sessionCookieName()}=; ${attributes(0)}`;

export function readSessionToken(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const name = sessionCookieName();
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      const value = part.slice(idx + 1).trim();
      return value.length > 0 && value.length <= 128 ? value : null;
    }
  }
  return null;
}

import { NextResponse, type NextRequest } from "next/server";

/**
 * UX-only gate: send visitors without a session cookie to the login page
 * before any admin UI is sent. This is NOT the security boundary. Real
 * authentication/authorisation happens server-side on every admin page
 * (admin/(panel)/layout.tsx) and every API route (server/http/route.ts),
 * both of which validate the session against the database.
 *
 * Runs only for /admin paths, so public pages pay nothing for it.
 */
const COOKIE_NAMES = ["__Host-oxway_session", "oxway_session"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const hasCookie = COOKIE_NAMES.some((name) => request.cookies.has(name));
  if (!hasCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

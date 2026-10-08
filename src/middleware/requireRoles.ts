// src/middleware/requireRoles.ts
// Middleware helper to enforce admin/editor role based access for API routes.
// It reads the "oxway_admin_session" cookie (JSON string { email, role }).
// Returns the parsed session object if authorized, otherwise redirects (page routes)
// or returns a JSON error (API routes).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function requireRoles(request: NextRequest, allowedRoles: string[]) {
  const cookie = request.cookies.get('oxway_admin_session');
  if (!cookie) {
    // No session – redirect for page routes, JSON error for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  let session: { email: string; role: string } | null = null;
  try {
    session = JSON.parse(cookie.value);
  } catch (_) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (!session || !allowedRoles.includes(session.role)) {
    // Forbidden – user exists but lacks role
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Authorized – return session for downstream handlers
  return session;
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireRoles } from '@/middleware/requireRoles';

export function proxy(request: NextRequest) {
  // Add security headers to all responses
  const headers = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers,
    },
  });

  // Strict Transport Security (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Control framing to prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (CSP)
  // Adjusted for WebGL/Three.js (unsafe-eval is sometimes needed by three.js/gsap, but we try to be strict)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data: https://images.unsplash.com;
    connect-src 'self';
    frame-ancestors 'none';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);

  // Example Admin Route Protection Check
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    // Server‑side protection for admin pages using requireRoles middleware
    // Allows both admin and editor roles to access the UI (specific pages may restrict further)
    const result = requireRoles(request, ['admin', 'editor']);
    if (result instanceof Response) {
      // result is a NextResponse (redirect or JSON error) – return it directly
      return result;
    }
    // If result is a session object, we continue rendering the request
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

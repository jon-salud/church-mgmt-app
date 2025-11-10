import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  // Skip middleware for auth-related routes and public pages
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/oauth') ||
    request.nextUrl.pathname.startsWith('/prayer')
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session_token')?.value;
  const demoToken = request.cookies.get('demo_token')?.value;

  // If has regular session token, allow access
  if (sessionToken) {
    return NextResponse.next();
  }

  // If has demo token, allow access
  if (
    demoToken &&
    ['demo-admin', 'demo-leader', 'demo-member', 'demo-new-admin'].includes(demoToken)
  ) {
    return NextResponse.next();
  }

  // No valid authentication, redirect to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - oauth (OAuth callback pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|oauth).*)',
  ],
};

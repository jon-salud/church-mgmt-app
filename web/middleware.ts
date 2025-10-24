import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  const demoToken = request.cookies.get('demo_token')?.value;

  // If using demo mode, allow access
  if (demoToken && ['demo-admin', 'demo-leader', 'demo-member'].includes(demoToken)) {
    return NextResponse.next();
  }

  // If has regular session token but not on Auth0 protected routes, allow access
  if (sessionToken && !request.nextUrl.pathname.startsWith('/pastoral-care')) {
    return NextResponse.next();
  }

  // For pastoral-care routes, check authentication
  if (request.nextUrl.pathname.startsWith('/pastoral-care')) {
    if (!sessionToken && !demoToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/pastoral-care/:path*'],
};

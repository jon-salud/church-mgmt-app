import { NextRequest, NextResponse } from 'next/server';

const isSafeRedirect = (redirect: string | null) => {
  if (!redirect) return false;
  return redirect.startsWith('/');
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const provider = url.searchParams.get('provider');
  const redirectParam = url.searchParams.get('redirect');

  if (!token) {
    const target = new URL('/(auth)/login', request.nextUrl.origin);
    target.searchParams.set('error', 'Missing token');
    return NextResponse.redirect(target);
  }

  const redirectPath = isSafeRedirect(redirectParam) ? redirectParam! : '/dashboard';

  const response = NextResponse.redirect(new URL(redirectPath, request.nextUrl.origin));
  response.cookies.set('session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  response.cookies.set('session_provider', provider ?? 'google', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  response.cookies.delete('demo_token');
  response.cookies.delete('demo_user_email');

  return response;
}

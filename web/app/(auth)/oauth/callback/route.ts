import { NextResponse } from 'next/server';

export async function GET() {
  // For static export, OAuth is not supported
  return NextResponse.redirect(new URL('/login', 'https://example.com'));
}

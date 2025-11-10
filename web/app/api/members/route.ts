import { NextRequest, NextResponse } from 'next/server';

// Mark this route as dynamic to allow searchParams
export const dynamic = 'force-dynamic';

const API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001/api/v1';

export async function GET(request: NextRequest) {
  try {
    // Forward all query params to the backend
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${API_BASE}/members${queryString ? `?${queryString}` : ''}`;

    // Get auth token from cookies
    const sessionToken = request.cookies.get('session_token')?.value;
    const demoToken = request.cookies.get('demo_token')?.value;
    const token =
      sessionToken || demoToken || (process.env.NODE_ENV === 'development' ? 'demo-admin' : null);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch members', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Members API route error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

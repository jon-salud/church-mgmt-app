'use server';

import { cookies } from 'next/headers';

const API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001/api/v1';

export async function GET(_request: Request, { params }: { params: { eventId: string } }) {
  const cookieStore = cookies();
  const token =
    cookieStore.get('session_token')?.value ||
    cookieStore.get('demo_token')?.value ||
    (process.env.NODE_ENV !== 'production' ? 'demo-admin' : '');

  if (!token) {
    return new Response('Missing credentials', { status: 401 });
  }

  const upstream = await fetch(
    `${API_BASE}/events/${encodeURIComponent(params.eventId)}/attendance.csv`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  );

  const payload = await upstream.text();
  if (!upstream.ok) {
    return new Response(payload, { status: upstream.status });
  }

  const disposition =
    upstream.headers.get('content-disposition') ||
    `attachment; filename="${params.eventId}-attendance.csv"`;

  return new Response(payload, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': disposition,
    },
  });
}

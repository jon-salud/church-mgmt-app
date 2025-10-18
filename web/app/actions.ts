'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

async function request<T>(path: string, init?: RequestInit) {
  const cookieStore = cookies();
  const token =
    cookieStore.get('session_token')?.value ||
    cookieStore.get('demo_token')?.value ||
    (process.env.NODE_ENV !== 'production' ? 'demo-admin' : '');
  const headers = new Headers(init?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete('session_token');
  cookieStore.delete('session_provider');
  cookieStore.delete('demo_token');
  cookieStore.delete('demo_user_email');
  redirect('/(auth)/login');
}

export async function markAnnouncementReadAction(id: string) {
  await request(`/announcements/${id}/read`, { method: 'POST' });
  revalidatePath('/announcements');
  revalidatePath('/dashboard');
}

export async function recordAttendanceAction(formData: FormData) {
  const eventId = String(formData.get('eventId'));
  const userId = String(formData.get('userId'));
  const status = String(formData.get('status')) as 'checkedIn' | 'absent' | 'excused';
  const note = formData.get('note') ? String(formData.get('note')) : undefined;
  await request(`/events/${eventId}/attendance`, {
    method: 'POST',
    body: JSON.stringify({ userId, status, note }),
  });
  revalidatePath('/events');
}

export async function recordContributionAction(formData: FormData) {
  const memberId = String(formData.get('memberId'));
  const amount = Number(formData.get('amount'));
  const date = String(formData.get('date'));
  const fundId = formData.get('fundId') ? String(formData.get('fundId')) : undefined;
  const method = (formData.get('method') as 'cash' | 'bank-transfer' | 'eftpos' | 'other') || 'cash';
  const note = formData.get('note') ? String(formData.get('note')) : undefined;
  await request('/giving/contributions', {
    method: 'POST',
    body: JSON.stringify({ memberId, amount, date, fundId, method, note }),
  });
  revalidatePath('/giving');
}

export async function demoLoginAction() {
  const cookieStore = cookies();
  cookieStore.set('session_token', 'demo-admin', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  cookieStore.set('session_provider', 'demo', {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  redirect('/dashboard');
}

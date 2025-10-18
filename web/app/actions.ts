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

export async function createMemberAction(formData: FormData) {
  const firstName = String(formData.get('firstName') ?? '');
  const lastName = String(formData.get('lastName') ?? '');
  const primaryEmail = String(formData.get('primaryEmail') ?? '');
  const phone = formData.get('phone') ? String(formData.get('phone')) : undefined;
  const address = formData.get('address') ? String(formData.get('address')) : undefined;
  const notes = formData.get('notes') ? String(formData.get('notes')) : undefined;
  const status = formData.get('status') ? String(formData.get('status')) : undefined;
  const role = formData.get('role') ? String(formData.get('role')) : 'Member';
  const payload = {
    firstName,
    lastName,
    primaryEmail,
    phone,
    address,
    notes,
    status,
    roles: [role].filter(Boolean),
  };
  const created = await request<any>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  revalidatePath('/members');
  const targetId: string | undefined = created?.id ?? created?.user?.id;
  if (targetId) {
    redirect(`/members/${targetId}`);
  }
  redirect('/members');
}

export async function updateMemberAction(formData: FormData) {
  const userId = String(formData.get('userId'));
  const payload: Record<string, unknown> = {};
  const fields: Array<[string, string | undefined]> = [
    ['firstName', formData.get('firstName') ? String(formData.get('firstName')) : undefined],
    ['lastName', formData.get('lastName') ? String(formData.get('lastName')) : undefined],
    ['primaryEmail', formData.get('primaryEmail') ? String(formData.get('primaryEmail')) : undefined],
    ['phone', formData.get('phone') ? String(formData.get('phone')) : undefined],
    ['address', formData.get('address') ? String(formData.get('address')) : undefined],
    ['notes', formData.get('notes') ? String(formData.get('notes')) : undefined],
  ];
  for (const [key, value] of fields) {
    if (value !== undefined) {
      payload[key] = value;
    }
  }
  const status = formData.get('status') ? String(formData.get('status')) : undefined;
  if (status) {
    payload.status = status;
  }
  const role = formData.get('role') ? String(formData.get('role')) : undefined;
  if (role) {
    payload.roles = [role];
  }
  await request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  revalidatePath(`/members/${userId}`);
  revalidatePath('/members');
}

export async function deleteMemberAction(formData: FormData) {
  const userId = String(formData.get('userId'));
  await request(`/users/${userId}`, { method: 'DELETE' });
  revalidatePath('/members');
  redirect('/members');
}

export async function addGroupMemberAction(formData: FormData) {
  const groupId = String(formData.get('groupId'));
  const userId = String(formData.get('userId'));
  const role = formData.get('role') ? String(formData.get('role')) : undefined;
  const status = formData.get('status') ? String(formData.get('status')) : undefined;
  await request(`/groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId, role, status }),
  });
  revalidatePath(`/groups/${groupId}`);
}

export async function updateGroupMemberAction(formData: FormData) {
  const groupId = String(formData.get('groupId'));
  const userId = String(formData.get('userId'));
  const role = formData.get('role') ? String(formData.get('role')) : undefined;
  const status = formData.get('status') ? String(formData.get('status')) : undefined;
  await request(`/groups/${groupId}/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role, status }),
  });
  revalidatePath(`/groups/${groupId}`);
}

export async function removeGroupMemberAction(formData: FormData) {
  const groupId = String(formData.get('groupId'));
  const userId = String(formData.get('userId'));
  await request(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' });
  revalidatePath(`/groups/${groupId}`);
}

const toIsoString = (value: string | undefined | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
};

const parseTags = (value: FormDataEntryValue | null) => {
  if (!value) return undefined;
  return String(value)
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
};

export async function createEventAction(formData: FormData) {
  const payload = {
    title: String(formData.get('title') ?? ''),
    description: formData.get('description') ? String(formData.get('description')) : undefined,
    startAt: toIsoString(String(formData.get('startAt') ?? '')),
    endAt: toIsoString(formData.get('endAt') ? String(formData.get('endAt')) : undefined),
    location: formData.get('location') ? String(formData.get('location')) : undefined,
    visibility: formData.get('visibility') ? String(formData.get('visibility')) : undefined,
    groupId: formData.get('groupId') ? String(formData.get('groupId')) : undefined,
    tags: parseTags(formData.get('tags')),
  };
  await request('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  revalidatePath('/events');
}

export async function updateEventAction(formData: FormData) {
  const eventId = String(formData.get('eventId'));
  const rawGroupId = formData.get('groupId');
  const payload = {
    title: formData.get('title') ? String(formData.get('title')) : undefined,
    description: formData.get('description') ? String(formData.get('description')) : undefined,
    startAt: toIsoString(formData.get('startAt') ? String(formData.get('startAt')) : undefined),
    endAt: toIsoString(formData.get('endAt') ? String(formData.get('endAt')) : undefined),
    location: formData.get('location') ? String(formData.get('location')) : undefined,
    visibility: formData.get('visibility') ? String(formData.get('visibility')) : undefined,
    groupId:
      rawGroupId === ''
        ? null
        : rawGroupId
        ? String(rawGroupId)
        : undefined,
    tags: parseTags(formData.get('tags')),
  };
  await request(`/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  revalidatePath('/events');
}

export async function deleteEventAction(formData: FormData) {
  const eventId = String(formData.get('eventId'));
  await request(`/events/${eventId}`, { method: 'DELETE' });
  revalidatePath('/events');
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

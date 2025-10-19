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
  const hasBody = init?.body !== undefined && init.body !== null;
  if (hasBody && !headers.has('Content-Type') && !(init?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
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

const toIsoString = (value: string | undefined | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
};

export async function createAnnouncementAction(formData: FormData) {
  const audience = (formData.get('audience') as 'all' | 'custom') || 'all';
  const publishInput = formData.get('publishAt') ? String(formData.get('publishAt')) : undefined;
  const expireInput = formData.get('expireAt') ? String(formData.get('expireAt')) : undefined;
  const payload: Record<string, unknown> = {
    title: String(formData.get('title') ?? ''),
    body: String(formData.get('body') ?? ''),
    audience,
    publishAt: toIsoString(publishInput) ?? new Date().toISOString(),
  };
  const expireIso = toIsoString(expireInput);
  if (expireIso) {
    payload.expireAt = expireIso;
  }
  if (audience === 'custom') {
    const groupIds = formData.getAll('groupIds').map(value => String(value)).filter(Boolean);
    payload.groupIds = groupIds;
  }
  await request('/announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  revalidatePath('/announcements');
  revalidatePath('/dashboard');
}

export async function updateAnnouncementAction(formData: FormData) {
  const announcementId = String(formData.get('announcementId'));
  const payload: Record<string, unknown> = {};
  const entries: Array<[string, FormDataEntryValue | null]> = [
    ['title', formData.get('title')],
    ['body', formData.get('body')],
  ];
  for (const [key, value] of entries) {
    if (value !== null) {
      const text = String(value);
      if (text.length > 0) {
        payload[key] = text;
      }
    }
  }

  const audienceRaw = formData.get('audience');
  const audience = audienceRaw ? String(audienceRaw) : undefined;
  if (audience) {
    payload.audience = audience;
  }

  const publishAtRaw = formData.get('publishAt');
  if (publishAtRaw) {
    const publishIso = toIsoString(String(publishAtRaw));
    if (publishIso) {
      payload.publishAt = publishIso;
    }
  }

  if (formData.has('expireAt')) {
    const expireValue = formData.get('expireAt');
    if (expireValue === null) {
      // no-op
    } else {
      const expireText = String(expireValue);
      if (expireText === '') {
        payload.expireAt = null;
      } else {
        const expireIso = toIsoString(expireText);
        if (expireIso) {
          payload.expireAt = expireIso;
        }
      }
    }
  }

  const groupIds = formData.getAll('groupIds').map(value => String(value)).filter(Boolean);
  const groupFieldTouched = formData.has('groupIdsMarker');
  if (audience === 'custom') {
    payload.groupIds = groupIds;
  } else if (audience && audience !== 'custom') {
    payload.groupIds = [];
  } else if (groupFieldTouched) {
    payload.groupIds = groupIds;
  }

  await request(`/announcements/${announcementId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
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
  revalidatePath('/dashboard');
}

export async function updateContributionAction(formData: FormData) {
  const contributionId = String(formData.get('contributionId'));
  const payload: Record<string, unknown> = {};
  const memberId = formData.get('memberId');
  if (memberId) {
    const value = String(memberId);
    if (value.length > 0) {
      payload.memberId = value;
    }
  }
  const amountRaw = formData.get('amount');
  if (amountRaw) {
    const amount = Number(amountRaw);
    if (!Number.isNaN(amount)) {
      payload.amount = amount;
    }
  }
  const dateRaw = formData.get('date');
  if (dateRaw) {
    const iso = toIsoString(String(dateRaw));
    if (iso) {
      payload.date = iso;
    }
  }
  const fundId = formData.get('fundId');
  if (fundId !== null) {
    const value = String(fundId);
    payload.fundId = value;
  }
  const method = formData.get('method');
  if (method) {
    payload.method = String(method);
  }
  const note = formData.get('note');
  if (note !== null) {
    payload.note = String(note);
  }

  await request(`/giving/contributions/${contributionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  revalidatePath('/giving');
  revalidatePath('/dashboard');
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

import { cookies } from 'next/headers';

const DEFAULT_API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
const DEFAULT_TOKEN = process.env.DEMO_DEFAULT_TOKEN || 'demo-admin';

type AuditLogActor = {
  id: string;
  primaryEmail: string;
  profile?: { firstName?: string; lastName?: string };
};

type AuditLogEntry = {
  id: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  diff?: Record<string, unknown>;
  actor?: AuditLogActor | null;
};

type AuditLogResponse = {
  items: AuditLogEntry[];
  meta: { total: number; page: number; pageSize: number };
};

const defaultHeaders = () => {
  const cookieStore = cookies();
  const token =
    cookieStore.get('session_token')?.value ||
    cookieStore.get('demo_token')?.value ||
    (process.env.NODE_ENV !== 'production' ? DEFAULT_TOKEN : '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

async function apiFetch<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  const defaults = defaultHeaders();
  Object.entries(defaults).forEach(([key, value]) => headers.set(key, value));
  const response = await fetch(`${DEFAULT_API_BASE}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }
  return (await response.json()) as T;
}

export const api = {
  async dashboardSummary() {
    return apiFetch<{ memberCount: number; groupCount: number; upcomingEvents: number; unreadAnnouncements: number; totalGivingLast30: number }>(
      '/dashboard/summary',
    );
  },
  async dashboardOverview() {
    return apiFetch<{
      church: { id: string; name: string; timezone: string };
      events: Array<{ id: string; title: string; startAt: string; location?: string }>;
      announcements: Array<{ id: string; title: string; publishAt: string }>;
      contributions: Array<{ id: string; amount: number; date: string; fundId?: string }>;
    }>('/dashboard/overview');
  },
  async currentUser() {
    return apiFetch<{ session: { token: string; provider: string }; user: any } | null>('/auth/me');
  },
  async members(search?: string) {
    const query = search ? `?q=${encodeURIComponent(search)}` : '';
    return apiFetch<Array<any>>(`/users${query}`);
  },
  async member(id: string) {
    return apiFetch<any>(`/users/${id}`);
  },
  async groups() {
    return apiFetch<Array<any>>('/groups');
  },
  async group(id: string) {
    return apiFetch<any>(`/groups/${id}`);
  },
  async events() {
    return apiFetch<Array<any>>('/events');
  },
  async event(id: string) {
    return apiFetch<any>(`/events/${id}`);
  },
  async announcements() {
    return apiFetch<Array<any>>('/announcements');
  },
  async funds() {
    return apiFetch<Array<any>>('/giving/funds');
  },
  async contributions(memberId?: string) {
    const query = memberId ? `?memberId=${encodeURIComponent(memberId)}` : '';
    return apiFetch<Array<any>>(`/giving/contributions${query}`);
  },
  async auditLogs(params?: {
    actorUserId?: string;
    entity?: string;
    entityId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) {
    const search = new URLSearchParams();
    if (params?.actorUserId) search.set('actorUserId', params.actorUserId);
    if (params?.entity) search.set('entity', params.entity);
    if (params?.entityId) search.set('entityId', params.entityId);
    if (params?.from) search.set('from', params.from);
    if (params?.to) search.set('to', params.to);
    if (params?.page && params.page > 1) search.set('page', String(params.page));
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    const query = search.toString();
    return apiFetch<AuditLogResponse>(`/audit${query ? `?${query}` : ''}`);
  },
};

export async function postToApi<T>(path: string, body?: unknown) {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

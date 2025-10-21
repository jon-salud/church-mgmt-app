import { PastoralCareTicket, PastoralCareComment } from './types';

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

async function apiFetch<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  headers.set('Content-Type', 'application/json');

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

export const clientApi = {
    async currentUser() {
        return apiFetch<{ session: { token: string; provider: string }; user: any } | null>('/auth/me');
    },
    async getSettings(churchId: string) {
        return apiFetch<any>(`/settings/${churchId}`);
    },
    async updateSettings(churchId: string, settings: any) {
        return apiFetch<any>(`/settings/${churchId}`, {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },
    async post<T>(path: string, body?: any) {
        return apiFetch<T>(path, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    },
    async put<T>(path: string, body?: any) {
        return apiFetch<T>(path, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    },
    async subscribeToNotifications(subscription: PushSubscription) {
        return apiFetch('/notifications/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
        });
    },
    async createPastoralCareTicket(dto: { title: string; description: string; priority: string }) {
        return apiFetch<PastoralCareTicket>('/pastoral-care/tickets', {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    },
    async createPastoralCareComment(ticketId: string, dto: { body: string }) {
        return apiFetch<PastoralCareComment>(`/pastoral-care/tickets/${ticketId}/comments`, {
            method: 'POST',
            body: JSON.stringify(dto),
        });
    },
};

import { PastoralCareTicket, PastoralCareComment } from './types';

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

async function apiFetch<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  headers.set('Content-Type', 'application/json');

  // Include demo token in Authorization header for testing environments
  // In production, authentication is handled via cookies
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.includes('localhost')
  ) {
    // For E2E tests, check if demo_token cookie is set and use that
    let demoToken = 'demo-admin';
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'demo_token') {
          demoToken = value;
          break;
        }
      }
    }
    headers.set('Authorization', `Bearer ${demoToken}`);
  }

  const response = await fetch(`${DEFAULT_API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include', // Required for cookie-based authentication in production
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
  async getRequestTypes(churchId: string) {
    return apiFetch<any[]>(`/settings/${churchId}/request-types`);
  },
  async createRequestType(
    churchId: string,
    name: string,
    hasConfidentialField: boolean,
    description?: string
  ) {
    return apiFetch<any>(`/settings/${churchId}/request-types`, {
      method: 'POST',
      body: JSON.stringify({ name, hasConfidentialField, description }),
    });
  },
  async reorderRequestTypes(churchId: string, ids: string[]) {
    return apiFetch<any>(`/settings/${churchId}/request-types/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ ids }),
    });
  },
  async updateRequestTypeStatus(churchId: string, id: string, status: 'active' | 'archived') {
    return apiFetch<any>(`/settings/${churchId}/request-types/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
  async createInvitation(
    churchId: string,
    email: string,
    roleId?: string,
    type?: 'team' | 'member'
  ) {
    return apiFetch<any>(`/invitations/${churchId}`, {
      method: 'POST',
      body: JSON.stringify({ email, roleId, type }),
    });
  },
  async bulkCreateInvitations(
    churchId: string,
    emails: string[],
    roleId?: string,
    type?: 'team' | 'member'
  ) {
    return apiFetch<any>(`/invitations/${churchId}/bulk`, {
      method: 'POST',
      body: JSON.stringify({ emails, roleId, type }),
    });
  },
  async listInvitations(churchId: string) {
    return apiFetch<any[]>(`/invitations/${churchId}`);
  },
  async bulkImportMembers(emails: string[]) {
    return apiFetch<any>('/users/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  },
  // Soft delete admin endpoints
  async hardDeleteUser(userId: string) {
    return apiFetch(`/users/${userId}/hard`, {
      method: 'DELETE',
    });
  },
  async recoverUser(userId: string) {
    return apiFetch(`/users/${userId}/undelete`, {
      method: 'POST',
    });
  },
  async listDeletedUsers() {
    return apiFetch<any[]>('/users/deleted');
  },
  async hardDeleteEvent(eventId: string) {
    return apiFetch(`/events/${eventId}/hard`, {
      method: 'DELETE',
    });
  },
  async recoverEvent(eventId: string) {
    return apiFetch(`/events/${eventId}/undelete`, {
      method: 'POST',
    });
  },
  async listDeletedEvents() {
    return apiFetch<any[]>('/events/deleted');
  },
  async hardDeleteRole(roleId: string) {
    return apiFetch(`/roles/${roleId}/hard`, {
      method: 'DELETE',
    });
  },
  async recoverRole(roleId: string) {
    return apiFetch(`/roles/${roleId}/undelete`, {
      method: 'POST',
    });
  },
  async listDeletedRoles() {
    return apiFetch<any[]>('/roles/deleted');
  },
  // Document Library methods
  async uploadDocument(
    file: any,
    metadata: { title: string; description?: string; roleIds: string[] }
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    formData.append('roleIds', JSON.stringify(metadata.roleIds));

    return apiFetch('/documents', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let the browser set it with boundary
    });
  },
  async updateDocument(
    docId: string,
    updates: { title?: string; description?: string; roleIds?: string[] }
  ) {
    return apiFetch(`/documents/${docId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
  async deleteDocument(docId: string) {
    return apiFetch(`/documents/${docId}`, {
      method: 'DELETE',
    });
  },
  async getDocumentDownloadUrl(docId: string) {
    return apiFetch<{ url: string; expiresAt: string }>(`/documents/${docId}/download-url`);
  },
  async hardDeleteDocument(docId: string) {
    return apiFetch(`/documents/${docId}/hard`, {
      method: 'DELETE',
    });
  },
  async recoverDocument(docId: string) {
    return apiFetch(`/documents/${docId}/undelete`, {
      method: 'POST',
    });
  },
  async listDeletedDocuments() {
    return apiFetch<any[]>('/documents/deleted');
  },
  // Groups soft delete methods
  async deleteGroup(groupId: string) {
    return apiFetch<{ success: boolean }>(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  },
  async undeleteGroup(groupId: string) {
    return apiFetch<{ success: boolean; reason?: string }>(`/groups/${groupId}/undelete`, {
      method: 'POST',
    });
  },
  async listDeletedGroups() {
    return apiFetch<any[]>('/groups/deleted/all');
  },
  async bulkDeleteGroups(ids: string[]) {
    return apiFetch<{ success: boolean; count: number }>('/groups/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
  async bulkUndeleteGroups(ids: string[]) {
    return apiFetch<{ success: boolean; count: number }>('/groups/bulk-undelete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
  // Announcements soft delete methods
  async deleteAnnouncement(announcementId: string) {
    return apiFetch<{ success: boolean }>(`/announcements/${announcementId}`, {
      method: 'DELETE',
    });
  },
  async undeleteAnnouncement(announcementId: string) {
    return apiFetch<{ success: boolean; reason?: string }>(
      `/announcements/${announcementId}/undelete`,
      {
        method: 'POST',
      }
    );
  },
  async listDeletedAnnouncements() {
    return apiFetch<any[]>('/announcements/deleted/all');
  },
  async bulkDeleteAnnouncements(ids: string[]) {
    return apiFetch<{ success: boolean; count: number }>('/announcements/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
  async bulkUndeleteAnnouncements(ids: string[]) {
    return apiFetch<{ success: boolean; count: number }>('/announcements/bulk-undelete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
};

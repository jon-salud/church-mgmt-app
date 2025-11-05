import { PastoralCareTicket, PastoralCareComment, HouseholdDependents } from './types';

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

async function apiFetch<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  // Only set Content-Type to application/json if body is present, not FormData/Blob/URLSearchParams, and Content-Type is not already set
  if (
    init?.body &&
    !headers.has('Content-Type') &&
    typeof init.body === 'string' // assume JSON.stringify has been called
  ) {
    headers.set('Content-Type', 'application/json');
  }

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

  // ==================== GIVING SOFT DELETE METHODS ====================

  // Fund soft delete operations
  async deleteFund(fundId: string) {
    return apiFetch<{ success: boolean; reason?: string }>(`/giving/funds/${fundId}`, {
      method: 'DELETE',
    });
  },

  async undeleteFund(fundId: string) {
    return apiFetch<{ success: boolean; reason?: string }>(`/giving/funds/${fundId}/undelete`, {
      method: 'POST',
    });
  },

  async listDeletedFunds() {
    return apiFetch<any[]>('/giving/funds/deleted/all');
  },

  async bulkDeleteFunds(ids: string[]) {
    return apiFetch<{ success: number; failed: Array<{ id: string; reason: string }> }>(
      '/giving/funds/bulk-delete',
      {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }
    );
  },

  async bulkUndeleteFunds(ids: string[]) {
    return apiFetch<{ success: number; failed: Array<{ id: string; reason: string }> }>(
      '/giving/funds/bulk-undelete',
      {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }
    );
  },

  // Contribution soft delete operations
  async deleteContribution(contributionId: string) {
    return apiFetch<{ success: boolean; reason?: string }>(
      `/giving/contributions/${contributionId}`,
      {
        method: 'DELETE',
      }
    );
  },

  async undeleteContribution(contributionId: string) {
    return apiFetch<{ success: boolean; reason?: string }>(
      `/giving/contributions/${contributionId}/undelete`,
      {
        method: 'POST',
      }
    );
  },

  async listDeletedContributions(filters?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.memberId) params.append('memberId', filters.memberId);
    if (filters?.fundId) params.append('fundId', filters.fundId);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    const query = params.toString();
    return apiFetch<any[]>(`/giving/contributions/deleted/all${query ? `?${query}` : ''}`);
  },

  async bulkDeleteContributions(ids: string[]) {
    return apiFetch<{ success: number; failed: Array<{ id: string; reason: string }> }>(
      '/giving/contributions/bulk-delete',
      {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }
    );
  },

  async bulkUndeleteContributions(ids: string[]) {
    return apiFetch<{ success: number; failed: Array<{ id: string; reason: string }> }>(
      '/giving/contributions/bulk-undelete',
      {
        method: 'POST',
        body: JSON.stringify({ ids }),
      }
    );
  },

  // Households soft delete methods
  async deleteHousehold(householdId: string) {
    return apiFetch<{ success: boolean }>(`/households/${householdId}`, {
      method: 'DELETE',
    });
  },

  async undeleteHousehold(householdId: string) {
    return apiFetch<{ success: boolean; reason?: string }>(`/households/${householdId}/undelete`, {
      method: 'POST',
    });
  },

  async bulkDeleteHouseholds(ids: string[]) {
    return apiFetch<{ success: boolean; count: number }>('/households/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  async bulkUndeleteHouseholds(ids: string[]) {
    return apiFetch<{ success: boolean; count: number }>('/households/bulk-undelete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  async hardDeleteHousehold(householdId: string) {
    return apiFetch<{ success: boolean }>(`/households/${householdId}/hard`, {
      method: 'DELETE',
    });
  },

  async getHouseholdDependents(householdId: string) {
    return apiFetch<HouseholdDependents>(`/households/${householdId}/dependents`);
  },

  // Children soft delete methods
  async deleteChild(childId: string) {
    return apiFetch<{ success: boolean }>(`/checkin/children/${childId}`, {
      method: 'DELETE',
    });
  },

  async undeleteChild(childId: string) {
    return apiFetch<{ success: boolean; reason?: string }>(
      `/checkin/children/${childId}/undelete`,
      {
        method: 'POST',
      }
    );
  },

  async bulkDeleteChildren(ids: string[]) {
    return apiFetch<{ success: boolean; count: number }>('/checkin/children/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  async bulkUndeleteChildren(ids: string[]) {
    return apiFetch<{ success: boolean; count: number }>('/checkin/children/bulk-undelete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  async hardDeleteChild(childId: string) {
    return apiFetch<{ success: boolean }>(`/checkin/children/${childId}/hard`, {
      method: 'DELETE',
    });
  },
};

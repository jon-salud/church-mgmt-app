/**
 * Members API Client
 * Phase 1: Discoverability & Speed
 */

export interface MemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];
  lastAttendance: string | null;
  groupsCount: number;
  groups: Array<{ id: string; name: string }>;
  badges: string[];
  createdAt: string;
}

export interface MemberListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
  role?: string;
  lastAttendance?: '7d' | '30d' | '60d' | '90d' | 'never';
  groupId?: string;
  hasEmail?: boolean;
  hasPhone?: boolean;
}

export interface MemberListResponse {
  data: MemberSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta: {
    queryTime: number;
    filters: Record<string, unknown>;
  };
}

/**
 * Build query string from member list parameters
 */
function buildQueryString(params: MemberListParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.role) searchParams.set('role', params.role);
  if (params.lastAttendance) searchParams.set('lastAttendance', params.lastAttendance);
  if (params.groupId) searchParams.set('groupId', params.groupId);
  if (params.hasEmail !== undefined) searchParams.set('hasEmail', String(params.hasEmail));
  if (params.hasPhone !== undefined) searchParams.set('hasPhone', String(params.hasPhone));

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Fetch members list with pagination, search, and filters
 * Client-side API call (requires auth token in cookies)
 */
export async function fetchMembers(params: MemberListParams = {}): Promise<MemberListResponse> {
  const queryString = buildQueryString(params);
  const response = await fetch(`/api/members${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch members: ${response.status} ${errorText}`);
  }

  return response.json();
}

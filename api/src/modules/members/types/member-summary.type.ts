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
  badges: string[];
  createdAt: string;
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

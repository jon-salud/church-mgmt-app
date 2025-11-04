export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  prayerCount: number;
}

export interface PastoralCareTicket {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  author: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  comments: PastoralCareComment[];
}

export interface PastoralCareComment {
  id: string;
  body: string;
  author: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}

export interface Role {
  churchId: string;
  roleId: string;
  role: string;
  slug?: string | null;
  permissions: string[];
}

export interface DashboardSummary {
  memberCount: number;
  groupCount: number;
  upcomingEvents: number;
  totalGivingLast30: number;
  careRequestCount?: number;
  volunteerNeeds?: number;
}

export interface DashboardEvent {
  id: string;
  title: string;
  startAt: string;
  location?: string;
  volunteerRoles?: Array<{
    filled: number;
    needed: number;
  }>;
}

export interface DashboardAnnouncement {
  id: string;
  title: string;
  publishAt: string;
}

export interface DashboardContribution {
  id: string;
  amount: number;
  date: string;
  fundId?: string;
}

export interface DashboardOverview {
  events: DashboardEvent[];
  announcements: DashboardAnnouncement[];
  contributions: DashboardContribution[];
}

export interface User {
  id: string;
  churchId: string;
  primaryEmail: string;
  status: 'active' | 'invited';
  profile: {
    firstName: string;
    lastName: string;
    [key: string]: any;
  };
  roles: Role[];
}

export interface RequestType {
  id: string;
  name: string;
  description: string;
  churchId: string;
  status: 'active' | 'archived';
  isBuiltIn: boolean;
  displayOrder: number;
  hasConfidentialField: boolean;
}

export interface Request {
  id: string;
  churchId: string;
  userId: string;
  requestTypeId: string;
  title: string;
  body: string;
  isConfidential: boolean;
  createdAt: string;
  status: 'Pending' | 'InProgress' | 'Closed';
  author?: {
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface Fund {
  id: string;
  name: string;
  description?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  fundId?: string | null;
  method: 'cash' | 'bank-transfer' | 'eftpos' | 'other';
  note?: string | null;
  deletedAt?: string | null;
  recordedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GivingSummary {
  totals: {
    overall: number;
    monthToDate: number;
    previousMonth: number;
    averageGift: number;
  };
  byFund: Array<{
    fundId: string | null;
    name: string;
    amount: number;
  }>;
  monthly: Array<{
    month: string;
    amount: number;
  }>;
}

export interface BulkOperationResult {
  success: number;
  failed: Array<{
    id: string;
    reason: string;
  }>;
}

export interface SuccessResponse {
  success: boolean;
  reason?: string;
}

export interface Household {
  id: string;
  churchId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  memberIds: string[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  householdId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  allergies?: string | null;
  medicalNotes?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdDependents {
  activeMemberCount: number;
  activeChildrenCount: number;
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

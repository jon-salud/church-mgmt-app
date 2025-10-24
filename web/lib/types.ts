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

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

export interface ObservabilityMetrics {
  eventStore: {
    appendCount: number;
    appendTotalDurationMs: number;
    appendAvgDurationMs: number;
    queryCount: number;
    queryTotalDurationMs: number;
    queryAvgDurationMs: number;
    rebuildCount: number;
    rebuildTotalDurationMs: number;
    rebuildAvgDurationMs: number;
  };
  circuitBreaker: {
    stateTransitionCount: number;
    failureCount: number;
    recoveryCount: number;
  };
  cqrs: {
    commandCount: number;
    commandTotalDurationMs: number;
    commandAvgDurationMs: number;
    queryCount: number;
    queryTotalDurationMs: number;
    queryAvgDurationMs: number;
  };
  timestamp: string;
}

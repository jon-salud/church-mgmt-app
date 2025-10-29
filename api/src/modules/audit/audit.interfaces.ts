import { ListAuditQueryDto } from './dto/list-audit-query.dto';

/**
 * Read model for audit log queries
 */
export interface AuditLogReadModel {
  id: string;
  churchId: string;
  actorUserId: string;
  actor?: {
    id: string;
    primaryEmail: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  diff?: Record<string, { previous: unknown; newValue: unknown }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Query result for audit logs with pagination
 */
export interface AuditLogQueryResult {
  items: AuditLogReadModel[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

/**
 * Interface for audit log read operations (CQRS Query side)
 */
export interface IAuditLogQueries {
  /**
   * List audit logs with filtering and pagination
   */
  listAuditLogs(query: ListAuditQueryDto): Promise<AuditLogQueryResult>;
}

/**
 * Interface for audit log write operations (CQRS Command side)
 */
export interface IAuditLogCommands {
  /**
   * Create a new audit log entry
   */
  createAuditLog(input: AuditLogCreateInput): Promise<AuditLogReadModel>;
}

/**
 * Input for creating audit log entries
 */
export interface AuditLogCreateInput {
  churchId?: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  diff?: Record<string, { previous: unknown; newValue: unknown }>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

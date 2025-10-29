import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';
import { IAuditLogQueries, AuditLogQueryResult } from './audit.interfaces';

/**
 * CQRS Query Service for audit log read operations
 */
@Injectable()
export class AuditLogQueryService implements IAuditLogQueries {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listAuditLogs(query: ListAuditQueryDto): Promise<AuditLogQueryResult> {
    const result = await this.db.listAuditLogs(query);
    // Transform to ensure correct types
    return {
      ...result,
      items: result.items.map(item => ({
        ...item,
        diff: item.diff as Record<string, { previous: unknown; newValue: unknown }> | undefined,
      })),
    };
  }
}

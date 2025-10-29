import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IAuditLogQueries, AuditLogQueryResult, AuditLogReadModel } from './audit.interfaces';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';

@Injectable()
export class AuditLogQueryService implements IAuditLogQueries {
  constructor(
    @Inject(DATA_STORE)
    private readonly dataStore: DataStore
  ) {}

  async listAuditLogs(query: ListAuditQueryDto): Promise<AuditLogQueryResult> {
    const auditLogs = await this.dataStore.listAuditLogs(query);

    // Transform to read models with actor resolution
    const items: AuditLogReadModel[] = await Promise.all(
      auditLogs.items.map(async (log: any) => ({
        id: log.id,
        churchId: log.churchId,
        actorUserId: log.actorUserId,
        actor: log.actorUserId ? await this.dataStore.getUserById(log.actorUserId) : undefined,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        summary: log.summary,
        diff: log.diff as Record<string, { previous: unknown; newValue: unknown }>,
        metadata: log.metadata,
        createdAt: log.createdAt,
      }))
    );

    return {
      items,
      meta: auditLogs.meta,
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IEventStore, EVENT_STORE } from '../../common/event-store.interface';
import { IAuditLogCommands, AuditLogReadModel, AuditLogCreateInput } from './audit.interfaces';

@Injectable()
export class AuditLogCommandService implements IAuditLogCommands {
  constructor(
    @Inject(DATA_STORE)
    private readonly dataStore: DataStore,
    @Inject(EVENT_STORE)
    private readonly eventStore: IEventStore
  ) {}

  async createAuditLog(input: AuditLogCreateInput): Promise<AuditLogReadModel> {
    const auditLog = await this.dataStore.createAuditLog(input);

    // Only append event if churchId is defined (required for event sourcing)
    if (input.churchId) {
      // Append event to event store for sourcing
      await this.eventStore.append({
        aggregateId: input.churchId,
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: {
          actorUserId: input.actorUserId,
          actor: input.actorUserId
            ? await this.dataStore.getUserById(input.actorUserId)
            : undefined,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          summary: input.summary,
          diff: input.diff,
          metadata: input.metadata,
        },
      });
    }

    // Transform to read model with actor resolution
    return {
      id: auditLog.id,
      churchId: auditLog.churchId,
      actorUserId: auditLog.actorUserId,
      actor: auditLog.actorUserId
        ? await this.dataStore.getUserById(auditLog.actorUserId)
        : undefined,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      summary: auditLog.summary,
      diff: auditLog.diff as Record<string, { previous: unknown; newValue: unknown }>,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
    };
  }
}

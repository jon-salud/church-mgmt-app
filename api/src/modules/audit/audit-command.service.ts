import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IAuditLogCommands, AuditLogReadModel, AuditLogCreateInput } from './audit.interfaces';

@Injectable()
export class AuditLogCommandService implements IAuditLogCommands {
  constructor(
    @Inject(DATA_STORE)
    private readonly dataStore: DataStore
  ) {}

  async createAuditLog(input: AuditLogCreateInput): Promise<AuditLogReadModel> {
    const auditLog = await this.dataStore.createAuditLog(input);

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

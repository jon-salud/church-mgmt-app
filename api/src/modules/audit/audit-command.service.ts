import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IAuditLogCommands, AuditLogCreateInput, AuditLogReadModel } from './audit.interfaces';

/**
 * CQRS Command Service for audit log write operations
 */
@Injectable()
export class AuditLogCommandService implements IAuditLogCommands {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async createAuditLog(input: AuditLogCreateInput): Promise<AuditLogReadModel> {
    const result = await this.db.createAuditLog(input);
    // Transform to read model format
    return {
      ...result,
      actor: await this.db.getUserById(result.actorUserId),
      diff: result.diff as Record<string, { previous: unknown; newValue: unknown }> | undefined,
    };
  }
}

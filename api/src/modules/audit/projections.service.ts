import { Injectable, Logger, Inject } from '@nestjs/common';
import { DomainEvent, IEventStore, EVENT_STORE } from '../../common/event-store.interface';

/**
 * Audit Log Projections Service
 *
 * Handles rebuilding read models from the event store by replaying events.
 * Used for:
 * - Consistency verification (audit log can be rebuilt from events)
 * - Disaster recovery (regenerate audit-log.json from events)
 * - Testing and validation
 */
@Injectable()
export class AuditProjectionsService {
  private readonly logger = new Logger(AuditProjectionsService.name);

  constructor(@Inject(EVENT_STORE) private readonly eventStore: IEventStore) {}

  /**
   * Rebuild audit log read model from events for a specific church.
   *
   * @param churchId The church ID to rebuild audit logs for
   * @returns Array of audit log entries in read model format
   */
  async rebuildAuditReadModel(churchId: string): Promise<object[]> {
    try {
      this.logger.log(`Rebuilding audit read model for church: ${churchId}`);

      // Query all audit events for this church
      const result = await this.eventStore.query({
        aggregateId: churchId,
        aggregateType: 'AuditLog',
      });

      // Transform events into read model format
      const readModel = result.events.map((event: DomainEvent) => ({
        id: event.id,
        churchId: event.aggregateId,
        actorUserId: event.data.actorUserId,
        actor: event.data.actor,
        action: event.data.action,
        entity: event.data.entity,
        entityId: event.data.entityId,
        summary: event.data.summary,
        diff: event.data.diff,
        metadata: event.data.metadata || {},
        createdAt: event.timestamp,
      }));

      this.logger.log(`Rebuilt ${readModel.length} audit entries for church: ${churchId}`);
      return readModel;
    } catch (error) {
      this.logger.error(
        `Failed to rebuild audit read model: ${error instanceof Error ? error.message : 'unknown error'}`
      );
      throw error;
    }
  }

  /**
   * Rebuild all audit events (all churches).
   * Used for full system recovery or migration.
   *
   * @returns Map of churchId -> audit read models
   */
  async rebuildAllAuditReadModels(): Promise<Map<string, object[]>> {
    try {
      this.logger.log('Rebuilding all audit read models');

      const result = await this.eventStore.query({
        aggregateType: 'AuditLog',
      });

      // Group events by churchId (aggregateId)
      const byChurch = new Map<string, object[]>();

      for (const event of result.events) {
        if (!byChurch.has(event.aggregateId)) {
          byChurch.set(event.aggregateId, []);
        }

        const entries = byChurch.get(event.aggregateId)!;
        entries.push({
          id: event.id,
          churchId: event.aggregateId,
          actorUserId: event.data.actorUserId,
          actor: event.data.actor,
          action: event.data.action,
          entity: event.data.entity,
          entityId: event.data.entityId,
          summary: event.data.summary,
          diff: event.data.diff,
          metadata: event.data.metadata || {},
          createdAt: event.timestamp,
        });
      }

      this.logger.log(`Rebuilt audit data for ${byChurch.size} churches`);
      return byChurch;
    } catch (error) {
      this.logger.error(
        `Failed to rebuild all audit read models: ${error instanceof Error ? error.message : 'unknown error'}`
      );
      throw error;
    }
  }

  /**
   * Get event count for audit logs (used for monitoring).
   */
  async getAuditEventCount(churchId?: string): Promise<number> {
    const result = await this.eventStore.query({
      aggregateId: churchId,
      aggregateType: 'AuditLog',
    });
    return result.totalCount;
  }
}

import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IEventStore, EVENT_STORE } from '../../common/event-store.interface';
import { CACHE_STORE, ICacheStore } from '../../common/cache-store.interface';
import { IAuditLogCommands, AuditLogReadModel, AuditLogCreateInput } from './audit.interfaces';
import { AuditLogQueryService } from './audit-query.service';
import { ObservabilityService } from '../../observability/observability.service';
import { OpenTelemetryService } from '../opentelemetry/opentelemetry.service';

@Injectable()
export class AuditLogCommandService implements IAuditLogCommands {
  private readonly logger = new Logger(AuditLogCommandService.name);

  constructor(
    @Inject(DATA_STORE)
    private readonly dataStore: DataStore,
    @Inject(EVENT_STORE)
    private readonly eventStore: IEventStore,
    @Inject(CACHE_STORE)
    private readonly cacheStore: ICacheStore,
    private readonly auditQueryService: AuditLogQueryService,
    private readonly observability: ObservabilityService,
    private readonly otelService: OpenTelemetryService
  ) {}

  async createAuditLog(input: AuditLogCreateInput): Promise<AuditLogReadModel> {
    // Start OpenTelemetry span for command
    const tracer = this.otelService.tracer;
    const span = tracer.startSpan('audit.createAuditLog', {
      attributes: {
        entity: input.entity,
        entityId: input.entityId,
        action: input.action,
      },
    });
    const startTime = Date.now();

    try {
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

      // Invalidate cache since new audit log was created
      await this.auditQueryService.invalidateCache();

      // Transform to read model with actor resolution
      const result: AuditLogReadModel = {
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

      // Record successful command
      const durationMs = Date.now() - startTime;
      span.setStatus({ code: 1 }); // OK
      span.end();
      this.observability.recordCQRSCommand('createAuditLog', durationMs, true);

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: (error as Error).message }); // ERROR
      span.end();
      this.observability.recordCQRSCommand('createAuditLog', durationMs, false);
      throw error;
    }
  }
}

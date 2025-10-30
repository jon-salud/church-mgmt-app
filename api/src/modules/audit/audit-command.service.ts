import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
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
    @Inject(AuditLogQueryService)
    private readonly auditQueryService: AuditLogQueryService,
    @Inject(ObservabilityService)
    private readonly observability: ObservabilityService,
    @Optional()
    @Inject(OpenTelemetryService)
    private readonly otelService: OpenTelemetryService
  ) {}

  async createAuditLog(input: AuditLogCreateInput): Promise<AuditLogReadModel> {
    // Start a span for the operation. Prefer ObservabilityService (legacy span API) so
    // unit tests that mock observability will be exercised. Fall back to OpenTelemetry tracer
    // if ObservabilityService isn't available.
    let otelSpan: any = null;
    let observabilitySpanId: string | undefined;
    const startTime = Date.now();

    if (this.observability?.startSpan) {
      observabilitySpanId = this.observability.startSpan('audit.createAuditLog', {
        entity: input.entity,
        entityId: input.entityId,
        action: input.action,
      });
    } else {
      const tracer = (this.otelService && this.otelService.tracer) || {
        startSpan: () => ({ setStatus: () => {}, end: () => {}, recordException: () => {} }),
      };
      otelSpan = tracer.startSpan('audit.createAuditLog', {
        attributes: {
          entity: input.entity,
          entityId: input.entityId,
          action: input.action,
        },
      });
    }

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
      } else {
        this.logger.warn(
          `Skipping event store append for audit log creation - churchId is required but not provided. Entity: ${input.entity}, EntityId: ${input.entityId}, Action: ${input.action}`
        );
      }

      // Invalidate cache since new audit log was created (guard in case the test
      // module didn't provide the method to avoid throwing during CI/Vitest runs)
      try {
        // eslint-disable-next-line no-console
        console.log('DEBUG: auditQueryService typeof:', typeof this.auditQueryService);
        // eslint-disable-next-line no-console
        console.log('DEBUG: auditQueryService raw:', this.auditQueryService);
        // eslint-disable-next-line no-console
        console.log(
          'DEBUG: auditQueryService.invalidateCache typeof:',
          typeof (this.auditQueryService as any).invalidateCache
        );
        this.logger.debug(
          `invalidateCache exists? ${Boolean((this.auditQueryService as any)?.invalidateCache)}`
        );
        if ((this.auditQueryService as any)?.invalidateCache) {
          await (this.auditQueryService as any).invalidateCache();
        }
      } catch (e) {
        this.logger.warn('Error calling auditQueryService.invalidateCache', (e as Error).message);
      }

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
      if (observabilitySpanId) {
        const spanResult = this.observability.endSpan(observabilitySpanId, 'success');
        this.observability?.recordCQRSCommand?.(
          'createAuditLog',
          spanResult.durationMs ?? durationMs,
          true
        );
      } else if (otelSpan) {
        otelSpan.setStatus({ code: 1 }); // OK
        otelSpan.end();
        this.observability?.recordCQRSCommand?.('createAuditLog', durationMs, true);
      } else {
        this.observability?.recordCQRSCommand?.('createAuditLog', durationMs, true);
      }

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      if (observabilitySpanId) {
        const spanResult = this.observability.endSpan(
          observabilitySpanId,
          'error',
          (error as Error).message
        );
        this.observability?.recordCQRSCommand?.(
          'createAuditLog',
          spanResult.durationMs ?? durationMs,
          false
        );
      } else if (otelSpan) {
        otelSpan.recordException(error as Error);
        otelSpan.setStatus({ code: 2, message: (error as Error).message }); // ERROR
        otelSpan.end();
        this.observability?.recordCQRSCommand?.('createAuditLog', durationMs, false);
      } else {
        this.observability?.recordCQRSCommand?.('createAuditLog', durationMs, false);
      }
      throw error;
    }
  }
}

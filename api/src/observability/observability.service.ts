import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { OpenTelemetryService } from '../modules/opentelemetry/opentelemetry.service';
import { ObservabilityMetrics } from '../types';

/**
 * Observability Service
 *
 * Provides centralized metrics collection, span tracking, and monitoring
 * for circuit breaker, event store, and CQRS operations using OpenTelemetry.
 *
 * Metrics tracked:
 * - Event store: append duration, query count, rebuild time
 * - Circuit breaker: state transitions, failure counts, recovery time
 * - CQRS: command execution time, query execution time
 */
@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  // OpenTelemetry instruments
  private eventStoreAppendDuration: any;
  private eventStoreAppendCount: any;
  private eventStoreQueryDuration: any;
  private eventStoreQueryCount: any;
  private eventStoreRebuildDuration: any;
  private eventStoreRebuildCount: any;

  private circuitBreakerStateTransitions: any;
  private circuitBreakerFailures: any;
  private circuitBreakerRecoveries: any;

  private cqrsCommandDuration: any;
  private cqrsCommandCount: any;
  private cqrsQueryDuration: any;
  private cqrsQueryCount: any;

  // Backward compatibility: maintain old metrics structure for getMetrics()
  private legacyMetrics = {
    eventStore: {
      appendCount: 0,
      appendTotalDurationMs: 0,
      queryCount: 0,
      queryTotalDurationMs: 0,
      rebuildCount: 0,
      rebuildTotalDurationMs: 0,
    },
    circuitBreaker: {
      stateTransitionCount: 0,
      failureCount: 0,
      recoveryCount: 0,
    },
    cqrs: {
      commandCount: 0,
      commandTotalDurationMs: 0,
      queryCount: 0,
      queryTotalDurationMs: 0,
    },
  };

  // Span context for backward compatibility
  private spans: Map<string, any> = new Map();

  constructor(
    @Optional()
    @Inject(OpenTelemetryService)
    private readonly otelService?: OpenTelemetryService
  ) {
    this.initializeInstruments();
  }

  private initializeInstruments() {
    if (!this.otelService) {
      this.logger.warn('OpenTelemetryService not available, using legacy metrics only');
      return;
    }

    const meter = this.otelService.meter;

    // Event store metrics
    this.eventStoreAppendDuration = meter.createHistogram('event_store_append_duration', {
      description: 'Duration of event store append operations',
      unit: 'ms',
    });
    this.eventStoreAppendCount = meter.createCounter('event_store_append_total', {
      description: 'Total number of event store append operations',
    });
    this.eventStoreQueryDuration = meter.createHistogram('event_store_query_duration', {
      description: 'Duration of event store query operations',
      unit: 'ms',
    });
    this.eventStoreQueryCount = meter.createCounter('event_store_query_total', {
      description: 'Total number of event store query operations',
    });
    this.eventStoreRebuildDuration = meter.createHistogram('event_store_rebuild_duration', {
      description: 'Duration of event store rebuild operations',
      unit: 'ms',
    });
    this.eventStoreRebuildCount = meter.createCounter('event_store_rebuild_total', {
      description: 'Total number of event store rebuild operations',
    });

    // Circuit breaker metrics
    this.circuitBreakerStateTransitions = meter.createCounter(
      'circuit_breaker_state_transitions_total',
      {
        description: 'Total number of circuit breaker state transitions',
      }
    );
    this.circuitBreakerFailures = meter.createCounter('circuit_breaker_failures_total', {
      description: 'Total number of circuit breaker failures',
    });
    this.circuitBreakerRecoveries = meter.createCounter('circuit_breaker_recoveries_total', {
      description: 'Total number of circuit breaker recoveries',
    });

    // CQRS metrics
    this.cqrsCommandDuration = meter.createHistogram('cqrs_command_duration', {
      description: 'Duration of CQRS command operations',
      unit: 'ms',
    });
    this.cqrsCommandCount = meter.createCounter('cqrs_command_total', {
      description: 'Total number of CQRS command operations',
    });
    this.cqrsQueryDuration = meter.createHistogram('cqrs_query_duration', {
      description: 'Duration of CQRS query operations',
      unit: 'ms',
    });
    this.cqrsQueryCount = meter.createCounter('cqrs_query_total', {
      description: 'Total number of CQRS query operations',
    });
  }

  /**
   * Track event store append operation
   */
  recordEventStoreAppend(durationMs: number, success: boolean): void {
    // OpenTelemetry metrics
    if (this.eventStoreAppendDuration) {
      this.eventStoreAppendDuration.record(durationMs, { success: success.toString() });
    }
    if (this.eventStoreAppendCount) {
      this.eventStoreAppendCount.add(1, { success: success.toString() });
    }

    // Legacy metrics for backward compatibility
    this.legacyMetrics.eventStore.appendCount++;
    if (success) {
      this.legacyMetrics.eventStore.appendTotalDurationMs += durationMs;
    }

    this.logger.debug(`Event store append: ${durationMs}ms (${success ? 'success' : 'failure'})`);
  }

  /**
   * Track event store query operation
   */
  recordEventStoreQuery(durationMs: number, itemCount: number): void {
    // OpenTelemetry metrics
    if (this.eventStoreQueryDuration) {
      this.eventStoreQueryDuration.record(durationMs, { item_count: itemCount.toString() });
    }
    if (this.eventStoreQueryCount) {
      this.eventStoreQueryCount.add(1, { item_count: itemCount.toString() });
    }

    // Legacy metrics for backward compatibility
    this.legacyMetrics.eventStore.queryCount++;
    this.legacyMetrics.eventStore.queryTotalDurationMs += durationMs;

    this.logger.debug(`Event store query: ${durationMs}ms, ${itemCount} items`);
  }

  /**
   * Track audit projection rebuild
   */
  recordAuditProjectionRebuild(durationMs: number, itemCount: number): void {
    // OpenTelemetry metrics
    if (this.eventStoreRebuildDuration) {
      this.eventStoreRebuildDuration.record(durationMs, { item_count: itemCount.toString() });
    }
    if (this.eventStoreRebuildCount) {
      this.eventStoreRebuildCount.add(1, { item_count: itemCount.toString() });
    }

    // Legacy metrics for backward compatibility
    this.legacyMetrics.eventStore.rebuildCount++;
    this.legacyMetrics.eventStore.rebuildTotalDurationMs += durationMs;

    this.logger.debug(`Audit projection rebuild: ${durationMs}ms, ${itemCount} items`);
  }

  /**
   * Track circuit breaker state transition
   */
  recordCircuitBreakerTransition(from: string, to: string, reason?: string): void {
    // OpenTelemetry metrics
    if (this.circuitBreakerStateTransitions) {
      this.circuitBreakerStateTransitions.add(1, {
        from_state: from,
        to_state: to,
        reason: reason || 'unknown',
      });
    }

    // Legacy metrics for backward compatibility
    this.legacyMetrics.circuitBreaker.stateTransitionCount++;

    this.logger.log(`Circuit breaker transition: ${from} → ${to}${reason ? ` (${reason})` : ''}`);
  }

  /**
   * Track circuit breaker failure
   */
  recordCircuitBreakerFailure(): void {
    // OpenTelemetry metrics
    if (this.circuitBreakerFailures) {
      this.circuitBreakerFailures.add(1);
    }

    // Legacy metrics for backward compatibility
    this.legacyMetrics.circuitBreaker.failureCount++;
  }

  /**
   * Track circuit breaker recovery
   */
  recordCircuitBreakerRecovery(): void {
    // OpenTelemetry metrics
    if (this.circuitBreakerRecoveries) {
      this.circuitBreakerRecoveries.add(1);
    }

    // Legacy metrics for backward compatibility
    this.legacyMetrics.circuitBreaker.recoveryCount++;
  }

  /**
   * Track CQRS command execution
   */
  recordCQRSCommand(command: string, durationMs: number, success: boolean): void {
    // OpenTelemetry metrics
    if (this.cqrsCommandDuration) {
      this.cqrsCommandDuration.record(durationMs, {
        command,
        success: success.toString(),
      });
    }
    if (this.cqrsCommandCount) {
      this.cqrsCommandCount.add(1, {
        command,
        success: success.toString(),
      });
    }

    // Legacy metrics for backward compatibility
    this.legacyMetrics.cqrs.commandCount++;
    if (success) {
      this.legacyMetrics.cqrs.commandTotalDurationMs += durationMs;
    }

    this.logger.debug(
      `CQRS command (${command}): ${durationMs}ms (${success ? 'success' : 'failure'})`
    );
  }

  /**
   * Track CQRS query execution
   */
  recordCQRSQuery(query: string, durationMs: number, itemCount: number): void {
    // OpenTelemetry metrics
    if (this.cqrsQueryDuration) {
      this.cqrsQueryDuration.record(durationMs, {
        query,
        item_count: itemCount.toString(),
      });
    }
    if (this.cqrsQueryCount) {
      this.cqrsQueryCount.add(1, {
        query,
        item_count: itemCount.toString(),
      });
    }

    // Legacy metrics for backward compatibility
    this.legacyMetrics.cqrs.queryCount++;
    this.legacyMetrics.cqrs.queryTotalDurationMs += durationMs;

    this.logger.debug(`CQRS query (${query}): ${durationMs}ms, ${itemCount} items`);
  }

  /**
   * Start a traced span for an operation
   */
  startSpan(operationName: string, attributes?: Record<string, any>): string {
    const spanId = `${operationName}-${Date.now()}-${randomUUID()}`;
    this.spans.set(spanId, {
      operationName,
      startTime: Date.now(),
      attributes: attributes || {},
    });
    return spanId;
  }

  /**
   * End a traced span
   */
  endSpan(
    spanId: string,
    status: 'success' | 'error' = 'success',
    errorMessage?: string
  ): { durationMs: number; operationName: string } {
    const span = this.spans.get(spanId);
    if (!span) {
      this.logger.warn(`Span not found: ${spanId}`);
      return { durationMs: 0, operationName: 'unknown' };
    }

    const durationMs = Date.now() - span.startTime;
    this.logger.debug(
      `Span ended: ${span.operationName} (${durationMs}ms, ${status}${errorMessage ? `: ${errorMessage}` : ''})`
    );

    this.spans.delete(spanId);

    return {
      durationMs,
      operationName: span.operationName,
    };
  }

  /**
   * Get current metrics snapshot for backward compatibility
   */
  getMetrics(): ObservabilityMetrics {
    return {
      ...this.legacyMetrics,
      eventStore: {
        ...this.legacyMetrics.eventStore,
        appendAvgDurationMs:
          this.legacyMetrics.eventStore.appendCount > 0
            ? this.legacyMetrics.eventStore.appendTotalDurationMs /
              this.legacyMetrics.eventStore.appendCount
            : 0,
        queryAvgDurationMs:
          this.legacyMetrics.eventStore.queryCount > 0
            ? this.legacyMetrics.eventStore.queryTotalDurationMs /
              this.legacyMetrics.eventStore.queryCount
            : 0,
        rebuildAvgDurationMs:
          this.legacyMetrics.eventStore.rebuildCount > 0
            ? this.legacyMetrics.eventStore.rebuildTotalDurationMs /
              this.legacyMetrics.eventStore.rebuildCount
            : 0,
      },
      cqrs: {
        ...this.legacyMetrics.cqrs,
        commandAvgDurationMs:
          this.legacyMetrics.cqrs.commandCount > 0
            ? this.legacyMetrics.cqrs.commandTotalDurationMs / this.legacyMetrics.cqrs.commandCount
            : 0,
        queryAvgDurationMs:
          this.legacyMetrics.cqrs.queryCount > 0
            ? this.legacyMetrics.cqrs.queryTotalDurationMs / this.legacyMetrics.cqrs.queryCount
            : 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.legacyMetrics = {
      eventStore: {
        appendCount: 0,
        appendTotalDurationMs: 0,
        queryCount: 0,
        queryTotalDurationMs: 0,
        rebuildCount: 0,
        rebuildTotalDurationMs: 0,
      },
      circuitBreaker: {
        stateTransitionCount: 0,
        failureCount: 0,
        recoveryCount: 0,
      },
      cqrs: {
        commandCount: 0,
        commandTotalDurationMs: 0,
        queryCount: 0,
        queryTotalDurationMs: 0,
      },
    };
  }
}

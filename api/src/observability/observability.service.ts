import { Injectable, Logger } from '@nestjs/common';

/**
 * Observability Service
 *
 * Provides centralized metrics collection, span tracking, and monitoring
 * for circuit breaker, event store, and CQRS operations.
 *
 * Metrics tracked:
 * - Event store: append duration, query count, rebuild time
 * - Circuit breaker: state transitions, failure counts, recovery time
 * - CQRS: command execution time, query execution time
 */
@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger(ObservabilityService.name);

  // Metrics storage
  private metrics = {
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

  // Span context for tracing
  private spans: Map<string, any> = new Map();

  /**
   * Track event store append operation
   */
  recordEventStoreAppend(durationMs: number, success: boolean): void {
    this.metrics.eventStore.appendCount++;
    if (success) {
      this.metrics.eventStore.appendTotalDurationMs += durationMs;
    }
    this.logger.debug(`Event store append: ${durationMs}ms (${success ? 'success' : 'failure'})`);
  }

  /**
   * Track event store query operation
   */
  recordEventStoreQuery(durationMs: number, itemCount: number): void {
    this.metrics.eventStore.queryCount++;
    this.metrics.eventStore.queryTotalDurationMs += durationMs;
    this.logger.debug(`Event store query: ${durationMs}ms, ${itemCount} items`);
  }

  /**
   * Track audit projection rebuild
   */
  recordAuditProjectionRebuild(durationMs: number, itemCount: number): void {
    this.metrics.eventStore.rebuildCount++;
    this.metrics.eventStore.rebuildTotalDurationMs += durationMs;
    this.logger.debug(`Audit projection rebuild: ${durationMs}ms, ${itemCount} items`);
  }

  /**
   * Track circuit breaker state transition
   */
  recordCircuitBreakerTransition(from: string, to: string, reason?: string): void {
    this.metrics.circuitBreaker.stateTransitionCount++;
    this.logger.log(`Circuit breaker transition: ${from} → ${to}${reason ? ` (${reason})` : ''}`);
  }

  /**
   * Track circuit breaker failure
   */
  recordCircuitBreakerFailure(): void {
    this.metrics.circuitBreaker.failureCount++;
  }

  /**
   * Track circuit breaker recovery
   */
  recordCircuitBreakerRecovery(): void {
    this.metrics.circuitBreaker.recoveryCount++;
  }

  /**
   * Track CQRS command execution
   */
  recordCQRSCommand(command: string, durationMs: number, success: boolean): void {
    this.metrics.cqrs.commandCount++;
    if (success) {
      this.metrics.cqrs.commandTotalDurationMs += durationMs;
    }
    this.logger.debug(
      `CQRS command (${command}): ${durationMs}ms (${success ? 'success' : 'failure'})`
    );
  }

  /**
   * Track CQRS query execution
   */
  recordCQRSQuery(query: string, durationMs: number, itemCount: number): void {
    this.metrics.cqrs.queryCount++;
    this.metrics.cqrs.queryTotalDurationMs += durationMs;
    this.logger.debug(`CQRS query (${query}): ${durationMs}ms, ${itemCount} items`);
  }

  /**
   * Start a traced span for an operation
   */
  startSpan(operationName: string, attributes?: Record<string, any>): string {
    const spanId = `${operationName}-${Date.now()}-${Math.random()}`;
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
   * Get current metrics snapshot
   */
  getMetrics() {
    return {
      ...this.metrics,
      eventStore: {
        ...this.metrics.eventStore,
        appendAvgDurationMs:
          this.metrics.eventStore.appendCount > 0
            ? this.metrics.eventStore.appendTotalDurationMs / this.metrics.eventStore.appendCount
            : 0,
        queryAvgDurationMs:
          this.metrics.eventStore.queryCount > 0
            ? this.metrics.eventStore.queryTotalDurationMs / this.metrics.eventStore.queryCount
            : 0,
        rebuildAvgDurationMs:
          this.metrics.eventStore.rebuildCount > 0
            ? this.metrics.eventStore.rebuildTotalDurationMs / this.metrics.eventStore.rebuildCount
            : 0,
      },
      cqrs: {
        ...this.metrics.cqrs,
        commandAvgDurationMs:
          this.metrics.cqrs.commandCount > 0
            ? this.metrics.cqrs.commandTotalDurationMs / this.metrics.cqrs.commandCount
            : 0,
        queryAvgDurationMs:
          this.metrics.cqrs.queryCount > 0
            ? this.metrics.cqrs.queryTotalDurationMs / this.metrics.cqrs.queryCount
            : 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
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

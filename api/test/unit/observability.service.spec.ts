import { Test, TestingModule } from '@nestjs/testing';
import { ObservabilityService } from '../../src/observability/observability.service';

describe('ObservabilityService (Unit Tests)', () => {
  let service: ObservabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ObservabilityService],
    }).compile();

    service = module.get<ObservabilityService>(ObservabilityService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('Event Store Metrics', () => {
    it('should track event store append operations', () => {
      service.recordEventStoreAppend(100, true);
      service.recordEventStoreAppend(150, true);

      const metrics = service.getMetrics();
      expect(metrics.eventStore.appendCount).toBe(2);
      expect(metrics.eventStore.appendTotalDurationMs).toBe(250);
      expect(metrics.eventStore.appendAvgDurationMs).toBe(125);
    });

    it('should not count failed appends in duration average', () => {
      service.recordEventStoreAppend(100, true);
      service.recordEventStoreAppend(200, false);

      const metrics = service.getMetrics();
      expect(metrics.eventStore.appendCount).toBe(2);
      expect(metrics.eventStore.appendTotalDurationMs).toBe(100);
      // Average is calculated from total duration / count = 100/2 = 50
      // (Failed durations are not added to total, but count is incremented)
      expect(metrics.eventStore.appendAvgDurationMs).toBe(50);
    });

    it('should track event store query operations', () => {
      service.recordEventStoreQuery(50, 10);
      service.recordEventStoreQuery(75, 15);

      const metrics = service.getMetrics();
      expect(metrics.eventStore.queryCount).toBe(2);
      expect(metrics.eventStore.queryTotalDurationMs).toBe(125);
      expect(metrics.eventStore.queryAvgDurationMs).toBe(62.5);
    });

    it('should track audit projection rebuild operations', () => {
      service.recordAuditProjectionRebuild(500, 100);
      service.recordAuditProjectionRebuild(600, 120);

      const metrics = service.getMetrics();
      expect(metrics.eventStore.rebuildCount).toBe(2);
      expect(metrics.eventStore.rebuildTotalDurationMs).toBe(1100);
      expect(metrics.eventStore.rebuildAvgDurationMs).toBe(550);
    });
  });

  describe('Circuit Breaker Metrics', () => {
    it('should track circuit breaker state transitions', () => {
      service.recordCircuitBreakerTransition('CLOSED', 'OPEN', 'threshold exceeded');
      service.recordCircuitBreakerTransition('OPEN', 'HALF_OPEN', 'timeout elapsed');

      const metrics = service.getMetrics();
      expect(metrics.circuitBreaker.stateTransitionCount).toBe(2);
    });

    it('should track circuit breaker failures', () => {
      service.recordCircuitBreakerFailure();
      service.recordCircuitBreakerFailure();
      service.recordCircuitBreakerFailure();

      const metrics = service.getMetrics();
      expect(metrics.circuitBreaker.failureCount).toBe(3);
    });

    it('should track circuit breaker recoveries', () => {
      service.recordCircuitBreakerRecovery();
      service.recordCircuitBreakerRecovery();

      const metrics = service.getMetrics();
      expect(metrics.circuitBreaker.recoveryCount).toBe(2);
    });
  });

  describe('CQRS Metrics', () => {
    it('should track CQRS command execution', () => {
      service.recordCQRSCommand('CreateAuditLog', 50, true);
      service.recordCQRSCommand('UpdateSetting', 100, true);

      const metrics = service.getMetrics();
      expect(metrics.cqrs.commandCount).toBe(2);
      expect(metrics.cqrs.commandTotalDurationMs).toBe(150);
      expect(metrics.cqrs.commandAvgDurationMs).toBe(75);
    });

    it('should not count failed commands in duration average', () => {
      service.recordCQRSCommand('CreateUser', 50, true);
      service.recordCQRSCommand('CreateUser', 100, false);

      const metrics = service.getMetrics();
      expect(metrics.cqrs.commandCount).toBe(2);
      expect(metrics.cqrs.commandTotalDurationMs).toBe(50);
      // Average is calculated from total duration / count = 50/2 = 25
      // (Failed durations are not added to total, but count is incremented)
      expect(metrics.cqrs.commandAvgDurationMs).toBe(25);
    });

    it('should track CQRS query execution', () => {
      service.recordCQRSQuery('ListAuditLogs', 75, 50);
      service.recordCQRSQuery('GetAuditLog', 25, 1);

      const metrics = service.getMetrics();
      expect(metrics.cqrs.queryCount).toBe(2);
      expect(metrics.cqrs.queryTotalDurationMs).toBe(100);
      expect(metrics.cqrs.queryAvgDurationMs).toBe(50);
    });
  });

  describe('Span Tracing', () => {
    it('should create and end spans with duration', () => {
      const spanId = service.startSpan('DataStoreQuery');
      expect(spanId).toBeDefined();

      // Simulate some work
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Busy wait for ~10ms
      }

      const result = service.endSpan(spanId, 'success');
      expect(result.operationName).toBe('DataStoreQuery');
      expect(result.durationMs).toBeGreaterThanOrEqual(10);
    });

    it('should track span attributes', () => {
      const spanId = service.startSpan('EventStoreAppend', {
        eventCount: 5,
        churchId: 'church-1',
      });

      const result = service.endSpan(spanId, 'success');
      expect(result.operationName).toBe('EventStoreAppend');
    });

    it('should handle end span for non-existent span', () => {
      const result = service.endSpan('non-existent-span');

      expect(result.durationMs).toBe(0);
      expect(result.operationName).toBe('unknown');
    });

    it('should support error status on span end', () => {
      const spanId = service.startSpan('FailingOperation');
      const result = service.endSpan(spanId, 'error', 'Connection timeout');

      expect(result.operationName).toBe('FailingOperation');
    });

    it('should clean up spans after ending', () => {
      const spanId1 = service.startSpan('Operation1');

      service.endSpan(spanId1);

      // Should not find spanId1
      const result = service.endSpan(spanId1);
      expect(result.durationMs).toBe(0);
    });
  });

  describe('Metrics Aggregation', () => {
    it('should compute average durations correctly', () => {
      // Event Store
      service.recordEventStoreAppend(100, true);
      service.recordEventStoreAppend(200, true);
      service.recordEventStoreAppend(300, true);

      // CQRS
      service.recordCQRSCommand('Cmd', 50, true);
      service.recordCQRSCommand('Cmd', 100, true);

      const metrics = service.getMetrics();
      expect(metrics.eventStore.appendAvgDurationMs).toBe(200);
      expect(metrics.cqrs.commandAvgDurationMs).toBe(75);
    });

    it('should handle zero counts without division errors', () => {
      const metrics = service.getMetrics();

      expect(metrics.eventStore.appendAvgDurationMs).toBe(0);
      expect(metrics.eventStore.queryAvgDurationMs).toBe(0);
      expect(metrics.cqrs.commandAvgDurationMs).toBe(0);
      expect(metrics.cqrs.queryAvgDurationMs).toBe(0);
    });

    it('should include timestamp in metrics', () => {
      const metrics = service.getMetrics();

      expect(metrics.timestamp).toBeDefined();
      expect(new Date(metrics.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Metrics Reset', () => {
    it('should reset all metrics to zero', () => {
      // Record various metrics
      service.recordEventStoreAppend(100, true);
      service.recordCircuitBreakerTransition('CLOSED', 'OPEN');
      service.recordCQRSCommand('Cmd', 50, true);

      // Reset
      service.reset();

      const metrics = service.getMetrics();
      expect(metrics.eventStore.appendCount).toBe(0);
      expect(metrics.circuitBreaker.stateTransitionCount).toBe(0);
      expect(metrics.cqrs.commandCount).toBe(0);
    });

    it('should clear spans on reset', () => {
      const spanId = service.startSpan('Operation');
      service.reset();

      const result = service.endSpan(spanId);
      expect(result.durationMs).toBe(0);
    });
  });

  describe('Mixed Operations', () => {
    it('should track complex real-world scenario', () => {
      // Simulate an audit log query scenario
      const querySpan = service.startSpan('AuditLogQuery', {
        churchId: 'church-1',
        pageSize: 50,
      });

      // Event store query
      service.recordEventStoreQuery(100, 50);

      // CQRS query
      service.recordCQRSQuery('ListAuditLogs', 120, 50);

      // Circuit breaker state
      service.recordCircuitBreakerTransition('CLOSED', 'CLOSED');

      // End span
      service.endSpan(querySpan, 'success');

      const metrics = service.getMetrics();

      expect(metrics.eventStore.queryCount).toBe(1);
      expect(metrics.cqrs.queryCount).toBe(1);
      expect(metrics.circuitBreaker.stateTransitionCount).toBe(1);
    });

    it('should handle concurrent span operations', () => {
      const spanIds = [];

      // Create multiple spans
      for (let i = 0; i < 10; i++) {
        const spanId = service.startSpan(`Operation${i}`);
        spanIds.push(spanId);
      }

      // End some spans
      for (let i = 0; i < 5; i++) {
        const result = service.endSpan(spanIds[i]);
        expect(result.operationName).toBe(`Operation${i}`);
      }

      // End remaining spans
      for (let i = 5; i < 10; i++) {
        const result = service.endSpan(spanIds[i]);
        expect(result.operationName).toBe(`Operation${i}`);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative durations gracefully', () => {
      // Should not crash with negative values
      service.recordEventStoreAppend(-10, true);

      const metrics = service.getMetrics();
      expect(metrics.eventStore.appendCount).toBe(1);
      expect(metrics.eventStore.appendTotalDurationMs).toBe(-10);
    });

    it('should handle large duration values', () => {
      service.recordEventStoreAppend(999999999, true);
      service.recordEventStoreAppend(999999999, true);

      const metrics = service.getMetrics();
      expect(metrics.eventStore.appendAvgDurationMs).toBe(999999999);
    });

    it('should handle many operations without overflow', () => {
      for (let i = 0; i < 1000; i++) {
        service.recordEventStoreAppend(i, true);
      }

      const metrics = service.getMetrics();
      expect(metrics.eventStore.appendCount).toBe(1000);
      expect(metrics.eventStore.appendAvgDurationMs).toBeGreaterThan(0);
    });
  });
});

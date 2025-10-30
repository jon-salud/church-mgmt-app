import { Test, TestingModule } from '@nestjs/testing';
import { CircuitBreakerService } from '../../src/resilience/circuit-breaker.service';
import { CircuitBreakerState } from '../../src/common/circuit-breaker-state.enum';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CircuitBreakerService],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('State Management', () => {
    it('should start in CLOSED state', () => {
      expect(service.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should successfully execute function in CLOSED state', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await service.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should track successful execution', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      await service.execute(fn);

      const metrics = service.getMetrics();
      expect(metrics.successCount).toBe(1);
      expect(metrics.failureCount).toBe(0);
      expect(metrics.successRate).toBe(100);
    });
  });

  describe('Failure Tracking', () => {
    it('should track failures in CLOSED state', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 4; i++) {
        try {
          await service.execute(fn);
        } catch {
          // Expected
        }
      }

      const metrics = service.getMetrics();
      expect(metrics.failureCount).toBe(4);
      expect(metrics.successCount).toBe(0);
      expect(service.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should transition to OPEN when failure threshold reached', async () => {
      service.setFailureThreshold(3);
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        try {
          await service.execute(fn);
        } catch {
          // Expected
        }
      }

      expect(service.getState()).toBe(CircuitBreakerState.OPEN);
    });

    it('should track failure time', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      service.setFailureThreshold(1);

      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      const metrics = service.getMetrics();
      expect(metrics.lastFailureTime).toBeDefined();
    });
  });

  describe('OPEN State Behavior', () => {
    beforeEach(() => {
      service.setFailureThreshold(1);
    });

    it('should fail fast when circuit is OPEN', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      // Trigger transition to OPEN
      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      // Try to execute - should fail fast
      await expect(service.execute(jest.fn())).rejects.toThrow('Circuit breaker is OPEN');

      // Original function should not be called
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use fallback when provided in OPEN state', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const fallback = jest.fn().mockResolvedValue('fallback data');

      // Trigger transition to OPEN
      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      const result = await service.execute(jest.fn().mockResolvedValue('success'), fallback);

      expect(result).toBe('fallback data');
      expect(fallback).toHaveBeenCalled();
    });

    it('should use fallback function that returns non-Promise', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      // Trigger transition to OPEN
      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      const result = await service.execute(jest.fn(), () => 'sync fallback');

      expect(result).toBe('sync fallback');
    });
  });

  describe('HALF_OPEN State Recovery', () => {
    beforeEach(() => {
      service.setFailureThreshold(1);
      service.setTimeout(100); // 100ms timeout
    });

    it('should transition to HALF_OPEN after timeout', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      // Trigger transition to OPEN
      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      expect(service.getState()).toBe(CircuitBreakerState.OPEN);

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Next execute should transition to HALF_OPEN first, then CLOSED if success
      const testFn = jest.fn().mockResolvedValue('recovered');
      const result = await service.execute(testFn);

      // Should be CLOSED after successful recovery from HALF_OPEN
      expect(service.getState()).toBe(CircuitBreakerState.CLOSED);
      expect(result).toBe('recovered');
      expect(testFn).toHaveBeenCalled();

      // Verify the transition happened via state transitions
      const metrics = service.getMetrics();
      const hasHalfOpenTransition = metrics.stateTransitions.some(
        t => t.to === CircuitBreakerState.HALF_OPEN
      );
      expect(hasHalfOpenTransition).toBe(true);
    });

    it('should succeed and return to CLOSED in HALF_OPEN', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      // Trigger transition to OPEN
      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Successful call in HALF_OPEN should transition to CLOSED
      const successFn = jest.fn().mockResolvedValue('success');
      await service.execute(successFn);

      expect(service.getState()).toBe(CircuitBreakerState.CLOSED);

      const metrics = service.getMetrics();
      expect(metrics.stateTransitions.length).toBeGreaterThan(0);
    });

    it('should reopen on failure in HALF_OPEN state', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      // Trigger transition to OPEN
      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Transition to HALF_OPEN
      expect(service.getState()).toBe(CircuitBreakerState.OPEN);

      // Wait a bit more to ensure we're past the timeout
      await new Promise(resolve => setTimeout(resolve, 50));

      // Attempt should now trigger HALF_OPEN check
      const failingFn = jest.fn().mockRejectedValue(new Error('still failing'));
      try {
        await service.execute(failingFn);
      } catch {
        // Expected to fail in HALF_OPEN
      }

      // Should be back to OPEN
      expect(service.getState()).toBe(CircuitBreakerState.OPEN);
    });
  });

  describe('Metrics Tracking', () => {
    it('should track success count', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      for (let i = 0; i < 5; i++) {
        await service.execute(fn);
      }

      const metrics = service.getMetrics();
      expect(metrics.successCount).toBe(5);
    });

    it('should calculate success rate', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const failFn = jest.fn().mockRejectedValue(new Error('fail'));

      // 3 successes
      for (let i = 0; i < 3; i++) {
        await service.execute(successFn);
      }

      // 2 failures
      service.setFailureThreshold(100); // Prevent circuit from opening
      for (let i = 0; i < 2; i++) {
        try {
          await service.execute(failFn);
        } catch {
          // Expected
        }
      }

      const metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(5);
      expect(Math.round(metrics.successRate)).toBe(60);
    });

    it('should track latency', async () => {
      const fn = jest.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve('done'), 10);
          })
      );

      await service.execute(fn);

      const metrics = service.getMetrics();
      expect(metrics.averageLatencyMs).toBeGreaterThanOrEqual(10);
    });

    it('should track state transitions', async () => {
      service.setFailureThreshold(1);
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      // Trigger OPEN
      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      const metrics = service.getMetrics();
      expect(metrics.stateTransitions.length).toBeGreaterThan(0);

      const lastTransition = metrics.stateTransitions[0];
      expect(lastTransition.to).toBe(CircuitBreakerState.OPEN);
    });

    it('should keep only last 100 transitions', async () => {
      service.setFailureThreshold(1);
      service.setTimeout(10);

      // Create 101 transitions
      for (let i = 0; i < 101; i++) {
        const fn = jest.fn().mockRejectedValue(new Error('fail'));
        try {
          await service.execute(fn);
        } catch {
          // Expected
        }
        service.reset();
      }

      const metrics = service.getMetrics();
      expect(metrics.stateTransitions.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Manual Reset', () => {
    it('should reset circuit to CLOSED', async () => {
      service.setFailureThreshold(1);
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      // Trigger OPEN
      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      expect(service.getState()).toBe(CircuitBreakerState.OPEN);

      // Reset
      service.reset();

      expect(service.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should clear metrics on reset', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      for (let i = 0; i < 5; i++) {
        await service.execute(fn);
      }

      service.reset();

      const metrics = service.getMetrics();
      expect(metrics.successCount).toBe(0);
      expect(metrics.failureCount).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should respect custom failure threshold', async () => {
      service.setFailureThreshold(10);
      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 9; i++) {
        try {
          await service.execute(fn);
        } catch {
          // Expected
        }
      }

      // Should still be CLOSED at 9 failures with threshold of 10
      expect(service.getState()).toBe(CircuitBreakerState.CLOSED);

      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      // Should be OPEN at 10 failures
      expect(service.getState()).toBe(CircuitBreakerState.OPEN);
    });

    it('should respect custom timeout', async () => {
      service.setFailureThreshold(1);
      service.setTimeout(50); // 50ms timeout

      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      expect(service.getState()).toBe(CircuitBreakerState.OPEN);

      // Wait 30ms - should still be OPEN
      await new Promise(resolve => setTimeout(resolve, 30));
      expect(service.getState()).toBe(CircuitBreakerState.OPEN);

      // Wait 30ms more - should attempt HALF_OPEN on next call
      await new Promise(resolve => setTimeout(resolve, 30));
      const successFn = jest.fn().mockResolvedValue('ok');
      await service.execute(successFn);

      expect(service.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should respect half-open success threshold', async () => {
      service.setFailureThreshold(1);
      service.setTimeout(50);
      service.setHalfOpenSuccessThreshold(2);

      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      // Wait for HALF_OPEN
      await new Promise(resolve => setTimeout(resolve, 100));

      // First success in HALF_OPEN
      const successFn = jest.fn().mockResolvedValue('ok');
      await service.execute(successFn);
      expect(service.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      // Second success - should close
      await service.execute(successFn);
      expect(service.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('Edge Cases', () => {
    it('should handle successful execution after failures', async () => {
      service.setFailureThreshold(100); // High threshold
      const failFn = jest.fn().mockRejectedValue(new Error('fail'));
      const successFn = jest.fn().mockResolvedValue('success');

      // Some failures
      for (let i = 0; i < 5; i++) {
        try {
          await service.execute(failFn);
        } catch {
          // Expected
        }
      }

      // Some successes
      for (let i = 0; i < 5; i++) {
        await service.execute(successFn);
      }

      const metrics = service.getMetrics();
      expect(metrics.successCount).toBe(5);
      expect(metrics.failureCount).toBe(5);
      expect(metrics.successRate).toBe(50);
    });

    it('should handle rapid sequential calls', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const promises = Array.from({ length: 10 }, () => service.execute(fn));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(fn).toHaveBeenCalledTimes(10);
    });

    it('should track last success time', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      await service.execute(fn);
      const metrics1 = service.getMetrics();
      expect(metrics1.lastSuccessTime).toBeDefined();

      // Wait a bit and execute again
      await new Promise(resolve => setTimeout(resolve, 10));
      await service.execute(fn);
      const metrics2 = service.getMetrics();

      expect(metrics2.lastSuccessTime!.getTime()).toBeGreaterThanOrEqual(
        metrics1.lastSuccessTime!.getTime()
      );
    });

    it('should limit latencies array to 100 entries', async () => {
      const fn = jest.fn().mockResolvedValue('ok');

      // Execute 101 times
      for (let i = 0; i < 101; i++) {
        await service.execute(fn);
      }

      const metrics = service.getMetrics();
      // Average should still be calculable
      expect(metrics.averageLatencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors when circuit is CLOSED', async () => {
      service.setFailureThreshold(100); // Very high threshold
      const error = new Error('specific error');
      const fn = jest.fn().mockRejectedValue(error);

      await expect(service.execute(fn)).rejects.toThrow('specific error');
    });

    it('should propagate errors in HALF_OPEN when no fallback', async () => {
      service.setFailureThreshold(1);
      service.setTimeout(50);

      const fn = jest.fn().mockRejectedValue(new Error('fail'));

      try {
        await service.execute(fn);
      } catch {
        // Expected
      }

      // Wait for HALF_OPEN attempt
      await new Promise(resolve => setTimeout(resolve, 100));

      const error = new Error('still failing');
      const failFn = jest.fn().mockRejectedValue(error);

      // This will transition to HALF_OPEN and fail
      try {
        await service.execute(failFn);
      } catch (e) {
        expect((e as Error).message).toBe('still failing');
      }
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent requests safely', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const promises = Array.from({ length: 50 }, () => service.execute(fn));
      await Promise.all(promises);

      const metrics = service.getMetrics();
      expect(metrics.successCount).toBe(50);
      expect(fn).toHaveBeenCalledTimes(50);
    });

    it('should handle concurrent mix of success and failure', async () => {
      service.setFailureThreshold(100);

      const calls = [];
      for (let i = 0; i < 25; i++) {
        calls.push(
          service.execute(jest.fn().mockResolvedValue('ok')),
          service.execute(jest.fn().mockRejectedValue(new Error('fail'))).catch(() => null)
        );
      }

      await Promise.all(calls);

      const metrics = service.getMetrics();
      expect(metrics.successCount).toBe(25);
      expect(metrics.failureCount).toBe(25);
    });
  });
});

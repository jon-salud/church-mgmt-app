import { CircuitBreakerService } from './circuit-breaker.service';
import { ICircuitBreaker } from '../common/circuit-breaker.interface';

/**
 * Factory for creating circuit breaker implementations
 *
 * Supports different strategies:
 * - 'enabled': Full circuit breaker with state machine (default for production)
 * - 'disabled': Pass-through (no circuit breaker, for development/testing)
 */
export class CircuitBreakerFactory {
  static create(mode: 'enabled' | 'disabled' = 'enabled'): ICircuitBreaker {
    if (mode === 'disabled') {
      // Return pass-through implementation for development
      return new PassThroughCircuitBreaker();
    }

    return new CircuitBreakerService();
  }
}

/**
 * Pass-through circuit breaker that doesn't actually circuit
 * Used for development/testing when resilience is not needed
 */
class PassThroughCircuitBreaker implements ICircuitBreaker {
  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (fallback) {
        return Promise.resolve(fallback()).then(result => result);
      }
      throw error;
    }
  }

  getState() {
    return 'CLOSED' as any;
  }

  getMetrics() {
    return {
      successCount: 0,
      failureCount: 0,
      totalRequests: 0,
      successRate: 100,
      averageLatencyMs: 0,
      stateTransitions: [],
    };
  }

  reset(): void {
    // No-op
  }

  setFailureThreshold(): void {
    // No-op
  }

  setTimeout(): void {
    // No-op
  }

  setHalfOpenSuccessThreshold(): void {
    // No-op
  }
}

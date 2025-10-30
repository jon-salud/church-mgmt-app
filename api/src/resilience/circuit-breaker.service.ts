import { Injectable, Logger } from '@nestjs/common';
import { ICircuitBreaker, CircuitBreakerMetrics } from '../common/circuit-breaker.interface';
import { CircuitBreakerState } from '../common/circuit-breaker-state.enum';

/**
 * Production-ready Circuit Breaker Service
 *
 * Implements the state machine pattern to prevent cascading failures.
 * Protects against repeated calls to failing services and allows graceful degradation.
 */
@Injectable()
export class CircuitBreakerService implements ICircuitBreaker {
  private readonly logger = new Logger(CircuitBreakerService.name);

  // State management
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;

  // Configuration
  private failureThreshold = 5; // Number of failures before opening
  private timeoutMs = 60000; // 60 seconds before trying to recover (half-open)
  private halfOpenSuccessThreshold = 1; // Success threshold in half-open state

  // Metrics
  private successCount = 0;
  private failureCount = 0;
  private totalRequests = 0;
  private latencies: number[] = [];
  private readonly stateTransitions: Array<{
    from: CircuitBreakerState;
    to: CircuitBreakerState;
    timestamp: Date;
    reason?: string;
  }> = [];

  // Half-open state tracking
  private halfOpenSuccessCount = 0;
  private halfOpenAttemptCount = 0;

  execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T> {
    this.totalRequests++;

    // When circuit is open, use fallback or fail fast
    if (this.state === CircuitBreakerState.OPEN) {
      // Check if timeout has elapsed to try half-open
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitBreakerState.HALF_OPEN, 'Timeout elapsed');
      } else {
        // Still open, use fallback or reject
        if (fallback) {
          this.logger.debug('Circuit OPEN: using fallback');
          return Promise.resolve(fallback()).then(result => result);
        }
        return Promise.reject(new Error('Circuit breaker is OPEN - service unavailable'));
      }
    }

    // Execute with timing
    const startTime = Date.now();
    return fn()
      .then(result => {
        const duration = Date.now() - startTime;
        this.recordSuccess(duration);
        return result;
      })
      .catch(error => {
        const duration = Date.now() - startTime;
        this.recordFailure(duration);
        throw error;
      });
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getMetrics(): CircuitBreakerMetrics {
    const avgLatency =
      this.latencies.length > 0
        ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
        : 0;

    return {
      successCount: this.successCount,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime ?? undefined,
      lastSuccessTime: this.lastSuccessTime ?? undefined,
      totalRequests: this.totalRequests,
      successRate: this.totalRequests > 0 ? (this.successCount / this.totalRequests) * 100 : 100,
      averageLatencyMs: avgLatency,
      stateTransitions: [...this.stateTransitions],
    };
  }

  reset(): void {
    this.logger.log('Manual circuit breaker reset requested');
    this.transitionTo(CircuitBreakerState.CLOSED, 'Manual reset');
    this.failureCount = 0;
    this.successCount = 0;
    this.latencies = [];
    this.halfOpenSuccessCount = 0;
    this.halfOpenAttemptCount = 0;
  }

  setFailureThreshold(threshold: number): void {
    this.failureThreshold = threshold;
  }

  setTimeout(timeoutMs: number): void {
    this.timeoutMs = timeoutMs;
  }

  setHalfOpenSuccessThreshold(threshold: number): void {
    this.halfOpenSuccessThreshold = threshold;
  }

  // Private methods

  private recordSuccess(latencyMs: number): void {
    this.successCount++;
    this.lastSuccessTime = new Date();
    this.latencies.push(latencyMs);

    // Keep last 100 latencies for average calculation
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.halfOpenSuccessCount++;
      this.halfOpenAttemptCount++;

      if (this.halfOpenSuccessCount >= this.halfOpenSuccessThreshold) {
        this.logger.log(`Circuit recovered after ${this.halfOpenAttemptCount} attempts`);
        this.transitionTo(CircuitBreakerState.CLOSED, 'Recovery successful');
        this.failureCount = 0;
        this.halfOpenSuccessCount = 0;
        this.halfOpenAttemptCount = 0;
      }
    }
  }

  private recordFailure(latencyMs: number): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    this.latencies.push(latencyMs);

    // Keep last 100 latencies for average calculation
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }

    if (this.state === CircuitBreakerState.CLOSED) {
      if (this.failureCount >= this.failureThreshold) {
        this.logger.warn(
          `Failure threshold reached (${this.failureCount}/${this.failureThreshold}) - opening circuit`
        );
        this.transitionTo(
          CircuitBreakerState.OPEN,
          `Failures exceeded threshold (${this.failureCount})`
        );
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Any failure in half-open state reopens the circuit
      this.logger.warn('Failure in HALF_OPEN state - reopening circuit');
      this.transitionTo(CircuitBreakerState.OPEN, 'Failed during recovery test');
      this.halfOpenSuccessCount = 0;
      this.halfOpenAttemptCount = 0;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return false;
    }

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.timeoutMs;
  }

  private transitionTo(newState: CircuitBreakerState, reason?: string): void {
    const oldState = this.state;
    this.state = newState;

    const message = `Circuit breaker transition: ${oldState} → ${newState}${reason ? ` (${reason})` : ''}`;
    this.logger.log(message);

    this.stateTransitions.push({
      from: oldState,
      to: newState,
      timestamp: new Date(),
      reason,
    });

    // Keep last 100 transitions for monitoring
    if (this.stateTransitions.length > 100) {
      this.stateTransitions.shift();
    }
  }
}

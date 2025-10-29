import { CircuitBreakerState } from './circuit-breaker-state.enum';

/**
 * Metrics for circuit breaker monitoring and observability
 */
export interface CircuitBreakerMetrics {
  successCount: number;
  failureCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  totalRequests: number;
  successRate: number; // 0-100
  averageLatencyMs: number;
  stateTransitions: Array<{
    from: CircuitBreakerState;
    to: CircuitBreakerState;
    timestamp: Date;
    reason?: string;
  }>;
}

/**
 * Circuit Breaker Interface
 *
 * Provides resilience against cascading failures by monitoring service calls
 * and failing fast when failure threshold is reached.
 *
 * State Machine:
 * CLOSED ──[failures > threshold]──> OPEN ──[timeout elapsed]──> HALF_OPEN
 *   ↑                                                                    ↓
 *   └────────────────[success]─────────────────────────────────────────┘
 */
export interface ICircuitBreaker {
  /**
   * Execute a function with circuit breaker protection
   * @param fn Function to execute
   * @param fallback Optional fallback to return if circuit is open
   * @returns Result of fn or fallback
   * @throws Error if circuit is open and no fallback provided
   */
  execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T>;

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitBreakerState;

  /**
   * Get current metrics for monitoring
   */
  getMetrics(): CircuitBreakerMetrics;

  /**
   * Manually reset circuit breaker to CLOSED state
   */
  reset(): void;

  /**
   * Set failure threshold (number of failures before opening)
   */
  setFailureThreshold(threshold: number): void;

  /**
   * Set timeout before attempting half-open (milliseconds)
   */
  setTimeout(timeoutMs: number): void;

  /**
   * Set success threshold in half-open state (failures in a row to reopen)
   */
  setHalfOpenSuccessThreshold(threshold: number): void;
}

/**
 * DI Token for Circuit Breaker
 */
export const CIRCUIT_BREAKER = Symbol('CIRCUIT_BREAKER');

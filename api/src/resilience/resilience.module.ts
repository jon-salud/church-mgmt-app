import { Module } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { CIRCUIT_BREAKER } from '../common/circuit-breaker.interface';
import { CircuitBreakerFactory } from './circuit-breaker-factory';

/**
 * Resilience Module
 *
 * Provides resilience patterns for the application:
 * - Circuit Breaker: Prevent cascading failures
 * - Fallback strategies: Graceful degradation
 * - Monitoring: Track health and state transitions
 *
 * Environment Variables:
 * - CIRCUIT_BREAKER_MODE: 'enabled' (default) or 'disabled'
 * - CIRCUIT_BREAKER_FAILURE_THRESHOLD: Number of failures before opening (default: 5)
 * - CIRCUIT_BREAKER_TIMEOUT_MS: Timeout before half-open (default: 60000)
 */
@Module({
  providers: [
    CircuitBreakerService,
    {
      provide: CIRCUIT_BREAKER,
      useFactory: (config?: { mode?: string }) => {
        const mode = (process.env.CIRCUIT_BREAKER_MODE as 'enabled' | 'disabled') || 'enabled';
        const circuitBreaker = CircuitBreakerFactory.create(mode);

        // Apply configuration from environment
        const failureThreshold = parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5', 10);
        const timeoutMs = parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || '60000', 10);

        circuitBreaker.setFailureThreshold(failureThreshold);
        circuitBreaker.setTimeout(timeoutMs);

        return circuitBreaker;
      },
    },
  ],
  exports: [CIRCUIT_BREAKER],
})
export class ResilienceModule {}

import { Module } from '@nestjs/common';
import { ObservabilityService } from './observability.service';

/**
 * Observability Module
 *
 * Provides centralized metrics collection and tracing for:
 * - Event sourcing operations
 * - Circuit breaker state transitions
 * - CQRS command and query execution
 */
@Module({
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}

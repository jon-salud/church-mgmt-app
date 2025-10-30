# Observability Architecture

## Overview

The Church Management App implements a centralized observability infrastructure for monitoring, debugging, and optimizing advanced patterns including event sourcing, caching, and circuit breaker resilience. This document describes the architecture, design principles, and integration patterns.

## Design Principles

1. **Centralized Metrics Collection** - Single source of truth for all observability data
2. **Zero-Dependency Instrumentation** - Observability service has minimal dependencies (@nestjs/common only)
3. **Structured Metrics** - Organized by operation type with consistent timestamp and status tracking
4. **Span-Based Tracing** - Correlate operations across service boundaries with unique span IDs
5. **Production-Ready** - Thread-safe, handles concurrent operations, includes edge case handling

## Architecture Components

### ObservabilityService

**Purpose:** Centralized metrics collection and span tracing for all advanced patterns

**Location:** `api/src/observability/observability.service.ts`

**Metrics Categories:**

#### 1. Event Store Metrics
```typescript
eventStore: {
  appendCount: number;
  appendTotalDurationMs: number;
  appendAvgDurationMs: number;
  queryCount: number;
  queryTotalDurationMs: number;
  queryAvgDurationMs: number;
  rebuildCount: number;
  rebuildTotalDurationMs: number;
  rebuildAvgDurationMs: number;
}
```

Tracks:
- Append operations: Time to write events to store
- Query operations: Time to read events from store
- Rebuild operations: Time to replay events for projections

#### 2. Circuit Breaker Metrics
```typescript
circuitBreaker: {
  stateTransitions: number;
  failureCount: number;
  recoveryCount: number;
}
```

Tracks:
- State changes: CLOSED → OPEN → HALF_OPEN → CLOSED
- Failures: Threshold for opening circuit
- Recoveries: Successful transitions back to CLOSED

#### 3. CQRS Metrics
```typescript
cqrs: {
  commandCount: number;
  commandTotalDurationMs: number;
  commandAvgDurationMs: number;
  queryCount: number;
  queryTotalDurationMs: number;
  queryAvgDurationMs: number;
}
```

Tracks:
- Command execution: Time to process write operations
- Query execution: Time to process read operations
- Item counts: Results returned from queries

### Span Tracing

**Purpose:** Correlate operations and track end-to-end latency

**Span Lifecycle:**
```typescript
// Start span
const spanId = observability.startSpan('operation.name', { attribute: 'value' });

// Do work...

// End span and get duration
const { durationMs, operationName } = observability.endSpan(spanId, 'success', null);

// For errors:
const { durationMs, operationName } = observability.endSpan(spanId, 'error', errorMessage);
```

**Span Structure:**
- `spanId`: Unique identifier for tracing
- `operationName`: Descriptive name for the operation
- `startTime`: Millisecond timestamp when span created
- `attributes`: Custom key-value pairs for context
- `status`: 'success', 'error', or undefined
- `errorMessage`: Error details if failed
- `durationMs`: Time from start to end in milliseconds

### ObservabilityModule

**Purpose:** Dependency injection provider for ObservabilityService

**Location:** `api/src/observability/observability.module.ts`

**Integration:**
```typescript
@Module({
  providers: [ObservabilityService],
  exports: [ObservabilityService],
})
export class ObservabilityModule {}
```

Modules using observability import this module and inject the service:
```typescript
constructor(
  private readonly observability: ObservabilityService
)
```

## Integration Patterns

### Pattern 1: Service Integration

**Step 1:** Import ObservabilityModule
```typescript
@Module({
  imports: [ObservabilityModule],
  // ...
})
export class MyModule {}
```

**Step 2:** Inject and use in service
```typescript
@Injectable()
export class MyService {
  constructor(private readonly observability: ObservabilityService) {}
  
  async myOperation(input: any) {
    const spanId = this.observability.startSpan('my-operation', { input });
    
    try {
      const result = await this.doWork(input);
      this.observability.recordCQRSQuery('myOperation', spanId_duration, result.count);
      return result;
    } catch (error) {
      this.observability.recordCQRSQuery('myOperation', span_duration, 0);
      throw error;
    }
  }
}
```

### Pattern 2: Audit Module Integration

See `api/src/modules/audit/` for reference implementation with:
- AuditLogQueryService: Span tracking + CQRS query metrics
- AuditLogCommandService: Span tracking + CQRS command metrics

## Metrics Interpretation

### Average Duration Calculations

Averages are calculated from successful operations only:
```
appendAvgDurationMs = appendTotalDurationMs / countOfSuccessfulAppends
```

Failed operations increment the count but do NOT contribute to total duration, giving accurate averages for healthy operations.

### Event Store Metrics

| Metric | Meaning | Good Range |
|--------|---------|-----------|
| appendAvgDurationMs | Time to write single event | < 10ms |
| queryAvgDurationMs | Time to read event batch | < 50ms |
| rebuildAvgDurationMs | Time to replay events | < 100ms per 1000 events |

### Circuit Breaker Metrics

| Metric | Meaning | Interpretation |
|--------|---------|-----------------|
| stateTransitions | Number of state changes | Low = stable, High = unstable service |
| failureCount | Cumulative failures tracked | Indicates service reliability |
| recoveryCount | Successful recoveries | High = resilient, catches and recovers from failures |

### CQRS Metrics

| Metric | Meaning | Good Range |
|--------|---------|-----------|
| commandAvgDurationMs | Write operation latency | < 50ms |
| queryAvgDurationMs | Read operation latency | < 100ms |

## Performance Characteristics

### Memory Overhead

- Metrics storage: ~500 bytes per metric type (minimal)
- Span tracking: ~1KB per concurrent span (typically < 10)
- Total memory impact: < 50KB typical

### CPU Overhead

- Metric recording: O(1) constant time
- Span creation/end: O(1) constant time
- No background threads or timers
- Minimal impact: < 1% CPU for typical workloads

### Scalability

- Handles concurrent spans: Map-based tracking supports unlimited concurrent operations
- No locks or mutexes: Safe for concurrent access via JavaScript event loop
- Memory-bounded: Spans are cleaned up on end, no accumulation

## Testing Integration

Unit tests mock the ObservabilityService:
```typescript
mockObservability = {
  startSpan: jest.fn().mockReturnValue('span-1'),
  endSpan: jest.fn().mockReturnValue({ durationMs: 10, operationName: 'test' }),
  recordCQRSQuery: jest.fn(),
  recordCQRSCommand: jest.fn(),
  recordEventStoreAppend: jest.fn(),
  // ... other methods
};

const module = Test.createTestingModule({
  providers: [
    MyService,
    { provide: ObservabilityService, useValue: mockObservability },
  ],
}).compile();
```

See `api/test/unit/audit-command.service.spec.ts` and `api/test/unit/audit-query.service.spec.ts` for reference implementations.

## Best Practices

1. **Always wrap async operations** - Ensure span is ended in success and error paths
2. **Use meaningful operation names** - Format: `module.operation` (e.g., `audit.listAuditLogs`)
3. **Include context in attributes** - Pass relevant data for debugging (IDs, counts, types)
4. **Record metrics after span end** - Metric methods take duration from endSpan result
5. **Handle errors gracefully** - Record failure metrics and propagate errors
6. **Reset metrics between test runs** - Call observability.reset() in test cleanup

## Future Enhancements

- OpenTelemetry export for distributed tracing
- Prometheus endpoints for metrics scraping
- Sentry integration for error tracking
- Grafana dashboards for visualization
- Real-time alerting on metric thresholds

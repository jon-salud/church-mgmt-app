# Observability Metrics Reference

## Complete Metrics Catalog

This document provides a comprehensive reference for all metrics tracked by the ObservabilityService.

## Event Store Metrics

### Append Operations

**Purpose:** Track event write performance

**API:**
```typescript
recordEventStoreAppend(durationMs: number, success: boolean): void
```

**Tracked Values:**
- `appendCount`: Total append operations
- `appendTotalDurationMs`: Sum of successful append durations
- `appendAvgDurationMs`: Average append duration (computed)

**Metrics Available:**
```typescript
metrics.eventStore.appendCount           // Number of append calls
metrics.eventStore.appendTotalDurationMs // Sum of successful durations
metrics.eventStore.appendAvgDurationMs   // Average (total / count)
```

**Example:**
```typescript
// Successful event append in 5ms
observability.recordEventStoreAppend(5, true);

// Failed event append (counted but no duration)
observability.recordEventStoreAppend(0, false);

// After 10 successful appends: avg = sum / count
metrics.eventStore.appendAvgDurationMs   // ~5ms average
```

**Interpretation:**
- Low average (< 5ms): Healthy event store performance
- High average (> 100ms): Event store is slow or disk is busy
- High failure count: File I/O issues or corrupt event store

### Query Operations

**Purpose:** Track event read performance

**API:**
```typescript
recordEventStoreQuery(durationMs: number, success: boolean): void
```

**Tracked Values:**
- `queryCount`: Total query operations
- `queryTotalDurationMs`: Sum of successful query durations
- `queryAvgDurationMs`: Average query duration (computed)

**Example:**
```typescript
// Query returning 100 events in 25ms
observability.recordEventStoreQuery(25, true);

// Metrics available
metrics.eventStore.queryCount           // Incremented to 1
metrics.eventStore.queryAvgDurationMs   // ~25ms
```

**Interpretation:**
- Low average (< 50ms): Query performance good for projection rebuilds
- High average (> 500ms): Event store may have many events or slow I/O
- Compare with queryCount to understand load pattern

### Rebuild Operations

**Purpose:** Track event replay performance for projections

**API:**
```typescript
recordEventStoreRebuild(durationMs: number, success: boolean): void
```

**Tracked Values:**
- `rebuildCount`: Total projection rebuild operations
- `rebuildTotalDurationMs`: Sum of successful rebuild durations
- `rebuildAvgDurationMs`: Average rebuild duration (computed)

**Example:**
```typescript
// Rebuild projection from 1000 events in 250ms
observability.recordEventStoreRebuild(250, true);

// Metrics available
metrics.eventStore.rebuildCount         // Incremented to 1
metrics.eventStore.rebuildAvgDurationMs // ~250ms (0.25ms per event)
```

**Interpretation:**
- Average per event: duration / event_count
- Expected: 0.1-1ms per event depending on event complexity
- High per-event time: Complex business logic in projection handler

## Circuit Breaker Metrics

### State Transitions

**Purpose:** Track circuit breaker state changes

**API:**
```typescript
recordCircuitBreakerTransition(fromState: CircuitBreakerState, toState: CircuitBreakerState): void
```

**Tracked Values:**
- `stateTransitions`: Count of all transitions

**Example:**
```typescript
// CLOSED → OPEN (failure threshold reached)
observability.recordCircuitBreakerTransition(CircuitBreakerState.CLOSED, CircuitBreakerState.OPEN);

// OPEN → HALF_OPEN (timeout reached)
observability.recordCircuitBreakerTransition(CircuitBreakerState.OPEN, CircuitBreakerState.HALF_OPEN);

// Metrics available
metrics.circuitBreaker.stateTransitions // Incremented by 2
```

**Interpretation:**
- Low transitions: Stable service, circuit stays CLOSED
- High transitions: Unstable service oscillating between states
- Multiple OPEN→HALF_OPEN transitions: Service in recovery attempts

### Failures

**Purpose:** Track failure events that trigger circuit breaker

**API:**
```typescript
recordCircuitBreakerFailure(): void
```

**Tracked Values:**
- `failureCount`: Total failures recorded

**Example:**
```typescript
// Datastore returns error
observability.recordCircuitBreakerFailure();

// Metrics available
metrics.circuitBreaker.failureCount // Incremented by 1
```

**Interpretation:**
- High count: Service is experiencing issues
- Correlate with transition metrics to understand state pattern
- Use for alerting on service health

### Recoveries

**Purpose:** Track successful recovery events

**API:**
```typescript
recordCircuitBreakerRecovery(): void
```

**Tracked Values:**
- `recoveryCount`: Total successful recovery attempts

**Example:**
```typescript
// HALF_OPEN → CLOSED (test request succeeded)
observability.recordCircuitBreakerRecovery();

// Metrics available
metrics.circuitBreaker.recoveryCount // Incremented by 1
```

**Interpretation:**
- High count with low state transitions: Good resilience (failures are temporary)
- Low count: Service struggles to recover once open
- For alerting: Monitor failure/recovery ratio

## CQRS Metrics

### Command Execution

**Purpose:** Track write operation (command) performance

**API:**
```typescript
recordCQRSCommand(command: string, durationMs: number, success: boolean): void
```

**Tracked Values:**
- `commandCount`: Total command operations
- `commandTotalDurationMs`: Sum of successful command durations
- `commandAvgDurationMs`: Average command duration (computed)

**Example:**
```typescript
// createAuditLog command took 15ms
observability.recordCQRSCommand('createAuditLog', 15, true);

// Failed command (counted, no duration)
observability.recordCQRSCommand('createAuditLog', 0, false);

// Metrics available
metrics.cqrs.commandCount           // Incremented to 1
metrics.cqrs.commandTotalDurationMs // Updated with 15ms
metrics.cqrs.commandAvgDurationMs   // ~15ms (1 successful)
```

**Interpretation:**
- Low average (< 50ms): Good command execution performance
- High average (> 500ms): Commands blocked on I/O or computation
- Monitor per-command to identify bottlenecks

### Query Execution

**Purpose:** Track read operation (query) performance

**API:**
```typescript
recordCQRSQuery(query: string, durationMs: number, itemCount: number): void
```

**Tracked Values:**
- `queryCount`: Total query operations
- `queryTotalDurationMs`: Sum of query durations
- `queryAvgDurationMs`: Average query duration (computed)

**Example:**
```typescript
// listAuditLogs query returned 50 items in 45ms
observability.recordCQRSQuery('listAuditLogs', 45, 50);

// Metrics available
metrics.cqrs.queryCount           // Incremented to 1
metrics.cqrs.queryTotalDurationMs // Updated with 45ms
metrics.cqrs.queryAvgDurationMs   // ~45ms (1 query)
```

**Interpretation:**
- Time per item: duration / itemCount
- Consistent times: Query is cache-efficient
- Increasing times: May indicate cache misses or growing dataset
- Monitor itemCount to understand dataset size

## Span Tracing Metrics

### Span Lifecycle

**API:**
```typescript
startSpan(operationName: string, attributes?: Record<string, any>): string
endSpan(spanId: string, status?: 'success' | 'error', errorMessage?: string): { durationMs: number; operationName: string }
```

**Example:**
```typescript
const spanId = observability.startSpan('audit.query', { filters: 'active' });

try {
  const result = await query();
  const { durationMs } = observability.endSpan(spanId, 'success');
  return result;
} catch (error) {
  const { durationMs } = observability.endSpan(spanId, 'error', error.message);
  throw error;
}
```

**Span Information:**
- Unique ID for tracing through operation
- Operation name for debugging
- Custom attributes for context
- Duration in milliseconds
- Success/error status for tracking

## Aggregated Metrics

### getMetrics() Output Structure

```typescript
{
  timestamp: number;
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
  };
  circuitBreaker: {
    stateTransitions: number;
    failureCount: number;
    recoveryCount: number;
  };
  cqrs: {
    commandCount: number;
    commandTotalDurationMs: number;
    commandAvgDurationMs: number;
    queryCount: number;
    queryTotalDurationMs: number;
    queryAvgDurationMs: number;
  };
}
```

## Common Metric Patterns

### Pattern 1: Monitoring Service Slowdown

```typescript
const metrics = observability.getMetrics();

// Check if queries are getting slower
if (metrics.cqrs.queryAvgDurationMs > 100) {
  console.warn('Queries are slow, possible cache issues');
}

// Check event store performance
if (metrics.eventStore.appendAvgDurationMs > 50) {
  console.warn('Event appends are slow, possible disk I/O');
}
```

### Pattern 2: Tracking Reliability

```typescript
const metrics = observability.getMetrics();

// Circuit breaker health
const failureRate = metrics.circuitBreaker.failureCount / 
                   (metrics.circuitBreaker.failureCount + metrics.circuitBreaker.recoveryCount);

if (failureRate > 0.1) {
  console.error('Service failure rate > 10%');
}
```

### Pattern 3: Understanding Load

```typescript
const metrics = observability.getMetrics();

// Track command volume
const commandsPerSecond = metrics.cqrs.commandCount / timeElapsedSeconds;

// Track average command time
const totalCommandTime = metrics.cqrs.commandTotalDurationMs;

console.log(`Commands: ${commandsPerSecond}/sec, Avg: ${metrics.cqrs.commandAvgDurationMs}ms`);
```

## Metric Collection Best Practices

1. **Collect metrics at operation boundaries** - Record when operations complete
2. **Include success status** - Distinguish between successful and failed operations
3. **Use meaningful names** - Make operation names self-documenting
4. **Record both count and duration** - Understand both frequency and latency
5. **Reset periodically** - Clear old metrics to prevent unbounded memory growth
6. **Correlate with traces** - Use span IDs to correlate with structured logs

## Alerts & Thresholds

Suggested alert thresholds for production:

| Metric | Warning | Critical |
|--------|---------|----------|
| appendAvgDurationMs | > 20ms | > 100ms |
| queryAvgDurationMs | > 100ms | > 500ms |
| commandAvgDurationMs | > 100ms | > 500ms |
| failureCount | > 10 | > 50 |
| stateTransitions | > 5/min | > 20/min |

Adjust based on your service SLAs and performance targets.

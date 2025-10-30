# Observability Infrastructure Documentation

This folder contains comprehensive documentation for the observability infrastructure implemented in Sprint 6B.4-6B.5, including metrics collection, span tracing, and monitoring setup guides.

## 📚 Documentation Guide

### Getting Started

**New to observability?** Start here:
1. Read [OBSERVABILITY_ARCHITECTURE.md](./OBSERVABILITY_ARCHITECTURE.md) for an overview of the system
2. Check [SPAN_TRACING_GUIDE.md](./SPAN_TRACING_GUIDE.md) for usage patterns

### For Developers

- **[OBSERVABILITY_INTEGRATION_EXAMPLES.md](./OBSERVABILITY_INTEGRATION_EXAMPLES.md)** - How to add observability to your services
  - Quick start (3 steps)
  - Audit Module reference implementation
  - Before/after code examples
  - Testing patterns
  - Integration checklist

### For Operations & DevOps

- **[OBSERVABILITY_PRODUCTION_SETUP.md](./OBSERVABILITY_PRODUCTION_SETUP.md)** - Production deployment guide
  - Metrics endpoints and health checks
  - Prometheus integration with PromQL queries
  - Datadog and CloudWatch setup
  - Alert configuration and routing
  - Grafana dashboards
  - Troubleshooting and maintenance

### For Architects & Performance Engineers

- **[OBSERVABILITY_PERFORMANCE.md](./OBSERVABILITY_PERFORMANCE.md)** - Performance characteristics
  - Per-operation overhead (0.07-0.15ms)
  - Scalability analysis
  - Memory management and optimization
  - Load testing results
  - Capacity planning
  - Environment-specific tuning

### Reference Materials

- **[OBSERVABILITY_ARCHITECTURE.md](./OBSERVABILITY_ARCHITECTURE.md)** - System design and principles
  - Design principles
  - Architecture components
  - Integration patterns
  - Metrics interpretation
  - Best practices

- **[OBSERVABILITY_METRICS_REFERENCE.md](./OBSERVABILITY_METRICS_REFERENCE.md)** - Complete metrics catalog
  - Event Store metrics
  - Circuit Breaker metrics
  - CQRS metrics
  - Alert thresholds
  - PromQL query examples

- **[SPAN_TRACING_GUIDE.md](./SPAN_TRACING_GUIDE.md)** - Span tracing API reference
  - Basic usage (startSpan/endSpan)
  - Complete lifecycle examples
  - Advanced patterns
  - Naming conventions
  - Error handling
  - Logging integration
  - Testing techniques

## 🚀 Quick Start

### Add Observability to a Service

```typescript
// 1. Import ObservabilityModule
@Module({
  imports: [ObservabilityModule],
  providers: [MyService],
})
export class MyModule {}

// 2. Inject ObservabilityService
@Injectable()
export class MyService {
  constructor(private readonly observability: ObservabilityService) {}

  // 3. Wrap operations with spans
  async getItem(id: string): Promise<Item> {
    const spanId = this.observability.startSpan('mymodule.getItem', { id });
    try {
      const item = await this.repository.findById(id);
      const { durationMs } = this.observability.endSpan(spanId, 'success');
      this.observability.recordCQRSQuery('getItem', durationMs, 1);
      return item;
    } catch (error) {
      const { durationMs } = this.observability.endSpan(spanId, 'error', error.message);
      this.observability.recordCQRSQuery('getItem', durationMs, 0);
      throw error;
    }
  }
}
```

See [OBSERVABILITY_INTEGRATION_EXAMPLES.md](./OBSERVABILITY_INTEGRATION_EXAMPLES.md) for more details.

### Monitor in Production

```bash
# 1. Scrape metrics endpoint
curl http://localhost:3001/api/v1/observability/metrics

# 2. Configure Prometheus
# Add to prometheus.yml:
# - job_name: 'church-api'
#   metrics_path: '/api/v1/observability/metrics'
#   static_configs:
#     - targets: ['localhost:3001']

# 3. Query in Prometheus
# avg(event_store_append_duration_ms) over (5m)
# rate(event_store_append_errors_total[5m])
```

See [OBSERVABILITY_PRODUCTION_SETUP.md](./OBSERVABILITY_PRODUCTION_SETUP.md) for complete setup guide.

## 📊 Key Metrics

| Metric | Category | Purpose |
|--------|----------|---------|
| `event_store_append_duration_ms` | Event Store | Track append operation latency |
| `event_store_query_duration_ms` | Event Store | Track query operation latency |
| `circuit_breaker_state` | Circuit Breaker | Monitor circuit breaker health (0=closed, 1=open, 2=half-open) |
| `cqrs_command_duration_ms` | CQRS | Track command execution time |
| `cqrs_query_duration_ms` | CQRS | Track query execution time |

See [OBSERVABILITY_METRICS_REFERENCE.md](./OBSERVABILITY_METRICS_REFERENCE.md) for complete reference.

## 🎯 By Role

### Developer
1. Read [OBSERVABILITY_ARCHITECTURE.md](./OBSERVABILITY_ARCHITECTURE.md) - understand the system
2. Follow [OBSERVABILITY_INTEGRATION_EXAMPLES.md](./OBSERVABILITY_INTEGRATION_EXAMPLES.md) - integrate observability
3. Review [SPAN_TRACING_GUIDE.md](./SPAN_TRACING_GUIDE.md) - naming conventions and best practices
4. Check [OBSERVABILITY_PERFORMANCE.md](./OBSERVABILITY_PERFORMANCE.md) - understand overhead

### DevOps Engineer
1. Read [OBSERVABILITY_PRODUCTION_SETUP.md](./OBSERVABILITY_PRODUCTION_SETUP.md) - complete guide for setup
2. Reference [OBSERVABILITY_METRICS_REFERENCE.md](./OBSERVABILITY_METRICS_REFERENCE.md) - all available metrics
3. Review [OBSERVABILITY_PERFORMANCE.md](./OBSERVABILITY_PERFORMANCE.md) - capacity planning

### Architect/Performance Engineer
1. Study [OBSERVABILITY_ARCHITECTURE.md](./OBSERVABILITY_ARCHITECTURE.md) - design principles
2. Review [OBSERVABILITY_PERFORMANCE.md](./OBSERVABILITY_PERFORMANCE.md) - overhead analysis and optimization

## 📈 Performance Summary

- **Per-Operation Overhead**: 0.07-0.15ms (negligible for most use cases)
- **CPU Impact**: <0.5% at 10,000 req/sec
- **Memory Growth**: ~1.2KB per tracked operation
- **Sampling**: Can reduce overhead by 90% while maintaining statistical accuracy

See [OBSERVABILITY_PERFORMANCE.md](./OBSERVABILITY_PERFORMANCE.md) for detailed analysis.

## 🔗 Related Documentation

- [CODING_STANDARDS.md](../CODING_STANDARDS.md) - Dependency injection patterns
- [REFACTORING_CHECKLIST.md](../REFACTORING_CHECKLIST.md) - Sprint 6B progress
- [TASKS.md](../TASKS.md) - Project tasks and status

## 📞 Questions?

Refer to the troubleshooting sections in:
- [OBSERVABILITY_INTEGRATION_EXAMPLES.md](./OBSERVABILITY_INTEGRATION_EXAMPLES.md#integration-checklist) - Integration issues
- [OBSERVABILITY_PRODUCTION_SETUP.md](./OBSERVABILITY_PRODUCTION_SETUP.md#6-troubleshooting) - Operational issues
- [OBSERVABILITY_PERFORMANCE.md](./OBSERVABILITY_PERFORMANCE.md#8-troubleshooting-performance-issues) - Performance issues

# Observability Production Setup Guide

## Overview

This guide covers deploying observability infrastructure to production, consuming metrics in monitoring systems, setting up alerting, and monitoring application health.

## 1. Exposing Metrics

### 1.1 Metrics Endpoint

Create an endpoint to expose metrics in a format compatible with monitoring systems:

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { ObservabilityService } from '../../observability/observability.service';

@Controller('api/v1/observability')
export class ObservabilityController {
  constructor(private readonly observability: ObservabilityService) {}

  /**
   * Get current metrics
   * Production monitoring systems poll this endpoint regularly
   */
  @Get('metrics')
  getMetrics() {
    const metrics = this.observability.getMetrics();
    return this.transformToPrometheusFormat(metrics);
  }

  /**
   * Health check endpoint
   * Used by load balancers to determine instance health
   */
  @Get('health')
  getHealth() {
    const metrics = this.observability.getMetrics();
    
    // Consider unhealthy if circuit breaker is open
    const isHealthy = metrics.circuitBreaker.currentState !== 'open';
    
    return {
      status: isHealthy ? 'healthy' : 'degraded',
      circuitBreakerState: metrics.circuitBreaker.currentState,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset metrics (admin only in production)
   */
  @Post('metrics/reset')
  resetMetrics() {
    this.observability.reset();
    return { success: true };
  }

  private transformToPrometheusFormat(metrics: any) {
    const timestamp = Date.now();
    return {
      // Event store metrics
      'event_store_append_total': metrics.eventStore.appendCount,
      'event_store_append_errors_total': metrics.eventStore.appendFailures,
      'event_store_append_duration_ms': metrics.eventStore.appendAvgDurationMs,
      'event_store_append_duration_p95_ms': this.calculateP95(metrics.eventStore.appendDurations),
      'event_store_append_duration_p99_ms': this.calculateP99(metrics.eventStore.appendDurations),
      
      'event_store_query_total': metrics.eventStore.queryCount,
      'event_store_query_errors_total': metrics.eventStore.queryFailures,
      'event_store_query_duration_ms': metrics.eventStore.queryAvgDurationMs,
      
      'event_store_rebuild_total': metrics.eventStore.rebuildCount,
      'event_store_rebuild_errors_total': metrics.eventStore.rebuildFailures,
      'event_store_rebuild_duration_ms': metrics.eventStore.rebuildAvgDurationMs,

      // Circuit breaker metrics
      'circuit_breaker_state': this.stateToNumber(metrics.circuitBreaker.currentState),
      'circuit_breaker_transitions_total': metrics.circuitBreaker.stateTransitions,
      'circuit_breaker_failures_total': metrics.circuitBreaker.failureCount,
      'circuit_breaker_recoveries_total': metrics.circuitBreaker.recoveryCount,

      // CQRS metrics
      'cqrs_command_total': metrics.cqrs.commandCount,
      'cqrs_command_failures_total': metrics.cqrs.commandFailures,
      'cqrs_command_duration_ms': metrics.cqrs.commandAvgDurationMs,
      
      'cqrs_query_total': metrics.cqrs.queryCount,
      'cqrs_query_failures_total': metrics.cqrs.queryFailures,
      'cqrs_query_duration_ms': metrics.cqrs.queryAvgDurationMs,

      // Timestamp for freshness verification
      timestamp_ms: timestamp,
    };
  }

  private stateToNumber(state: string): number {
    const states: Record<string, number> = {
      'closed': 0,
      'open': 1,
      'half-open': 2,
    };
    return states[state] ?? 3;
  }

  private calculateP95(durations: number[]): number {
    if (durations.length === 0) return 0;
    const sorted = [...durations].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * 0.95)];
  }

  private calculateP99(durations: number[]): number {
    if (durations.length === 0) return 0;
    const sorted = [...durations].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * 0.99)];
  }
}
```

### 1.2 Register Observability Controller

```typescript
import { Module } from '@nestjs/common';
import { ObservabilityModule } from '../../observability/observability.module';
import { ObservabilityController } from './observability.controller';

@Module({
  imports: [ObservabilityModule],
  controllers: [ObservabilityController],
})
export class ObservabilityExportModule {}
```

## 2. Integration with Monitoring Systems

### 2.1 Prometheus Integration

#### Setup Prometheus Scraper

Add to `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'church-api'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/api/v1/observability/metrics'
    scrape_interval: 30s
    scrape_timeout: 10s
```

#### PromQL Queries for Common Scenarios

```promql
# Average request latency
avg(event_store_append_duration_ms) over (5m)

# 95th percentile latency
event_store_append_duration_p95_ms

# Error rate
rate(event_store_append_errors_total[5m]) / rate(event_store_append_total[5m])

# Circuit breaker health
circuit_breaker_state == 1  # 1 = open (unhealthy)

# CQRS command success rate
rate(cqrs_command_total[5m]) - rate(cqrs_command_failures_total[5m])
```

### 2.2 Datadog Integration

Create a custom metric publisher:

```typescript
@Injectable()
export class DatadogMetricsPublisher {
  constructor(
    private readonly observability: ObservabilityService,
    private readonly http: HttpClient,
  ) {}

  /**
   * Publish metrics to Datadog API
   * Run this on a timer (e.g., every 30 seconds)
   */
  async publishMetrics() {
    const metrics = this.observability.getMetrics();
    
    const datadogMetrics = [
      {
        metric: 'event_store.append.avg_duration_ms',
        points: [[Date.now() / 1000, metrics.eventStore.appendAvgDurationMs]],
        type: 'gauge',
        tags: ['service:church-api', 'module:event-store'],
      },
      {
        metric: 'event_store.append.error_rate',
        points: [[
          Date.now() / 1000,
          this.calculateErrorRate(
            metrics.eventStore.appendFailures,
            metrics.eventStore.appendCount
          ),
        ]],
        type: 'gauge',
        tags: ['service:church-api', 'module:event-store'],
      },
      {
        metric: 'circuit_breaker.state',
        points: [[Date.now() / 1000, this.stateToNumber(metrics.circuitBreaker.currentState)]],
        type: 'gauge',
        tags: ['service:church-api', 'module:circuit-breaker'],
      },
      {
        metric: 'cqrs.command.avg_duration_ms',
        points: [[Date.now() / 1000, metrics.cqrs.commandAvgDurationMs]],
        type: 'gauge',
        tags: ['service:church-api', 'module:cqrs', 'operation:command'],
      },
      {
        metric: 'cqrs.query.avg_duration_ms',
        points: [[Date.now() / 1000, metrics.cqrs.queryAvgDurationMs]],
        type: 'gauge',
        tags: ['service:church-api', 'module:cqrs', 'operation:query'],
      },
    ];

    const apiKey = process.env.DATADOG_API_KEY;
    await this.http.post(
      'https://api.datadoghq.com/api/v1/series',
      { series: datadogMetrics },
      {
        headers: { 'DD-API-KEY': apiKey },
      }
    ).toPromise();
  }

  private calculateErrorRate(failures: number, total: number): number {
    if (total === 0) return 0;
    return (failures / total) * 100;
  }

  private stateToNumber(state: string): number {
    const states: Record<string, number> = { 'closed': 0, 'open': 1, 'half-open': 2 };
    return states[state] ?? 3;
  }
}
```

### 2.3 CloudWatch Integration (AWS)

```typescript
@Injectable()
export class CloudWatchMetricsPublisher {
  private readonly cloudwatch = new AWS.CloudWatch();

  constructor(private readonly observability: ObservabilityService) {}

  async publishMetrics() {
    const metrics = this.observability.getMetrics();

    const params = {
      Namespace: 'ChurchApp/API',
      MetricData: [
        {
          MetricName: 'EventStoreAppendLatency',
          Value: metrics.eventStore.appendAvgDurationMs,
          Unit: 'Milliseconds',
          Timestamp: new Date(),
          Dimensions: [{ Name: 'Environment', Value: process.env.NODE_ENV }],
        },
        {
          MetricName: 'EventStoreErrorRate',
          Value: (metrics.eventStore.appendFailures / metrics.eventStore.appendCount) * 100,
          Unit: 'Percent',
          Timestamp: new Date(),
          Dimensions: [{ Name: 'Environment', Value: process.env.NODE_ENV }],
        },
        {
          MetricName: 'CircuitBreakerHealth',
          Value: metrics.circuitBreaker.currentState === 'closed' ? 1 : 0,
          Unit: 'None',
          Timestamp: new Date(),
          Dimensions: [{ Name: 'Environment', Value: process.env.NODE_ENV }],
        },
      ],
    };

    await this.cloudwatch.putMetricData(params).promise();
  }
}
```

## 3. Alerting Configuration

### 3.1 Prometheus Alert Rules

Create `alerts.yml`:

```yaml
groups:
  - name: church-api-alerts
    interval: 30s
    rules:
      # High latency alert
      - alert: HighEventStoreLatency
        expr: event_store_append_duration_ms > 500
        for: 5m
        annotations:
          summary: "High event store latency detected"
          description: "Average append latency is {{ $value }}ms"

      # Error rate alert
      - alert: HighEventStoreErrorRate
        expr: |
          (rate(event_store_append_errors_total[5m]) / 
           rate(event_store_append_total[5m])) > 0.05
        for: 3m
        annotations:
          summary: "High event store error rate"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # Circuit breaker open alert
      - alert: CircuitBreakerOpen
        expr: circuit_breaker_state == 1
        for: 1m
        annotations:
          summary: "Circuit breaker is open"
          description: "Circuit breaker has been open for more than 1 minute"

      # High query latency alert
      - alert: HighCQRSQueryLatency
        expr: cqrs_query_duration_ms > 1000
        for: 5m
        annotations:
          summary: "High CQRS query latency"
          description: "Average query latency is {{ $value }}ms"

      # Query error rate alert
      - alert: HighCQRSQueryErrorRate
        expr: |
          (rate(cqrs_query_failures_total[5m]) / 
           rate(cqrs_query_total[5m])) > 0.10
        for: 3m
        annotations:
          summary: "High CQRS query error rate"
          description: "Error rate is {{ $value | humanizePercentage }}"
```

### 3.2 Alert Routing

In `alertmanager.yml`:

```yaml
route:
  receiver: 'critical'
  group_by: ['alertname']
  routes:
    - match:
        severity: 'critical'
      receiver: 'oncall'
      group_wait: 0s
      group_interval: 30s
      repeat_interval: 4h

    - match:
        severity: 'warning'
      receiver: 'team-slack'
      group_wait: 1m
      group_interval: 10m
      repeat_interval: 1h

receivers:
  - name: 'critical'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'

  - name: 'oncall'
    email_configs:
      - to: 'oncall@church.org'
        smarthost: 'smtp.gmail.com:587'

  - name: 'team-slack'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#alerts'
```

## 4. Monitoring Dashboard

### 4.1 Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Church API Observability",
    "panels": [
      {
        "title": "Event Store Performance",
        "targets": [
          {
            "expr": "event_store_append_duration_ms",
            "legendFormat": "Append Latency"
          },
          {
            "expr": "event_store_query_duration_ms",
            "legendFormat": "Query Latency"
          }
        ],
        "gridPos": { "x": 0, "y": 0, "w": 12, "h": 8 }
      },
      {
        "title": "Circuit Breaker Health",
        "targets": [
          {
            "expr": "circuit_breaker_state",
            "legendFormat": "State (0=closed, 1=open, 2=half-open)"
          }
        ],
        "gridPos": { "x": 12, "y": 0, "w": 12, "h": 8 }
      },
      {
        "title": "Error Rates",
        "targets": [
          {
            "expr": "rate(event_store_append_errors_total[5m])",
            "legendFormat": "Event Store Errors"
          },
          {
            "expr": "rate(cqrs_command_failures_total[5m])",
            "legendFormat": "CQRS Command Errors"
          }
        ],
        "gridPos": { "x": 0, "y": 8, "w": 12, "h": 8 }
      },
      {
        "title": "CQRS Operations",
        "targets": [
          {
            "expr": "rate(cqrs_command_total[5m])",
            "legendFormat": "Commands/sec"
          },
          {
            "expr": "rate(cqrs_query_total[5m])",
            "legendFormat": "Queries/sec"
          }
        ],
        "gridPos": { "x": 12, "y": 8, "w": 12, "h": 8 }
      }
    ]
  }
}
```

## 5. Production Best Practices

### 5.1 Metric Retention Policy

```typescript
@Injectable()
export class MetricsRetentionService {
  constructor(private readonly observability: ObservabilityService) {}

  @Cron('0 */6 * * *')  // Every 6 hours
  cleanOldMetrics() {
    // In production, metrics should be exported before being cleared
    // This prevents unbounded memory growth

    const metrics = this.observability.getMetrics();
    
    // Keep only last 1000 duration samples per metric
    this.pruneMetric(metrics.eventStore, 1000);
    this.pruneMetric(metrics.circuitBreaker, 1000);
    this.pruneMetric(metrics.cqrs, 1000);
  }

  private pruneMetric(metric: any, maxSamples: number) {
    ['appendDurations', 'queryDurations', 'rebuildDurations', 'stateTransitionTimes'].forEach(
      (field) => {
        if (metric[field] && metric[field].length > maxSamples) {
          metric[field] = metric[field].slice(-maxSamples);
        }
      }
    );
  }
}
```

### 5.2 Metrics Export Before Shutdown

```typescript
@Injectable()
export class GracefulShutdownService {
  constructor(
    private readonly observability: ObservabilityService,
    private readonly metricsPublisher: DatadogMetricsPublisher,
  ) {}

  async shutdown() {
    console.log('Publishing final metrics before shutdown...');
    
    // Export metrics one final time
    await this.metricsPublisher.publishMetrics();
    
    // Log final metrics to persistent storage
    const metrics = this.observability.getMetrics();
    console.log('Final metrics:', JSON.stringify(metrics, null, 2));
  }
}
```

### 5.3 Environment-Specific Configuration

```typescript
// environment.prod.ts
export const observabilityConfig = {
  enabled: true,
  exportInterval: 30000,  // Every 30 seconds
  metricsRetention: 10000,  // Keep 10k samples
  alertingThresholds: {
    latencyMs: 500,
    errorRatePercent: 5,
    circuitBreakerRecoveryAttempts: 3,
  },
};

// environment.staging.ts
export const observabilityConfig = {
  enabled: true,
  exportInterval: 60000,  // Every 60 seconds
  metricsRetention: 5000,
  alertingThresholds: {
    latencyMs: 1000,
    errorRatePercent: 10,
    circuitBreakerRecoveryAttempts: 5,
  },
};

// environment.dev.ts
export const observabilityConfig = {
  enabled: true,
  exportInterval: 300000,  // Every 5 minutes
  metricsRetention: 1000,
  alertingThresholds: {
    latencyMs: 2000,
    errorRatePercent: 20,
    circuitBreakerRecoveryAttempts: 10,
  },
};
```

### 5.4 Health Check Integration

```typescript
@Injectable()
export class HealthCheck implements HealthIndicator {
  constructor(private readonly observability: ObservabilityService) {}

  check(): HealthCheckResult {
    const metrics = this.observability.getMetrics();

    const circuitBreakerHealthy = metrics.circuitBreaker.currentState === 'closed';
    const errorRate = this.calculateErrorRate(
      metrics.eventStore.appendFailures,
      metrics.eventStore.appendCount
    );
    const errorRateAcceptable = errorRate < 5;

    const status = circuitBreakerHealthy && errorRateAcceptable ? 'up' : 'down';

    return {
      status,
      details: {
        circuitBreaker: metrics.circuitBreaker.currentState,
        errorRate: `${errorRate.toFixed(2)}%`,
        avgLatency: `${metrics.eventStore.appendAvgDurationMs.toFixed(2)}ms`,
      },
    };
  }

  private calculateErrorRate(failures: number, total: number): number {
    if (total === 0) return 0;
    return (failures / total) * 100;
  }
}
```

## 6. Troubleshooting

### Metrics Not Appearing

1. Verify observability endpoint is accessible: `curl http://localhost:3001/api/v1/observability/metrics`
2. Check monitoring system scrape logs
3. Verify metrics are being recorded in services (check logs for span creation)
4. Ensure ObservabilityModule is imported in all relevant modules

### High Memory Usage

1. Implement metric retention policy (see 5.1)
2. Reduce duration sample count from 1000 to 500
3. Increase export/cleanup interval
4. Monitor span lifecycle - ensure endSpan is always called

### Missing Latency Data

1. Verify try/catch blocks include observability calls
2. Check that endSpan is called in both success and error paths
3. Use finally blocks to ensure metrics are recorded: `finally { this.observability.endSpan(...) }`
4. Review test mocks to ensure observability is properly mocked

## 7. Maintenance Checklist

- [ ] Metrics endpoint responding within SLA
- [ ] Monitoring system receiving metrics regularly
- [ ] Alert rules firing for test scenarios
- [ ] Dashboard displaying all expected metrics
- [ ] Metric retention policy preventing memory leaks
- [ ] Health check endpoint returns accurate status
- [ ] Final metrics exported before planned maintenance shutdowns
- [ ] Alerting escalation paths validated
- [ ] Team trained on interpreting observability dashboards

import { Injectable } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';

type MetricLabels = {
  method: string;
  route: string;
  status: string;
};

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly httpRequestCounter;
  private readonly httpRequestDuration;

  constructor() {
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'church_app_',
    });

    this.httpRequestCounter = new Counter({
      registers: [this.registry],
      name: 'church_app_http_requests_total',
      help: 'Total number of HTTP requests received',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpRequestDuration = new Histogram({
      registers: [this.registry],
      name: 'church_app_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    });
  }

  recordRequest(method: string, route: string | undefined, status: number, durationSeconds: number) {
    const labels: MetricLabels = {
      method: method.toUpperCase(),
      route: route ?? 'unmapped',
      status: String(status),
    };
    this.httpRequestCounter.inc(labels);
    this.httpRequestDuration.observe(labels, Math.max(durationSeconds, 0));
  }

  async snapshot() {
    return this.registry.metrics();
  }
}

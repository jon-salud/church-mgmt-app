import { Injectable, OnModuleInit } from '@nestjs/common';
import { Meter, metrics } from '@opentelemetry/api';
import { trace, Tracer } from '@opentelemetry/api';

@Injectable()
export class OpenTelemetryService implements OnModuleInit {
  private _meter!: Meter;
  private _tracer!: Tracer;

  onModuleInit() {
    // Get the global meter and tracer
    this._meter = metrics.getMeter('church-api', '1.0.0');
    this._tracer = trace.getTracer('church-api', '1.0.0');
  }

  get meter(): Meter {
    return this._meter;
  }

  get tracer(): Tracer {
    return this._tracer;
  }

  // Convenience methods for creating instruments
  createCounter(name: string, options?: { description?: string; unit?: string }) {
    return this._meter.createCounter(name, options);
  }

  createHistogram(name: string, options?: { description?: string; unit?: string }) {
    return this._meter.createHistogram(name, options);
  }

  createGauge(name: string, options?: { description?: string; unit?: string }) {
    return this._meter.createGauge(name, options);
  }

  createObservableGauge(name: string, options?: { description?: string; unit?: string }) {
    return this._meter.createObservableGauge(name, options);
  }

  // Convenience methods for tracing
  startSpan(name: string, options?: any) {
    return this._tracer.startSpan(name, options);
  }

  startActiveSpan<T>(name: string, fn: (span: any) => T): T {
    return this._tracer.startActiveSpan(name, fn);
  }
}

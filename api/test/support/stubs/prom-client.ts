export class Registry {
  metrics() {
    return '# Prometheus metrics disabled in test environment\n';
  }
}

export const collectDefaultMetrics = () => undefined;

export class Counter<TLabels extends string = string> {
  constructor(_config: any) {}
  inc(_labels?: Record<TLabels, string>, _value?: number) {}
}

export class Histogram<TLabels extends string = string> {
  constructor(_config: any) {}
  observe(_labels?: Record<TLabels, string>, _value?: number) {}
}

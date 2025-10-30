import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { detectResources } from '@opentelemetry/resources';

// Create resource with service information
const resource = detectResources();

// Configure Prometheus exporter for metrics
const prometheusExporter = new PrometheusExporter({
  port: 9464, // Default Prometheus metrics port
  endpoint: '/metrics',
});

// Configure Jaeger exporter for traces
const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
});

// Initialize OpenTelemetry SDK
export const sdk = new NodeSDK({
  resource,
  metricReader: prometheusExporter,
  traceExporter: jaegerExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable auto-instrumentation for specific packages we handle manually
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-fastify': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-ioredis': {
        enabled: false, // We don't use Redis yet
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: false, // We use Prisma, not direct PG
      },
    }),
  ],
});

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    // eslint-disable-next-line no-console
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    // eslint-disable-next-line no-console
    .catch(error => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  sdk
    .shutdown()
    // eslint-disable-next-line no-console
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    // eslint-disable-next-line no-console
    .catch(error => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { detectResources } from '@opentelemetry/resources';

// Configure Prometheus exporter for metrics
const prometheusExporter = new PrometheusExporter({
  port: 9464, // Default Prometheus metrics port
  endpoint: '/metrics',
});

// Configure Jaeger exporter for traces
const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
});

// Initialize OpenTelemetry SDK asynchronously
let sdk: NodeSDK | undefined;

export const initializeOpenTelemetry = async () => {
  const resource = await detectResources();

  sdk = new NodeSDK({
    resource,
    metricReader: prometheusExporter,
    traceExporter: jaegerExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Selectively enable auto-instrumentation for relevant packages
        // Enable HTTP and Fastify for web request tracing
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-fastify': {
          enabled: true,
        },
        // Disable packages we don't use or handle manually
        '@opentelemetry/instrumentation-ioredis': {
          enabled: false, // We don't use Redis yet
        },
        '@opentelemetry/instrumentation-pg': {
          enabled: false, // We use Prisma, not direct PG
        },
      }),
    ],
  });

  return sdk;
};

// Graceful shutdown
const shutdownOpenTelemetry = async () => {
  if (sdk) {
    await sdk.shutdown();
    // eslint-disable-next-line no-console
    console.log('OpenTelemetry SDK shut down successfully');
  }
};

process.on('SIGTERM', () => {
  shutdownOpenTelemetry()
    // eslint-disable-next-line no-console
    .catch((error: unknown) => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  shutdownOpenTelemetry()
    // eslint-disable-next-line no-console
    .catch((error: unknown) => console.error('Error shutting down OpenTelemetry SDK', error))
    .finally(() => process.exit(0));
});

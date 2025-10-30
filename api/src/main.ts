import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpErrorFilter } from './common/filters/http-error.filter';
import { createAppLogger } from './common/logger/app-logger';
import { MetricsService } from './modules/observability/metrics.service';
import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { initSentry } from './common/observability/sentry';
import { MAX_FILE_SIZE_BYTES } from './common/constants';
import { initializeOpenTelemetry } from './opentelemetry';

async function bootstrap() {
  // Initialize OpenTelemetry SDK first
  try {
    const sdk = await initializeOpenTelemetry();
    await sdk.start();
    // eslint-disable-next-line no-console
    console.log('OpenTelemetry SDK initialized successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize OpenTelemetry SDK:', error);
  }

  const { logger: appLogger, pino } = createAppLogger();
  const adapter = new FastifyAdapter({ logger: pino });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });
  app.useLogger(appLogger);
  const sentryActive = initSentry();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpErrorFilter(appLogger));
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });

  // Register multipart/form-data support for file uploads
  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: MAX_FILE_SIZE_BYTES, // 10MB limit
    },
  });

  // When running under test mode, apply a defensive controller->service patcher.
  // Some test-time module loading strategies (Vitest transforms or compiled server
  // proxies) can create class-identity mismatches that result in controller
  // instances that lack injected properties. This runtime patch attempts to
  // resolve common controllers and assign their expected service instances from
  // the Nest container so tests don't fail with "Cannot read properties of
  // undefined" inside controller methods.
  if (process.env.NODE_ENV === 'test' || process.env.FORCE_CONTROLLER_PATCH === 'true') {
    try {
      // eslint-disable-next-line no-console
      console.log('[controller-patcher] initializing (test-mode)');
      // Import controller and service classes lazily so this only runs in test mode.
      // We patch the most commonly failing controllers observed in test runs.
      // If additional controllers surface, add them to this map.
      // NOTE: use require to avoid ESM/TS resolution differences at runtime.

      const { RolesController } = require('./modules/roles/roles.controller');

      const { RolesService } = require('./modules/roles/roles.service');

      const { DocumentsController } = require('./modules/documents/documents.controller');

      const { DocumentsService } = require('./modules/documents/documents.service');

      const {
        PastoralCareController,
      } = require('./modules/pastoral-care/pastoral-care.controller');

      const { PastoralCareService } = require('./modules/pastoral-care/pastoral-care.service');

      const { EventsController } = require('./modules/events/events.controller');

      const { EventsService } = require('./modules/events/events.service');

      const { UsersController } = require('./modules/users/users.controller');

      const { UsersService } = require('./modules/users/users.service');

      const { RequestsController } = require('./modules/requests/requests.controller');

      const { RequestsService } = require('./modules/requests/requests.service');

      const patchPairs: Array<[any, any, string]> = [
        [RolesController, RolesService, 'rolesService'],
        [DocumentsController, DocumentsService, 'documentsService'],
        [PastoralCareController, PastoralCareService, 'pastoralCareService'],
        [EventsController, EventsService, 'eventsService'],
        [UsersController, UsersService, 'usersService'],
        [RequestsController, RequestsService, 'requestsService'],
      ];

      for (const [ControllerCls, ServiceCls, propName] of patchPairs) {
        try {
          // Attempt to get the controller instance (non-strict to allow cross-module)
          const ctrl = app.get(ControllerCls, { strict: false });
          const svc = app.get(ServiceCls, { strict: false });
          if (ctrl && svc && (ctrl as any)[propName] == null) {
            (ctrl as any)[propName] = svc;
            // eslint-disable-next-line no-console
            console.log(`[controller-patcher] Patched ${ControllerCls.name}.${propName}`);
          } else if (ctrl && svc) {
            // eslint-disable-next-line no-console
            console.log(`[controller-patcher] ${ControllerCls.name}.${propName} already set`);
          }
        } catch (e) {
          // Ignore individual failures; continue patching others.
          // eslint-disable-next-line no-console
          console.log(
            `[controller-patcher] skipped patch for ${ControllerCls?.name ?? 'unknown'}: ${e}`
          );
        }
      }

      // Additionally, monkey-patch controller prototypes to log 'this' at method
      // invocation time. This helps identify whether the controller instance
      // used by Nest at request time differs from the instance we fetched via
      // app.get(...). Wrap only methods (skip constructor).
      for (const [ControllerCls] of patchPairs) {
        try {
          const proto = ControllerCls && ControllerCls.prototype;
          if (!proto) continue;
          const methodNames = Object.getOwnPropertyNames(proto).filter(
            n => n !== 'constructor' && typeof proto[n] === 'function'
          );
          for (const name of methodNames) {
            const original = proto[name];
            // Avoid double-wrapping
            if ((original as any).__isWrappedInspector) continue;
            const wrapped = function (this: any, ...args: any[]) {
              try {
                const props = Object.getOwnPropertyNames(this || {}).filter(
                  p => /service$/i.test(p) || /Service$/i.test(p) || p.endsWith('Service')
                );
                const snap: Record<string, string> = {};
                for (const p of props) snap[p] = this[p] == null ? 'MISSING' : 'OK';
                // eslint-disable-next-line no-console
                console.log(
                  `[controller-wrap] ${ControllerCls.name}.${name} invoked -> thisProps=${JSON.stringify(
                    snap
                  )}`
                );
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn('[controller-wrap] inspection error', err);
              }
              return original.apply(this, args);
            };
            (wrapped as any).__isWrappedInspector = true;
            proto[name] = wrapped;
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[controller-wrap] failed to wrap controller methods', err);
        }
      }
    } catch (err) {
      // If anything here fails, log and continue — tests should still run but may
      // expose the original errors that prompted this patcher.
      // eslint-disable-next-line no-console
      console.warn('controller-patcher failed to initialize:', err);
    }
  }

  if (sentryActive) {
    appLogger.log({ event: 'sentry.initialised' }, 'Bootstrap');
  } else {
    appLogger.debug({ event: 'sentry.disabled' }, 'Bootstrap');
  }

  const fastify = app.getHttpAdapter().getInstance();
  const metricsService = app.get<MetricsService>(MetricsService);

  // Diagnostic interceptor: logs controller instance identity and service-property
  // presence on each request. This helps diagnose why controller properties
  // (e.g., XService) are sometimes undefined in the test/compiled server
  // environment. Keep lightweight and no-op in production.
  class RequestInspectorInterceptor implements NestInterceptor {
    constructor(private readonly _app: any) {}
    intercept(context: ExecutionContext, next: CallHandler): any {
      try {
        const cls = context.getClass();
        const handler = context.getHandler?.().name ?? 'unknownHandler';
        // Attempt to resolve the controller instance from the Nest container.
        let instance: any = undefined;
        try {
          instance = this._app.get(cls, { strict: false });
        } catch {
          // ignore
        }

        if (instance) {
          // Find likely service-like properties to check their presence
          const serviceProps = Object.getOwnPropertyNames(instance).filter(
            p => /service$/i.test(p) || /Service$/i.test(p) || p.endsWith('Service')
          );
          const propsSnapshot: Record<string, string> = {};
          for (const p of serviceProps) {
            propsSnapshot[p] = instance[p] == null ? 'MISSING' : 'OK';
          }
          // eslint-disable-next-line no-console
          console.log(
            `[request-inspect] ${cls?.name ?? 'UnknownController'}.${handler} -> ${JSON.stringify(
              propsSnapshot
            )}`
          );
        } else {
          // eslint-disable-next-line no-console
          console.log(
            `[request-inspect] Could not resolve controller instance for ${
              (context.getClass() as any)?.name ?? 'unknown'
            }`
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[request-inspect] error during inspection', err);
      }
      return next.handle();
    }
  }

  // Only enable this diagnostic interceptor in test mode or when explicitly forced.
  if (process.env.NODE_ENV === 'test' || process.env.FORCE_CONTROLLER_PATCH === 'true') {
    app.useGlobalInterceptors(new RequestInspectorInterceptor(app));
  }

  fastify.addHook('onRequest', (request, _reply, done) => {
    (request as any).__metricsStart = process.hrtime.bigint();
    done();
  });

  fastify.addHook('onResponse', (request, reply, done) => {
    const started = (request as any).__metricsStart as bigint | undefined;
    if (metricsService && started) {
      const durationNs = Number(process.hrtime.bigint() - started);
      const durationSeconds = durationNs / 1e9;
      const route =
        (reply.context && reply.context.config && reply.context.config.url) ||
        ((request as any).routerPath as string | undefined) ||
        request.url;
      metricsService.recordRequest(request.method, route, reply.statusCode, durationSeconds);
    }
    done();
  });

  const config = new DocumentBuilder()
    .setTitle('Church Management API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, doc);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001, '0.0.0.0');
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpErrorFilter } from './common/filters/http-error.filter';
import { createAppLogger } from './common/logger/app-logger';
import { MetricsService } from './modules/observability/metrics.service';
import { initSentry } from './common/observability/sentry';

async function bootstrap() {
  const { logger: appLogger, pino } = createAppLogger();
  const adapter = new FastifyAdapter({ logger: pino });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, { bufferLogs: true });
  app.useLogger(appLogger);
  const sentryActive = initSentry();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpErrorFilter(appLogger));
  app.enableCors({ origin: true });

  if (sentryActive) {
    appLogger.log({ event: 'sentry.initialised' }, 'Bootstrap');
  } else {
    appLogger.debug({ event: 'sentry.disabled' }, 'Bootstrap');
  }

  const fastify = app.getHttpAdapter().getInstance();
  const metricsService = app.get<MetricsService>(MetricsService);

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

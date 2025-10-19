import { LoggerService } from '@nestjs/common';
import pino, { Logger as PinoLogger, LoggerOptions } from 'pino';

const createPinoInstance = (): PinoLogger => {
  const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  const options: LoggerOptions = {
    level,
    base: {
      service: 'church-api',
      environment: process.env.NODE_ENV ?? 'development',
    },
    formatters: {
      level: label => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    messageKey: 'message',
    errorKey: 'error',
  };
  return pino(options);
};

export class AppLogger implements LoggerService {
  constructor(private readonly logger: PinoLogger = createPinoInstance()) {}

  get instance(): PinoLogger {
    return this.logger;
  }

  log(message: any, context?: string) {
    this.logger.info(this.buildPayload(message, context));
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(this.buildPayload(message, context, trace));
  }

  warn(message: any, context?: string) {
    this.logger.warn(this.buildPayload(message, context));
  }

  debug(message: any, context?: string) {
    this.logger.debug(this.buildPayload(message, context));
  }

  verbose(message: any, context?: string) {
    this.logger.trace(this.buildPayload(message, context));
  }

  private buildPayload(message: any, context?: string, trace?: string) {
    const payload: Record<string, unknown> = {};
    if (typeof message === 'object' && message !== null) {
      Object.assign(payload, message);
    } else if (message !== undefined) {
      payload.message = String(message);
    }
    if (context) {
      payload.context = context;
    }
    if (trace) {
      payload.stack = trace;
    }
    return payload;
  }
}

export const createAppLogger = () => {
  const logger = new AppLogger();
  return { logger, pino: logger.instance };
};

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, LoggerService } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { captureSentryException, isSentryEnabled } from '../observability/sentry';

type HttpExceptionResponseBody = string | { message?: string | string[]; [key: string]: unknown };

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger: LoggerService;

  constructor(logger?: LoggerService) {
    this.logger = logger ?? new Logger(HttpErrorFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const responsePayload = exception instanceof HttpException ? (exception.getResponse() as HttpExceptionResponseBody) : undefined;
    const message = this.resolveMessage(responsePayload, exception, status);
    const requestId = this.getRequestId(request);

    const body: Record<string, unknown> = {
      statusCode: status,
      error: exception instanceof HttpException ? exception.name : 'InternalServerError',
      message,
      method: request.method,
      path: request.url,
      timestamp: new Date().toISOString(),
      requestId,
    };

    if (status < HttpStatus.INTERNAL_SERVER_ERROR && responsePayload && typeof responsePayload === 'object') {
      body.details = responsePayload;
    }

    const logContext = `${request.method} ${request.url} [${status}]${requestId ? ` req:${requestId}` : ''}`;
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      if (isSentryEnabled()) {
        captureSentryException(exception, { status, path: request.url, method: request.method, requestId });
      }
      this.logger.error(logContext, exception instanceof Error ? exception.stack : undefined);
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(`${logContext} ${message}`);
    } else {
      this.logger.log(logContext);
    }

    response.status(status).send(body);
  }

  private resolveMessage(body: HttpExceptionResponseBody | undefined, exception: unknown, status: number) {
    if (typeof body === 'string' && body.trim().length > 0) {
      return body;
    }
    if (body && typeof body === 'object') {
      const rawMessage = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
        return rawMessage;
      }
    }
    if (exception instanceof Error && exception.message) {
      return exception.message;
    }
    return status >= HttpStatus.INTERNAL_SERVER_ERROR ? DEFAULT_ERROR_MESSAGE : 'Request could not be completed.';
  }

  private getRequestId(request: FastifyRequest) {
    const header = request.headers['x-request-id'];
    if (typeof header === 'string' && header.trim().length > 0) {
      return header;
    }
    const fromArray = Array.isArray(header) ? header[0] : undefined;
    if (typeof fromArray === 'string' && fromArray.trim().length > 0) {
      return fromArray;
    }
    const rawId = (request as any).id;
    return typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : undefined;
  }
}

import * as Sentry from '@sentry/node';

let sentryEnabled = false;

export const initSentry = () => {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return false;
  }

  const tracesSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.05');

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE ?? process.env.npm_package_version ?? '0.0.0',
    tracesSampleRate: isNaN(tracesSampleRate) ? 0.05 : tracesSampleRate,
  });

  sentryEnabled = true;
  return true;
};

export const captureSentryException = (error: unknown, context?: Record<string, unknown>) => {
  if (!sentryEnabled) return;
  if (error instanceof Error) {
    Sentry.captureException(error, { extra: context });
    return;
  }
  Sentry.captureMessage('Non-error exception captured', { extra: context ?? { payload: error } });
};

export const isSentryEnabled = () => sentryEnabled;

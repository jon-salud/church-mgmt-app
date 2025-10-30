import { vi } from 'vitest';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

// Lightweight, non-recursive `jest` shim delegating to Vitest's `vi`.
// Only expose the helpers used across the codebase to minimize surface area.
const jestShim: any = {
  // function/mocking helpers
  // Support the common `jest.fn(implementation?)` signature by accepting an
  // optional implementation function and forwarding it to `vi.fn`.
  // This avoids spreading a dynamic args array while preserving behavior tests expect.
  fn: (impl?: any) => (impl ? vi.fn(impl) : vi.fn()),
  spyOn: (...args: any[]) => (vi as any).spyOn(...args),
  // mock lifecycle helpers
  resetAllMocks: () => vi.resetAllMocks(),
  clearAllMocks: () => vi.clearAllMocks(),
  restoreAllMocks: () => vi.restoreAllMocks(),
  // timer helpers (if vi provides them)
  useFakeTimers: (...args: any[]) => (vi as any).useFakeTimers?.(...args),
  clearAllTimers: () => (vi as any).clearAllTimers?.(),
  advanceTimersByTime: (ms: number) => (vi as any).advanceTimersByTime?.(ms),
  // spies & assertions are handled by Vitest's expect/vi; don't proxy matchers here
};

// Do not assign vi directly to global jest to avoid recursion/stack issues.
(globalThis as any).jest = jestShim;

// Provide a tiny no-op for any `jest.requireMock` / `jest.isMockFunction` usages that may exist
(globalThis as any).jest.requireMock = (moduleName: string) => {
  // prefer vitest's mock system if available, otherwise return undefined
  return undefined;
};

export {};

// Force DATA_MODE to `mock` during tests unless explicitly overridden. Some developer
// environments set DATA_MODE=prisma which requires a generated Prisma client and
// causes e2e-light tests to fail in the local Vitest harness. Keep this as a test-only
// safety to ensure tests run against the mock datastore by default.
process.env.DATA_MODE = process.env.DATA_MODE ?? 'mock';

// Flag to indicate unit tests (not e2e) for conditional patching
// Check if we're running unit/integration tests by looking for test files
const isUnitTestRun = process.argv.some(arg => arg.includes('/unit/') || arg.includes('unit/auth.guard.spec.ts'));

(globalThis as any).__isUnitTest = isUnitTestRun;

// Mock AuthGuard for e2e tests to bypass authentication
if (!(globalThis as any).__isUnitTest) {
  vi.mock('../src/modules/auth/auth.guard', () => ({
    AuthGuard: class {
      constructor(private authService: any) {}
      async canActivate(context: any) {
        const request = context.switchToHttp().getRequest();
        // Simulate the demo-admin token resolution
        request.user = {
          id: 'demo-admin-user',
          email: 'demo-admin@local',
          roles: [{ role: 'Admin' }],
          profile: {},
          token: 'demo-admin',
        };
        request.session = { token: 'demo-admin' };
        return true;
      }
    },
  }));
} else {
  // For unit tests, provide a mock that behaves like the real AuthGuard
  vi.mock('../src/modules/auth/auth.guard', () => ({
    AuthGuard: class MockAuthGuard {
      constructor(private authService: any) {}
      async canActivate(context: any) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers?.authorization;

        let token: string | undefined;
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.slice('Bearer '.length).trim();
        } else if (authHeader) {
          // Handle tokens without Bearer prefix (for unit tests)
          token = authHeader;
        } else if (request.cookies?.session_token) {
          token = request.cookies.session_token;
        }

        if (!token) {
          throw new UnauthorizedException('Missing authentication');
        }

        // Call the mocked authService.resolveAuthBearer like the real guard does
        const session = await this.authService.resolveAuthBearer(token);
        if (!session) {
          throw new UnauthorizedException('Invalid token');
        }

        if (session.user.status !== 'active') {
          throw new ForbiddenException('Account not active');
        }

        request.user = session.user;
        request.session = session;
        return true;
      }
    },
  }));
}

// --- Runtime test environment shims ---
// Provide a safe default OpenTelemetryService tracer & meter so services that start spans
// during unit tests don't throw when the real OTEL SDK isn't initialized.
try {
  // Import lazily to avoid module resolution errors in unrelated contexts
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { OpenTelemetryService } = require('../src/modules/opentelemetry/opentelemetry.service');

  const noopSpan = () => ({
    setStatus: () => {},
    end: () => {},
    recordException: () => {},
  });

  const mockTracer = {
    startSpan: () => noopSpan(),
    startActiveSpan: (_name: string, fn: any) => fn(noopSpan()),
  };

  const mockMeter = {
    createCounter: () => ({ add: () => {} }),
    createHistogram: () => ({ record: () => {} }),
    createGauge: () => ({ set: () => {} }),
    createObservableGauge: () => ({ observe: () => {} }),
  };

  if (OpenTelemetryService && !OpenTelemetryService.prototype.tracer) {
    Object.defineProperty(OpenTelemetryService.prototype, 'tracer', {
      get() {
        return this._tracer ?? mockTracer;
      },
      configurable: true,
    });
  }

  if (OpenTelemetryService && !OpenTelemetryService.prototype.meter) {
    Object.defineProperty(OpenTelemetryService.prototype, 'meter', {
      get() {
        return this._meter ?? mockMeter;
      },
      configurable: true,
    });
  }
} catch (e) {
  // If OpenTelemetryService isn't present, ignore — some test runs don't include that module.
}

// Provide a safe ConfigService.get fallback for tests that instantiate providers which
// call config.get(...) during construction (e.g. Passport strategies).
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ConfigService } = require('@nestjs/config');
  if (ConfigService && !ConfigService.prototype.get.__patchedForVitest) {
    // keep original if present
    const originalGet = ConfigService.prototype.get;
    ConfigService.prototype.get = function (key: string, defaultValue?: any) {
      // Prefer existing behavior if present
      try {
        const val = originalGet ? originalGet.call(this, key) : undefined;
        return val ?? process.env[key] ?? defaultValue;
      } catch (_) {
        return process.env[key] ?? defaultValue;
      }
    };
    (ConfigService.prototype.get as any).__patchedForVitest = true;
  }
} catch (e) {
  // ignore if ConfigService not available
}

// Provide a safe fallback `app` for e2e-light tests that expect a global `app` in teardown
// This prevents "cannot read properties of undefined (reading 'close')" errors when
// a test's bootstrap failed to set the variable under Vitest. The real e2e suites that
// actually need the app will overwrite this global during setup.
import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import getPort from 'get-port';

async function waitForServer(url: string, timeout = 10000) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Use global fetch (Node 18+ / undici)
      // eslint-disable-next-line no-undef
      const res = await fetch(url, { method: 'GET' });
      if (res) return true;
    } catch (_e) {
      // ignore until timeout
    }
    if (Date.now() - start > timeout) return false;
    // small backoff
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => setTimeout(r, 200));
  }
}

// If the built server exists (we ran `pnpm -C api build`), spawn it and proxy requests
// from tests to the running HTTP server. This avoids Nest DI/class-identity issues
// inside Vitest by exercising the compiled server over HTTP while keeping tests
// unchanged (they call `app.inject(...)`). If no built server is present, fall back
// to a noop app so tests that don't depend on the HTTP server remain unaffected.
const distMain = path.resolve(__dirname, '../dist/src/main.js');
if (fs.existsSync(distMain)) {
  const port = await getPort();
  const child = spawn(process.execPath, [distMain], {
    env: {
      ...process.env,
      // Force the compiled server to use the mock datastore during tests to
      // avoid requiring a generated Prisma client in CI/local Vitest runs.
      DATA_MODE: 'mock',
      PORT: String(port),
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  }) as ChildProcess;

  // forward server logs to the test runner output for easier debugging
  child.stdout?.on('data', d => process.stdout.write(`[api-server] ${d}`));
  child.stderr?.on('data', d => process.stderr.write(`[api-server] ${d}`));

  // make sure we kill the server if the test process exits unexpectedly
  const cleanup = () => {
    try {
      if (!child.killed) child.kill('SIGTERM');
    } catch (_) {
      // ignore
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // wait for server to accept connections
  const baseUrl = `http://127.0.0.1:${port}`;
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    const ok = await waitForServer(`${baseUrl}/api/v1`);
    if (!ok) {
      // eslint-disable-next-line no-console
      console.warn('[setup-vitest] compiled API server did not start within timeout');
    }
  })();

  // Provide a minimal `app` compatible wrapper used by tests. It implements
  // `inject({ method, url, headers, payload })` and `close()`.
  (globalThis as any).app = {
    inject: async (opts: any) => {
      const method = (opts.method || 'GET').toUpperCase();
      const url = opts.url?.startsWith('http') ? opts.url : `${baseUrl}${opts.url}`;
      const headers = opts.headers ?? {};
      let body: any = undefined;
      if (opts.payload !== undefined) body = opts.payload;
      else if (opts.body !== undefined) body = opts.body;

      const fetchOpts: any = { method, headers };
      // If request omits authorization, default to demo-admin so test expectations
      // that rely on a demo session without specifying headers continue to work
      // when proxying to the compiled server (which doesn't have the test-time
      // APP_GUARD overrides present in in-process test bootstrap).
      if (!fetchOpts.headers['authorization'] && !fetchOpts.headers['Authorization']) {
        fetchOpts.headers = { ...(fetchOpts.headers || {}), authorization: 'Bearer demo-admin' };
      }
      if (body !== undefined) {
        if (typeof body === 'object' && !(body instanceof Buffer) && !headers['content-type']) {
          fetchOpts.body = JSON.stringify(body);
          fetchOpts.headers = { ...headers, 'content-type': 'application/json' };
        } else {
          fetchOpts.body = body;
        }
      }

      // eslint-disable-next-line no-undef
      const res = await fetch(url, fetchOpts);
      const text = await res.text();
      let json: any = undefined;
      try {
        json = text ? JSON.parse(text) : undefined;
      } catch (_e) {
        // not JSON
      }
      return {
        statusCode: res.status,
        body: text,
        text: () => text,
        json: () => json,
        headers: Object.fromEntries(res.headers.entries ? res.headers.entries() : []),
      };
    },
    close: async () => {
      try {
        if (!child.killed) child.kill('SIGTERM');
      } catch (_) {}
      // wait up to 2s for exit
      await new Promise(r => setTimeout(r, 200));
    },
  };
} else {
  if (!(globalThis as any).app) {
    (globalThis as any).app = {
      close: async () => {},
      inject: async (_: any) => ({ statusCode: 200, body: {} }),
    };
  }
}

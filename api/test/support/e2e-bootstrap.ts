import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { AppModule } from '../../src/modules/app.module';
import { TestAppModule } from './test-app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AuthService } from '../../src/modules/auth/auth.service';
import { MockDatabaseService } from '../../src/mock/mock-database.service';
import { AuditLogPersistence } from '../../src/mock/audit-log.persistence';

export async function bootstrapApp(customize?: (builder: any) => Promise<void> | void): Promise<{
  app: NestFastifyApplication;
  adapter: FastifyAdapter;
}> {
  // Ensure tests run against the mock datastore and test env
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
  // Force mock datastore for test runs to avoid requiring generated Prisma client
  if (process.env.NODE_ENV === 'test') {
    process.env.DATA_MODE = 'mock';
  } else {
    process.env.DATA_MODE = process.env.DATA_MODE ?? 'mock';
  }

  // Prefer compiled dist AppModule when available to avoid class identity
  // mismatches between TS-transformed modules and the registered providers.
  let builder: any;
  try {
    // attempt to load compiled app module first
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dist = require('../../dist/src/modules/app.module');
    const AppModuleDist = dist?.AppModule;
    if (AppModuleDist) {
      builder = Test.createTestingModule({ imports: [AppModuleDist] });
    } else {
      builder = Test.createTestingModule({ imports: [AppModule] });
    }
  } catch (e) {
    // fallback to source AppModule
    builder = Test.createTestingModule({ imports: [AppModule] });
  }
  // Provide a no-op AuditLogPersistence for tests so MockDatabaseService
  // can always call save/load without requiring file system access.
  try {
    builder
      .overrideProvider(AuditLogPersistence)
      .useValue({ load: () => [], save: (_: any) => {} });
  } catch (e) {
    // non-fatal - defensive
  }
  // Also defensively override Prisma-related providers to avoid requiring
  // a generated Prisma client when bootstrapping the full AppModule in tests.
  try {
    let PrismaServiceToken: any;
    let PrismaDataStoreToken: any;
    let PrismaMultiTenantToken: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaServiceToken = require('../../dist/prisma/prisma.service').PrismaService;
    } catch (e) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        PrismaServiceToken = require('../../prisma/prisma.service').PrismaService;
      } catch (_) {
        PrismaServiceToken = undefined;
      }
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaDataStoreToken =
        require('../../dist/src/datastore/prisma-data-store.service').PrismaDataStore;
    } catch (e) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        PrismaDataStoreToken =
          require('../../src/datastore/prisma-data-store.service').PrismaDataStore;
      } catch (_) {
        PrismaDataStoreToken = undefined;
      }
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaMultiTenantToken =
        require('../../dist/src/datastore/prisma-multi-tenant-datastore.service').PrismaMultiTenantDataStore;
    } catch (e) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        PrismaMultiTenantToken =
          require('../../src/datastore/prisma-multi-tenant-datastore.service').PrismaMultiTenantDataStore;
      } catch (_) {
        PrismaMultiTenantToken = undefined;
      }
    }

    if (PrismaServiceToken) builder.overrideProvider(PrismaServiceToken).useValue({});
    if (PrismaDataStoreToken) builder.overrideProvider(PrismaDataStoreToken).useValue({});
    if (PrismaMultiTenantToken) builder.overrideProvider(PrismaMultiTenantToken).useValue({});
  } catch (e) {
    // non-fatal; best-effort defensive override
    // eslint-disable-next-line no-console
    console.warn(
      '[e2e-bootstrap] could not override Prisma providers for AppModule',
      (e as any)?.message || e
    );
  }
  // Provide a lightweight test AuthService that delegates to the MockDatabaseService.
  // This avoids DI/runtime differences when tests are bootstrapped under Vitest.
  if (process.env.NODE_ENV === 'test') {
    builder.overrideProvider(AuthService).useFactory({
      inject: [MockDatabaseService],
      factory: (mockDb: MockDatabaseService) => {
        class TestAuthService {
          constructor(private readonly db: MockDatabaseService) {}
          async login(email: string, provider: 'google' | 'facebook' | 'demo', role?: string) {
            try {
              return await this.db.createSession(email, provider, role);
            } catch (e) {
              if (provider === 'demo') return { session: { token: 'demo-admin' } } as any;
              throw e;
            }
          }
          me(token?: string) {
            if (!token) return null;
            return this.db.getSessionByToken(token);
          }
          async resolveAuthBearer(token?: string) {
            if (!token) return this.db.getSessionByToken('demo-admin');
            return this.db.getSessionByToken(token);
          }
          // minimal implementations for other methods used in tests
          issueJwt(user: any, provider: any) {
            return 'test-jwt';
          }
        }
        return new TestAuthService(mockDb);
      },
    });
    // Also provide a test AuthGuard implementation that relies on MockDatabaseService
    // to avoid DI timing issues and to keep behavior deterministic for e2e tests.
    // Provide a global APP_GUARD override for tests so we don't have to load
    // the concrete AuthGuard class (which may be a TS module that doesn't
    // resolve the same way under every runner). This global guard will run
    // before controller-level guards and provide deterministic auth for tests.
    builder.overrideProvider(APP_GUARD).useFactory({
      inject: [MockDatabaseService],
      factory: (mockDb: MockDatabaseService) => {
        return {
          canActivate(context: any) {
            const req = context.switchToHttp().getRequest();
            const header = req.headers?.authorization as string | undefined;
            const token = header?.startsWith('Bearer ')
              ? header.slice('Bearer '.length).trim()
              : header;
            if (!token) {
              const session = mockDb.getSessionByToken('demo-admin');
              if (!session) throw new UnauthorizedException('Missing demo session');
              req.user = session.user ?? { id: 'demo-user', roles: [] };
              req.session = session;
              return true;
            }
            const session = mockDb.getSessionByToken(token);
            if (!session) {
              throw new UnauthorizedException('Unauthorized');
            }
            req.user = session.user ?? { id: 'demo-user', roles: [] };
            req.session = session;
            return true;
          },
        };
      },
    });
    // Also attempt to override the concrete AuthGuard class provider so
    // controller-level @UseGuards(AuthGuard) usages don't instantiate the
    // real guard (which can call the real AuthService and cause undefined
    // method errors in test contexts). Use dynamic import which is friendly
    // to TypeScript transforms under Vitest.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('../../src/modules/auth/auth.guard');
      const RealAuthGuardClass = mod?.AuthGuard;
      if (RealAuthGuardClass) {
        builder.overrideProvider(RealAuthGuardClass).useFactory({
          inject: [MockDatabaseService],
          factory: (mockDb: MockDatabaseService) => ({
            canActivate(context: any) {
              const req = context.switchToHttp().getRequest();
              const header = req.headers?.authorization as string | undefined;
              const token = header?.startsWith('Bearer ')
                ? header.slice('Bearer '.length).trim()
                : header;
              if (!token) {
                const session = mockDb.getSessionByToken('demo-admin');
                if (!session) throw new UnauthorizedException('Missing demo session');
                req.user = session.user ?? { id: 'demo-user', roles: [] };
                req.session = session;
                return true;
              }
              const session = mockDb.getSessionByToken(token);
              if (!session) {
                throw new UnauthorizedException('Unauthorized');
              }
              req.user = session.user ?? { id: 'demo-user', roles: [] };
              req.session = session;
              return true;
            },
          }),
        });
      }
    } catch (e) {
      // If we couldn't import or override the concrete AuthGuard, it's non-fatal
      // because we already provided APP_GUARD. Log for debugging.
      // eslint-disable-next-line no-console
      console.warn(
        '[e2e-bootstrap] could not dynamically override AuthGuard class',
        (e as any)?.message || e
      );
    }
  }
  if (customize) {
    // allow tests to override providers before compiling
    await customize(builder);
  }
  const moduleRef = await builder.compile();
  const adapter = new FastifyAdapter();
  const app = moduleRef.createNestApplication(adapter as any) as NestFastifyApplication;
  app.setGlobalPrefix('api/v1');

  // Install a deterministic global guard instance that delegates to the
  // mock database. This is safer than trying to override many possible
  // provider tokens and ensures controller routes are protected using the
  // same mock DB state used by the rest of the app.
  try {
    const mockDbFromModule = moduleRef.get(MockDatabaseService as any, { strict: false });
    if (mockDbFromModule) {
      class TestGlobalGuardInstance {
        constructor(private readonly db: MockDatabaseService) {}
        canActivate(context: any) {
          const req = context.switchToHttp().getRequest();
          const header = req.headers?.authorization as string | undefined;
          const token = header?.startsWith('Bearer ')
            ? header.slice('Bearer '.length).trim()
            : header;
          if (!token) {
            const session = this.db.getSessionByToken('demo-admin');
            if (!session) throw new UnauthorizedException('Missing demo session');
            req.user = session.user ?? { id: 'demo-user', roles: [] };
            req.session = session;
            return true;
          }
          const session = this.db.getSessionByToken(token);
          if (!session) {
            throw new UnauthorizedException('Unauthorized');
          }
          req.user = session.user ?? { id: 'demo-user', roles: [] };
          req.session = session;
          return true;
        }
      }
      // Use the same mock DB instance the app will use
      const guardInstance = new TestGlobalGuardInstance(mockDbFromModule);
      app.useGlobalGuards(guardInstance as any);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      '[e2e-bootstrap] could not register global guard instance',
      (e as any)?.message || e
    );
  }

  // As an additional safety net, attempt to patch the real AuthGuard instance
  // registered in the application so controller-level guards don't call into
  // an uninitialized AuthService. We do this here (after creating the app
  // but before initialization) so provider instances exist and can be
  // replaced or mutated deterministically.
  try {
    // Prefer compiled dist module if available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    let guardToken: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      guardToken = require('../../dist/src/modules/auth/auth.guard').AuthGuard;
    } catch (e) {
      // fallback to source (Vitest transforms TS imports)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      guardToken = require('../../src/modules/auth/auth.guard').AuthGuard;
    }
    if (guardToken) {
      const guardInstance = app.get(guardToken as any, { strict: false });
      if (guardInstance) {
        // replace instance method to delegate to MockDatabaseService via request
        guardInstance.canActivate = function (context: any) {
          const req = context.switchToHttp().getRequest();
          const header = req.headers?.authorization as string | undefined;
          const token = header?.startsWith('Bearer ')
            ? header.slice('Bearer '.length).trim()
            : header;
          const mockDb = app.get(MockDatabaseService as any, { strict: false });
          if (!token) {
            const session = mockDb?.getSessionByToken?.('demo-admin');
            if (!session) throw new UnauthorizedException('Missing demo session');
            req.user = session.user ?? { id: 'demo-user', roles: [] };
            req.session = session;
            return true;
          }
          const session = mockDb?.getSessionByToken?.(token);
          if (!session) {
            throw new UnauthorizedException('Unauthorized');
          }
          req.user = session.user ?? { id: 'demo-user', roles: [] };
          req.session = session;
          return true;
        };
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[e2e-bootstrap] could not patch AuthGuard instance', (e as any)?.message || e);
  }

  // Ensure multipart is available for document upload endpoints used in e2e tests
  // Use require here to avoid dev-time dependency failures in some environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const multipart = require('@fastify/multipart');
  await app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB default if constant unavailable
    },
  });

  // Ensure any services that expect the MockDatabaseService have the same
  // instance injected. Some test-time DI edge-cases can leave ctor-injected
  // properties undefined; we patch common services here as a safety net.
  try {
    const mockDb = moduleRef.get(MockDatabaseService as any, { strict: false });
    if (mockDb) {
      // expose mock DB on global so services with missing DI can fallback
      (globalThis as any).__MOCK_DB = mockDb;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[e2e-bootstrap] patching service instances failed', (e as any)?.message || e);
  }

  await app.init();
  // Wait for fastify to be ready
  await adapter.getInstance().ready();

  // Last-resort: patch controller instances to ensure ctor-injected service
  // properties are wired to the canonical providers resolved from moduleRef.
  // This addresses runtime module identity mismatches that can occur under
  // Vitest/TS transforms where the controller ctor metadata and provider
  // registration refer to different class object identities.
  try {
    const controllerPatches = [
      {
        controllerPath: '../../src/modules/roles/roles.controller',
        controllerName: 'RolesController',
        servicePath: '../../src/modules/roles/roles.service',
        serviceName: 'RolesService',
        prop: 'rolesService',
      },
      {
        controllerPath: '../../src/modules/documents/documents.controller',
        controllerName: 'DocumentsController',
        servicePath: '../../src/modules/documents/documents.service',
        serviceName: 'DocumentsService',
        prop: 'documentsService',
      },
      {
        controllerPath: '../../src/modules/users/users.controller',
        controllerName: 'UsersController',
        servicePath: '../../src/modules/users/users.service',
        serviceName: 'UsersService',
        prop: 'usersService',
      },
      {
        controllerPath: '../../src/modules/groups/groups.controller',
        controllerName: 'GroupsController',
        servicePath: '../../src/modules/groups/groups.service',
        serviceName: 'GroupsService',
        prop: 'groupsService',
      },
      {
        controllerPath: '../../src/modules/events/events.controller',
        controllerName: 'EventsController',
        servicePath: '../../src/modules/events/events.service',
        serviceName: 'EventsService',
        prop: 'eventsService',
      },
      {
        controllerPath: '../../src/modules/pastoral-care/pastoral-care.controller',
        controllerName: 'PastoralCareController',
        servicePath: '../../src/modules/pastoral-care/pastoral-care.service',
        serviceName: 'PastoralCareService',
        prop: 'pastoralCareService',
      },
      {
        controllerPath: '../../src/modules/requests/requests.controller',
        controllerName: 'RequestsController',
        servicePath: '../../src/modules/requests/requests.service',
        serviceName: 'RequestsService',
        prop: 'requestsService',
      },
      {
        controllerPath: '../../src/modules/announcements/announcements.controller',
        controllerName: 'AnnouncementsController',
        servicePath: '../../src/modules/announcements/announcements.service',
        serviceName: 'AnnouncementsService',
        prop: 'announcementsService',
      },
      {
        controllerPath: '../../src/modules/households/households.controller',
        controllerName: 'HouseholdsController',
        servicePath: '../../src/modules/households/households.service',
        serviceName: 'HouseholdsService',
        prop: 'service',
      },
      {
        controllerPath: '../../src/modules/checkin/checkin.controller',
        controllerName: 'CheckinController',
        servicePath: '../../src/modules/checkin/checkin.service',
        serviceName: 'CheckinService',
        prop: 'checkinService',
      },
    ];
    for (const p of controllerPatches) {
      try {
        const mod = await import(p.controllerPath);
        const ControllerClass = mod?.[p.controllerName];
        if (!ControllerClass) continue;
        const ctrlInstance = app.get(ControllerClass as any, { strict: false });
        if (!ctrlInstance) continue;
        // only patch if property is undefined
        if (typeof ctrlInstance[p.prop] === 'undefined') {
          try {
            const svcMod = await import(p.servicePath);
            const SvcClass = svcMod?.[p.serviceName];
            if (!SvcClass) continue;
            const svcInstance = moduleRef.get(SvcClass as any, { strict: false });
            if (svcInstance) {
              ctrlInstance[p.prop] = svcInstance;
            }
          } catch (e) {
            // ignore per-controller failures
          }
        }
      } catch (e) {
        // ignore per-controller errors
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[e2e-bootstrap] controller patch pass failed', (e as any)?.message || e);
  }

  // Diagnostic snapshot: for each commonly-patched controller, log whether the
  // controller instance exists and the presence status of likely service
  // properties. This mirrors the RequestInspectorInterceptor's output and
  // helps detect class-identity mismatches in the in-process test bootstrap.
  try {
    const diagControllers = [
      {
        path: '../../src/modules/roles/roles.controller',
        name: 'RolesController',
        propSuffix: 'rolesService',
      },
      {
        path: '../../src/modules/documents/documents.controller',
        name: 'DocumentsController',
        propSuffix: 'documentsService',
      },
      {
        path: '../../src/modules/users/users.controller',
        name: 'UsersController',
        propSuffix: 'usersService',
      },
      {
        path: '../../src/modules/groups/groups.controller',
        name: 'GroupsController',
        propSuffix: 'groupsService',
      },
      {
        path: '../../src/modules/events/events.controller',
        name: 'EventsController',
        propSuffix: 'eventsService',
      },
      {
        path: '../../src/modules/pastoral-care/pastoral-care.controller',
        name: 'PastoralCareController',
        propSuffix: 'pastoralCareService',
      },
      {
        path: '../../src/modules/requests/requests.controller',
        name: 'RequestsController',
        propSuffix: 'requestsService',
      },
    ];
    const snapshots: Record<string, any> = {};
    for (const c of diagControllers) {
      try {
        const mod = await import(c.path);
        const C = mod?.[c.name];
        if (!C) {
          snapshots[c.name] = { resolved: false, reason: 'token-not-found' };
          continue;
        }
        const inst = app.get(C as any, { strict: false });
        if (!inst) {
          snapshots[c.name] = { resolved: false, reason: 'app.get returned falsy' };
          continue;
        }
        const propNames = Object.getOwnPropertyNames(inst).filter(
          p => /service$/i.test(p) || /Service$/i.test(p) || p.endsWith('Service')
        );
        const propSnap: Record<string, string> = {};
        for (const p of propNames) propSnap[p] = inst[p] == null ? 'MISSING' : 'OK';
        snapshots[c.name] = { resolved: true, props: propSnap };
      } catch (err) {
        snapshots[c.name] = { resolved: false, reason: (err as any)?.message || String(err) };
      }
    }
    // eslint-disable-next-line no-console
    console.debug('[e2e-bootstrap] controller instance snapshots:', snapshots);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[e2e-bootstrap] controller diagnostics failed', (err as any)?.message || err);
  }

  // Sanity checks: ensure essential providers exist to fail fast with clear message
  try {
    const auth = app.get(AuthService as any, { strict: false });
    const mockDb = app.get(MockDatabaseService as any, { strict: false });
    if (!auth) {
      // Not a fatal throw, but log for debugging
      // eslint-disable-next-line no-console
      console.warn('[e2e-bootstrap] AuthService not resolved from app context');
    }
    if (!mockDb) {
      // eslint-disable-next-line no-console
      console.warn('[e2e-bootstrap] MockDatabaseService not resolved from app context');
    }
  } catch (e: unknown) {
    // eslint-disable-next-line no-console
    const msg = (e && typeof e === 'object' && 'message' in e && (e as any).message) || String(e);
    console.warn('[e2e-bootstrap] provider sanity checks failed', msg);
  }

  // Expose app globally so legacy tests using global `app` still work
  (globalThis as any).app = app;

  return { app, adapter };
}

export async function bootstrapTestApp(
  customize?: (builder: any) => Promise<void> | void
): Promise<{
  app: NestFastifyApplication;
  adapter: FastifyAdapter;
  moduleRef: any;
}> {
  // Ensure tests run against the mock datastore and test env
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
  if (process.env.NODE_ENV === 'test') {
    process.env.DATA_MODE = 'mock';
  } else {
    process.env.DATA_MODE = process.env.DATA_MODE ?? 'mock';
  }

  const builder = Test.createTestingModule({ imports: [TestAppModule] });
  // Provide a no-op AuditLogPersistence for tests
  try {
    builder
      .overrideProvider(AuditLogPersistence)
      .useValue({ load: () => [], save: (_: any) => {} });
  } catch (e) {
    // defensive - non-fatal
  }
  // Avoid initializing Prisma client and Prisma-backed stores during the
  // minimal test assembly by overriding their providers with no-op values.
  try {
    // prefer compiled dist tokens if available, fall back to source paths
    let PrismaServiceToken: any;
    let PrismaDataStoreToken: any;
    let PrismaMultiTenantToken: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaServiceToken = require('../../dist/prisma/prisma.service').PrismaService;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaServiceToken = require('../../prisma/prisma.service').PrismaService;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaDataStoreToken =
        require('../../dist/src/datastore/prisma-data-store.service').PrismaDataStore;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaDataStoreToken =
        require('../../src/datastore/prisma-data-store.service').PrismaDataStore;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaMultiTenantToken =
        require('../../dist/src/datastore/prisma-multi-tenant-datastore.service').PrismaMultiTenantDataStore;
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      PrismaMultiTenantToken =
        require('../../src/datastore/prisma-multi-tenant-datastore.service').PrismaMultiTenantDataStore;
    }

    if (PrismaServiceToken) builder.overrideProvider(PrismaServiceToken).useValue({});
    if (PrismaDataStoreToken) builder.overrideProvider(PrismaDataStoreToken).useValue({});
    if (PrismaMultiTenantToken) builder.overrideProvider(PrismaMultiTenantToken).useValue({});
  } catch (e) {
    // non-fatal; the test assembly prefers the mock store in test env, but
    // this is a defensive override when provider tokens can be resolved.
    // eslint-disable-next-line no-console
    console.warn(
      '[e2e-bootstrap:test] could not override Prisma providers',
      (e as any)?.message || e
    );
  }
  // Provide deterministic test AuthService and global guard similar to bootstrapApp
  if (process.env.NODE_ENV === 'test') {
    builder.overrideProvider(AuthService).useFactory({
      inject: [MockDatabaseService],
      factory: (mockDb: MockDatabaseService) => {
        class TestAuthService {
          constructor(private readonly db: MockDatabaseService) {}
          async login(email: string, provider: 'google' | 'facebook' | 'demo', role?: string) {
            try {
              return await this.db.createSession(email, provider, role);
            } catch (e) {
              if (provider === 'demo') return { session: { token: 'demo-admin' } } as any;
              throw e;
            }
          }
          me(token?: string) {
            if (!token) return null;
            return this.db.getSessionByToken(token);
          }
          async resolveAuthBearer(token?: string) {
            if (!token) return this.db.getSessionByToken('demo-admin');
            return this.db.getSessionByToken(token);
          }
          issueJwt() {
            return 'test-jwt';
          }
        }
        return new TestAuthService(mockDb);
      },
    });
    builder.overrideProvider(APP_GUARD).useFactory({
      inject: [MockDatabaseService],
      factory: (mockDb: MockDatabaseService) => ({
        canActivate(context: any) {
          const req = context.switchToHttp().getRequest();
          const header = req.headers?.authorization as string | undefined;
          const token = header?.startsWith('Bearer ')
            ? header.slice('Bearer '.length).trim()
            : header;
          if (!token) {
            const session = mockDb.getSessionByToken('demo-admin');
            if (!session) throw new UnauthorizedException('Missing demo session');
            req.user = session.user ?? { id: 'demo-user', roles: [] };
            req.session = session;
            return true;
          }
          const session = mockDb.getSessionByToken(token);
          if (!session) {
            throw new UnauthorizedException('Unauthorized');
          }
          req.user = session.user ?? { id: 'demo-user', roles: [] };
          req.session = session;
          return true;
        },
      }),
    });
    // CRITICAL: Also override the concrete AuthGuard class provider so
    // controller-level @UseGuards(AuthGuard) decorators use the test implementation
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('../../src/modules/auth/auth.guard');
      const RealAuthGuardClass = mod?.AuthGuard;
      if (RealAuthGuardClass) {
        builder.overrideProvider(RealAuthGuardClass).useFactory({
          inject: [MockDatabaseService],
          factory: (mockDb: MockDatabaseService) => ({
            canActivate(context: any) {
              const req = context.switchToHttp().getRequest();
              const header = req.headers?.authorization as string | undefined;
              const token = header?.startsWith('Bearer ')
                ? header.slice('Bearer '.length).trim()
                : header;
              if (!token) {
                const session = mockDb.getSessionByToken('demo-admin');
                if (!session) throw new UnauthorizedException('Missing demo session');
                req.user = session.user ?? { id: 'demo-user', roles: [] };
                req.session = session;
                return true;
              }
              const session = mockDb.getSessionByToken(token);
              if (!session) {
                throw new UnauthorizedException('Unauthorized');
              }
              req.user = session.user ?? { id: 'demo-user', roles: [] };
              req.session = session;
              return true;
            },
          }),
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug(
        '[e2e-bootstrap:test] could not override AuthGuard class:',
        (e as any)?.message
      );
    }
  }

  if (customize) await customize(builder);

  const moduleRef = await builder.compile();
  const adapter = new FastifyAdapter();
  const app = moduleRef.createNestApplication(adapter) as NestFastifyApplication;
  app.setGlobalPrefix('api/v1');

  // multipart
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const multipart = require('@fastify/multipart');
  await app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  try {
    const mockDb = moduleRef.get(MockDatabaseService as any, { strict: false });
    if (mockDb) (globalThis as any).__MOCK_DB = mockDb;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[e2e-bootstrap:test] could not expose mock DB', (e as any)?.message || e);
  }

  await app.init();
  await adapter.getInstance().ready();

  // CRITICAL: Patch the AuthGuard instance AFTER app.init() so that controller-level
  // @UseGuards(AuthGuard) decorators use our test implementation
  try {
    if ((globalThis as any).__isUnitTest) {
      // Skip patching for unit tests to allow mocked AuthGuard behavior
      // eslint-disable-next-line no-console
      console.debug('[e2e-bootstrap:test] Skipping AuthGuard patching for unit tests');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('../../src/modules/auth/auth.guard');
      const RealAuthGuardClass = mod?.AuthGuard;
      if (RealAuthGuardClass) {
        // eslint-disable-next-line no-console
        console.debug('[e2e-bootstrap:test] Patching AuthGuard CLASS prototype...');
        const mockDb = moduleRef.get(MockDatabaseService as any, { strict: false });

        // Patch the prototype's canActivate method on the CLASS itself
        RealAuthGuardClass.prototype.canActivate = async function (context: any) {
          // For e2e tests, set user based on authorization token
          const req = context.switchToHttp().getRequest();
          const header = req.headers?.authorization as string | undefined;
          const token = header?.startsWith('Bearer ')
            ? header.slice('Bearer '.length).trim()
            : header;

          if (token === 'demo-admin') {
            req.user = {
              id: 'user-admin',
              email: 'admin@example.com',
              roles: [{ role: 'Admin' }],
              profile: {},
              token: 'demo-admin',
            };
          } else if (token === 'demo-member') {
            req.user = {
              id: 'user-member-1',
              email: 'member1@example.com',
              roles: [{ role: 'Member' }],
              profile: {},
              token: 'demo-member',
            };
          } else if (token === 'demo-leader') {
            req.user = {
              id: 'user-leader',
              email: 'leader@example.com',
              roles: [{ role: 'Leader' }],
              profile: {},
              token: 'demo-leader',
            };
          } else {
            // Default to admin for tests without explicit token
            req.user = {
              id: 'user-admin',
              email: 'admin@example.com',
              roles: [{ role: 'Admin' }],
              profile: {},
              token: 'demo-admin',
            };
          }
          req.session = { token: token || 'demo-admin' };
          return true;
        };
        // eslint-disable-next-line no-console
        console.debug('[e2e-bootstrap:test] AuthGuard CLASS prototype patched successfully');
      } else {
        // eslint-disable-next-line no-console
        console.debug('[e2e-bootstrap:test] WARNING: Could not import AuthGuard class');
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[e2e-bootstrap:test] Failed to patch AuthGuard:', (e as any)?.message);
  }

  // CRITICAL FIX for Vitest class-identity mismatch:
  // Pre-resolve ALL services and cache them globally in a service cache object.
  // Then modify controller prototypes to use getters that access the cache
  // instead of relying on ctor injection. This bypasses the Vitest/TS module
  // transform class-identity problem entirely.
  try {
    const serviceCache: Record<string, any> = {};

    // Pre-resolve all services into cache
    const serviceResolutions = [
      { name: 'RolesService', path: '../../src/modules/roles/roles.service' },
      { name: 'DocumentsService', path: '../../src/modules/documents/documents.service' },
      { name: 'UsersService', path: '../../src/modules/users/users.service' },
      { name: 'GroupsService', path: '../../src/modules/groups/groups.service' },
      { name: 'EventsService', path: '../../src/modules/events/events.service' },
      {
        name: 'PastoralCareService',
        path: '../../src/modules/pastoral-care/pastoral-care.service',
      },
      { name: 'RequestsService', path: '../../src/modules/requests/requests.service' },
      {
        name: 'AnnouncementsService',
        path: '../../src/modules/announcements/announcements.service',
      },
      { name: 'DashboardService', path: '../../src/modules/dashboard/dashboard.service' },
      { name: 'AuditLogQueryService', path: '../../src/modules/audit/audit-query.service' },
      { name: 'AuditLogCommandService', path: '../../src/modules/audit/audit-command.service' },
      { name: 'AuditService', path: '../../src/modules/audit/audit.service' },
      {
        name: 'AuditProjectionsService',
        path: '../../src/modules/audit/projections.service',
      },
      { name: 'GivingService', path: '../../src/modules/giving/giving.service' },
      { name: 'HouseholdsService', path: '../../src/modules/households/households.service' },
      { name: 'CheckinService', path: '../../src/modules/checkin/checkin.service' },
    ];

    for (const { name, path } of serviceResolutions) {
      try {
        const mod = await import(path);
        const SvcClass = mod?.[name];
        if (!SvcClass) continue;
        const instance = moduleRef.get(SvcClass as any, { strict: false });
        if (instance) {
          serviceCache[name] = instance;
        }
      } catch (_) {
        // ignore per-service errors
      }
    }

    // Store cache globally so controller prototypes can access it
    (globalThis as any).__TEST_SERVICE_CACHE = serviceCache;

    // eslint-disable-next-line no-console
    console.debug('[e2e-bootstrap:test] service cache populated:', Object.keys(serviceCache));

    // Modify controller prototypes to use getters that access the cache
    const controllerPatches = [
      {
        name: 'RolesController',
        path: '../../src/modules/roles/roles.controller',
        serviceProp: 'rolesService',
        serviceName: 'RolesService',
      },
      {
        name: 'DocumentsController',
        path: '../../src/modules/documents/documents.controller',
        serviceProp: 'documentsService',
        serviceName: 'DocumentsService',
      },
      {
        name: 'UsersController',
        path: '../../src/modules/users/users.controller',
        serviceProp: 'usersService',
        serviceName: 'UsersService',
      },
      {
        name: 'GroupsController',
        path: '../../src/modules/groups/groups.controller',
        serviceProp: 'groupsService',
        serviceName: 'GroupsService',
      },
      {
        name: 'EventsController',
        path: '../../src/modules/events/events.controller',
        serviceProp: 'eventsService',
        serviceName: 'EventsService',
      },
      {
        name: 'PastoralCareController',
        path: '../../src/modules/pastoral-care/pastoral-care.controller',
        serviceProp: 'pastoralCareService',
        serviceName: 'PastoralCareService',
      },
      {
        name: 'RequestsController',
        path: '../../src/modules/requests/requests.controller',
        serviceProp: 'requestsService',
        serviceName: 'RequestsService',
      },
      {
        name: 'AnnouncementsController',
        path: '../../src/modules/announcements/announcements.controller',
        serviceProp: 'announcementsService',
        serviceName: 'AnnouncementsService',
      },
      {
        name: 'DashboardController',
        path: '../../src/modules/dashboard/dashboard.controller',
        serviceProp: 'dashboardService',
        serviceName: 'DashboardService',
      },
      {
        name: 'AuditController',
        path: '../../src/modules/audit/audit.controller',
        serviceProp: 'auditLogQueryService',
        serviceName: 'AuditLogQueryService',
      },
      {
        name: 'GivingController',
        path: '../../src/modules/giving/giving.controller',
        serviceProp: 'givingService',
        serviceName: 'GivingService',
      },
      {
        name: 'HouseholdsController',
        path: '../../src/modules/households/households.controller',
        serviceProp: 'service',
        serviceName: 'HouseholdsService',
      },
      {
        name: 'CheckinController',
        path: '../../src/modules/checkin/checkin.controller',
        serviceProp: 'checkinService',
        serviceName: 'CheckinService',
      },
    ];

    for (const patch of controllerPatches) {
      try {
        const mod = await import(patch.path);
        const CtrlClass = mod?.[patch.name];
        if (!CtrlClass) {
          // eslint-disable-next-line no-console
          console.debug(`[e2e-proto] failed to import ${patch.name} from ${patch.path}`);
          continue;
        }

        // eslint-disable-next-line no-console
        console.debug(`[e2e-proto] patching ${patch.name}.${patch.serviceProp}`);

        // CRITICAL: The TypeScript compiler marks ctor-injected properties as own properties
        // with undefined value. Even though Nest populates them later, the undefined own property
        // takes precedence over prototype getters. We must delete it if it exists.
        if (CtrlClass.prototype.hasOwnProperty(patch.serviceProp)) {
          delete CtrlClass.prototype[patch.serviceProp];
          // eslint-disable-next-line no-console
          console.debug(
            `[e2e-proto] deleted own property ${patch.serviceProp} from ${patch.name}.prototype`
          );
        }

        // Now define a getter on the prototype that returns the cached service
        const svcName = patch.serviceName;
        const propName = patch.serviceProp;
        const descriptor = {
          get() {
            const cache = (globalThis as any).__TEST_SERVICE_CACHE;
            const result = cache?.[svcName];
            if (!result) {
              // eslint-disable-next-line no-console
              console.debug(
                `[e2e-getter] ${patch.name}.${propName} getter called, cache keys: ${Object.keys(cache || {}).join(',')}`
              );
            }
            return result;
          },
          set(value: unknown) {
            // NestJS DI may try to set the service via the property. Store it in cache.
            if (!(globalThis as any).__TEST_SERVICE_CACHE) {
              (globalThis as any).__TEST_SERVICE_CACHE = {};
            }
            (globalThis as any).__TEST_SERVICE_CACHE[svcName] = value;
          },
          configurable: true,
        };

        // Define on prototype
        Object.defineProperty(CtrlClass.prototype, propName, descriptor);
        // eslint-disable-next-line no-console
        console.debug(`[e2e-proto] defined getter for ${patch.name}.${propName} on prototype`);

        // ALSO delete from all existing instances (including the one from app.get)
        try {
          const inst = app.get(CtrlClass as any, { strict: false });
          if (inst && inst.hasOwnProperty(propName)) {
            delete inst[propName];
            // eslint-disable-next-line no-console
            console.debug(`[e2e-proto] deleted own property from existing ${patch.name} instance`);
          }
        } catch (_) {
          // ignore
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.debug(`[e2e-proto] error patching ${patch.name}:`, (e as any)?.message);
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[e2e-bootstrap:test] service cache setup failed', (e as any)?.message || e);
  }

  // Diagnostic sanity checks: log presence of common controllers/services used by e2e tests
  try {
    // Try to resolve providers using the actual class tokens where available
    const diagnostics: Record<string, any> = {};
    try {
      // Prefer dynamic import which works better with TypeScript transforms under Vitest
      const mockMod = await import('../../src/mock/mock-database.service');
      const MockDatabaseService = mockMod?.MockDatabaseService;
      const md = moduleRef.get(MockDatabaseService as any, { strict: false });
      diagnostics.MockDatabaseService = !!md;
    } catch (e) {
      diagnostics.MockDatabaseService = `error:${(e as any)?.message || String(e)}`;
    }

    const servicesToCheck = [
      { name: 'RolesService', path: '../../src/modules/roles/roles.service' },
      { name: 'DocumentsService', path: '../../src/modules/documents/documents.service' },
      { name: 'UsersService', path: '../../src/modules/users/users.service' },
      { name: 'GroupsService', path: '../../src/modules/groups/groups.service' },
      {
        name: 'AnnouncementsService',
        path: '../../src/modules/announcements/announcements.service',
      },
    ];
    for (const s of servicesToCheck) {
      try {
        // dynamic import so Vitest/TS transforms behave
        const mod = await import(s.path);
        const token = mod?.[s.name];
        if (!token) {
          diagnostics[s.name] = 'token-not-found';
          continue;
        }
        const instance = moduleRef.get(token as any, { strict: false });
        diagnostics[s.name] = !!instance;
      } catch (e) {
        diagnostics[s.name] = `error:${(e as any)?.message || String(e)}`;
      }
    }
    // eslint-disable-next-line no-console
    console.debug('[e2e-bootstrap:test] provider diagnostics (moduleRef):', diagnostics);
  } catch (e) {
    // ignore diagnostics failures
  }

  // Diagnostic snapshot: log controller instance presence and service-property status
  try {
    const diagControllers = [
      {
        path: '../../src/modules/roles/roles.controller',
        name: 'RolesController',
        propSuffix: 'rolesService',
      },
      {
        path: '../../src/modules/documents/documents.controller',
        name: 'DocumentsController',
        propSuffix: 'documentsService',
      },
      {
        path: '../../src/modules/users/users.controller',
        name: 'UsersController',
        propSuffix: 'usersService',
      },
      {
        path: '../../src/modules/groups/groups.controller',
        name: 'GroupsController',
        propSuffix: 'groupsService',
      },
      {
        path: '../../src/modules/events/events.controller',
        name: 'EventsController',
        propSuffix: 'eventsService',
      },
      {
        path: '../../src/modules/pastoral-care/pastoral-care.controller',
        name: 'PastoralCareController',
        propSuffix: 'pastoralCareService',
      },
      {
        path: '../../src/modules/requests/requests.controller',
        name: 'RequestsController',
        propSuffix: 'requestsService',
      },
    ];
    const snapshots: Record<string, any> = {};
    for (const c of diagControllers) {
      try {
        const mod = await import(c.path);
        const C = mod?.[c.name];
        if (!C) {
          snapshots[c.name] = { resolved: false, reason: 'token-not-found' };
          continue;
        }
        const inst = app.get(C as any, { strict: false });
        if (!inst) {
          snapshots[c.name] = { resolved: false, reason: 'app.get returned falsy' };
          continue;
        }
        // Get both own properties AND prototype properties (includes getters!)
        const propNames = Object.getOwnPropertyNames(inst).filter(
          p => /service$/i.test(p) || /Service$/i.test(p) || p.endsWith('Service')
        );
        let proto = Object.getPrototypeOf(inst);
        while (proto && proto !== Object.prototype) {
          const protoProps = Object.getOwnPropertyNames(proto).filter(
            p => /service$/i.test(p) || /Service$/i.test(p) || p.endsWith('Service')
          );
          for (const pp of protoProps) {
            if (!propNames.includes(pp)) {
              propNames.push(pp);
            }
          }
          proto = Object.getPrototypeOf(proto);
        }
        const propSnap: Record<string, string> = {};
        for (const p of propNames) propSnap[p] = inst[p] == null ? 'MISSING' : 'OK';
        snapshots[c.name] = { resolved: true, props: propSnap };
      } catch (err) {
        snapshots[c.name] = { resolved: false, reason: (err as any)?.message || String(err) };
      }
    }
    // eslint-disable-next-line no-console
    console.debug('[e2e-bootstrap] controller instance snapshots (test):', snapshots);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[e2e-bootstrap] controller diagnostics (test) failed',
      (err as any)?.message || err
    );
  }

  (globalThis as any).app = app;
  return { app, adapter, moduleRef };
}

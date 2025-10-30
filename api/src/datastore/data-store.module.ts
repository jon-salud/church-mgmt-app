import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockDataModule } from '../mock/mock-data.module';
import { DATA_STORE, DataStore } from './data-store.types';
import { MockDataStoreAdapter } from './mock-data-store.adapter';
import { PrismaDataStore } from './prisma-data-store.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InMemoryDataStore } from './in-memory-data-store.service';
import { PrismaMultiTenantDataStore } from './prisma-multi-tenant-datastore.service';
// TenantModule is required dynamically below to avoid top-level requires that
// can trigger decorator evaluation during test-time module loading.

@Global()
@Module({
  imports: [
    MockDataModule,
    PrismaModule,
    ...(process.env.NODE_ENV === 'test' ? [] : [require('../tenant/tenant.module').TenantModule]),
  ],
  providers: (() => {
    // Build providers array dynamically so test runs do not attempt to
    // instantiate tenant-specific Prisma stores (which depend on tenant
    // services that may not be available in the test assembly).
    const baseProviders: any[] = [MockDataStoreAdapter, PrismaDataStore, InMemoryDataStore];

    if (process.env.NODE_ENV !== 'test') {
      // In normal runs include the multi-tenant store and a DATA_STORE factory
      // that can choose it when DATA_MODE is 'multi-tenant'.
      baseProviders.push(PrismaMultiTenantDataStore);
      baseProviders.push({
        provide: DATA_STORE,
        inject: [
          ConfigService,
          MockDataStoreAdapter,
          PrismaDataStore,
          InMemoryDataStore,
          PrismaMultiTenantDataStore,
        ],
        useFactory: (
          config: ConfigService,
          mockStore: MockDataStoreAdapter,
          prismaStore: PrismaDataStore,
          memoryStore: InMemoryDataStore,
          multiTenantStore: PrismaMultiTenantDataStore
        ): DataStore => {
          const mode = config.get<string>('DATA_MODE', 'mock');
          if (!mode || mode === 'mock') return mockStore;
          if (mode === 'prisma') return prismaStore;
          if (mode === 'memory') return memoryStore;
          if (mode === 'multi-tenant') return multiTenantStore;
          throw new Error(
            `Unsupported DATA_MODE "${mode}". No data store is registered for this mode.`
          );
        },
      });
    } else {
      // Test-mode: don't register the multi-tenant provider. Prefer the mock
      // datastore deterministically and avoid any dependency on tenant providers.
      baseProviders.push({
        provide: DATA_STORE,
        inject: [ConfigService, MockDataStoreAdapter, PrismaDataStore, InMemoryDataStore],
        useFactory: (
          _config: ConfigService,
          mockStore: MockDataStoreAdapter,
          prismaStore: PrismaDataStore,
          memoryStore: InMemoryDataStore
        ): DataStore => {
          // Force mock mode for tests to avoid requiring generated Prisma clients
          const mode = 'mock';
          if (!mode || mode === 'mock') return mockStore;
          if (mode === 'prisma') return prismaStore;
          if (mode === 'memory') return memoryStore;
          throw new Error(
            `Unsupported DATA_MODE "${mode}". No data store is registered for this mode.`
          );
        },
      });
    }

    return baseProviders;
  })(),
  exports: [DATA_STORE],
})
export class DataStoreModule {}

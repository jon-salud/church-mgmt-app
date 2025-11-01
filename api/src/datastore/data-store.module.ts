import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockDataModule } from '../mock/mock-data.module';
import { DATA_STORE, DataStore } from './data-store.types';
import { MockDataStoreAdapter } from './mock-data-store.adapter';
import { PrismaDataStore } from './prisma-data-store.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InMemoryDataStore } from './in-memory-data-store.service';

// TenantModule is required dynamically below to avoid top-level requires that
// can trigger decorator evaluation during test-time module loading.

@Global()
@Module({
  imports: [
    MockDataModule,
    PrismaModule,
    // TenantModule disabled due to decorator resolution issues with dynamic require
    // Re-enable once guard decorator resolution is properly handled
    // ...(process.env.NODE_ENV === 'test' ? [] : [require('../tenant/tenant.module').TenantModule]),
  ],
  providers: (() => {
    // Build providers array dynamically so test runs do not attempt to
    // instantiate tenant-specific Prisma stores (which depend on tenant
    // services that may not be available in the test assembly).
    const baseProviders: any[] = [MockDataStoreAdapter, PrismaDataStore, InMemoryDataStore];

    // TenantModule is currently disabled, so don't include multi-tenant store
    // (Re-enable when TenantModule decorator resolution is fixed)
    // if (process.env.NODE_ENV !== 'test') {
    //   baseProviders.push(PrismaMultiTenantDataStore);
    // }

    // Create a unified DATA_STORE factory that works without multi-tenant support
    baseProviders.push({
      provide: DATA_STORE,
      inject: [ConfigService, MockDataStoreAdapter, PrismaDataStore, InMemoryDataStore],
      useFactory: (
        config: ConfigService,
        mockStore: MockDataStoreAdapter,
        prismaStore: PrismaDataStore,
        memoryStore: InMemoryDataStore
      ): DataStore => {
        const mode = config.get<string>('DATA_MODE', 'mock');
        if (!mode || mode === 'mock') return mockStore;
        if (mode === 'prisma') return prismaStore;
        if (mode === 'memory') return memoryStore;
        // multi-tenant mode not available (TenantModule disabled)
        throw new Error(
          `Unsupported DATA_MODE "${mode}". No data store is registered for this mode.`
        );
      },
    });

    return baseProviders;
  })(),
  exports: [DATA_STORE],
})
export class DataStoreModule {}

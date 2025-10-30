import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockDataModule } from '../mock/mock-data.module';
import { DATA_STORE, DataStore } from './data-store.types';
import { MockDataStoreAdapter } from './mock-data-store.adapter';
import { PrismaDataStore } from './prisma-data-store.service';
import { PrismaModule } from '../prisma/prisma.module';
import { InMemoryDataStore } from './in-memory-data-store.service';
import { PrismaMultiTenantDataStore } from './prisma-multi-tenant-datastore.service';
import { TenantModule } from '../tenant/tenant.module';

@Global()
@Module({
  imports: [MockDataModule, PrismaModule, TenantModule],
  providers: [
    MockDataStoreAdapter,
    PrismaDataStore,
    InMemoryDataStore,
    PrismaMultiTenantDataStore,
    {
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
        if (!mode || mode === 'mock') {
          return mockStore;
        }
        if (mode === 'prisma') {
          return prismaStore;
        }
        if (mode === 'memory') {
          return memoryStore;
        }
        if (mode === 'multi-tenant') {
          return multiTenantStore;
        }
        throw new Error(
          `Unsupported DATA_MODE "${mode}". No data store is registered for this mode.`
        );
      },
    },
  ],
  exports: [DATA_STORE],
})
export class DataStoreModule {}

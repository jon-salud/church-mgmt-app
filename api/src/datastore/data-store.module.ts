import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockDataModule } from '../mock/mock-data.module';
import { DATA_STORE, DataStore } from './data-store.types';
import { MockDataStoreAdapter } from './mock-data-store.adapter';
import { PrismaDataStore } from './prisma-data-store.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [MockDataModule, PrismaModule],
  providers: [
    MockDataStoreAdapter,
    PrismaDataStore,
    {
      provide: DATA_STORE,
      inject: [ConfigService, MockDataStoreAdapter, PrismaDataStore],
      useFactory: (config: ConfigService, mockStore: MockDataStoreAdapter, prismaStore: PrismaDataStore): DataStore => {
        const mode = config.get<string>('DATA_MODE', 'mock');
        if (!mode || mode === 'mock') {
          return mockStore;
        }
        if (mode === 'prisma') {
          return prismaStore;
        }
        throw new Error(`Unsupported DATA_MODE "${mode}". No data store is registered for this mode.`);
      },
    },
  ],
  exports: [DATA_STORE],
})
export class DataStoreModule {}

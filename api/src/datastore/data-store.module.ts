import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockDataModule } from '../mock/mock-data.module';
import { MockDatabaseService } from '../mock/mock-database.service';
import { DATA_STORE, DataStore } from './data-store.types';

@Global()
@Module({
  imports: [MockDataModule],
  providers: [
    {
      provide: DATA_STORE,
      inject: [ConfigService, MockDatabaseService],
      useFactory: (config: ConfigService, mockDb: MockDatabaseService): DataStore => {
        const mode = config.get<string>('DATA_MODE', 'mock');
        if (!mode || mode === 'mock') {
          return mockDb;
        }
        throw new Error(`Unsupported DATA_MODE "${mode}". No data store is registered for this mode.`);
      },
    },
  ],
  exports: [DATA_STORE],
})
export class DataStoreModule {}

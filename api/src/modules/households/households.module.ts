import { Module } from '@nestjs/common';
import { MockDataModule } from '../../mock/mock-data.module';
import { DataStoreModule } from '../../datastore/data-store.module';
import { AuditModule } from '../audit/audit.module';
import { CheckinModule } from '../checkin/checkin.module';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';
import { HouseholdsDataStoreRepository } from './households.datastore.repository';
import { HOUSEHOLDS_REPOSITORY } from './households.repository.interface';

@Module({
  imports: [MockDataModule, DataStoreModule, AuditModule, CheckinModule],
  controllers: [HouseholdsController],
  providers: [
    HouseholdsService,
    {
      provide: HOUSEHOLDS_REPOSITORY,
      useClass: HouseholdsDataStoreRepository,
    },
  ],
})
export class HouseholdsModule {}

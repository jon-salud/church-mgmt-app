import { Module } from '@nestjs/common';
import { MockDataModule } from '../../mock/mock-data.module';
import { DataStoreModule } from '../../datastore/data-store.module';
import { AuditModule } from '../audit/audit.module';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { CheckinDataStoreRepository } from './checkin.datastore.repository';
import { CHECKIN_REPOSITORY } from './checkin.repository.interface';

@Module({
  imports: [MockDataModule, DataStoreModule, AuditModule],
  controllers: [CheckinController],
  providers: [
    CheckinService,
    {
      provide: CHECKIN_REPOSITORY,
      useClass: CheckinDataStoreRepository,
    },
  ],
})
export class CheckinModule {}

import { Module } from '@nestjs/common';
import { MockDataModule } from '../../mock/mock-data.module';
import { DataStoreModule } from '../../datastore/data-store.module';
import { AuditModule } from '../audit/audit.module';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';

@Module({
  imports: [MockDataModule, DataStoreModule, AuditModule],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}

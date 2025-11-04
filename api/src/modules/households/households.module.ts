import { Module } from '@nestjs/common';
import { MockDataModule } from '../../mock/mock-data.module';
import { DataStoreModule } from '../../datastore/data-store.module';
import { AuditModule } from '../audit/audit.module';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';

@Module({
  imports: [MockDataModule, DataStoreModule, AuditModule],
  controllers: [HouseholdsController],
  providers: [HouseholdsService],
})
export class HouseholdsModule {}

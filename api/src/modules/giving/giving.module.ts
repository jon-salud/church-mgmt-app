import { Module } from '@nestjs/common';
import { GivingController } from './giving.controller';
import { GivingService } from './giving.service';
import { GivingDataStoreRepository } from './giving.datastore.repository';
import { GIVING_REPOSITORY } from './giving.repository.interface';
import { DataStoreModule } from '../../datastore/data-store.module';

@Module({
  imports: [DataStoreModule],
  controllers: [GivingController],
  providers: [
    GivingService,
    {
      provide: GIVING_REPOSITORY,
      useClass: GivingDataStoreRepository,
    },
  ],
  exports: [GivingService],
})
export class GivingModule {}

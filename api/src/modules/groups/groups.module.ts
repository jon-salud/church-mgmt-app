import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupsDataStoreRepository } from './groups.datastore.repository';
import { GROUPS_REPOSITORY } from './groups.repository.interface';

@Module({
  controllers: [GroupsController],
  providers: [
    GroupsService,
    {
      provide: GROUPS_REPOSITORY,
      useClass: GroupsDataStoreRepository,
    },
  ],
  exports: [GroupsService],
})
export class GroupsModule {}

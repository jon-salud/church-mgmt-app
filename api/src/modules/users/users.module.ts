import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersDataStoreRepository } from './users.datastore.repository';
import { USER_REPOSITORY } from './users.repository.interface';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: UsersDataStoreRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}


import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { DataStoreModule } from '../../datastore';

@Module({
  imports: [DataStoreModule],
  controllers: [RequestsController],
  providers: [RequestsService]
})
export class RequestsModule {}

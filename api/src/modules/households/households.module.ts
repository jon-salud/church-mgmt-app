import { Module } from '@nestjs/common';
import { MockDataModule } from '../../mock/mock-data.module';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';

@Module({
  imports: [MockDataModule],
  controllers: [HouseholdsController],
  providers: [HouseholdsService],
})
export class HouseholdsModule {}

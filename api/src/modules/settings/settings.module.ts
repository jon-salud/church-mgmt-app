import { Module } from '@nestjs/common';
import { MockDataModule } from '../../mock/mock-data.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [MockDataModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}

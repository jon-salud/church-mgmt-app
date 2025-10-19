import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class SettingsService {
  constructor(private readonly db: MockDatabaseService) {}

  getSettings(churchId: string) {
    return this.db.getSettings(churchId);
  }

  updateSettings(churchId: string, settings: any) {
    return this.db.updateSettings(churchId, settings);
  }
}

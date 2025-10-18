import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: MockDatabaseService) {}

  summary() {
    const church = this.db.getChurch();
    return this.db.getDashboardSnapshot(church.id);
  }

  overview() {
    const church = this.db.getChurch();
    const events = this.db
      .listEvents()
      .filter(event => new Date(event.startAt) >= new Date())
      .slice(0, 5);
    const announcements = this.db.listAnnouncements(church.id).slice(0, 5);
    const contributions = this.db.listContributions().slice(-5).reverse();
    return {
      church,
      events,
      announcements,
      contributions,
    };
  }
}

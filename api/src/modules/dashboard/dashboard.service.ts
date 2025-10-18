import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class DashboardService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

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

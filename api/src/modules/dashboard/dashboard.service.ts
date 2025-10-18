import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class DashboardService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async summary() {
    const church = await this.db.getChurch();
    return this.db.getDashboardSnapshot(church.id);
  }

  async overview() {
    const church = await this.db.getChurch();
    const [events, announcements, contributions] = await Promise.all([
      this.db.listEvents(),
      this.db.listAnnouncements(church.id),
      this.db.listContributions(),
    ]);
    const upcomingEvents = events.filter(event => new Date(event.startAt as any) >= new Date()).slice(0, 5);
    const recentAnnouncements = announcements.slice(0, 5);
    const recentContributions = contributions.slice(-5).reverse();
    return {
      church,
      events: upcomingEvents,
      announcements: recentAnnouncements,
      contributions: recentContributions,
    };
  }
}

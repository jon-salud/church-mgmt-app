
import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class PrayerService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listPrayerRequests() {
    return this.db.getPrayerRequests();
  }

  async listPendingPrayerRequests() {
    const allRequests = await this.db.getPrayerRequests();
    return allRequests.filter((request) => !request.approvedAt);
  }
}

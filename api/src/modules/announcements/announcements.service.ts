import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class AnnouncementsService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async list() {
    const church = await this.db.getChurch();
    return this.db.listAnnouncements(church.id);
  }

  markRead(announcementId: string, userId: string) {
    return this.db.markAnnouncementRead(announcementId, userId);
  }
}

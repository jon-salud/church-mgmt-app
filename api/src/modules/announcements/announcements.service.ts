import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class AnnouncementsService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  list() {
    return this.db.listAnnouncements(this.db.getChurch().id);
  }

  markRead(announcementId: string, userId: string) {
    return this.db.markAnnouncementRead(announcementId, userId);
  }
}

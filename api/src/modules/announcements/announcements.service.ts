import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly db: MockDatabaseService) {}

  list() {
    return this.db.listAnnouncements(this.db.getChurch().id);
  }

  markRead(announcementId: string, userId: string) {
    return this.db.markAnnouncementRead(announcementId, userId);
  }
}

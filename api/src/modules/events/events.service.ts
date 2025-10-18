import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';
import { AttendanceStatus } from '../../mock/mock-data';

@Injectable()
export class EventsService {
  constructor(private readonly db: MockDatabaseService) {}

  list() {
    return this.db.listEvents();
  }

  detail(id: string) {
    return this.db.getEventById(id);
  }

  recordAttendance(eventId: string, userId: string, status: AttendanceStatus, note?: string, recordedBy?: string) {
    return this.db.recordAttendance({ eventId, userId, status, note, recordedBy });
  }
}

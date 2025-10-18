import { Inject, Injectable } from '@nestjs/common';
import { AttendanceStatus } from '../../mock/mock-data';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class EventsService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

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

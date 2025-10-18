import { Inject, Injectable } from '@nestjs/common';
import { AttendanceStatus } from '../../mock/mock-data';
import { DATA_STORE, DataStore } from '../../datastore';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

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

  create(input: CreateEventDto, actorUserId: string) {
    return this.db.createEvent({ ...input, actorUserId });
  }

  update(id: string, input: UpdateEventDto, actorUserId: string) {
    return this.db.updateEvent(id, { ...input, actorUserId });
  }

  remove(id: string, actorUserId: string) {
    return this.db.deleteEvent(id, { actorUserId });
  }
}

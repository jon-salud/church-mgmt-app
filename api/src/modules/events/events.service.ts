import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  recordAttendance(
    eventId: string,
    userId: string,
    status: AttendanceStatus,
    note?: string,
    recordedBy?: string
  ) {
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

  createVolunteerRole(eventId: string, name: string, needed: number) {
    return this.db.createEventVolunteerRole({ eventId, name, needed });
  }

  updateVolunteerRole(id: string, name?: string, needed?: number) {
    const updateData: { name?: string; needed?: number } = {};
    if (name !== undefined) updateData.name = name;
    if (needed !== undefined) updateData.needed = needed;
    return this.db.updateEventVolunteerRole(id, updateData);
  }

  deleteVolunteerRole(id: string) {
    return this.db.deleteEventVolunteerRole(id);
  }

  createVolunteerSignup(volunteerRoleId: string, userId: string) {
    return this.db.createEventVolunteerSignup({ volunteerRoleId, userId });
  }

  async deleteVolunteerSignup(id: string, actorUserId: string) {
    const signup = await this.db.getEventVolunteerSignupById(id);
    if (!signup) {
      throw new NotFoundException('Signup not found');
    }

    const user = await this.db.getUserById(actorUserId);
    const isAdmin = user?.roles.some((role: any) => role.role === 'Admin');

    if (signup.userId !== actorUserId && !isAdmin) {
      throw new ForbiddenException('You are not authorized to delete this signup');
    }

    return this.db.deleteEventVolunteerSignup(id);
  }

  async exportAttendanceCsv(eventId: string) {
    const event = await this.db.getEventById(eventId);
    if (!event) {
      throw new NotFoundException(`Event ${eventId} not found`);
    }

    const members = (await this.db.listUsers()) as Array<{
      id: string;
      primaryEmail: string;
      profile?: { firstName?: string; lastName?: string };
    }>;
    const userLookup = new Map<string, { name: string; email: string | undefined }>(
      members.map(member => [
        member.id,
        {
          name:
            `${member.profile?.firstName ?? ''} ${member.profile?.lastName ?? ''}`.trim() ||
            member.primaryEmail ||
            member.id,
          email: member.primaryEmail,
        },
      ])
    );

    const escape = (value: string | number | null | undefined) => {
      if (value === undefined || value === null) {
        return '';
      }
      const stringValue = String(value);
      if (/["\n,]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const statusLabels: Record<string, string> = {
      checkedIn: 'Checked-in',
      absent: 'Absent',
      excused: 'Excused',
    };

    const attendanceRows = event.attendance
      .map(record => {
        const attendee = userLookup.get(record.userId);
        const recordedBy = record.recordedBy ? userLookup.get(record.recordedBy) : undefined;
        const statusLabel = statusLabels[record.status] ?? record.status;
        return [
          escape(attendee?.name ?? record.userId),
          escape(attendee?.email ?? ''),
          escape(statusLabel),
          escape(record.note ?? ''),
          escape(recordedBy?.name ?? record.recordedBy ?? ''),
          escape(record.recordedAt ? new Date(record.recordedAt).toISOString() : ''),
        ].join(',');
      })
      .sort();

    const lines: string[] = [
      ['Event Title', escape(event.title ?? '')].join(','),
      ['Start', escape(event.startAt)].join(','),
      ['End', escape(event.endAt)].join(','),
      ['Location', escape(event.location ?? '')].join(','),
      '',
      ['Member Name', 'Member Email', 'Status', 'Note', 'Recorded By', 'Recorded At'].join(','),
      ...attendanceRows,
    ];

    const filenameBase =
      event.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || event.id;

    return {
      filename: `${filenameBase}-attendance.csv`,
      content: lines.join('\n'),
    };
  }
}

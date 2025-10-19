import { EventsService } from '../../src/modules/events/events.service';
import { createDataStoreMock } from '../support/datastore.mock';

describe('EventsService', () => {
  const store = createDataStoreMock();
  const service = new EventsService(store);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists events via the datastore', async () => {
    const expected = [{ id: 'event-1' }];
    store.listEvents.mockResolvedValue(expected as any);

    const result = await service.list();

    expect(result).toEqual(expected);
    expect(store.listEvents).toHaveBeenCalledTimes(1);
  });

  it('returns event detail from datastore', async () => {
    const event = { id: 'event-1' };
    store.getEventById.mockResolvedValue(event as any);

    const result = await service.detail('event-1');

    expect(store.getEventById).toHaveBeenCalledWith('event-1');
    expect(result).toEqual(event);
  });

  it('returns null when event not found', async () => {
    store.getEventById.mockResolvedValue(null);

    const result = await service.detail('missing');

    expect(result).toBeNull();
  });

  it('records attendance through datastore', async () => {
    store.recordAttendance.mockResolvedValue({ status: 'checkedIn' } as any);

    const result = await service.recordAttendance('event-1', 'user-1', 'checkedIn', 'note', 'actor-1');

    expect(store.recordAttendance).toHaveBeenCalledWith({
      eventId: 'event-1',
      userId: 'user-1',
      status: 'checkedIn',
      note: 'note',
      recordedBy: 'actor-1',
    });
    expect(result).toEqual({ status: 'checkedIn' });
  });

  it('exports attendance as csv with derived filename', async () => {
    store.getEventById.mockResolvedValue({
      id: 'event-1',
      title: 'Sunday Gathering',
      startAt: '2024-05-01T10:00:00.000Z',
      endAt: '2024-05-01T11:30:00.000Z',
      location: 'Main Hall',
      attendance: [
        {
          eventId: 'event-1',
          userId: 'user-1',
          status: 'checkedIn',
          note: 'Arrived early',
          recordedBy: 'user-2',
          recordedAt: '2024-05-01T10:05:00.000Z',
        },
      ],
    } as any);
    store.listUsers.mockResolvedValue([
      {
        id: 'user-1',
        primaryEmail: 'attendee@example.com',
        profile: { firstName: 'Alex', lastName: 'Smith' },
      },
      {
        id: 'user-2',
        primaryEmail: 'recorder@example.com',
        profile: { firstName: 'Jamie', lastName: 'Lee' },
      },
    ] as any);

    const result = await service.exportAttendanceCsv('event-1');

    expect(store.getEventById).toHaveBeenCalledWith('event-1');
    expect(store.listUsers).toHaveBeenCalledTimes(1);
    expect(result.filename).toBe('sunday-gathering-attendance.csv');
    expect(result.content).toContain('Event Title,Sunday Gathering');
    expect(result.content).toContain('Alex Smith');
    expect(result.content).toContain('Jamie Lee');
    expect(result.content).toContain('Checked-in');
  });

  it('throws when exporting attendance for missing event', async () => {
    store.getEventById.mockResolvedValue(null);

    await expect(service.exportAttendanceCsv('missing')).rejects.toThrow('Event missing not found');
  });
});

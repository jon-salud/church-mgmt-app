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
    store.listEvents.mockReturnValue(expected as any);
    const service = new EventsService(store);

    const result = service.list();

    expect(result).toEqual(expected);
    expect(store.listEvents).toHaveBeenCalledTimes(1);
  });

  it('returns event detail from datastore', () => {
    const event = { id: 'event-1' };
    store.getEventById.mockReturnValue(event as any);

    const result = service.detail('event-1');

    expect(store.getEventById).toHaveBeenCalledWith('event-1');
    expect(result).toEqual(event);
  });

  it('returns null when event not found', () => {
    store.getEventById.mockReturnValue(null);
    const service = new EventsService(store);

    const result = service.detail('missing');

    expect(result).toBeNull();
  });

  it('records attendance through datastore', () => {
    const service = new EventsService(store);
    store.recordAttendance.mockReturnValue({ status: 'checkedIn' } as any);

    const result = service.recordAttendance('event-1', 'user-1', 'checkedIn', 'note', 'actor-1');

    expect(store.recordAttendance).toHaveBeenCalledWith({
      eventId: 'event-1',
      userId: 'user-1',
      status: 'checkedIn',
      note: 'note',
      recordedBy: 'actor-1',
    });
    expect(result).toEqual({ status: 'checkedIn' });
  });
});

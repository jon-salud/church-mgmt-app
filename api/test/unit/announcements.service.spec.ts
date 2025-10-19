import { AnnouncementsService } from '../../src/modules/announcements/announcements.service';
import { createDataStoreMock } from '../support/datastore.mock';

describe('AnnouncementsService', () => {
  const store = createDataStoreMock();
  const service = new AnnouncementsService(store);

  beforeEach(() => {
    jest.clearAllMocks();
    store.getChurch.mockResolvedValue({ id: 'church-1' } as any);
  });

  it('lists announcements for the current church', async () => {
    const announcements = [{ id: 'announcement-1' }];
    store.listAnnouncements.mockResolvedValue(announcements as any);

    const result = await service.list();

    expect(store.getChurch).toHaveBeenCalled();
    expect(store.listAnnouncements).toHaveBeenCalledWith('church-1');
    expect(result).toEqual(announcements);
  });

  it('marks announcement read through the datastore', async () => {
    const record = { announcementId: 'announcement-1', userId: 'user-1' };
    store.markAnnouncementRead.mockResolvedValue(record as any);

    const result = await service.markRead('announcement-1', 'user-1');

    expect(store.markAnnouncementRead).toHaveBeenCalledWith('announcement-1', 'user-1');
    expect(result).toEqual(record);
  });

  it('creates announcement via datastore with defaults', async () => {
    store.createAnnouncement.mockResolvedValue({ id: 'announcement-123' } as any);

    const result = await service.create(
      {
        title: 'New series',
        body: 'Join our new teaching series',
        audience: 'all',
      },
      'user-admin',
    );

    expect(store.createAnnouncement).toHaveBeenCalledTimes(1);
    const payload = store.createAnnouncement.mock.calls[0][0];
    expect(payload).toMatchObject({
      title: 'New series',
      body: 'Join our new teaching series',
      audience: 'all',
      groupIds: undefined,
      expireAt: undefined,
      actorUserId: 'user-admin',
    });
    const publishAt = payload.publishAt as string | undefined;
    expect(typeof publishAt).toBe('string');
    if (publishAt) {
      expect(new Date(publishAt).toString()).not.toBe('Invalid Date');
    }
    expect(result).toEqual({ id: 'announcement-123' });
  });

  it('updates announcement via datastore', async () => {
    store.updateAnnouncement.mockResolvedValue({ id: 'announcement-1', title: 'Updated' } as any);

    const result = await service.update(
      'announcement-1',
      {
        title: 'Updated',
        audience: 'custom',
        groupIds: ['group-1'],
      },
      'user-admin',
    );

    expect(store.updateAnnouncement).toHaveBeenCalledWith('announcement-1', {
      title: 'Updated',
      audience: 'custom',
      groupIds: ['group-1'],
      actorUserId: 'user-admin',
    });
    expect(result).toEqual({ id: 'announcement-1', title: 'Updated' });
  });
});

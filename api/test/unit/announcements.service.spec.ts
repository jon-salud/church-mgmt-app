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
});

import { NotificationsService } from '../../src/modules/notifications/notifications.service';
import { INotificationSender } from '../../src/modules/notifications/notifications.interface';
import { createDataStoreMock } from '../support/datastore.mock';
import { DataStore } from '../../src/datastore';

const createNotificationSenderMock = (): jest.Mocked<INotificationSender> => ({
  sendNotification: jest.fn().mockResolvedValue(undefined),
});

describe('NotificationsService', () => {
  let store: jest.Mocked<DataStore>;
  let sender: jest.Mocked<INotificationSender>;
  let service: NotificationsService;

  beforeEach(() => {
    store = createDataStoreMock();
    sender = createNotificationSenderMock();
    service = new NotificationsService(store, sender);
  });

  it('delegates subscribe to datastore', async () => {
    const subscription = { userId: 'user-1', endpoint: 'endpoint' };
    store.createPushSubscription.mockResolvedValue(subscription as any);

    const result = await service.subscribe(subscription as any);

    expect(store.createPushSubscription).toHaveBeenCalledWith(subscription);
    expect(result).toEqual(subscription);
  });

  it('delegates sendNotification to sender', async () => {
    const payload = { title: 'Test' };

    await service.sendNotification('user-1', payload);

    expect(sender.sendNotification).toHaveBeenCalledWith('user-1', payload);
  });
});

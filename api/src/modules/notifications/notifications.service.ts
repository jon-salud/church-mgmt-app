import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import * as webPush from 'web-push';
import { CreateNotificationSubscriptionDto } from './dto/create-notification-subscription.dto';
import { DATA_STORE, DataStore } from '../../datastore';
import { INotificationSender, NOTIFICATION_SENDER } from './notifications.interface';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(DATA_STORE) private readonly db: DataStore,
    @Inject(NOTIFICATION_SENDER) private readonly sender: INotificationSender
  ) {}

  onModuleInit() {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      this.logger.warn('VAPID keys not configured. Push notifications will be disabled.');
      return;
    }

    webPush.setVapidDetails(
      'mailto:admin@example.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  }

  async subscribe(subscription: CreateNotificationSubscriptionDto) {
    return this.db.createPushSubscription(subscription);
  }

  async sendNotification(userId: string, payload: unknown) {
    return this.sender.sendNotification(userId, payload);
  }
}

import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import * as webPush from 'web-push';
import { CreateNotificationSubscriptionDto } from './dto/create-notification-subscription.dto';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

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

  async sendNotification(userId: string, payload: any) {
    if (!process.env.VAPID_PUBLIC_KEY) {
      this.logger.warn('Cannot send push notification, VAPID keys not configured.');
      return;
    }

    const subscriptions = await this.db.getPushSubscriptionsByUserId(userId);
    if (!subscriptions) {
      return;
    }

    const notificationPayload = JSON.stringify(payload);
    subscriptions.forEach((subscription: any) => {
      webPush.sendNotification(subscription, notificationPayload).catch(err => {
        this.logger.error('Error sending push notification', err);
      });
    });
  }
}

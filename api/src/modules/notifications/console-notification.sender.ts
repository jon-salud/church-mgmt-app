import { Injectable, Logger } from '@nestjs/common';
import { INotificationSender } from './notifications.interface';

@Injectable()
export class ConsoleNotificationSender implements INotificationSender {
  private readonly logger = new Logger(ConsoleNotificationSender.name);

  async sendNotification(userId: string, payload: unknown): Promise<void> {
    this.logger.log(`Sending notification to user ${userId}: ${JSON.stringify(payload)}`);
  }
}

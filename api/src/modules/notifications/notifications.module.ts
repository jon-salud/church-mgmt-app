import { Module, Global } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ConsoleNotificationSender } from './console-notification.sender';
import { NOTIFICATION_SENDER } from './notifications.interface';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATION_SENDER,
      useClass: ConsoleNotificationSender,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

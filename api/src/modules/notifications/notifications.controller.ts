import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationSubscriptionDto } from './dto/create-notification-subscription.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  subscribe(@Body() subscription: CreateNotificationSubscriptionDto) {
    this.notificationsService.subscribe(subscription);
  }
}

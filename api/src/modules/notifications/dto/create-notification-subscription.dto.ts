import { IsString, IsObject } from 'class-validator';

export class CreateNotificationSubscriptionDto {
  @IsString()
  endpoint!: string;

  @IsObject()
  keys!: {
    p256dh: string;
    auth: string;
  };

  @IsString()
  userId!: string;
}

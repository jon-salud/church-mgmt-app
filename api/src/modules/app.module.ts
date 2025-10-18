import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { EventsModule } from './events/events.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { GivingModule } from './giving/giving.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MockDataModule } from '../mock/mock-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MockDataModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    EventsModule,
    AnnouncementsModule,
    GivingModule,
    DashboardModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { EventsModule } from './events/events.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { GivingModule } from './giving/giving.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataStoreModule } from '../datastore';
import { AuditModule } from './audit/audit.module';
import { ObservabilityModule } from './observability/observability.module';
import { RolesModule } from './roles/roles.module';
import { HouseholdsModule } from './households/households.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataStoreModule,
    AuthModule,
    UsersModule,
    HouseholdsModule,
    GroupsModule,
    EventsModule,
    AnnouncementsModule,
    GivingModule,
    DashboardModule,
    AuditModule,
    ObservabilityModule,
    RolesModule,
    SettingsModule,
  ],
})
export class AppModule {}

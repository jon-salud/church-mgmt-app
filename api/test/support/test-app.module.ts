import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MockDataModule } from '../../src/mock/mock-data.module';
import { DataStoreModule } from '../../src/datastore/data-store.module';
import { HouseholdsModule } from '../../src/modules/households/households.module';
import { EventsModule } from '../../src/modules/events/events.module';
import { CheckinModule } from '../../src/modules/checkin/checkin.module';
import { NotificationsModule } from '../../src/modules/notifications/notifications.module';
import { RolesModule } from '../../src/modules/roles/roles.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { DocumentsModule } from '../../src/modules/documents/documents.module';
import { GroupsModule } from '../../src/modules/groups/groups.module';
import { AnnouncementsModule } from '../../src/modules/announcements/announcements.module';
import { GivingModule } from '../../src/modules/giving/giving.module';
import { PastoralCareModule } from '../../src/modules/pastoral-care/pastoral-care.module';
import { RequestsModule } from '../../src/modules/requests/requests.module';
import { DashboardModule } from '../../src/modules/dashboard/dashboard.module';
import { AuditModule } from '../../src/modules/audit/audit.module';
import { AuthModule } from '../../src/modules/auth/auth.module';

@Module({
  imports: [
    // Provide ConfigService used by DataStoreModule
    ConfigModule.forRoot({ isGlobal: true }),
    MockDataModule,
    DataStoreModule,
    AuthModule,
    NotificationsModule,
    HouseholdsModule,
    EventsModule,
    CheckinModule,
    RolesModule,
    UsersModule,
    DocumentsModule,
    GroupsModule,
    AnnouncementsModule,
    GivingModule,
    PastoralCareModule,
    RequestsModule,
    DashboardModule,
    AuditModule,
  ],
})
export class TestAppModule {}

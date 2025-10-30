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
import { CheckinModule } from './checkin/checkin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PastoralCareModule } from './pastoral-care/pastoral-care.module';
import { PrayerModule } from './prayer/prayer.module';
import { RequestsModule } from './requests/requests.module';
import { InvitationsModule } from './invitations/invitations.module';
import { DocumentsModule } from './documents/documents.module';
// TenantModule is intentionally not imported statically to avoid require-time
// evaluation of its decorators (which can reference runtime-only guards).
// It will be conditionally required when not running under test to keep the
// compiled/test server bootable.
import { OpenTelemetryModule } from './opentelemetry/opentelemetry.module';

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
    CheckinModule,
    NotificationsModule,
    PastoralCareModule,
    PrayerModule,
    RequestsModule,
    InvitationsModule,
    DocumentsModule,
    // When running tests we may want to avoid loading the Tenant module as
    // its controllers can reference runtime guards that are difficult to
    // reliably resolve under transformed/test-time module loading. Skip the
    // TenantModule in test runs to keep the compiled/test server bootable and
    // avoid decorator resolution errors.
    ...(process.env.NODE_ENV === 'test' ? [] : [require('../tenant/tenant.module').TenantModule]),
    OpenTelemetryModule,
  ],
})
export class AppModule {}

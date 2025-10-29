import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogQueryService } from './audit-query.service';
import { AuditLogCommandService } from './audit-command.service';
import { AuditProjectionsService } from './projections.service';
import { EVENT_STORE } from '../../common/event-store.interface';
import { CACHE_STORE } from '../../common/cache-store.interface';
import { FileEventStoreService } from '../../event-store/file-event-store.service';
import { CacheFactory } from '../../common/cache-store.factory';
import { ResilienceModule } from '../../resilience/resilience.module';
import { ObservabilityModule } from '../../observability/observability.module';

@Module({
  imports: [ResilienceModule, ObservabilityModule],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditLogQueryService,
    AuditLogCommandService,
    AuditProjectionsService,
    {
      provide: EVENT_STORE,
      useFactory: () => new FileEventStoreService('storage/event-store.ndjson'),
    },
    {
      provide: CACHE_STORE,
      useFactory: () => CacheFactory.create(process.env.CACHE_MODE || 'memory'),
    },
  ],
  exports: [
    AuditService,
    AuditLogQueryService,
    AuditLogCommandService,
    AuditProjectionsService,
    ResilienceModule,
  ],
})
export class AuditModule {}

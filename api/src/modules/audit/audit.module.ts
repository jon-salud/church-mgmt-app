import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogQueryService } from './audit-query.service';
import { AuditLogCommandService } from './audit-command.service';
import { AuditProjectionsService } from './projections.service';
import { EVENT_STORE } from '../../common/event-store.interface';
import { FileEventStoreService } from '../../event-store/file-event-store.service';

@Module({
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
  ],
  exports: [AuditService, AuditLogQueryService, AuditLogCommandService, AuditProjectionsService],
})
export class AuditModule {}

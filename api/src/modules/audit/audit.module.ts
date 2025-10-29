import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogQueryService } from './audit-query.service';
import { AuditLogCommandService } from './audit-command.service';

@Module({
  controllers: [AuditController],
  providers: [
    AuditService, // Keep for backward compatibility
    AuditLogQueryService,
    AuditLogCommandService,
  ],
  exports: [
    AuditService, // Keep for backward compatibility
    AuditLogQueryService,
    AuditLogCommandService,
  ],
})
export class AuditModule {}

import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogQueryService } from './audit-query.service';
import { AuditLogCommandService } from './audit-command.service';

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditLogQueryService, AuditLogCommandService],
  exports: [AuditService, AuditLogQueryService, AuditLogCommandService],
})
export class AuditModule {}

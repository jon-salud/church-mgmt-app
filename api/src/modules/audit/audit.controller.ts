import { Controller, ForbiddenException, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditLogQueryService } from './audit-query.service';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { objectResponse } from '../../common/openapi/schemas';

@UseGuards(AuthGuard)
@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditQueryService: AuditLogQueryService) {}

  @Get()
  @ApiOperation({ summary: 'List audit log entries' })
  @ApiOkResponse(objectResponse)
  list(@Req() req: any, @Query() query: ListAuditQueryDto) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required to view audit logs');
    }
    return this.auditQueryService.listAuditLogs(query);
  }
}

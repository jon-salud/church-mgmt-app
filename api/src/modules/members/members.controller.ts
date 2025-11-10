import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { MemberListQueryDto } from './dto/member-list-query.dto';
import { MemberListResponse } from './types/member-summary.type';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('members')
@Controller('members')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({
    summary: 'List members with pagination, search, and filters',
    description:
      'Returns a paginated list of church members with optional search and filtering. ' +
      'Supports filtering by status, role, attendance, groups, email/phone presence. ' +
      'Results can be sorted by various fields.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved member list',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string', nullable: true },
              phone: { type: 'string', nullable: true },
              status: { type: 'string' },
              roles: { type: 'array', items: { type: 'string' } },
              lastAttendance: { type: 'string', nullable: true },
              groupsCount: { type: 'number' },
              groups: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: { id: { type: 'string' }, name: { type: 'string' } },
                },
              },
              badges: { type: 'array', items: { type: 'string' } },
              createdAt: { type: 'string' },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            pages: { type: 'number' },
          },
        },
        meta: {
          type: 'object',
          properties: {
            queryTime: { type: 'number' },
            filters: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - churchId required' })
  async listMembers(
    @Req() req: any,
    @Query() query: MemberListQueryDto
  ): Promise<MemberListResponse> {
    const churchId = req.user?.churchId;
    return this.membersService.listMembers(churchId, query);
  }
}

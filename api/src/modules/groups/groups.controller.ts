import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { AuthGuard } from '../auth/auth.guard';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';

@UseGuards(AuthGuard)
@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'List groups' })
  @ApiOkResponse(arrayOfObjectsResponse)
  list() {
    return this.groupsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group detail' })
  @ApiOkResponse(objectResponse)
  detail(@Param('id') id: string) {
    return this.groupsService.detail(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List group members' })
  @ApiOkResponse(arrayOfObjectsResponse)
  members(@Param('id') id: string) {
    return this.groupsService.members(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to group' })
  @ApiCreatedResponse(objectResponse)
  addMember(@Param('id') id: string, @Body() dto: AddGroupMemberDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.groupsService.addMember(id, dto, req.user.id);
  }

  @Patch(':groupId/members/:userId')
  @ApiOperation({ summary: 'Update group member' })
  @ApiOkResponse(objectResponse)
  updateMember(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateGroupMemberDto,
    @Req() req: any,
  ) {
    this.ensureAdmin(req);
    return this.groupsService.updateMember(groupId, userId, dto, req.user.id);
  }

  @Delete(':groupId/members/:userId')
  @ApiOperation({ summary: 'Remove group member' })
  @ApiOkResponse({ type: SuccessResponseDto })
  removeMember(@Param('groupId') groupId: string, @Param('userId') userId: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.groupsService.removeMember(groupId, userId, req.user.id);
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required for membership management');
    }
  }
}

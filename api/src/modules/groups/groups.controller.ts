import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { AuthGuard } from '../auth/auth.guard';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';

@UseGuards(AuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  list() {
    return this.groupsService.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.groupsService.detail(id);
  }

  @Get(':id/members')
  members(@Param('id') id: string) {
    return this.groupsService.members(id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddGroupMemberDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.groupsService.addMember(id, dto, req.user.id);
  }

  @Patch(':groupId/members/:userId')
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

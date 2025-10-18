import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { DemoAuthGuard } from '../auth/demo-auth.guard';

@UseGuards(DemoAuthGuard)
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
}

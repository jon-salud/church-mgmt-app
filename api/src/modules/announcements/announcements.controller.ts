import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { DemoAuthGuard } from '../auth/demo-auth.guard';

@UseGuards(DemoAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  list() {
    return this.announcementsService.list();
  }

  @Post(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.announcementsService.markRead(id, req.user?.id);
  }
}

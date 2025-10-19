import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@UseGuards(AuthGuard)
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

  @Post()
  create(@Body() dto: CreateAnnouncementDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.announcementsService.create(dto, req.user?.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.announcementsService.update(id, dto, req.user?.id);
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required for announcement management');
    }
  }
}

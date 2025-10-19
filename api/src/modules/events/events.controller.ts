import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@UseGuards(AuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  list() {
    return this.eventsService.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.eventsService.detail(id);
  }

  @Post(':id/attendance')
  recordAttendance(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
    @Req() req: any,
  ) {
    return this.eventsService.recordAttendance(id, dto.userId, dto.status, dto.note, req.user?.id);
  }

  @Post()
  create(@Body() dto: CreateEventDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.remove(id, req.user.id);
  }

  @Get(':id/attendance.csv')
  async exportAttendance(@Param('id') id: string, @Req() req: any, @Res({ passthrough: true }) res: FastifyReply) {
    this.ensureAdmin(req);
    const { content, filename } = await this.eventsService.exportAttendanceCsv(id);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    return content;
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required for event management');
    }
  }
}

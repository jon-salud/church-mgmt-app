import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { DemoAuthGuard } from '../auth/demo-auth.guard';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@UseGuards(DemoAuthGuard)
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
}

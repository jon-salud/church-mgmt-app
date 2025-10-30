import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CreateEventVolunteerRoleDto, UpdateEventVolunteerRoleDto } from './dto/volunteer.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';

@UseGuards(AuthGuard)
@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events' })
  @ApiOkResponse(arrayOfObjectsResponse)
  list() {
    return this.eventsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event detail' })
  @ApiOkResponse(objectResponse)
  detail(@Param('id') id: string) {
    return this.eventsService.detail(id);
  }

  @Post(':id/attendance')
  @ApiOperation({ summary: 'Record attendance for an event' })
  @ApiOkResponse(objectResponse)
  recordAttendance(@Param('id') id: string, @Body() dto: UpdateAttendanceDto, @Req() req: any) {
    return this.eventsService.recordAttendance(id, dto.userId, dto.status, dto.note, req.user?.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @ApiCreatedResponse(objectResponse)
  create(@Body() dto: CreateEventDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiOkResponse(objectResponse)
  update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiOkResponse({ type: SuccessResponseDto })
  remove(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.remove(id, req.user.id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete an event (admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  hardDelete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.hardDelete(id, req.user.id);
  }

  @Post(':id/undelete')
  @ApiOperation({ summary: 'Restore a deleted event (admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  undelete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.undelete(id, req.user.id);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'List deleted events (admin only)' })
  @ApiOkResponse(arrayOfObjectsResponse)
  listDeleted(@Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.listDeleted();
  }

  @Get(':id/attendance.csv')
  @ApiOperation({ summary: 'Export attendance CSV' })
  @ApiProduces('text/csv')
  @ApiOkResponse({
    description: 'CSV payload',
    schema: { type: 'string', example: 'eventId,userId,status\n' },
  })
  async exportAttendance(
    @Param('id') id: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
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

  @Post(':id/volunteer-roles')
  @ApiOperation({ summary: 'Create a volunteer role for an event' })
  @ApiCreatedResponse(objectResponse)
  createVolunteerRole(
    @Param('id') id: string,
    @Body() dto: CreateEventVolunteerRoleDto,
    @Req() req: any
  ) {
    this.ensureAdmin(req);
    return this.eventsService.createVolunteerRole(id, dto.name, dto.needed);
  }

  @Patch('volunteer-roles/:roleId')
  @ApiOperation({ summary: 'Update a volunteer role' })
  @ApiOkResponse(objectResponse)
  updateVolunteerRole(
    @Param('roleId') roleId: string,
    @Body() dto: UpdateEventVolunteerRoleDto,
    @Req() req: any
  ) {
    this.ensureAdmin(req);
    return this.eventsService.updateVolunteerRole(roleId, dto.name, dto.needed);
  }

  @Delete('volunteer-roles/:roleId')
  @ApiOperation({ summary: 'Delete a volunteer role' })
  @ApiOkResponse({ type: SuccessResponseDto })
  deleteVolunteerRole(@Param('roleId') roleId: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.eventsService.deleteVolunteerRole(roleId);
  }

  @Post('volunteer-roles/:roleId/signups')
  @ApiOperation({ summary: 'Sign up for a volunteer role' })
  @ApiCreatedResponse(objectResponse)
  createVolunteerSignup(@Param('roleId') roleId: string, @Req() req: any) {
    return this.eventsService.createVolunteerSignup(roleId, req.user.id);
  }

  @Delete('volunteer-signups/:signupId')
  @ApiOperation({ summary: 'Delete a volunteer signup' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async deleteVolunteerSignup(@Param('signupId') signupId: string, @Req() req: any) {
    return await this.eventsService.deleteVolunteerSignup(signupId, req.user.id);
  }
}

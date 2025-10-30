import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';

@UseGuards(AuthGuard)
@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  announcementsService: AnnouncementsService;

  constructor(announcementsService: AnnouncementsService) {
    this.announcementsService = announcementsService;
  }

  @Get()
  @ApiOperation({ summary: 'List announcements' })
  @ApiOkResponse(arrayOfObjectsResponse)
  list() {
    return this.announcementsService.list();
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark announcement as read' })
  @ApiOkResponse(objectResponse)
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.announcementsService.markRead(id, req.user?.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create announcement' })
  @ApiCreatedResponse(objectResponse)
  create(@Body() dto: CreateAnnouncementDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.announcementsService.create(dto, req.user?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update announcement' })
  @ApiOkResponse(objectResponse)
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

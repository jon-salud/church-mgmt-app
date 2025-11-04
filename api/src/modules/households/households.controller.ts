import {
  Controller,
  Get,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { HouseholdsService } from './households.service';
import { BulkArchiveHouseholdsDto, BulkRestoreHouseholdsDto } from './dto/bulk-operations.dto';
import { ensureLeader } from '../../common/auth/auth.helpers';

@ApiTags('Households')
@UseGuards(AuthGuard)
@Controller('households')
export class HouseholdsController {
  constructor(private readonly service: HouseholdsService) {}

  @Get()
  @ApiOperation({ summary: 'List all households' })
  @ApiOkResponse({ description: 'A list of all households' })
  findAll() {
    return this.service.findAll();
  }

  @Get('deleted/all')
  @ApiOperation({ summary: 'List all deleted/archived households' })
  @ApiOkResponse({ description: 'A list of all deleted households' })
  findAllDeleted(@Req() req: any) {
    ensureLeader(req);
    return this.service.findAllDeleted();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single household by ID' })
  @ApiOkResponse({ description: 'The household with the specified ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/dependents')
  @ApiOperation({ summary: 'Get household dependents count for warning dialogs' })
  @ApiOkResponse({ description: 'Active members and children counts for the household' })
  async getDependents(@Param('id') id: string, @Req() req: any) {
    ensureLeader(req);
    return this.service.getDependents(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete (archive) a household' })
  @ApiOkResponse({ description: 'The household was successfully archived' })
  delete(@Param('id') id: string, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.id || 'system';
    return this.service.delete(id, actorUserId);
  }

  @Post(':id/undelete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted household' })
  @ApiOkResponse({ description: 'The household was successfully restored' })
  undelete(@Param('id') id: string, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.id || 'system';
    return this.service.undelete(id, actorUserId);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk soft delete (archive) multiple households' })
  @ApiOkResponse({ description: 'Bulk archive result' })
  bulkDelete(@Body() dto: BulkArchiveHouseholdsDto, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.userId || 'system';
    return this.service.bulkDelete(dto, actorUserId);
  }

  @Post('bulk-undelete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk restore multiple soft-deleted households' })
  @ApiOkResponse({ description: 'Bulk restore result' })
  bulkUndelete(@Body() dto: BulkRestoreHouseholdsDto, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.userId || 'system';
    return this.service.bulkUndelete(dto, actorUserId);
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete a household (cannot be undone)' })
  @ApiOkResponse({ description: 'The household was permanently deleted' })
  hardDelete(@Param('id') id: string, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.id || 'system';
    return this.service.hardDelete(id, actorUserId);
  }
}

import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@UseGuards(AuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get(':churchId')
  @ApiOperation({ summary: 'Get settings for a church' })
  @ApiOkResponse({ description: 'The settings for the specified church' })
  getSettings(@Param('churchId') churchId: string) {
    return this.service.getSettings(churchId);
  }

  @Put(':churchId')
  @ApiOperation({ summary: 'Update settings for a church' })
  @ApiOkResponse({ description: 'The updated settings' })
  updateSettings(@Param('churchId') churchId: string, @Body() settings: any) {
    return this.service.updateSettings(churchId, settings);
  }
}

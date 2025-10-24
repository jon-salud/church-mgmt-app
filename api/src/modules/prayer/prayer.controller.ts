import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrayerService } from './prayer.service';
import { AuthGuard } from '../auth/auth.guard';
import { arrayOfObjectsResponse } from '../../common/openapi/schemas';

@UseGuards(AuthGuard)
@ApiTags('Prayer')
@ApiBearerAuth()
@Controller('prayer')
export class PrayerController {
  constructor(private readonly prayerService: PrayerService) {}

  @Get('requests')
  @ApiOperation({ summary: 'List all prayer requests' })
  @ApiOkResponse(arrayOfObjectsResponse)
  listPrayerRequests() {
    return this.prayerService.listPrayerRequests();
  }
}

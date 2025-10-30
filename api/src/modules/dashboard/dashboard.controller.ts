import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';
import { objectResponse } from '../../common/openapi/schemas';

@UseGuards(AuthGuard)
@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  public dashboardService: DashboardService;

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary snapshot' })
  @ApiOkResponse(objectResponse)
  summary() {
    return this.dashboardService.summary();
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview breakdown' })
  @ApiOkResponse(objectResponse)
  overview() {
    return this.dashboardService.overview();
  }
}

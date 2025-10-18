import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DemoAuthGuard } from '../auth/demo-auth.guard';

@UseGuards(DemoAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.summary();
  }

  @Get('overview')
  overview() {
    return this.dashboardService.overview();
  }
}

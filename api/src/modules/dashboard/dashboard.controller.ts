import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
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

import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { GivingService } from './giving.service';
import { DemoAuthGuard } from '../auth/demo-auth.guard';
import { CreateContributionDto } from './dto/create-contribution.dto';

@UseGuards(DemoAuthGuard)
@Controller('giving')
export class GivingController {
  constructor(private readonly givingService: GivingService) {}

  @Get('funds')
  funds() {
    return this.givingService.listFunds();
  }

  @Get('contributions')
  contributions(@Query('memberId') memberId?: string, @Query('fundId') fundId?: string) {
    return this.givingService.listContributions({ memberId, fundId });
  }

  @Post('contributions')
  create(@Body() dto: CreateContributionDto) {
    return this.givingService.recordContribution(dto);
  }
}

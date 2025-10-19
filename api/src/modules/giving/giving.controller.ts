import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { GivingService } from './giving.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { FastifyReply } from 'fastify';

@UseGuards(AuthGuard)
@Controller('giving')
export class GivingController {
  constructor(private readonly givingService: GivingService) {}

  @Get('funds')
  funds() {
    return this.givingService.listFunds();
  }

  @Get('contributions')
  contributions(
    @Query('memberId') memberId?: string,
    @Query('fundId') fundId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.givingService.listContributions({ memberId, fundId, from, to });
  }

  @Get('reports/summary')
  summary(@Req() req: any) {
    this.ensureAdmin(req);
    return this.givingService.summary();
  }

  @Post('contributions')
  create(@Body() dto: CreateContributionDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.givingService.recordContribution(dto, req.user?.id);
  }

  @Patch('contributions/:id')
  update(@Param('id') id: string, @Body() dto: UpdateContributionDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.givingService.updateContribution(id, dto, req.user?.id);
  }

  @Get('contributions.csv')
  async export(
    @Query('memberId') memberId: string | undefined,
    @Query('fundId') fundId: string | undefined,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    this.ensureAdmin(req);
    const { content, filename } = await this.givingService.exportContributionsCsv({ memberId, fundId, from, to });
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    return content;
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required for managing giving records');
    }
  }
}

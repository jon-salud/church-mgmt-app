import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { GivingService } from './giving.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { FastifyReply } from 'fastify';
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';

@UseGuards(AuthGuard)
@ApiTags('Giving')
@ApiBearerAuth()
@Controller('giving')
export class GivingController {
  public givingService: GivingService;

  constructor(givingService: GivingService) {
    this.givingService = givingService;
  }

  @Get('funds')
  @ApiOperation({ summary: 'List giving funds' })
  @ApiOkResponse(arrayOfObjectsResponse)
  funds() {
    return this.givingService.listFunds();
  }

  @Get('contributions')
  @ApiOperation({ summary: 'List contributions' })
  @ApiQuery({ name: 'memberId', required: false })
  @ApiQuery({ name: 'fundId', required: false })
  @ApiQuery({ name: 'from', required: false, description: 'ISO date filter' })
  @ApiQuery({ name: 'to', required: false, description: 'ISO date filter' })
  @ApiOkResponse(arrayOfObjectsResponse)
  contributions(
    @Query('memberId') memberId?: string,
    @Query('fundId') fundId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    return this.givingService.listContributions({ memberId, fundId, from, to });
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get giving summary' })
  @ApiOkResponse(objectResponse)
  summary(@Req() req: any) {
    this.ensureAdmin(req);
    return this.givingService.summary();
  }

  @Post('contributions')
  @ApiOperation({ summary: 'Record a contribution' })
  @ApiCreatedResponse(objectResponse)
  create(@Body() dto: CreateContributionDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.givingService.recordContribution(dto, req.user?.id);
  }

  @Patch('contributions/:id')
  @ApiOperation({ summary: 'Update a contribution' })
  @ApiOkResponse(objectResponse)
  update(@Param('id') id: string, @Body() dto: UpdateContributionDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.givingService.updateContribution(id, dto, req.user?.id);
  }

  @Get('contributions.csv')
  @ApiOperation({ summary: 'Export contributions CSV' })
  @ApiProduces('text/csv')
  @ApiOkResponse({
    description: 'CSV payload',
    schema: { type: 'string', example: 'contributionId,date,member,amount\n' },
  })
  async export(
    @Query('memberId') memberId: string | undefined,
    @Query('fundId') fundId: string | undefined,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    this.ensureAdmin(req);
    const { content, filename } = await this.givingService.exportContributionsCsv({
      memberId,
      fundId,
      from,
      to,
    });
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

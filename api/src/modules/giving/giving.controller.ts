import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  BadRequestException,
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
import { SuccessResponseDto } from '../../common/dto/success-response.dto';

@UseGuards(AuthGuard)
@ApiTags('Giving')
@ApiBearerAuth()
@Controller('giving')
export class GivingController {
  constructor(private givingService: GivingService) {}

  // ==================== FUNDS ====================

  @Get('funds/deleted/all')
  @ApiOperation({ summary: 'List deleted funds' })
  @ApiOkResponse(arrayOfObjectsResponse)
  deletedFunds(@Query('q') query?: string, @Req() req?: any) {
    this.ensureAdmin(req);
    return this.givingService.listDeletedFunds(query);
  }

  @Post('funds/bulk-delete')
  @ApiOperation({ summary: 'Soft delete multiple funds' })
  @ApiOkResponse()
  bulkDeleteFunds(@Body() dto: { ids: string[] }, @Req() req: any) {
    this.ensureLeader(req);
    if (!Array.isArray(dto.ids) || dto.ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }
    return this.givingService.bulkDeleteFunds(dto.ids, req.user?.id);
  }

  @Post('funds/bulk-undelete')
  @ApiOperation({ summary: 'Restore multiple deleted funds' })
  @ApiOkResponse()
  bulkUndeleteFunds(@Body() dto: { ids: string[] }, @Req() req: any) {
    this.ensureLeader(req);
    if (!Array.isArray(dto.ids) || dto.ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }
    return this.givingService.bulkUndeleteFunds(dto.ids, req.user?.id);
  }

  @Get('funds')
  @ApiOperation({ summary: 'List active funds' })
  @ApiOkResponse(arrayOfObjectsResponse)
  funds() {
    return this.givingService.listFunds();
  }

  @Post('funds')
  @ApiOperation({ summary: 'Create a new fund' })
  @ApiCreatedResponse(objectResponse)
  createFund(@Body() dto: { name: string; description?: string }, @Req() req: any) {
    this.ensureLeader(req);
    return this.givingService.createFund(dto, req.user?.id);
  }

  @Patch('funds/:id')
  @ApiOperation({ summary: 'Update a fund' })
  @ApiOkResponse(objectResponse)
  updateFund(
    @Param('id') id: string,
    @Body() dto: Partial<{ name: string; description?: string }>,
    @Req() req: any
  ) {
    this.ensureLeader(req);
    return this.givingService.updateFund(id, dto, req.user?.id);
  }

  @Delete('funds/:id/hard')
  @HttpCode(200)
  @ApiOperation({ summary: 'Permanently delete a fund (admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async hardDeleteFund(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    const result = await this.givingService.hardDeleteFund(id, req.user?.id);
    if (!result.success) {
      throw new NotFoundException('Fund not found');
    }
    return result;
  }

  @Delete('funds/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft delete a fund' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async deleteFund(@Param('id') id: string, @Req() req: any) {
    this.ensureLeader(req);
    const result = await this.givingService.deleteFund(id, req.user?.id);
    if (!result.success) {
      throw new NotFoundException('Fund not found');
    }
    return result;
  }

  @Post('funds/:id/undelete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Restore a deleted fund' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async undeleteFund(@Param('id') id: string, @Req() req: any) {
    this.ensureLeader(req);
    const result = await this.givingService.undeleteFund(id, req.user?.id);
    if (!result.success) {
      throw new NotFoundException('Fund not found or not deleted');
    }
    return result;
  }

  // ==================== CONTRIBUTIONS ====================

  @Get('contributions/deleted/all')
  @ApiOperation({ summary: 'List deleted contributions' })
  @ApiOkResponse(arrayOfObjectsResponse)
  deletedContributions(
    @Query('memberId') memberId?: string,
    @Query('fundId') fundId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Req() req?: any
  ) {
    this.ensureLeader(req);
    return this.givingService.listDeletedContributions({
      memberId,
      fundId,
      from,
      to,
    });
  }

  @Post('contributions/bulk-delete')
  @ApiOperation({ summary: 'Soft delete multiple contributions' })
  @ApiOkResponse()
  bulkDeleteContributions(@Body() dto: { ids: string[] }, @Req() req: any) {
    this.ensureLeader(req);
    if (!Array.isArray(dto.ids) || dto.ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }
    return this.givingService.bulkDeleteContributions(dto.ids, req.user?.id);
  }

  @Post('contributions/bulk-undelete')
  @ApiOperation({ summary: 'Restore multiple deleted contributions' })
  @ApiOkResponse()
  bulkUndeleteContributions(@Body() dto: { ids: string[] }, @Req() req: any) {
    this.ensureLeader(req);
    if (!Array.isArray(dto.ids) || dto.ids.length === 0) {
      throw new BadRequestException('ids must be a non-empty array');
    }
    return this.givingService.bulkUndeleteContributions(dto.ids, req.user?.id);
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
    @Query('to') to?: string,
    @Req() req?: any
  ) {
    // Members can only see their own contributions; leaders/admin see all
    const isAdmin = req?.user?.roles?.some((r: any) => r.role === 'Admin');
    const isLeader = req?.user?.roles?.some((r: any) => r.role === 'Leader');

    // Security: Members must have a valid user ID and cannot override the filter
    if (!isAdmin && !isLeader && !req?.user?.id) {
      throw new ForbiddenException('You are not authorized to view contributions.');
    }

    const effectiveMemberId = !isAdmin && !isLeader ? req.user.id : memberId || undefined;

    return this.givingService.listContributions({
      memberId: effectiveMemberId,
      fundId,
      from,
      to,
    });
  }

  @Post('contributions')
  @ApiOperation({ summary: 'Record a contribution' })
  @ApiCreatedResponse(objectResponse)
  create(@Body() dto: CreateContributionDto, @Req() req: any) {
    this.ensureLeader(req);
    return this.givingService.recordContribution(dto, req.user?.id);
  }

  @Patch('contributions/:id')
  @ApiOperation({ summary: 'Update a contribution' })
  @ApiOkResponse(objectResponse)
  update(@Param('id') id: string, @Body() dto: UpdateContributionDto, @Req() req: any) {
    this.ensureLeader(req);
    return this.givingService.updateContribution(id, dto, req.user?.id);
  }

  @Delete('contributions/:id/hard')
  @HttpCode(200)
  @ApiOperation({ summary: 'Permanently delete a contribution (admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async hardDeleteContribution(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    const result = await this.givingService.hardDeleteContribution(id, req.user?.id);
    if (!result.success) {
      throw new NotFoundException('Contribution not found');
    }
    return result;
  }

  @Delete('contributions/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Soft delete a contribution' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async deleteContribution(@Param('id') id: string, @Req() req: any) {
    const isAdmin = req?.user?.roles?.some((r: any) => r.role === 'Admin');
    const isLeader = req?.user?.roles?.some((r: any) => r.role === 'Leader');

    if (!isAdmin && !isLeader) {
      throw new ForbiddenException('Cannot delete contribution');
    }

    const result = await this.givingService.deleteContribution(id, req.user?.id);
    if (!result.success) {
      throw new NotFoundException('Contribution not found');
    }
    return result;
  }

  @Post('contributions/:id/undelete')
  @HttpCode(200)
  @ApiOperation({ summary: 'Restore a deleted contribution' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async undeleteContribution(@Param('id') id: string, @Req() req: any) {
    this.ensureLeader(req);
    const result = await this.givingService.undeleteContribution(id, req.user?.id);
    if (!result.success) {
      throw new NotFoundException('Contribution not found or not deleted');
    }
    return result;
  }

  @Get('reports/summary')
  @ApiOperation({ summary: 'Get giving summary' })
  @ApiOkResponse(objectResponse)
  summary(@Req() req: any) {
    this.ensureAdmin(req);
    return this.givingService.summary();
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
      throw new ForbiddenException('Admin role required');
    }
  }

  private ensureLeader(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isLeader = roles.some(role => role.role === 'Leader');
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isLeader && !isAdmin) {
      throw new ForbiddenException('Leader or Admin role required');
    }
  }
}

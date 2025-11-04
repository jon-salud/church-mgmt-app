import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  UseGuards,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateChildDto } from './dto/create-child.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateChildDto } from './dto/update-child.dto';
import { InitiateCheckinDto } from './dto/initiate-checkin.dto';
import { ConfirmCheckinDto } from './dto/confirm-checkin.dto';
import { InitiateCheckoutDto } from './dto/initiate-checkout.dto';
import { ConfirmCheckoutDto } from './dto/confirm-checkout.dto';
import { BulkArchiveChildrenDto, BulkRestoreChildrenDto } from './dto/bulk-operations.dto';
import { ensureLeader } from '../../common/auth/auth.helpers';

@Controller('checkin')
@UseGuards(AuthGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post('children')
  createChild(@Body() createChildDto: CreateChildDto, @CurrentUser() user: { id: string }) {
    return this.checkinService.createChild(createChildDto, user.id);
  }

  @Get('households/:householdId/children')
  getChildren(@Param('householdId') householdId: string) {
    return this.checkinService.getChildren(householdId);
  }

  @Patch('children/:id')
  updateChild(
    @Param('id') id: string,
    @Body() updateChildDto: UpdateChildDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.checkinService.updateChild(id, updateChildDto, user.id);
  }

  @Get('children/deleted')
  listDeletedChildren(@Query('householdId') householdId: string | undefined, @Req() req: any) {
    ensureLeader(req);
    return this.checkinService.listDeletedChildren(householdId);
  }

  @Delete('children/:id')
  @HttpCode(HttpStatus.OK)
  deleteChild(@Param('id') id: string, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.id || 'system';
    return this.checkinService.deleteChild(id, actorUserId);
  }

  @Post('children/:id/undelete')
  @HttpCode(HttpStatus.OK)
  undeleteChild(@Param('id') id: string, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.id || 'system';
    return this.checkinService.undeleteChild(id, actorUserId);
  }

  @Post('children/bulk-delete')
  @HttpCode(HttpStatus.OK)
  bulkDeleteChildren(@Body() dto: BulkArchiveChildrenDto, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.id || 'system';
    return this.checkinService.bulkDeleteChildren(dto.childIds, actorUserId);
  }

  @Post('children/bulk-undelete')
  @HttpCode(HttpStatus.OK)
  bulkUndeleteChildren(@Body() dto: BulkRestoreChildrenDto, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.id || 'system';
    return this.checkinService.bulkUndeleteChildren(dto.childIds, actorUserId);
  }

  @Delete('children/:id/hard')
  @HttpCode(HttpStatus.OK)
  hardDeleteChild(@Param('id') id: string, @Req() req: any) {
    ensureLeader(req);
    const actorUserId = req.user?.id || 'system';
    return this.checkinService.hardDeleteChild(id, actorUserId);
  }

  @Post('initiate')
  initiateCheckin(
    @Body() initiateCheckinDto: InitiateCheckinDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.checkinService.initiateCheckin(initiateCheckinDto, user.id);
  }

  @Post('confirm')
  confirmCheckin(
    @Body() confirmCheckinDto: ConfirmCheckinDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.checkinService.confirmCheckin(confirmCheckinDto, user.id);
  }

  @Post('checkout/initiate')
  initiateCheckout(
    @Body() initiateCheckoutDto: InitiateCheckoutDto,
    @CurrentUser() user: { id: string }
  ) {
    return this.checkinService.initiateCheckout(initiateCheckoutDto, user.id);
  }

  @Get()
  getCheckins(
    @Query('status') status?: 'pending' | 'checked-in',
    @Query('eventId') eventId?: string
  ) {
    // Validate that only one parameter is provided to avoid ambiguous behavior
    if (status && eventId) {
      throw new BadRequestException(
        'Cannot specify both status and eventId parameters. Use status for filtering by check-in status, or eventId for getting all checkins for a specific event.'
      );
    }
    if (!status && !eventId) {
      throw new BadRequestException('Either status or eventId parameter must be provided.');
    }

    if (eventId) {
      return this.checkinService.getCheckinsByEventId(eventId);
    }
    return this.checkinService.getCheckins(status!);
  }

  @Post('checkout/confirm')
  confirmCheckout(@Body() confirmCheckoutDto: ConfirmCheckoutDto) {
    return this.checkinService.confirmCheckout(confirmCheckoutDto);
  }
}

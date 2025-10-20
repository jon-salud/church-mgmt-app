import { Controller, Post, Body, Patch, Param, Delete, Get, UseGuards, Query } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateChildDto } from './dto/create-child.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateChildDto } from './dto/update-child.dto';
import { InitiateCheckinDto } from './dto/initiate-checkin.dto';
import { ConfirmCheckinDto } from './dto/confirm-checkin.dto';
import { InitiateCheckoutDto } from './dto/initiate-checkout.dto';
import { ConfirmCheckoutDto } from './dto/confirm-checkout.dto';

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
  updateChild(@Param('id') id: string, @Body() updateChildDto: UpdateChildDto, @CurrentUser() user: { id: string }) {
    return this.checkinService.updateChild(id, updateChildDto, user.id);
  }

  @Delete('children/:id')
  deleteChild(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.checkinService.deleteChild(id, user.id);
  }

  @Get()
  getCheckins(@Query('eventId') eventId: string) {
    return this.checkinService.getCheckinsByEventId(eventId);
  }

  @Post('initiate')
  initiateCheckin(@Body() initiateCheckinDto: InitiateCheckinDto, @CurrentUser() user: { id: string }) {
    return this.checkinService.initiateCheckin(initiateCheckinDto, user.id);
  }

  @Post('confirm')
  confirmCheckin(@Body() confirmCheckinDto: ConfirmCheckinDto, @CurrentUser() user: { id: string }) {
    return this.checkinService.confirmCheckin(confirmCheckinDto, user.id);
  }

  @Post('checkout/initiate')
  initiateCheckout(@Body() initiateCheckoutDto: InitiateCheckoutDto, @CurrentUser() user: { id: string }) {
    return this.checkinService.initiateCheckout(initiateCheckoutDto, user.id);
  }

  @Post('checkout/confirm')
  confirmCheckout(@Body() confirmCheckoutDto: ConfirmCheckoutDto, @CurrentUser() user: { id: string }) {
    return this.checkinService.confirmCheckout(confirmCheckoutDto, user.id);
  }
}

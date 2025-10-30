import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../../types';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(readonly requestsService: RequestsService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto, @CurrentUser() user: User) {
    return this.requestsService.create(createRequestDto, user);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }
}

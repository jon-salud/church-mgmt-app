import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { DemoAuthGuard } from '../auth/demo-auth.guard';

@UseGuards(DemoAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query('q') q?: string) {
    return this.usersService.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.usersService.get(id);
  }
}

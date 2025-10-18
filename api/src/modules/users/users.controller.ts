import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  list(@Query('q') q?: string, @Req() req?: any) {
    return this.usersService.list(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.usersService.get(id);
  }
}

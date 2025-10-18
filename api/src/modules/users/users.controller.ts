import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(AuthGuard)
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

  @Post()
  create(@Body() dto: CreateUserDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.delete(id, req.user.id);
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required for user management');
    }
  }
}

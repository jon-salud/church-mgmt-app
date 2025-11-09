import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateThemeDto, ThemeResponseDto } from './dto/theme.dto';
import { BulkActionDto } from './dto/bulk-action.dto';
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';

@UseGuards(AuthGuard)
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiQuery({ name: 'q', required: false, description: 'Optional search query' })
  @ApiOkResponse(arrayOfObjectsResponse)
  list(@Query('q') q?: string) {
    return this.usersService.list(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse(objectResponse)
  get(@Param('id') id: string) {
    return this.usersService.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiCreatedResponse(objectResponse)
  create(@Body() dto: CreateUserDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.create(dto, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiOkResponse(objectResponse)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiOkResponse({ type: SuccessResponseDto })
  delete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.delete(id, req.user.id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a user (admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  hardDelete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.hardDelete(id, req.user.id);
  }

  @Post(':id/undelete')
  @ApiOperation({ summary: 'Restore a deleted user (admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  undelete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.undelete(id, req.user.id);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'List deleted users (admin only)' })
  @ApiQuery({ name: 'q', required: false, description: 'Optional search query' })
  @ApiOkResponse(arrayOfObjectsResponse)
  listDeleted(@Req() req: any, @Query('q') q?: string) {
    this.ensureAdmin(req);
    return this.usersService.listDeleted(q);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import members by sending invitations' })
  @ApiCreatedResponse(objectResponse)
  bulkImport(@Body() dto: { emails: string[] }, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.bulkImport(dto.emails, req.user.id);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on multiple members' })
  @ApiCreatedResponse(objectResponse)
  bulkAction(@Body() dto: BulkActionDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.bulkAction(dto, req.user.id);
  }

  @Get('me/theme')
  @ApiOperation({ summary: 'Get current user theme preferences' })
  @ApiResponse({
    status: 200,
    description: 'Theme preferences retrieved successfully',
    type: ThemeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyTheme(@Req() req: any): Promise<ThemeResponseDto> {
    const userId = req.user.id;
    return this.usersService.getUserTheme(userId);
  }

  @Patch('me/theme')
  @ApiOperation({ summary: 'Update current user theme preferences' })
  @ApiBody({ type: UpdateThemeDto })
  @ApiResponse({
    status: 200,
    description: 'Theme updated successfully',
    type: ThemeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid theme data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMyTheme(
    @Req() req: any,
    @Body() updateThemeDto: UpdateThemeDto
  ): Promise<ThemeResponseDto> {
    const userId = req.user.id;
    return this.usersService.updateUserTheme(userId, updateThemeDto);
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required for user management');
    }
  }
}

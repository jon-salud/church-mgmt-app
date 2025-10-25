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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';

@UseGuards(AuthGuard)
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk import members by sending invitations' })
  @ApiCreatedResponse(objectResponse)
  bulkImport(@Body() dto: { emails: string[] }, @Req() req: any) {
    this.ensureAdmin(req);
    return this.usersService.bulkImport(dto.emails, req.user.id);
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required for user management');
    }
  }
}

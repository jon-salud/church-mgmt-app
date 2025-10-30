import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';

@UseGuards(AuthGuard)
@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  rolesService: RolesService;

  constructor(rolesService: RolesService) {
    this.rolesService = rolesService;
  }

  @Get()
  @ApiOperation({ summary: 'List roles' })
  @ApiOkResponse(arrayOfObjectsResponse)
  list() {
    return this.rolesService.list();
  }

  @Post()
  @ApiOperation({ summary: 'Create a custom role' })
  @ApiCreatedResponse(objectResponse)
  create(@Body() dto: CreateRoleDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.rolesService.create(dto, req.user?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  @ApiOkResponse(objectResponse)
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.rolesService.update(id, dto, req.user?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiOkResponse(objectResponse)
  remove(@Param('id') id: string, @Body() dto: DeleteRoleDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.rolesService.delete(id, dto, req.user?.id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a role (admin only)' })
  @ApiOkResponse(objectResponse)
  hardDelete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.rolesService.hardDelete(id, req.user?.id);
  }

  @Post(':id/undelete')
  @ApiOperation({ summary: 'Restore a deleted role (admin only)' })
  @ApiOkResponse(objectResponse)
  undelete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.rolesService.undelete(id, req.user?.id);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'List deleted roles (admin only)' })
  @ApiOkResponse(arrayOfObjectsResponse)
  listDeleted(@Req() req: any) {
    this.ensureAdmin(req);
    return this.rolesService.listDeleted();
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ role?: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some(role => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin role required for role management');
    }
  }
}

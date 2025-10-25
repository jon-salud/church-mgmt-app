import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { InvitationsService } from './invitations.service';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Invitations')
@UseGuards(AuthGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly service: InvitationsService) {}

  @Post(':churchId')
  @ApiOperation({ summary: 'Create a new invitation' })
  @ApiOkResponse({ description: 'The created invitation' })
  createInvitation(
    @Param('churchId') churchId: string,
    @Body() body: { email: string; roleId?: string; type?: 'team' | 'member' },
    @CurrentUser() user: any
  ) {
    return this.service.createInvitation(churchId, body.email, body.roleId, user.id, body.type);
  }

  @Post(':churchId/bulk')
  @ApiOperation({ summary: 'Create multiple invitations' })
  @ApiOkResponse({ description: 'The created invitations' })
  bulkCreateInvitations(
    @Param('churchId') churchId: string,
    @Body() body: { emails: string[]; roleId?: string; type?: 'team' | 'member' },
    @CurrentUser() user: any
  ) {
    return this.service.bulkCreateInvitations(
      churchId,
      body.emails,
      body.roleId,
      user.id,
      body.type
    );
  }

  @Get(':churchId')
  @ApiOperation({ summary: 'List all invitations for a church' })
  @ApiOkResponse({ description: 'A list of invitations' })
  listInvitations(@Param('churchId') churchId: string) {
    return this.service.listInvitations(churchId);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept an invitation using token' })
  @ApiOkResponse({ description: 'Whether the invitation was accepted' })
  acceptInvitation(@Body() body: { token: string }, @CurrentUser() user: any) {
    return this.service.acceptInvitation(body.token, user.id);
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Get invitation details by token' })
  @ApiOkResponse({ description: 'The invitation details' })
  getInvitationByToken(@Param('token') token: string) {
    return this.service.getInvitationByToken(token);
  }
}

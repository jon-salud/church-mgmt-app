import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PastoralCareService } from './pastoral-care.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreatePastoralCareTicketDto } from './dto/create-pastoral-care-ticket.dto';
import { UpdatePastoralCareTicketDto } from './dto/update-pastoral-care-ticket.dto';
import { CreatePastoralCareCommentDto } from './dto/create-pastoral-care-comment.dto';
import { objectResponse, arrayOfObjectsResponse } from '../../common/openapi/schemas';

@UseGuards(AuthGuard)
@ApiTags('Pastoral Care')
@ApiBearerAuth()
@Controller('pastoral-care')
export class PastoralCareController {
  constructor(private readonly pastoralCareService: PastoralCareService) {}

  @Post('tickets')
  @ApiOperation({ summary: 'Create a pastoral care ticket' })
  @ApiCreatedResponse(objectResponse)
  createTicket(@Body() dto: CreatePastoralCareTicketDto, @Req() req: any) {
    return this.pastoralCareService.createTicket(dto, req.user?.id);
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update a pastoral care ticket' })
  @ApiOkResponse(objectResponse)
  updateTicket(@Param('id') id: string, @Body() dto: UpdatePastoralCareTicketDto, @Req() req: any) {
    return this.pastoralCareService.updateTicket(id, dto, req.user?.id);
  }

  @Post('tickets/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a pastoral care ticket' })
  @ApiCreatedResponse(objectResponse)
  createComment(@Param('id') id: string, @Body() dto: CreatePastoralCareCommentDto, @Req() req: any) {
    return this.pastoralCareService.createComment(id, dto, req.user?.id);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get a pastoral care ticket by ID' })
  @ApiOkResponse(objectResponse)
  getTicket(@Param('id') id: string) {
    return this.pastoralCareService.getTicket(id);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List all pastoral care tickets' })
  @ApiOkResponse(arrayOfObjectsResponse)
  listTickets() {
    return this.pastoralCareService.listTickets();
  }
}

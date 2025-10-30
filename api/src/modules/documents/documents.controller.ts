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
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';
import { SuccessResponseDto } from '../../common/dto/success-response.dto';

@UseGuards(AuthGuard)
@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(public documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List documents the user has permission to view' })
  @ApiOkResponse(arrayOfObjectsResponse)
  list(@Req() req: any) {
    return this.documentsService.list(req.user.id);
  }

  @Get('deleted')
  @ApiOperation({ summary: 'List deleted documents (admin only)' })
  @ApiOkResponse(arrayOfObjectsResponse)
  listDeleted(@Req() req: any) {
    this.ensureAdmin(req);
    return this.documentsService.listDeleted();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document detail' })
  @ApiOkResponse(objectResponse)
  getDetail(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.getDetail(id, req.user.id);
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get a time-limited download URL for a document' })
  @ApiOkResponse(objectResponse)
  getDownloadUrl(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.getDownloadUrl(id, req.user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a document' })
  @ApiProduces('application/octet-stream')
  async download(@Param('id') id: string, @Req() req: any, @Res() reply: FastifyReply) {
    const { fileName, data } = await this.documentsService.downloadFile(id, req.user.id);

    reply.header('Content-Type', 'application/octet-stream');
    reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
    reply.send(data);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a new document (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
          maxLength: 200,
        },
        description: {
          type: 'string',
          maxLength: 1000,
        },
        roleIds: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['file', 'title', 'roleIds'],
    },
  })
  @ApiCreatedResponse(objectResponse)
  async upload(@Req() req: any) {
    this.ensureAdmin(req);

    // Parse multipart form data
    const { file, fields } = await this.parseMultipartParts(req);
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Get the buffer from the file stream
    const buffer = await file.toBuffer();

    let roleIds: string[];
    if (Array.isArray(fields.roleIds)) {
      roleIds = fields.roleIds;
    } else {
      try {
        roleIds = JSON.parse(fields.roleIds || '[]');
      } catch {
        throw new BadRequestException('Malformed JSON in roleIds field');
      }
    }
    const dto: CreateDocumentDto = {
      title: fields.title,
      description: fields.description,
      roleIds,
    };

    return this.documentsService.create(
      {
        filename: file.filename,
        mimetype: file.mimetype,
        buffer,
      },
      dto,
      req.user.id
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata (Admin only)' })
  @ApiOkResponse(objectResponse)
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @Req() req: any) {
    this.ensureAdmin(req);
    return this.documentsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a document (Admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  delete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.documentsService.delete(id, req.user.id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Permanently delete a document (Admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  hardDelete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.documentsService.hardDelete(id, req.user.id);
  }

  @Post(':id/undelete')
  @ApiOperation({ summary: 'Restore a deleted document (Admin only)' })
  @ApiOkResponse({ type: SuccessResponseDto })
  undelete(@Param('id') id: string, @Req() req: any) {
    this.ensureAdmin(req);
    return this.documentsService.undelete(id, req.user.id);
  }

  private ensureAdmin(req: any) {
    const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
    const isAdmin = roles.some((role: { role: string }) => role.role === 'Admin');
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
  }

  /**
   * Parses all multipart parts, returning both the file (if any) and the fields.
   * Returns: { file, fields }
   */
  private async parseMultipartParts(
    req: any
  ): Promise<{ file?: any; fields: Record<string, string> }> {
    const fields: Record<string, string> = {};
    let file: any = undefined;

    for await (const part of req.parts()) {
      if (part.type === 'file' && !file) {
        file = part;
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value as string;
      }
    }

    return { file, fields };
  }
}

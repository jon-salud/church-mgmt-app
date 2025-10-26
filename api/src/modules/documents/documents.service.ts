import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DocumentsService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async list(userId: string) {
    const church = await this.db.getChurch();
    const user = await this.db.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userRoleIds = user.roles
      .filter((r: { churchId: string }) => r.churchId === church.id)
      .map((r: { roleId: string }) => r.roleId);

    return this.db.listDocuments(church.id, userRoleIds);
  }

  async getDetail(id: string, userId: string) {
    const church = await this.db.getChurch();
    const user = await this.db.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userRoleIds = user.roles
      .filter((r: { churchId: string }) => r.churchId === church.id)
      .map((r: { roleId: string }) => r.roleId);

    const doc = await this.db.getDocumentWithPermissions(id, userRoleIds);
    if (!doc) throw new NotFoundException('Document not found or access denied');

    return doc;
  }

  async create(
    file: {
      filename: string;
      mimetype: string;
      buffer: Buffer;
    },
    dto: CreateDocumentDto,
    userId: string
  ) {
    const church = await this.db.getChurch();
    const user = await this.db.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Validate file size (max 10MB for mock storage)
    if (file.buffer.length > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate roles exist
    for (const roleId of dto.roleIds) {
      const role = await this.db.getRole(roleId);
      if (!role || role.churchId !== church.id) {
        throw new BadRequestException(`Invalid role ID: ${roleId}`);
      }
    }

    // Convert file to base64
    const fileData = file.buffer.toString('base64');

    return this.db.createDocument(
      church.id,
      userId,
      file.filename,
      file.mimetype,
      dto.title,
      dto.description,
      fileData,
      dto.roleIds,
      userId
    );
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string) {
    const church = await this.db.getChurch();

    // Validate roles exist if provided
    if (dto.roleIds) {
      for (const roleId of dto.roleIds) {
        const role = await this.db.getRole(roleId);
        if (!role || role.churchId !== church.id) {
          throw new BadRequestException(`Invalid role ID: ${roleId}`);
        }
      }
    }

    const doc = await this.db.updateDocument(id, dto.title, dto.description, dto.roleIds, userId);
    if (!doc) throw new NotFoundException('Document not found');

    return doc;
  }

  async delete(id: string, userId: string) {
    const deleted = await this.db.deleteDocument(id, userId);
    if (!deleted) throw new NotFoundException('Document not found');

    return { success: true, message: 'Document archived' };
  }

  async hardDelete(id: string, userId: string) {
    const deleted = await this.db.hardDeleteDocument(id, userId);
    if (!deleted) throw new NotFoundException('Document not found');

    return { success: true, message: 'Document permanently deleted' };
  }

  async undelete(id: string, userId: string) {
    const restored = await this.db.undeleteDocument(id, userId);
    if (!restored) throw new NotFoundException('Document not found or not deleted');

    return { success: true, message: 'Document restored' };
  }

  async listDeleted() {
    const church = await this.db.getChurch();
    return this.db.listDeletedDocuments(church.id);
  }

  async getDownloadUrl(id: string, userId: string): Promise<{ url: string; expiresAt: string }> {
    const church = await this.db.getChurch();
    const user = await this.db.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userRoleIds = user.roles
      .filter((r: { churchId: string }) => r.churchId === church.id)
      .map((r: { roleId: string }) => r.roleId);

    const doc = await this.db.getDocumentWithPermissions(id, userRoleIds);
    if (!doc) throw new NotFoundException('Document not found or access denied');

    // Generate a time-limited token (valid for 1 hour)
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // In a real implementation, we would store this token and validate it
    // For mock, we'll just return a URL with the token
    const url = `/api/v1/documents/${id}/download?token=${token}`;

    return { url, expiresAt };
  }

  async downloadFile(id: string, userId: string): Promise<{ fileName: string; data: Buffer }> {
    const church = await this.db.getChurch();
    const user = await this.db.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userRoleIds = user.roles
      .filter((r: { churchId: string }) => r.churchId === church.id)
      .map((r: { roleId: string }) => r.roleId);

    const doc = await this.db.getDocumentWithPermissions(id, userRoleIds);
    if (!doc) throw new NotFoundException('Document not found or access denied');

    // Decode base64 to buffer
    const data = Buffer.from(doc.fileData, 'base64');

    return {
      fileName: doc.fileName,
      data,
    };
  }
}

import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import {
  DOCUMENTS_REPOSITORY,
  IDocumentsRepository,
  DocumentWithPermissions,
} from './documents.repository.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { randomUUID } from 'node:crypto';
import { MAX_FILE_SIZE_BYTES } from '../../common/constants';
import { DocumentId } from '../../domain/value-objects/DocumentId';
import { ChurchId } from '../../domain/value-objects/ChurchId';
import { UserId } from '../../domain/value-objects/UserId';
import { Document } from '../../domain/entities/Document';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject(DOCUMENTS_REPOSITORY) private readonly documentsRepository: IDocumentsRepository,
    @Inject(DATA_STORE) private readonly db: DataStore
  ) {}

  async list(userId: string) {
    const church = await this.db.getChurch();
    const user = await this.db.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userRoleIds = user.roles
      .filter((r: { churchId: string }) => r.churchId === church.id)
      .map((r: { roleId: string }) => r.roleId);

    const documents = await this.documentsRepository.listDocuments(
      ChurchId.create(church.id),
      userRoleIds
    );
    return documents.map(doc => this.toDocumentResponse(doc));
  }

  async getDetail(id: string, userId: string) {
    const church = await this.db.getChurch();
    const user = await this.db.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userRoleIds = user.roles
      .filter((r: { churchId: string }) => r.churchId === church.id)
      .map((r: { roleId: string }) => r.roleId);

    const doc = await this.documentsRepository.getDocumentWithPermissions(
      DocumentId.create(id),
      userRoleIds
    );
    if (!doc) throw new NotFoundException('Document not found or access denied');

    return this.toDocumentWithPermissionsResponse(doc);
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
    if (file.buffer.length > MAX_FILE_SIZE_BYTES) {
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

    return this.documentsRepository
      .createDocument(
        ChurchId.create(church.id),
        UserId.create(userId),
        file.filename,
        file.mimetype,
        dto.title,
        dto.description,
        fileData,
        dto.roleIds,
        UserId.create(userId)
      )
      .then(doc => this.toDocumentResponse(doc));
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

    const doc = await this.documentsRepository.updateDocument(
      DocumentId.create(id),
      dto.title,
      dto.description,
      dto.roleIds,
      UserId.create(userId)
    );
    if (!doc) throw new NotFoundException('Document not found');

    return this.toDocumentResponse(doc);
  }

  async delete(id: string, userId: string) {
    const deleted = await this.documentsRepository.deleteDocument(
      DocumentId.create(id),
      UserId.create(userId)
    );
    if (!deleted) throw new NotFoundException('Document not found');

    return { success: true, message: 'Document archived' };
  }

  async hardDelete(id: string, userId: string) {
    const deleted = await this.documentsRepository.hardDeleteDocument(
      DocumentId.create(id),
      UserId.create(userId)
    );
    if (!deleted) throw new NotFoundException('Document not found');

    return { success: true, message: 'Document permanently deleted' };
  }

  async undelete(id: string, userId: string) {
    const restored = await this.documentsRepository.undeleteDocument(
      DocumentId.create(id),
      UserId.create(userId)
    );
    if (!restored) throw new NotFoundException('Document not found or not deleted');

    return { success: true, message: 'Document restored' };
  }

  async listDeleted() {
    const church = await this.db.getChurch();
    const documents = await this.documentsRepository.listDeletedDocuments(
      ChurchId.create(church.id)
    );
    return documents.map(doc => this.toDocumentResponse(doc));
  }

  async getDownloadUrl(id: string, userId: string): Promise<{ url: string; expiresAt: string }> {
    const church = await this.db.getChurch();
    const user = await this.db.getUserById(userId);
    if (!user) throw new NotFoundException('User not found');

    const userRoleIds = user.roles
      .filter((r: { churchId: string }) => r.churchId === church.id)
      .map((r: { roleId: string }) => r.roleId);

    const doc = await this.documentsRepository.getDocumentWithPermissions(
      DocumentId.create(id),
      userRoleIds
    );
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

    const doc = await this.documentsRepository.getDocumentWithPermissions(
      DocumentId.create(id),
      userRoleIds
    );
    if (!doc) throw new NotFoundException('Document not found or access denied');

    // Decode base64 to buffer
    const data = Buffer.from(doc.fileData, 'base64');

    return {
      fileName: doc.fileName,
      data,
    };
  }

  private toDocumentResponse(doc: Document) {
    return {
      id: doc.id.value,
      churchId: doc.churchId.value,
      uploaderProfileId: doc.uploaderProfileId.value,
      fileName: doc.fileName,
      fileType: doc.fileType,
      title: doc.title,
      description: doc.description,
      storageKey: doc.storageKey,
      fileData: doc.fileData,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      deletedAt: doc.deletedAt?.toISOString(),
    };
  }

  private toDocumentWithPermissionsResponse(doc: DocumentWithPermissions) {
    return {
      id: doc.id.value,
      churchId: doc.churchId.value,
      uploaderProfileId: doc.uploaderProfileId.value,
      fileName: doc.fileName,
      fileType: doc.fileType,
      title: doc.title,
      description: doc.description,
      storageKey: doc.storageKey,
      fileData: doc.fileData,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      deletedAt: doc.deletedAt?.toISOString(),
      permissions: doc.permissions,
    };
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IDocumentsRepository, DocumentWithPermissions } from './documents.repository.interface';
import { Document } from '../../domain/entities/Document';
import { DocumentId } from '../../domain/value-objects/DocumentId';
import { ChurchId } from '../../domain/value-objects/ChurchId';
import { UserId } from '../../domain/value-objects/UserId';

@Injectable()
export class DocumentsDataStoreRepository implements IDocumentsRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listDocuments(churchId: ChurchId, userRoleIds: string[]): Promise<Document[]> {
    const documents = await this.db.listDocuments(churchId.value, userRoleIds);
    return documents.map(doc => this.mapToDocument(doc));
  }

  async getDocument(id: DocumentId): Promise<Document | undefined> {
    const doc = await this.db.getDocument(id.value);
    return doc ? this.mapToDocument(doc) : undefined;
  }

  async getDocumentWithPermissions(
    id: DocumentId,
    userRoleIds: string[]
  ): Promise<DocumentWithPermissions | undefined> {
    const doc = await this.db.getDocumentWithPermissions(id.value, userRoleIds);
    return doc
      ? {
          id: DocumentId.create(doc.id),
          churchId: ChurchId.create(doc.churchId),
          uploaderProfileId: UserId.create(doc.uploaderProfileId),
          fileName: doc.fileName,
          fileType: doc.fileType,
          title: doc.title,
          description: doc.description,
          storageKey: doc.storageKey,
          fileData: doc.fileData,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          deletedAt: doc.deletedAt ? new Date(doc.deletedAt) : undefined,
          permissions: doc.permissions,
        }
      : undefined;
  }

  async createDocument(
    churchId: ChurchId,
    uploaderProfileId: UserId,
    fileName: string,
    fileType: string,
    title: string,
    description: string | undefined,
    fileData: string,
    roleIds: string[],
    actorUserId: UserId
  ): Promise<Document> {
    const doc = await this.db.createDocument(
      churchId.value,
      uploaderProfileId.value,
      fileName,
      fileType,
      title,
      description,
      fileData,
      roleIds,
      actorUserId.value
    );
    return this.mapToDocument(doc);
  }

  async updateDocument(
    id: DocumentId,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    actorUserId: UserId
  ): Promise<Document | undefined> {
    const doc = await this.db.updateDocument(
      id.value,
      title,
      description,
      roleIds,
      actorUserId.value
    );
    return doc ? this.mapToDocument(doc) : undefined;
  }

  async deleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean> {
    return this.db.deleteDocument(id.value, actorUserId.value);
  }

  async hardDeleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean> {
    return this.db.hardDeleteDocument(id.value, actorUserId.value);
  }

  async undeleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean> {
    return this.db.undeleteDocument(id.value, actorUserId.value);
  }

  async listDeletedDocuments(churchId: ChurchId): Promise<Document[]> {
    const documents = await this.db.listDeletedDocuments(churchId.value);
    return documents.map(doc => this.mapToDocument(doc));
  }

  private mapToDocument(doc: any): Document {
    return Document.reconstruct({
      id: DocumentId.create(doc.id),
      churchId: ChurchId.create(doc.churchId),
      uploaderProfileId: UserId.create(doc.uploaderProfileId),
      fileName: doc.fileName,
      fileType: doc.fileType,
      title: doc.title,
      description: doc.description,
      storageKey: doc.storageKey,
      fileData: doc.fileData,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
      deletedAt: doc.deletedAt ? new Date(doc.deletedAt) : undefined,
    });
  }
}

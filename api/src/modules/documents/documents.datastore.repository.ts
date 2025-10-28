import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IDocumentsRepository, Document } from './documents.repository.interface';

@Injectable()
export class DocumentsDataStoreRepository implements IDocumentsRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listDocuments(churchId: string, userRoleIds: string[]): Promise<Document[]> {
    return this.db.listDocuments(churchId, userRoleIds);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.db.getDocument(id);
  }

  async getDocumentWithPermissions(
    id: string,
    userRoleIds: string[]
  ): Promise<(Document & { permissions: string[] }) | undefined> {
    return this.db.getDocumentWithPermissions(id, userRoleIds);
  }

  async createDocument(
    churchId: string,
    uploaderProfileId: string,
    fileName: string,
    fileType: string,
    title: string,
    description: string | undefined,
    fileData: string,
    roleIds: string[],
    actorUserId: string
  ): Promise<Document> {
    return this.db.createDocument(
      churchId,
      uploaderProfileId,
      fileName,
      fileType,
      title,
      description,
      fileData,
      roleIds,
      actorUserId
    );
  }

  async updateDocument(
    id: string,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    actorUserId: string
  ): Promise<Document | undefined> {
    return this.db.updateDocument(id, title, description, roleIds, actorUserId);
  }

  async deleteDocument(id: string, actorUserId: string): Promise<boolean> {
    return this.db.deleteDocument(id, actorUserId);
  }

  async hardDeleteDocument(id: string, actorUserId: string): Promise<boolean> {
    return this.db.hardDeleteDocument(id, actorUserId);
  }

  async undeleteDocument(id: string, actorUserId: string): Promise<boolean> {
    return this.db.undeleteDocument(id, actorUserId);
  }

  async listDeletedDocuments(churchId: string): Promise<Document[]> {
    return this.db.listDeletedDocuments(churchId);
  }
}

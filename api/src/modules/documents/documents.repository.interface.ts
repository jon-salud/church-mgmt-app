import { Document } from '../../domain/entities/Document';
import { DocumentId } from '../../domain/value-objects/DocumentId';
import { ChurchId } from '../../domain/value-objects/ChurchId';
import { UserId } from '../../domain/value-objects/UserId';

export interface DocumentWithPermissions {
  id: DocumentId;
  churchId: ChurchId;
  uploaderProfileId: UserId;
  fileName: string;
  fileType: string;
  title: string;
  description?: string;
  storageKey: string;
  fileData: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  permissions: string[];
}

export const DOCUMENTS_REPOSITORY = Symbol('DOCUMENTS_REPOSITORY');

export interface IDocumentsRepository {
  listDocuments(churchId: ChurchId, userRoleIds: string[]): Promise<Document[]>;
  getDocument(id: DocumentId): Promise<Document | undefined>;
  getDocumentWithPermissions(
    id: DocumentId,
    userRoleIds: string[]
  ): Promise<DocumentWithPermissions | undefined>;
  createDocument(
    churchId: ChurchId,
    uploaderProfileId: UserId,
    fileName: string,
    fileType: string,
    title: string,
    description: string | undefined,
    fileData: string,
    roleIds: string[],
    actorUserId: UserId
  ): Promise<Document>;
  updateDocument(
    id: DocumentId,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    actorUserId: UserId
  ): Promise<Document | undefined>;
  deleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean>;
  hardDeleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean>;
  undeleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean>;
  listDeletedDocuments(churchId: ChurchId): Promise<Document[]>;
}

export interface Document {
  id: string;
  churchId: string;
  uploaderProfileId: string;
  fileName: string;
  fileType: string;
  title: string;
  description?: string;
  storageKey: string;
  fileData: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const DOCUMENTS_REPOSITORY = Symbol('DOCUMENTS_REPOSITORY');

export interface IDocumentsRepository {
  listDocuments(churchId: string, userRoleIds: string[]): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentWithPermissions(
    id: string,
    userRoleIds: string[]
  ): Promise<(Document & { permissions: string[] }) | undefined>;
  createDocument(
    churchId: string,
    uploaderProfileId: string,
    fileName: string,
    fileType: string,
    title: string,
    description: string | undefined,
    fileData: string,
    roleIds: string[],
    actorUserId: string
  ): Promise<Document>;
  updateDocument(
    id: string,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    actorUserId: string
  ): Promise<Document | undefined>;
  deleteDocument(id: string, actorUserId: string): Promise<boolean>;
  hardDeleteDocument(id: string, actorUserId: string): Promise<boolean>;
  undeleteDocument(id: string, actorUserId: string): Promise<boolean>;
  listDeletedDocuments(churchId: string): Promise<Document[]>;
}

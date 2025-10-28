import { MockDocument } from '../../mock/mock-data';

export const DOCUMENTS_REPOSITORY = Symbol('DOCUMENTS_REPOSITORY');

export interface IDocumentsRepository {
  listDocuments(churchId: string, userRoleIds: string[]): Promise<MockDocument[]>;
  getDocument(id: string): Promise<MockDocument | undefined>;
  getDocumentWithPermissions(
    id: string,
    userRoleIds: string[]
  ): Promise<(MockDocument & { permissions: string[] }) | undefined>;
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
  ): Promise<MockDocument>;
  updateDocument(
    id: string,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    actorUserId: string
  ): Promise<MockDocument | undefined>;
  deleteDocument(id: string, actorUserId: string): Promise<boolean>;
  hardDeleteDocument(id: string, actorUserId: string): Promise<boolean>;
  undeleteDocument(id: string, actorUserId: string): Promise<boolean>;
  listDeletedDocuments(churchId: string): Promise<MockDocument[]>;
}

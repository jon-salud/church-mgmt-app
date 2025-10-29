import { DocumentsService } from '../../src/modules/documents/documents.service';
import { IDocumentsRepository } from '../../src/modules/documents/documents.repository.interface';
import { DataStore } from '../../src/datastore';
import { createDataStoreMock } from '../support/datastore.mock';
import { MockDocument, MockChurch, MockUser } from '../../src/mock/mock-data';
import { Document } from '../../src/domain/entities/Document';
import { DocumentId } from '../../src/domain/value-objects/DocumentId';
import { ChurchId } from '../../src/domain/value-objects/ChurchId';
import { UserId } from '../../src/domain/value-objects/UserId';

const createDocumentsRepositoryMock = (): jest.Mocked<IDocumentsRepository> => ({
  listDocuments: jest.fn().mockResolvedValue([]),
  getDocument: jest.fn().mockResolvedValue(undefined),
  getDocumentWithPermissions: jest.fn().mockResolvedValue(undefined),
  createDocument: jest.fn().mockResolvedValue({} as MockDocument),
  updateDocument: jest.fn().mockResolvedValue(undefined),
  deleteDocument: jest.fn().mockResolvedValue(false),
  hardDeleteDocument: jest.fn().mockResolvedValue(false),
  undeleteDocument: jest.fn().mockResolvedValue(false),
  listDeletedDocuments: jest.fn().mockResolvedValue([]),
});

describe('DocumentsService', () => {
  let repo: jest.Mocked<IDocumentsRepository>;
  let store: jest.Mocked<DataStore>;
  let service: DocumentsService;

  beforeEach(() => {
    repo = createDocumentsRepositoryMock();
    store = createDataStoreMock();
    service = new DocumentsService(repo, store);
  });

  it('lists documents with role filtering', async () => {
    const mockChurch: MockChurch = { id: 'church-1', name: 'Test Church', timezone: 'UTC' };
    const mockUser: MockUser = {
      id: 'user-1',
      primaryEmail: 'test@example.com',
      status: 'active',
      createdAt: '2024-01-01',
      roles: [{ churchId: 'church-1', roleId: 'role-1' }],
      profile: {
        firstName: 'Test',
        lastName: 'User',
        householdId: 'hh-1',
        householdRole: 'Head',
      },
    };
    const mockDoc = Document.reconstruct({
      id: DocumentId.create('doc-1'),
      churchId: ChurchId.create('church-1'),
      uploaderProfileId: UserId.create('user-1'),
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Doc',
      description: 'Test description',
      storageKey: 'key',
      fileData: 'data',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.getChurch.mockResolvedValue(mockChurch);
    store.getUserById.mockResolvedValue(mockUser);
    repo.listDocuments.mockResolvedValue([mockDoc]);

    const result = await service.list('user-1');

    expect(store.getChurch).toHaveBeenCalled();
    expect(store.getUserById).toHaveBeenCalledWith('user-1');
    expect(repo.listDocuments).toHaveBeenCalledWith(ChurchId.create('church-1'), ['role-1']);
    expect(result).toEqual([
      {
        id: 'doc-1',
        churchId: 'church-1',
        uploaderProfileId: 'user-1',
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        title: 'Test Doc',
        description: 'Test description',
        storageKey: 'key',
        fileData: 'data',
        createdAt: mockDoc.createdAt.toISOString(),
        updatedAt: mockDoc.updatedAt.toISOString(),
        deletedAt: undefined,
      },
    ]);
  });

  it('throws error if user not found in list', async () => {
    store.getChurch.mockResolvedValue({ id: 'church-1' } as any);
    store.getUserById.mockResolvedValue(null);

    await expect(service.list('user-1')).rejects.toThrow('User not found');
  });

  it('gets document detail with permissions', async () => {
    const mockChurch = { id: 'church-1' };
    const mockUser = { id: 'user-1', roles: [{ churchId: 'church-1', roleId: 'role-1' }] };
    const mockDoc = {
      id: DocumentId.create('doc-1'),
      churchId: ChurchId.create('church-1'),
      uploaderProfileId: UserId.create('user-1'),
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Doc',
      description: 'Test description',
      storageKey: 'key',
      fileData: 'data',
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: ['role-1'],
    };
    store.getChurch.mockResolvedValue(mockChurch as any);
    store.getUserById.mockResolvedValue(mockUser as any);
    repo.getDocumentWithPermissions.mockResolvedValue(mockDoc as any);

    const result = await service.getDetail('doc-1', 'user-1');

    expect(store.getChurch).toHaveBeenCalled();
    expect(store.getUserById).toHaveBeenCalledWith('user-1');
    expect(repo.getDocumentWithPermissions).toHaveBeenCalledWith(DocumentId.create('doc-1'), [
      'role-1',
    ]);
    expect(result).toEqual({
      id: 'doc-1',
      churchId: 'church-1',
      uploaderProfileId: 'user-1',
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Doc',
      description: 'Test description',
      storageKey: 'key',
      fileData: 'data',
      createdAt: mockDoc.createdAt.toISOString(),
      updatedAt: mockDoc.updatedAt.toISOString(),
      deletedAt: undefined,
      permissions: ['role-1'],
    });
  });

  it('throws error if document not found in getDetail', async () => {
    const mockChurch = { id: 'church-1' };
    const mockUser = { id: 'user-1', roles: [{ churchId: 'church-1', roleId: 'role-1' }] };
    store.getChurch.mockResolvedValue(mockChurch as any);
    store.getUserById.mockResolvedValue(mockUser as any);
    repo.getDocumentWithPermissions.mockResolvedValue(undefined);

    await expect(service.getDetail('doc-1', 'user-1')).rejects.toThrow(
      'Document not found or access denied'
    );
  });

  it('creates document with validation', async () => {
    const mockChurch = { id: 'church-1' };
    const mockUser = { id: 'user-1' };
    const mockRole = { id: 'role-1', churchId: 'church-1' };
    const file = { filename: 'test.pdf', mimetype: 'application/pdf', buffer: Buffer.from('test') };
    const dto = { title: 'Test Doc', description: 'Desc', roleIds: ['role-1'] };
    const mockDoc = Document.reconstruct({
      id: DocumentId.create('doc-1'),
      churchId: ChurchId.create('church-1'),
      uploaderProfileId: UserId.create('user-1'),
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Doc',
      description: 'Desc',
      storageKey: 'key',
      fileData: 'dGVzdA==', // base64 of 'test'
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.getChurch.mockResolvedValue(mockChurch as any);
    store.getUserById.mockResolvedValue(mockUser as any);
    store.getRole.mockResolvedValue(mockRole as any);
    repo.createDocument.mockResolvedValue(mockDoc);

    const result = await service.create(file, dto, 'user-1');

    expect(store.getChurch).toHaveBeenCalled();
    expect(store.getUserById).toHaveBeenCalledWith('user-1');
    expect(store.getRole).toHaveBeenCalledWith('role-1');
    expect(repo.createDocument).toHaveBeenCalledWith(
      ChurchId.create('church-1'),
      UserId.create('user-1'),
      'test.pdf',
      'application/pdf',
      'Test Doc',
      'Desc',
      expect.any(String), // base64 data
      ['role-1'],
      UserId.create('user-1')
    );
    expect(result).toEqual({
      id: 'doc-1',
      churchId: 'church-1',
      uploaderProfileId: 'user-1',
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Doc',
      description: 'Desc',
      storageKey: 'key',
      fileData: 'dGVzdA==',
      createdAt: mockDoc.createdAt.toISOString(),
      updatedAt: mockDoc.updatedAt.toISOString(),
      deletedAt: undefined,
    });
  });

  it('throws error if file too large', async () => {
    const mockChurch: MockChurch = { id: 'church-1', name: 'Test Church', timezone: 'UTC' };
    const mockUser: MockUser = {
      id: 'user-1',
      primaryEmail: 'test@example.com',
      status: 'active',
      createdAt: '2024-01-01',
      roles: [{ churchId: 'church-1', roleId: 'role-1' }],
      profile: {
        firstName: 'Test',
        lastName: 'User',
        householdId: 'hh-1',
        householdRole: 'Head',
      },
    };
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const file = { filename: 'large.pdf', mimetype: 'application/pdf', buffer: largeBuffer };
    const dto = { title: 'Large Doc', description: 'Desc', roleIds: [] };
    store.getChurch.mockResolvedValue(mockChurch);
    store.getUserById.mockResolvedValue(mockUser);

    await expect(service.create(file, dto, 'user-1')).rejects.toThrow(
      'File size exceeds 10MB limit'
    );
  });

  it('throws error if invalid role in create', async () => {
    const mockChurch = { id: 'church-1' };
    const mockUser = { id: 'user-1' };
    store.getChurch.mockResolvedValue(mockChurch as any);
    store.getUserById.mockResolvedValue(mockUser as any);
    store.getRole.mockResolvedValue(undefined); // invalid role

    const file = { filename: 'test.pdf', mimetype: 'application/pdf', buffer: Buffer.from('test') };
    const dto = { title: 'Test Doc', description: 'Desc', roleIds: ['invalid-role'] };

    await expect(service.create(file, dto, 'user-1')).rejects.toThrow(
      'Invalid role ID: invalid-role'
    );
  });

  it('updates document with validation', async () => {
    const mockChurch = { id: 'church-1' };
    const mockRole = { id: 'role-1', churchId: 'church-1' };
    const dto = { title: 'Updated Title', roleIds: ['role-1'] };
    const mockDoc = Document.reconstruct({
      id: DocumentId.create('doc-1'),
      churchId: ChurchId.create('church-1'),
      uploaderProfileId: UserId.create('user-1'),
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Updated Title',
      description: 'Description',
      storageKey: 'key',
      fileData: 'data',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.getChurch.mockResolvedValue(mockChurch as any);
    store.getRole.mockResolvedValue(mockRole as any);
    repo.updateDocument.mockResolvedValue(mockDoc);

    const result = await service.update('doc-1', dto, 'user-1');

    expect(store.getChurch).toHaveBeenCalled();
    expect(store.getRole).toHaveBeenCalledWith('role-1');
    expect(repo.updateDocument).toHaveBeenCalledWith(
      DocumentId.create('doc-1'),
      'Updated Title',
      undefined,
      ['role-1'],
      UserId.create('user-1')
    );
    expect(result).toEqual({
      id: 'doc-1',
      churchId: 'church-1',
      uploaderProfileId: 'user-1',
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Updated Title',
      description: 'Description',
      storageKey: 'key',
      fileData: 'data',
      createdAt: mockDoc.createdAt.toISOString(),
      updatedAt: mockDoc.updatedAt.toISOString(),
      deletedAt: undefined,
    });
  });

  it('throws error if document not found in update', async () => {
    const mockChurch = { id: 'church-1' };
    store.getChurch.mockResolvedValue(mockChurch as any);
    repo.updateDocument.mockResolvedValue(undefined);

    await expect(service.update('doc-1', { title: 'New Title' }, 'user-1')).rejects.toThrow(
      'Document not found'
    );
  });

  it('deletes document', async () => {
    repo.deleteDocument.mockResolvedValue(true);

    const result = await service.delete('doc-1', 'user-1');

    expect(repo.deleteDocument).toHaveBeenCalledWith(
      DocumentId.create('doc-1'),
      UserId.create('user-1')
    );
    expect(result).toEqual({ success: true, message: 'Document archived' });
  });

  it('throws error if document not found in delete', async () => {
    repo.deleteDocument.mockResolvedValue(false);

    await expect(service.delete('doc-1', 'user-1')).rejects.toThrow('Document not found');
  });

  it('hard deletes document', async () => {
    repo.hardDeleteDocument.mockResolvedValue(true);

    const result = await service.hardDelete('doc-1', 'user-1');

    expect(repo.hardDeleteDocument).toHaveBeenCalledWith(
      DocumentId.create('doc-1'),
      UserId.create('user-1')
    );
    expect(result).toEqual({ success: true, message: 'Document permanently deleted' });
  });

  it('undeletes document', async () => {
    repo.undeleteDocument.mockResolvedValue(true);

    const result = await service.undelete('doc-1', 'user-1');

    expect(repo.undeleteDocument).toHaveBeenCalledWith(
      DocumentId.create('doc-1'),
      UserId.create('user-1')
    );
    expect(result).toEqual({ success: true, message: 'Document restored' });
  });

  it('lists deleted documents', async () => {
    const mockChurch = { id: 'church-1' };
    const mockDoc = Document.reconstruct({
      id: DocumentId.create('doc-1'),
      churchId: ChurchId.create('church-1'),
      uploaderProfileId: UserId.create('user-1'),
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Doc',
      description: 'Description',
      storageKey: 'key',
      fileData: 'data',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.getChurch.mockResolvedValue(mockChurch as any);
    repo.listDeletedDocuments.mockResolvedValue([mockDoc]);

    const result = await service.listDeleted();

    expect(store.getChurch).toHaveBeenCalled();
    expect(repo.listDeletedDocuments).toHaveBeenCalledWith(ChurchId.create('church-1'));
    expect(result).toEqual([
      {
        id: 'doc-1',
        churchId: 'church-1',
        uploaderProfileId: 'user-1',
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        title: 'Test Doc',
        description: 'Description',
        storageKey: 'key',
        fileData: 'data',
        createdAt: mockDoc.createdAt.toISOString(),
        updatedAt: mockDoc.updatedAt.toISOString(),
        deletedAt: undefined,
      },
    ]);
  });

  it('gets download url with permissions', async () => {
    const mockChurch = { id: 'church-1' };
    const mockUser = { id: 'user-1', roles: [{ churchId: 'church-1', roleId: 'role-1' }] };
    const mockDoc = Document.reconstruct({
      id: DocumentId.create('doc-1'),
      churchId: ChurchId.create('church-1'),
      uploaderProfileId: UserId.create('user-1'),
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Doc',
      description: 'Test description',
      storageKey: 'key',
      fileData: 'base64data',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.getChurch.mockResolvedValue(mockChurch as any);
    store.getUserById.mockResolvedValue(mockUser as any);
    repo.getDocumentWithPermissions.mockResolvedValue({
      ...mockDoc,
      permissions: ['role-1'],
    } as any);

    const result = await service.getDownloadUrl('doc-1', 'user-1');

    expect(repo.getDocumentWithPermissions).toHaveBeenCalledWith(DocumentId.create('doc-1'), [
      'role-1',
    ]);
    expect(result.url).toMatch(/\/api\/v1\/documents\/doc-1\/download\?token=.+/);
    expect(result.expiresAt).toBeDefined();
  });

  it('downloads file with permissions', async () => {
    const mockChurch = { id: 'church-1' };
    const mockUser = { id: 'user-1', roles: [{ churchId: 'church-1', roleId: 'role-1' }] };
    const mockDoc = Document.reconstruct({
      id: DocumentId.create('doc-1'),
      churchId: ChurchId.create('church-1'),
      uploaderProfileId: UserId.create('user-1'),
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Doc',
      description: 'Test description',
      storageKey: 'key',
      fileData: Buffer.from('test').toString('base64'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    store.getChurch.mockResolvedValue(mockChurch as any);
    store.getUserById.mockResolvedValue(mockUser as any);
    repo.getDocumentWithPermissions.mockResolvedValue({
      ...mockDoc,
      permissions: ['role-1'],
    } as any);

    const result = await service.downloadFile('doc-1', 'user-1');

    expect(repo.getDocumentWithPermissions).toHaveBeenCalledWith(DocumentId.create('doc-1'), [
      'role-1',
    ]);
    expect(result.fileName).toBe('test.pdf');
    expect(result.data).toEqual(Buffer.from('test'));
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from '../../src/modules/documents/documents.service';
import {
  DOCUMENTS_REPOSITORY,
  IDocumentsRepository,
} from '../../src/modules/documents/documents.repository.interface';
import { DATA_STORE } from '../../src/datastore';
import { DocumentId } from '../../src/domain/value-objects/DocumentId';
import { ChurchId } from '../../src/domain/value-objects/ChurchId';
import { UserId } from '../../src/domain/value-objects/UserId';
import { Document } from '../../src/domain/entities/Document';
import { TestDatabase } from '../support';

describe('DocumentsService (Integration)', () => {
  let service: DocumentsService;
  let db: any;

  beforeEach(async () => {
    // Create a fresh in-memory database for each test
    db = TestDatabase.createFresh();

    // Create the repository implementation using the in-memory store
    class MockDocumentsRepository implements IDocumentsRepository {
      async listDocuments(churchId: ChurchId, userRoleIds: string[]): Promise<Document[]> {
        const mockDocuments: {
          id: string;
          churchId: string;
          uploaderProfileId: string;
          fileName: string;
          fileType: string;
          title: string;
          description?: string;
          storageKey: string;
          fileData: string;
          createdAt: Date;
          updatedAt: Date;
        }[] = await db.listDocuments();
        return mockDocuments
          .filter(doc => doc.churchId === churchId.value)
          .map(mockDoc => this.toDomainDocument(mockDoc));
      }

      async getDocument(id: DocumentId): Promise<Document | undefined> {
        const mockDoc = await db.getDocumentById(id.value);
        return mockDoc ? this.toDomainDocument(mockDoc) : undefined;
      }

      async getDocumentWithPermissions(
        id: DocumentId,
        userRoleIds: string[]
      ): Promise<any | undefined> {
        const mockDoc = await db.getDocumentById(id.value);
        if (!mockDoc) return undefined;

        return {
          ...this.toDomainDocument(mockDoc),
          permissions: ['read', 'write'], // Mock permissions
        };
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
        const mockDoc = {
          id: 'doc-' + Date.now(),
          churchId: churchId.value,
          uploaderProfileId: uploaderProfileId.value,
          fileName,
          fileType,
          title,
          description,
          storageKey: `storage/${fileName}`,
          fileData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.createDocument(mockDoc);
        return this.toDomainDocument(mockDoc);
      }

      async updateDocument(
        id: DocumentId,
        title: string | undefined,
        description: string | undefined,
        roleIds: string[] | undefined,
        actorUserId: UserId
      ): Promise<Document | undefined> {
        const mockDoc = await db.getDocumentById(id.value);
        if (!mockDoc) return undefined;

        const updatedMockDoc = {
          ...mockDoc,
          title: title || mockDoc.title,
          description: description || mockDoc.description,
          updatedAt: new Date(),
        };
        await db.updateDocument(id.value, updatedMockDoc);
        return this.toDomainDocument(updatedMockDoc);
      }

      async deleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean> {
        // Mock soft delete - just mark as deleted
        return true;
      }

      async hardDeleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean> {
        return (await db.deleteDocument(id.value)).success;
      }

      async undeleteDocument(id: DocumentId, actorUserId: UserId): Promise<boolean> {
        // Mock undelete
        return true;
      }

      async listDeletedDocuments(churchId: ChurchId): Promise<Document[]> {
        // Mock - return empty array
        return [];
      }

      private toDomainDocument(mockDoc: {
        id: string;
        churchId: string;
        uploaderProfileId: string;
        fileName: string;
        fileType: string;
        title: string;
        description?: string;
        storageKey: string;
        fileData: string;
        createdAt: Date;
        updatedAt: Date;
      }): Document {
        return Document.reconstruct({
          id: DocumentId.create(mockDoc.id),
          churchId: ChurchId.create(mockDoc.churchId),
          uploaderProfileId: UserId.create(mockDoc.uploaderProfileId),
          fileName: mockDoc.fileName,
          fileType: mockDoc.fileType,
          title: mockDoc.title,
          description: mockDoc.description || '',
          storageKey: mockDoc.storageKey,
          fileData: mockDoc.fileData,
          createdAt: mockDoc.createdAt,
          updatedAt: mockDoc.updatedAt,
        });
      }
    }

    // Mock DataStore
    const mockDataStore = {
      getChurch: jest.fn().mockResolvedValue({
        id: 'church-test-001',
        name: 'Test Church',
      }),
      getUserById: jest.fn().mockImplementation((userId: string) => {
        if (userId === 'user-admin-001') {
          return Promise.resolve({
            id: userId,
            roles: [{ churchId: 'church-test-001', roleId: 'role-admin' }],
          });
        }
        return Promise.resolve(null);
      }),
      getRole: jest.fn().mockResolvedValue({
        id: 'role-admin',
        churchId: 'church-test-001',
      }),
    };

    const documentsRepository = new MockDocumentsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: DOCUMENTS_REPOSITORY,
          useValue: documentsRepository,
        },
        {
          provide: DATA_STORE,
          useValue: mockDataStore,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should list documents for user', async () => {
    // Arrange - seed a document
    const document = {
      id: 'doc-001',
      churchId: 'church-test-001',
      uploaderProfileId: 'user-admin-001',
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Document',
      description: 'A test document',
      storageKey: 'storage/test.pdf',
      fileData: 'base64data',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.createDocument(document);

    // Act
    const documents = await service.list('user-admin-001');

    // Assert
    expect(documents.length).toBe(1);
    expect(documents[0].title).toBe(document.title);
    expect(documents[0].fileName).toBe(document.fileName);
  });

  it('should get document detail', async () => {
    // Arrange - seed a document
    const document = {
      id: 'doc-001',
      churchId: 'church-test-001',
      uploaderProfileId: 'user-admin-001',
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Document',
      description: 'A test document',
      storageKey: 'storage/test.pdf',
      fileData: 'base64data',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.createDocument(document);

    // Act
    const detail = await service.getDetail(document.id, 'user-admin-001');

    // Assert
    expect(detail).toBeDefined();
    expect(detail!.id).toBe(document.id);
    expect(detail!.title).toBe(document.title);
    expect(detail!.permissions).toEqual(['read', 'write']);
  });

  it('should create a document', async () => {
    // Arrange
    const file = {
      filename: 'new-document.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('test file content'),
    };
    const createDto = {
      title: 'New Document',
      description: 'A newly created document',
      roleIds: ['role-admin'],
    };

    // Act
    const created = await service.create(file, createDto, 'user-admin-001');

    // Assert
    expect(created).toBeDefined();
    expect(created.title).toBe(createDto.title);
    expect(created.fileName).toBe(file.filename);
    expect(created.fileType).toBe(file.mimetype);
  });

  it('should update a document', async () => {
    // Arrange - seed a document
    const document = {
      id: 'doc-001',
      churchId: 'church-test-001',
      uploaderProfileId: 'user-admin-001',
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Original Title',
      description: 'Original description',
      storageKey: 'storage/test.pdf',
      fileData: 'base64data',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.createDocument(document);

    const updateDto = {
      title: 'Updated Title',
      description: 'Updated description',
    };

    // Act
    const updated = await service.update(document.id, updateDto, 'user-admin-001');

    // Assert
    expect(updated).toBeDefined();
    expect(updated!.title).toBe(updateDto.title);
    expect(updated!.description).toBe(updateDto.description);
  });

  it('should delete a document', async () => {
    // Arrange - seed a document
    const document = {
      id: 'doc-001',
      churchId: 'church-test-001',
      uploaderProfileId: 'user-admin-001',
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Test Document',
      description: 'A test document',
      storageKey: 'storage/test.pdf',
      fileData: 'base64data',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.createDocument(document);

    // Act
    const result = await service.delete(document.id, 'user-admin-001');

    // Assert
    expect(result.success).toBe(true);
    expect(result.message).toBe('Document archived');
  });
});

import { Document } from '../../../src/domain/entities/Document';
import { DocumentId } from '../../../src/domain/value-objects/DocumentId';
import { ChurchId } from '../../../src/domain/value-objects/ChurchId';
import { UserId } from '../../../src/domain/value-objects/UserId';

describe('Document', () => {
  const documentId = DocumentId.create('550e8400-e29b-41d4-a716-446655440000');
  const churchId = ChurchId.create('650e8400-e29b-41d4-a716-446655440000');
  const uploaderProfileId = UserId.create('750e8400-e29b-41d4-a716-446655440000');
  const createdAt = new Date('2023-01-01T00:00:00Z');
  const updatedAt = new Date('2023-01-01T00:00:00Z');

  it('should create a Document with valid data', () => {
    const document = Document.reconstruct({
      id: documentId,
      churchId,
      uploaderProfileId,
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Meeting Notes',
      description: 'Important meeting notes',
      storageKey: 'documents/test.pdf',
      fileData: 'base64data',
      createdAt,
      updatedAt,
    });

    expect(document.id).toEqual(documentId);
    expect(document.title).toBe('Meeting Notes');
    expect(document.fileName).toBe('test.pdf');
    expect(document.fileType).toBe('application/pdf');
    expect(document.churchId).toEqual(churchId);
    expect(document.uploaderProfileId).toEqual(uploaderProfileId);
    expect(document.createdAt).toEqual(createdAt);
    expect(document.updatedAt).toEqual(updatedAt);
    expect(document.deletedAt).toBeUndefined();
  });

  it('should validate required fields in factory', () => {
    expect(() =>
      Document.create({
        churchId,
        uploaderProfileId,
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        title: '',
        description: 'Description',
        storageKey: 'documents/test.pdf',
        fileData: 'base64data',
      })
    ).toThrow('Title is required');

    expect(() =>
      Document.create({
        churchId,
        uploaderProfileId,
        fileName: '',
        fileType: 'application/pdf',
        title: 'Title',
        description: 'Description',
        storageKey: 'documents/test.pdf',
        fileData: 'base64data',
      })
    ).toThrow('File name is required');

    expect(() =>
      Document.create({
        churchId,
        uploaderProfileId,
        fileName: 'test.pdf',
        fileType: 'application/pdf',
        title: 'Title',
        description: 'Description',
        storageKey: 'documents/test.pdf',
        fileData: '',
      })
    ).toThrow('File data is required');
  });

  it('should handle soft delete', () => {
    const document = Document.reconstruct({
      id: documentId,
      churchId,
      uploaderProfileId,
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Meeting Notes',
      description: 'Description',
      storageKey: 'documents/test.pdf',
      fileData: 'base64data',
      createdAt,
      updatedAt,
    });

    expect(document.isDeleted()).toBe(false);

    const deletedDocument = document.markAsDeleted();
    expect(deletedDocument.isDeleted()).toBe(true);
    expect(deletedDocument.deletedAt).toBeInstanceOf(Date);
  });

  it('should update document properties', () => {
    const document = Document.reconstruct({
      id: documentId,
      churchId,
      uploaderProfileId,
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      title: 'Meeting Notes',
      description: 'Description',
      storageKey: 'documents/test.pdf',
      fileData: 'base64data',
      createdAt,
      updatedAt,
    });

    const updated = document.update({ title: 'Updated Notes', description: 'Updated description' });
    expect(updated.title).toBe('Updated Notes');
    expect(updated.description).toBe('Updated description');
    expect(updated.updatedAt).not.toEqual(updatedAt);
  });
});

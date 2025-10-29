import { DocumentId } from '../../../src/domain/value-objects/DocumentId';

describe('DocumentId', () => {
  it('should create a valid DocumentId', () => {
    const id = 'doc-1';
    const documentId = DocumentId.create(id);
    expect(documentId.value).toBe(id);
  });

  it('should throw an error for empty string', () => {
    expect(() => DocumentId.create('')).toThrow('DocumentId must be a non-empty string');
  });

  it('should throw an error for non-string value', () => {
    expect(() => DocumentId.create(null as any)).toThrow('DocumentId must be a non-empty string');
  });

  it('should be equal to another DocumentId with the same value', () => {
    const id = 'doc-1';
    const documentId1 = DocumentId.create(id);
    const documentId2 = DocumentId.create(id);
    expect(documentId1.equals(documentId2)).toBe(true);
  });

  it('should not be equal to another DocumentId with different value', () => {
    const documentId1 = DocumentId.create('doc-1');
    const documentId2 = DocumentId.create('doc-2');
    expect(documentId1.equals(documentId2)).toBe(false);
  });
});

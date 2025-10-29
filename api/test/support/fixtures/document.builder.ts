import { Document, DocumentProps } from '../../../src/domain/entities/Document';
import { DocumentId } from '../../../src/domain/value-objects/DocumentId';
import { ChurchId } from '../../../src/domain/value-objects/ChurchId';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { TestBuilder } from './base.builder';

/**
 * Builder for creating Document domain entities in tests
 */
export class DocumentBuilder extends TestBuilder<Document> {
  constructor() {
    super();
    // Set defaults
    this.withData({
      id: DocumentId.create('doc-1'),
      churchId: ChurchId.create('church-1'),
      uploaderProfileId: UserId.create('user-1'),
      fileName: 'test-document.pdf',
      fileType: 'application/pdf',
      title: 'Test Document',
      storageKey: 'documents/test-document.pdf',
      fileData: 'base64-encoded-content',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    } as Partial<DocumentProps>);
  }

  withId(id: string): this {
    return this.with('id', DocumentId.create(id));
  }

  withChurchId(churchId: string): this {
    return this.with('churchId', ChurchId.create(churchId));
  }

  withUploader(uploaderId: string): this {
    return this.with('uploaderProfileId', UserId.create(uploaderId));
  }

  withFile(fileName: string, fileType: string = 'application/pdf'): this {
    return this.with('fileName', fileName).with('fileType', fileType);
  }

  withTitle(title: string): this {
    return this.with('title', title);
  }

  withDescription(description: string): this {
    return this.with('description', description);
  }

  withStorageKey(storageKey: string): this {
    return this.with('storageKey', storageKey);
  }

  withFileData(fileData: string): this {
    return this.with('fileData', fileData);
  }

  withCreatedAt(date: Date): this {
    return this.with('createdAt', date).with('updatedAt', date);
  }

  build(): Document {
    const props: DocumentProps = {
      id: this.data.id!,
      churchId: this.data.churchId!,
      uploaderProfileId: this.data.uploaderProfileId!,
      fileName: this.data.fileName!,
      fileType: this.data.fileType!,
      title: this.data.title!,
      description: this.data.description,
      storageKey: this.data.storageKey!,
      fileData: this.data.fileData!,
      createdAt: this.data.createdAt!,
      updatedAt: this.data.updatedAt!,
      deletedAt: this.data.deletedAt,
    };

    return Document.reconstruct(props);
  }

  clone(): DocumentBuilder {
    const clone = new DocumentBuilder();
    clone.data = { ...this.data };
    return clone;
  }
}

/**
 * Pre-configured document builders for common test scenarios
 */
export class DocumentFixtures {
  static pdfDocument(): DocumentBuilder {
    return new DocumentBuilder()
      .withId('pdf-doc-1')
      .withFile('church-bulletin.pdf', 'application/pdf')
      .withTitle('Weekly Church Bulletin')
      .withDescription("This week's announcements and service information")
      .withStorageKey('documents/bulletin-2025-01-01.pdf');
  }

  static imageDocument(): DocumentBuilder {
    return new DocumentBuilder()
      .withId('image-doc-1')
      .withFile('event-photo.jpg', 'image/jpeg')
      .withTitle('Community Event Photo')
      .withDescription('Photo from the recent community outreach event')
      .withStorageKey('documents/event-photo-2025-01-01.jpg');
  }

  static wordDocument(): DocumentBuilder {
    return new DocumentBuilder()
      .withId('word-doc-1')
      .withFile(
        'meeting-notes.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )
      .withTitle('Board Meeting Notes')
      .withDescription('Minutes from the monthly board meeting')
      .withStorageKey('documents/meeting-notes-2025-01-01.docx');
  }

  static uploadedBy(uploaderId: string): DocumentBuilder {
    return new DocumentBuilder()
      .withId('uploaded-doc')
      .withUploader(uploaderId)
      .withTitle('Uploaded Document')
      .withFile('uploaded.pdf', 'application/pdf');
  }
}

import { DocumentId } from '../value-objects/DocumentId';
import { ChurchId } from '../value-objects/ChurchId';
import { UserId } from '../value-objects/UserId';

export interface DocumentProps {
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
}

export class Document {
  readonly id: DocumentId;
  readonly churchId: ChurchId;
  readonly uploaderProfileId: UserId;
  readonly fileName: string;
  readonly fileType: string;
  readonly title: string;
  readonly description?: string;
  readonly storageKey: string;
  readonly fileData: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;

  private constructor(props: DocumentProps) {
    this.id = props.id;
    this.churchId = props.churchId;
    this.uploaderProfileId = props.uploaderProfileId;
    this.fileName = props.fileName;
    this.fileType = props.fileType;
    this.title = props.title;
    this.description = props.description;
    this.storageKey = props.storageKey;
    this.fileData = props.fileData;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  static create(
    props: Omit<DocumentProps, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): Document {
    if (!props.title.trim()) {
      throw new Error('Title is required');
    }
    if (!props.fileName.trim()) {
      throw new Error('File name is required');
    }
    if (!props.fileData.trim()) {
      throw new Error('File data is required');
    }
    return new Document({
      ...props,
      id: DocumentId.create(crypto.randomUUID()),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstruct(props: DocumentProps): Document {
    return new Document(props);
  }

  isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  markAsDeleted(): Document {
    return new Document({
      ...this,
      deletedAt: new Date(),
    });
  }

  update(updates: Partial<Pick<DocumentProps, 'title' | 'description'>>): Document {
    return new Document({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }
}

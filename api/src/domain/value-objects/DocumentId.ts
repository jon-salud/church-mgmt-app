export class DocumentId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): DocumentId {
    if (!value || typeof value !== 'string') {
      throw new Error('DocumentId must be a non-empty string');
    }
    return new DocumentId(value);
  }

  equals(other: DocumentId): boolean {
    return this.value === other.value;
  }
}

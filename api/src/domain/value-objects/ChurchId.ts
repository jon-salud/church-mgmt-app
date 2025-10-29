export class ChurchId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): ChurchId {
    if (!value || typeof value !== 'string') {
      throw new Error('ChurchId must be a non-empty string');
    }
    return new ChurchId(value);
  }

  equals(other: ChurchId): boolean {
    return this.value === other.value;
  }
}

export class UserId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): UserId {
    if (!value || typeof value !== 'string') {
      throw new Error('UserId must be a non-empty string');
    }
    return new UserId(value);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

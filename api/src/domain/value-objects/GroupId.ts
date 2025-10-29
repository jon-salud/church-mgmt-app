export class GroupId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): GroupId {
    if (!value || typeof value !== 'string') {
      throw new Error('GroupId must be a non-empty string');
    }
    return new GroupId(value);
  }

  equals(other: GroupId): boolean {
    return this.value === other.value;
  }
}

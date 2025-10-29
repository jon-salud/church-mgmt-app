export class Email {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Email {
    if (!Email.isValidEmail(value)) {
      throw new Error('Invalid email format');
    }
    return new Email(value);
  }

  private static isValidEmail(email: string): boolean {
    // Simple email regex for basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

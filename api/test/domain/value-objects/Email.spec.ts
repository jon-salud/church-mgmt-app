import { Email } from '../../../src/domain/value-objects/Email';

describe('Email', () => {
  it('should create a valid email', () => {
    const email = Email.create('test@example.com');
    expect(email.value).toBe('test@example.com');
  });

  it('should throw an error for invalid email format', () => {
    expect(() => Email.create('invalid-email')).toThrow('Invalid email format');
  });

  it('should be equal to another Email with the same value', () => {
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });

  it('should not be equal to another Email with different value', () => {
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('other@example.com');
    expect(email1.equals(email2)).toBe(false);
  });
});

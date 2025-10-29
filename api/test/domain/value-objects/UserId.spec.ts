import { UserId } from '../../../src/domain/value-objects/UserId';

describe('UserId', () => {
  it('should create a valid UserId', () => {
    const id = 'user-admin';
    const userId = UserId.create(id);
    expect(userId.value).toBe(id);
  });

  it('should throw an error for empty string', () => {
    expect(() => UserId.create('')).toThrow('UserId must be a non-empty string');
  });

  it('should throw an error for non-string value', () => {
    expect(() => UserId.create(null as any)).toThrow('UserId must be a non-empty string');
  });

  it('should be equal to another UserId with the same value', () => {
    const id = 'user-admin';
    const userId1 = UserId.create(id);
    const userId2 = UserId.create(id);
    expect(userId1.equals(userId2)).toBe(true);
  });

  it('should not be equal to another UserId with different value', () => {
    const userId1 = UserId.create('user-admin');
    const userId2 = UserId.create('user-leader');
    expect(userId1.equals(userId2)).toBe(false);
  });
});

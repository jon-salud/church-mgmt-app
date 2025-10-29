import { User } from '../../../src/domain/entities/User';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { Email } from '../../../src/domain/value-objects/Email';
import { ChurchId } from '../../../src/domain/value-objects/ChurchId';

describe('User', () => {
  const userId = UserId.create('550e8400-e29b-41d4-a716-446655440000');
  const email = Email.create('test@example.com');
  const churchId = ChurchId.create('650e8400-e29b-41d4-a716-446655440000');
  const createdAt = new Date('2023-01-01T00:00:00Z');

  it('should create a User with valid data', () => {
    const user = User.create({
      id: userId,
      primaryEmail: email,
      churchId,
      createdAt,
      status: 'active',
      roles: [],
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        householdId: '',
        householdRole: 'Head',
      },
    });

    expect(user.id).toEqual(userId);
    expect(user.primaryEmail).toEqual(email);
    expect(user.churchId).toEqual(churchId);
    expect(user.createdAt).toEqual(createdAt);
    expect(user.profile.firstName).toBe('John');
    expect(user.profile.lastName).toBe('Doe');
    expect(user.deletedAt).toBeUndefined();
  });

  it('should have readonly properties enforced by TypeScript', () => {
    const user = User.create({
      id: userId,
      primaryEmail: email,
      churchId,
      createdAt,
      status: 'active',
      roles: [],
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        householdId: '',
        householdRole: 'Head',
      },
    });

    // In runtime, assignment is possible, but TypeScript prevents it
    // This test just checks initial value
    expect(user.profile.firstName).toBe('John');
  });

  it('should handle soft delete', () => {
    const user = User.create({
      id: userId,
      primaryEmail: email,
      churchId,
      createdAt,
      status: 'active',
      roles: [],
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        householdId: '',
        householdRole: 'Head',
      },
    });

    expect(user.isDeleted()).toBe(false);

    const deletedUser = user.markAsDeleted();
    expect(deletedUser.isDeleted()).toBe(true);
    expect(deletedUser.deletedAt).toBeInstanceOf(Date);
  });

  it('should validate required fields in factory', () => {
    expect(() =>
      User.create({
        id: userId,
        primaryEmail: email,
        churchId,
        createdAt,
        status: 'active',
        roles: [],
        profile: {
          firstName: '',
          lastName: 'Doe',
          householdId: '',
          householdRole: 'Head',
        },
      })
    ).toThrow('First name is required');

    expect(() =>
      User.create({
        id: userId,
        primaryEmail: email,
        churchId,
        createdAt,
        status: 'active',
        roles: [],
        profile: {
          firstName: 'John',
          lastName: '',
          householdId: '',
          householdRole: 'Head',
        },
      })
    ).toThrow('Last name is required');
  });
});

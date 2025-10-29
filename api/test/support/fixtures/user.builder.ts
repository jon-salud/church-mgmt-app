import { User, UserProps, UserProfile, UserRole } from '../../../src/domain/entities/User';
import { ChurchId } from '../../../src/domain/value-objects/ChurchId';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { Email } from '../../../src/domain/value-objects/Email';
import { TestBuilder } from './base.builder';

/**
 * Deep clone function for builder data that preserves value object instances and Dates.
 */
function deepCloneData(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  // Handle value objects
  if (obj instanceof UserId) {
    return UserId.create(obj.value);
  }
  if (obj instanceof ChurchId) {
    return ChurchId.create(obj.value);
  }
  if (obj instanceof Email) {
    return Email.create(obj.value);
  }
  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map(deepCloneData);
  }
  // Handle plain object
  const cloned: any = {};
  for (const key of Object.keys(obj)) {
    cloned[key] = deepCloneData(obj[key]);
  }
  return cloned;
}

/**
 * Builder for creating User domain entities in tests
 */
export class UserBuilder extends TestBuilder<User> {
  constructor() {
    super();
    // Set defaults
    this.withData({
      id: UserId.create('user-1'),
      churchId: ChurchId.create('church-1'),
      primaryEmail: Email.create('test@example.com'),
      status: 'active',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      roles: [],
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        householdId: 'household-1',
        householdRole: 'member',
      },
    } as Partial<UserProps>);
  }

  withId(id: string): this {
    return this.with('id', UserId.create(id));
  }

  withChurchId(churchId: string): this {
    return this.with('churchId', ChurchId.create(churchId));
  }

  withEmail(email: string): this {
    return this.with('primaryEmail', Email.create(email));
  }

  withName(firstName: string, lastName: string): this {
    const currentProfile = this.data.profile || {};
    return this.with('profile', {
      ...currentProfile,
      firstName,
      lastName,
    } as UserProfile);
  }

  withRoles(roles: UserRole[]): this {
    return this.with('roles', roles);
  }

  withStatus(status: 'active' | 'invited'): this {
    return this.with('status', status);
  }

  withHousehold(householdId: string, householdRole: string = 'member'): this {
    const currentProfile = this.data.profile || {};
    return this.with('profile', {
      ...currentProfile,
      householdId,
      householdRole,
    } as UserProfile);
  }

  withCreatedAt(date: Date): this {
    return this.with('createdAt', date);
  }

  build(): User {
    const props: UserProps = {
      id: this.data.id!,
      churchId: this.data.churchId!,
      primaryEmail: this.data.primaryEmail!,
      status: this.data.status!,
      createdAt: this.data.createdAt!,
      lastLoginAt: this.data.lastLoginAt,
      roles: this.data.roles!,
      profile: this.data.profile!,
      deletedAt: this.data.deletedAt,
    };

    return User.from(props);
  }

  clone(): UserBuilder {
    const clone = new UserBuilder();
    clone.data = deepCloneData(this.data);
    return clone;
  }
}

/**
 * Pre-configured user builders for common test scenarios
 */
export class UserFixtures {
  static admin(): UserBuilder {
    return new UserBuilder()
      .withId('admin-user')
      .withEmail('admin@church.com')
      .withName('Admin', 'User')
      .withRoles([{ churchId: 'church-1', roleId: 'role-admin' }]);
  }

  static leader(): UserBuilder {
    return new UserBuilder()
      .withId('leader-user')
      .withEmail('leader@church.com')
      .withName('Leader', 'User')
      .withRoles([{ churchId: 'church-1', roleId: 'role-leader' }]);
  }

  static member(): UserBuilder {
    return new UserBuilder()
      .withId('member-user')
      .withEmail('member@church.com')
      .withName('Member', 'User')
      .withRoles([{ churchId: 'church-1', roleId: 'role-member' }]);
  }

  static invited(): UserBuilder {
    return new UserBuilder()
      .withId('invited-user')
      .withEmail('invited@church.com')
      .withName('Invited', 'User')
      .withStatus('invited')
      .withRoles([]);
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/modules/users/users.service';
import {
  IUsersRepository,
  USER_REPOSITORY,
} from '../../src/modules/users/users.repository.interface';
import { UserId } from '../../src/domain/value-objects/UserId';
import { User } from '../../src/domain/entities/User';
import { Email } from '../../src/domain/value-objects/Email';
import { ChurchId } from '../../src/domain/value-objects/ChurchId';
import { TestDatabase } from '../support';
import { DomainMappers } from '../support/utils/domain-mappers';
import { GroupsService } from '../../src/modules/groups/groups.service';

describe('UsersService (Integration)', () => {
  let service: UsersService;
  let db: any;

  beforeEach(async () => {
    // Create a fresh in-memory database for each test
    db = TestDatabase.createFresh();

    // Create the repository implementation using the in-memory store
    class MockUsersRepository implements IUsersRepository {
      async listUsers(query?: string): Promise<User[]> {
        const mockUsers: {
          id: string;
          primaryEmail: string;
          churchId: string;
          status: string;
          profile: { firstName: string; lastName: string; phone?: string };
        }[] = await db.listUsers();
        return mockUsers.map(mockUser => DomainMappers.toDomainUser(mockUser));
      }

      async getUserProfile(id: UserId): Promise<User | null> {
        const mockUser = await db.getUserById(id.value);
        return mockUser ? DomainMappers.toDomainUser(mockUser) : null;
      }

      async createUser(user: User, actorUserId: UserId): Promise<User> {
        const mockUser = {
          id: user.id.value,
          primaryEmail: user.primaryEmail.value,
          churchId: user.churchId.value,
          status: user.status,
          profile: user.profile,
        };
        await db.createUser(mockUser);
        return user;
      }

      async updateUser(id: UserId, input: any): Promise<User | null> {
        const mockUser = await db.getUserById(id.value);
        if (!mockUser) return null;

        // Extract the actual update data (exclude actorUserId)
        const { actorUserId, ...updateData } = input;

        const updatedMockUser = {
          ...mockUser,
          profile: {
            ...mockUser.profile,
            ...updateData,
          },
        };
        await db.updateUser(id.value, updatedMockUser);
        return DomainMappers.toDomainUser(updatedMockUser);
      }

      async deleteUser(id: UserId, input: { actorUserId: UserId }): Promise<{ success: boolean }> {
        return db.deleteUser(id.value);
      }

      async hardDeleteUser(id: UserId, input: { actorUserId: UserId }): Promise<unknown> {
        return db.deleteUser(id.value);
      }

      async undeleteUser(id: UserId, input: { actorUserId: UserId }): Promise<unknown> {
        // Mock implementation - just return success
        return { success: true };
      }

      async listDeletedUsers(query?: string): Promise<User[]> {
        // Mock implementation - return empty array
        return [];
      }

      async bulkCreateInvitations(
        churchId: ChurchId,
        emails: string[],
        roleId: string | undefined,
        actorUserId: UserId,
        type?: 'team' | 'member'
      ): Promise<unknown[]> {
        // Mock implementation - return empty array
        return [];
      }
    }

    const usersRepository = new MockUsersRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USER_REPOSITORY,
          useValue: usersRepository,
        },
        {
          provide: GroupsService,
          useValue: {
            addMember: async () => ({ success: true }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should create and retrieve a user', async () => {
    // Arrange - seed the actor user directly in the mock DB
    const actorUser = {
      id: 'user-admin-001',
      primaryEmail: 'admin@test.com',
      churchId: 'church-test-001',
      status: 'active',
      roles: [{ churchId: 'church-test-001', roleId: 'role-admin' }],
      profile: { firstName: 'Admin', lastName: 'User' },
    };
    await db.createUser(actorUser);

    const createInput = {
      primaryEmail: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
    };

    // Act
    const createdUser = await service.create(createInput, actorUser.id);
    const retrievedUser = await service.get(createdUser.id);

    // Assert
    expect(createdUser).toBeDefined();
    expect(createdUser.primaryEmail).toBe(createInput.primaryEmail);
    expect(retrievedUser).toBeDefined();
    expect(retrievedUser!.id).toBe(createdUser.id);
  });

  it('should list users', async () => {
    // Arrange
    const actorUser = {
      id: 'user-admin-001',
      primaryEmail: 'admin@test.com',
      churchId: 'church-test-001',
      status: 'active',
      roles: [{ churchId: 'church-test-001', roleId: 'role-admin' }],
      profile: { firstName: 'Admin', lastName: 'User' },
    };

    // Seed the actor user
    await db.createUser(actorUser);

    // Create additional users directly in the mock DB
    const user1 = {
      id: 'user-001',
      primaryEmail: 'user1@test.com',
      churchId: 'church-test-001',
      status: 'active',
      roles: [{ churchId: 'church-test-001', roleId: 'role-member' }],
      profile: { firstName: 'User', lastName: 'One' },
    };
    const user2 = {
      id: 'user-002',
      primaryEmail: 'user2@test.com',
      churchId: 'church-test-001',
      status: 'active',
      roles: [{ churchId: 'church-test-001', roleId: 'role-member' }],
      profile: { firstName: 'User', lastName: 'Two' },
    };

    await db.createUser(user1);
    await db.createUser(user2);

    // Act
    const users = await service.list();

    // Assert
    expect(users.length).toBeGreaterThanOrEqual(3); // actor + 2 created
    expect(users.map((u: any) => u.primaryEmail)).toEqual(
      expect.arrayContaining([actorUser.primaryEmail, user1.primaryEmail, user2.primaryEmail])
    );
  });

  it('should update user profile', async () => {
    // Arrange
    const actorUser = {
      id: 'user-admin-001',
      primaryEmail: 'admin@test.com',
      churchId: 'church-test-001',
      status: 'active',
      roles: [{ churchId: 'church-test-001', roleId: 'role-admin' }],
      profile: { firstName: 'Admin', lastName: 'User' },
    };

    // Seed the actor user
    await db.createUser(actorUser);

    const createInput = {
      primaryEmail: 'update-test@example.com',
      firstName: 'Original',
      lastName: 'Name',
    };

    const createdUser = await service.create(createInput, actorUser.id);

    // Act
    const updateInput = {
      firstName: 'Updated',
      lastName: 'Name',
    };
    const updatedUser = await service.update(createdUser.id, updateInput, actorUser.id);

    // Assert
    expect(updatedUser).toBeDefined();
    expect(updatedUser!.profile.firstName).toBe('Updated');
    expect(updatedUser!.profile.lastName).toBe('Name');
  });

  it('should soft delete user', async () => {
    // Arrange
    const actorUser = {
      id: 'user-admin-001',
      primaryEmail: 'admin@test.com',
      churchId: 'church-test-001',
      status: 'active',
      roles: [{ churchId: 'church-test-001', roleId: 'role-admin' }],
      profile: { firstName: 'Admin', lastName: 'User' },
    };

    // Seed the actor user
    await db.createUser(actorUser);

    const createInput = {
      primaryEmail: 'delete-test@example.com',
      firstName: 'Delete',
      lastName: 'Test',
    };

    const createdUser = await service.create(createInput, actorUser.id);

    // Act - Soft delete
    const deleteResult = await service.delete(createdUser.id, actorUser.id);
    expect(deleteResult.success).toBe(true);

    // Verify user is not in active list (mock doesn't implement soft delete properly, but API should work)
    const users = await service.list();
    const activeUserIds = users.map((u: any) => u.id);
    expect(activeUserIds).not.toContain(createdUser.id);
  });

  it('should handle non-existent user', async () => {
    // Arrange
    const nonExistentId = 'user-non-existent';

    // Act & Assert
    await expect(service.get(nonExistentId)).resolves.toBeNull();
  });
});

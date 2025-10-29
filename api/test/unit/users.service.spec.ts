import { UsersService } from '../../src/modules/users/users.service';
import { IUsersRepository } from '../../src/modules/users/users.repository.interface';
import { User } from '../../src/domain/entities/User';
import { UserId } from '../../src/domain/value-objects/UserId';
import { Email } from '../../src/domain/value-objects/Email';
import { ChurchId } from '../../src/domain/value-objects/ChurchId';

const createUsersRepositoryMock = (): jest.Mocked<IUsersRepository> => ({
  listUsers: jest.fn().mockResolvedValue([]),
  getUserProfile: jest.fn().mockResolvedValue(null),
  createUser: jest.fn().mockResolvedValue({}),
  updateUser: jest.fn().mockResolvedValue(null),
  deleteUser: jest.fn().mockResolvedValue({ success: false }),
  hardDeleteUser: jest.fn().mockResolvedValue({}),
  undeleteUser: jest.fn().mockResolvedValue({}),
  listDeletedUsers: jest.fn().mockResolvedValue([]),
  bulkCreateInvitations: jest.fn().mockResolvedValue([]),
});

describe('UsersService', () => {
  let repo: jest.Mocked<IUsersRepository>;
  let service: UsersService;

  beforeEach(() => {
    repo = createUsersRepositoryMock();
    service = new UsersService(repo);
  });

  it('delegates list to repository', async () => {
    const mockUser = User.from({
      id: UserId.create('user-1'),
      primaryEmail: Email.create('test@example.com'),
      churchId: ChurchId.create('church-1'),
      status: 'active',
      createdAt: new Date(),
      roles: [],
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        householdId: '',
        householdRole: 'Head',
      },
    });
    repo.listUsers.mockResolvedValue([mockUser]);

    const result = await service.list('query');

    expect(repo.listUsers).toHaveBeenCalledWith('query');
    expect(result).toEqual([
      {
        id: 'user-1',
        primaryEmail: 'test@example.com',
        status: 'active',
        createdAt: mockUser.createdAt.toISOString(),
        lastLoginAt: undefined,
        profile: mockUser.profile,
        roles: [],
        deletedAt: undefined,
      },
    ]);
  });

  it('delegates get to repository', async () => {
    const mockUser = User.from({
      id: UserId.create('user-1'),
      primaryEmail: Email.create('test@example.com'),
      churchId: ChurchId.create('church-1'),
      status: 'active',
      createdAt: new Date(),
      roles: [],
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        householdId: '',
        householdRole: 'Head',
      },
    });
    repo.getUserProfile.mockResolvedValue(mockUser);

    const result = await service.get('user-1');

    expect(repo.getUserProfile).toHaveBeenCalledWith(UserId.create('user-1'));
    expect(result).toEqual({
      id: 'user-1',
      primaryEmail: 'test@example.com',
      status: 'active',
      createdAt: mockUser.createdAt.toISOString(),
      lastLoginAt: undefined,
      profile: mockUser.profile,
      roles: [],
      deletedAt: undefined,
    });
  });

  it('delegates create to repository', async () => {
    const input = { firstName: 'John', lastName: 'Doe', primaryEmail: 'john@example.com' };
    const mockActor = User.from({
      id: UserId.create('actor-1'),
      primaryEmail: Email.create('actor@example.com'),
      churchId: ChurchId.create('church-1'),
      status: 'active',
      createdAt: new Date(),
      roles: [],
      profile: {
        firstName: 'Actor',
        lastName: 'User',
        householdId: '',
        householdRole: 'Head',
      },
    });
    const mockCreatedUser = User.from({
      id: UserId.create('user-1'),
      primaryEmail: Email.create('john@example.com'),
      churchId: ChurchId.create('church-1'),
      status: 'invited',
      createdAt: new Date(),
      roles: [{ churchId: 'church-1', roleId: 'role-member' }],
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phone: undefined,
        householdId: '',
        householdRole: 'Head',
      },
    });
    repo.getUserProfile.mockResolvedValue(mockActor);
    repo.createUser.mockResolvedValue(mockCreatedUser);

    const result = await service.create(input, 'actor-1');

    expect(repo.getUserProfile).toHaveBeenCalledWith(UserId.create('actor-1'));
    expect(repo.createUser).toHaveBeenCalledWith(
      expect.any(User), // The created User object
      UserId.create('actor-1')
    );
    expect(result).toEqual({
      id: 'user-1',
      primaryEmail: 'john@example.com',
      status: 'invited',
      createdAt: mockCreatedUser.createdAt.toISOString(),
      lastLoginAt: undefined,
      profile: mockCreatedUser.profile,
      roles: [{ churchId: 'church-1', roleId: 'role-member' }],
      deletedAt: undefined,
    });
  });

  it('delegates update to repository', async () => {
    const input = { firstName: 'Jane' };
    const mockUpdatedUser = User.from({
      id: UserId.create('user-1'),
      primaryEmail: Email.create('test@example.com'),
      churchId: ChurchId.create('church-1'),
      status: 'active',
      createdAt: new Date(),
      roles: [],
      profile: {
        firstName: 'Jane',
        lastName: 'Doe',
        householdId: '',
        householdRole: 'Head',
      },
    });
    repo.updateUser.mockResolvedValue(mockUpdatedUser);

    const result = await service.update('user-1', input, 'actor-1');

    expect(repo.updateUser).toHaveBeenCalledWith(UserId.create('user-1'), {
      ...input,
      actorUserId: UserId.create('actor-1'),
    });
    expect(result).toEqual({
      id: 'user-1',
      primaryEmail: 'test@example.com',
      status: 'active',
      createdAt: mockUpdatedUser.createdAt.toISOString(),
      lastLoginAt: undefined,
      profile: mockUpdatedUser.profile,
      roles: [],
      deletedAt: undefined,
    });
  });

  it('delegates delete to repository', async () => {
    repo.deleteUser.mockResolvedValue({ success: true });

    const result = await service.delete('user-1', 'actor-1');

    expect(repo.deleteUser).toHaveBeenCalledWith(UserId.create('user-1'), {
      actorUserId: UserId.create('actor-1'),
    });
    expect(result).toEqual({ success: true });
  });

  it('delegates hardDelete to repository', async () => {
    const mockResult = { success: true };
    repo.hardDeleteUser.mockResolvedValue(mockResult);

    const result = await service.hardDelete('user-1', 'actor-1');

    expect(repo.hardDeleteUser).toHaveBeenCalledWith(UserId.create('user-1'), {
      actorUserId: UserId.create('actor-1'),
    });
    expect(result).toEqual(mockResult);
  });

  it('delegates undelete to repository', async () => {
    const mockResult = { success: true };
    repo.undeleteUser.mockResolvedValue(mockResult);

    const result = await service.undelete('user-1', 'actor-1');

    expect(repo.undeleteUser).toHaveBeenCalledWith(UserId.create('user-1'), {
      actorUserId: UserId.create('actor-1'),
    });
    expect(result).toEqual(mockResult);
  });

  it('delegates listDeleted to repository', async () => {
    const mockUsers = [{ id: 'user-1' }];
    repo.listDeletedUsers.mockResolvedValue(mockUsers as any);

    const result = await service.listDeleted('query');

    expect(repo.listDeletedUsers).toHaveBeenCalledWith('query');
    expect(result).toEqual(mockUsers);
  });

  it('bulkImport gets user profile and creates invitations', async () => {
    const mockUser = User.from({
      id: UserId.create('actor-1'),
      primaryEmail: Email.create('actor@example.com'),
      churchId: ChurchId.create('church-1'),
      status: 'active',
      createdAt: new Date(),
      roles: [],
      profile: {
        firstName: 'Actor',
        lastName: 'User',
        householdId: '',
        householdRole: 'Head',
      },
    });
    repo.getUserProfile.mockResolvedValue(mockUser);
    const mockInvitations = [{ id: 'inv-1' }];
    repo.bulkCreateInvitations.mockResolvedValue(mockInvitations);

    const result = await service.bulkImport(['email@example.com'], 'actor-1');

    expect(repo.getUserProfile).toHaveBeenCalledWith(UserId.create('actor-1'));
    expect(repo.bulkCreateInvitations).toHaveBeenCalledWith(
      ChurchId.create('church-1'),
      ['email@example.com'],
      undefined,
      UserId.create('actor-1'),
      'member'
    );
    expect(result).toEqual(mockInvitations);
  });

  it('bulkImport throws error if user has no churchId', async () => {
    repo.getUserProfile.mockResolvedValue(null);

    await expect(service.bulkImport(['email@example.com'], 'actor-1')).rejects.toThrow(
      'User not found'
    );
  });
});

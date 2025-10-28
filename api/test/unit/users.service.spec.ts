import { UsersService } from '../../src/modules/users/users.service';
import { IUsersRepository } from '../../src/modules/users/users.repository.interface';

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
    const mockUsers = [{ id: 'user-1' }];
    repo.listUsers.mockResolvedValue(mockUsers as unknown as any);

    const result = await service.list('query');

    expect(repo.listUsers).toHaveBeenCalledWith('query');
    expect(result).toEqual(mockUsers);
  });

  it('delegates get to repository', async () => {
    const mockUser = { id: 'user-1' };
    repo.getUserProfile.mockResolvedValue(mockUser as unknown as any);

    const result = await service.get('user-1');

    expect(repo.getUserProfile).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(mockUser);
  });

  it('delegates create to repository', async () => {
    const input = { firstName: 'John', lastName: 'Doe', primaryEmail: 'john@example.com' };
    const mockUser = { id: 'user-1', ...input };
    repo.createUser.mockResolvedValue(mockUser as unknown as any);

    const result = await service.create(input, 'actor-1');

    expect(repo.createUser).toHaveBeenCalledWith({ ...input, actorUserId: 'actor-1' });
    expect(result).toEqual(mockUser);
  });

  it('delegates update to repository', async () => {
    const input = { firstName: 'Jane' };
    const mockUser = { id: 'user-1', firstName: 'Jane' };
    repo.updateUser.mockResolvedValue(mockUser as unknown as any);

    const result = await service.update('user-1', input, 'actor-1');

    expect(repo.updateUser).toHaveBeenCalledWith('user-1', { ...input, actorUserId: 'actor-1' });
    expect(result).toEqual(mockUser);
  });

  it('delegates delete to repository', async () => {
    repo.deleteUser.mockResolvedValue({ success: true });

    const result = await service.delete('user-1', 'actor-1');

    expect(repo.deleteUser).toHaveBeenCalledWith('user-1', { actorUserId: 'actor-1' });
    expect(result).toEqual({ success: true });
  });

  it('delegates hardDelete to repository', async () => {
    const mockResult = { success: true };
    repo.hardDeleteUser.mockResolvedValue(mockResult);

    const result = await service.hardDelete('user-1', 'actor-1');

    expect(repo.hardDeleteUser).toHaveBeenCalledWith('user-1', { actorUserId: 'actor-1' });
    expect(result).toEqual(mockResult);
  });

  it('delegates undelete to repository', async () => {
    const mockResult = { success: true };
    repo.undeleteUser.mockResolvedValue(mockResult);

    const result = await service.undelete('user-1', 'actor-1');

    expect(repo.undeleteUser).toHaveBeenCalledWith('user-1', { actorUserId: 'actor-1' });
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
    const mockUser = { id: 'actor-1', churchId: 'church-1' };
    repo.getUserProfile.mockResolvedValue(mockUser as any);
    const mockInvitations = [{ id: 'inv-1' }];
    repo.bulkCreateInvitations.mockResolvedValue(mockInvitations);

    const result = await service.bulkImport(['email@example.com'], 'actor-1');

    expect(repo.getUserProfile).toHaveBeenCalledWith('actor-1');
    expect(repo.bulkCreateInvitations).toHaveBeenCalledWith(
      'church-1',
      ['email@example.com'],
      'actor-1',
      undefined,
      'member'
    );
    expect(result).toEqual(mockInvitations);
  });

  it('bulkImport throws error if user has no churchId', async () => {
    const mockUser = { id: 'actor-1' };
    repo.getUserProfile.mockResolvedValue(mockUser as any);

    await expect(service.bulkImport(['email@example.com'], 'actor-1')).rejects.toThrow(
      'User must be associated with a church'
    );
  });
});

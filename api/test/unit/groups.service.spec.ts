import { GroupsService } from '../../src/modules/groups/groups.service';
import { IGroupsRepository } from '../../src/modules/groups/groups.repository.interface';
import { DataStore } from '../../src/datastore';
import { createDataStoreMock } from '../support/datastore.mock';
import {
  MockGroup,
  MockGroupMember,
  MockGroupResource,
  MockUser,
  MockEvent,
} from '../../src/mock/mock-data';

const createGroupsRepositoryMock = (): jest.Mocked<IGroupsRepository> => ({
  listGroups: jest.fn().mockResolvedValue([]),
  getGroupById: jest.fn().mockResolvedValue(null),
  getGroupMembers: jest.fn().mockResolvedValue([]),
  addGroupMember: jest.fn().mockResolvedValue({} as MockGroupMember & { user: MockUser }),
  updateGroupMember: jest.fn().mockResolvedValue(null),
  removeGroupMember: jest.fn().mockResolvedValue({ success: false }),
  getGroupResources: jest.fn().mockResolvedValue([]),
  createGroupResource: jest.fn().mockResolvedValue({} as MockGroupResource),
  updateGroupResource: jest.fn().mockResolvedValue({} as MockGroupResource),
  deleteGroupResource: jest.fn().mockResolvedValue({ success: false }),
});

describe('GroupsService', () => {
  let repo: jest.Mocked<IGroupsRepository>;
  let store: jest.Mocked<DataStore>;
  let service: GroupsService;

  beforeEach(() => {
    repo = createGroupsRepositoryMock();
    store = createDataStoreMock();
    service = new GroupsService(repo, store);
  });

  it('lists groups', async () => {
    const mockGroups: MockGroup[] = [{ id: 'group-1' } as MockGroup];
    repo.listGroups.mockResolvedValue(mockGroups);

    const result = await service.list();

    expect(repo.listGroups).toHaveBeenCalledWith();
    expect(result).toEqual(mockGroups);
  });

  it('returns group detail with members, events, and resources', async () => {
    const mockGroup: MockGroup = { id: 'group-1' } as MockGroup;
    const mockMembers: Array<MockGroupMember & { user: MockUser }> = [];
    const mockEvents: MockEvent[] = [{ id: 'event-1', startAt: '2024-01-01' } as MockEvent];
    const mockResources: MockGroupResource[] = [{ id: 'resource-1' } as MockGroupResource];
    repo.getGroupById.mockResolvedValue(mockGroup);
    repo.getGroupMembers.mockResolvedValue(mockMembers);
    store.listEventsByGroupId.mockResolvedValue(mockEvents);
    repo.getGroupResources.mockResolvedValue(mockResources);

    const result = await service.detail('group-1');

    expect(repo.getGroupById).toHaveBeenCalledWith('group-1');
    expect(repo.getGroupMembers).toHaveBeenCalledWith('group-1');
    expect(store.listEventsByGroupId).toHaveBeenCalledWith('group-1');
    expect(repo.getGroupResources).toHaveBeenCalledWith('group-1');
    expect(result).toEqual({
      ...mockGroup,
      members: mockMembers,
      events: mockEvents,
      resources: mockResources,
    });
  });

  it('returns null when group not found in detail', async () => {
    repo.getGroupById.mockResolvedValue(null);

    const result = await service.detail('missing');

    expect(result).toBeNull();
  });

  it('gets group members', async () => {
    const mockMembers: Array<MockGroupMember & { user: MockUser }> = [
      { userId: 'user-1', user: {} as MockUser } as MockGroupMember & { user: MockUser },
    ];
    repo.getGroupMembers.mockResolvedValue(mockMembers);

    const result = await service.members('group-1');

    expect(repo.getGroupMembers).toHaveBeenCalledWith('group-1');
    expect(result).toEqual(mockMembers);
  });

  it('adds group member', async () => {
    const input = { userId: 'user-1', role: 'Member' as const };
    const mockMember: MockGroupMember & { user: MockUser } = {
      userId: 'user-1',
      user: {} as MockUser,
    } as MockGroupMember & { user: MockUser };
    repo.addGroupMember.mockResolvedValue(mockMember);

    const result = await service.addMember('group-1', input, 'actor-1');

    expect(repo.addGroupMember).toHaveBeenCalledWith('group-1', {
      ...input,
      actorUserId: 'actor-1',
    });
    expect(result).toEqual(mockMember);
  });

  it('updates group member', async () => {
    const input = { role: 'Leader' as const };
    const mockMember: MockGroupMember & { user: MockUser | null } = {
      userId: 'user-1',
      user: {} as MockUser,
    } as MockGroupMember & { user: MockUser };
    repo.updateGroupMember.mockResolvedValue(mockMember);

    const result = await service.updateMember('group-1', 'user-1', input, 'actor-1');

    expect(repo.updateGroupMember).toHaveBeenCalledWith('group-1', 'user-1', {
      ...input,
      actorUserId: 'actor-1',
    });
    expect(result).toEqual(mockMember);
  });

  it('removes group member', async () => {
    repo.removeGroupMember.mockResolvedValue({ success: true });

    const result = await service.removeMember('group-1', 'user-1', 'actor-1');

    expect(repo.removeGroupMember).toHaveBeenCalledWith('group-1', 'user-1', {
      actorUserId: 'actor-1',
    });
    expect(result).toEqual({ success: true });
  });

  it('gets group resources', async () => {
    const mockResources: MockGroupResource[] = [{ id: 'resource-1' } as MockGroupResource];
    repo.getGroupResources.mockResolvedValue(mockResources);

    const result = await service.resources('group-1');

    expect(repo.getGroupResources).toHaveBeenCalledWith('group-1');
    expect(result).toEqual(mockResources);
  });

  it('creates group resource', async () => {
    const input = { title: 'Test Resource', url: 'https://example.com' };
    const mockResource: MockGroupResource = { id: 'resource-1' } as MockGroupResource;
    repo.createGroupResource.mockResolvedValue(mockResource);

    const result = await service.createResource('group-1', input, 'actor-1');

    expect(repo.createGroupResource).toHaveBeenCalledWith('group-1', {
      ...input,
      actorUserId: 'actor-1',
    });
    expect(result).toEqual(mockResource);
  });

  it('updates group resource', async () => {
    const input = { title: 'Updated Title' };
    const mockResource: MockGroupResource = {
      id: 'resource-1',
      title: 'Updated Title',
    } as MockGroupResource;
    repo.updateGroupResource.mockResolvedValue(mockResource);

    const result = await service.updateResource('resource-1', input, 'actor-1');

    expect(repo.updateGroupResource).toHaveBeenCalledWith('resource-1', {
      ...input,
      actorUserId: 'actor-1',
    });
    expect(result).toEqual(mockResource);
  });

  it('deletes group resource', async () => {
    repo.deleteGroupResource.mockResolvedValue({ success: true });

    const result = await service.deleteResource('resource-1', 'actor-1');

    expect(repo.deleteGroupResource).toHaveBeenCalledWith('resource-1', { actorUserId: 'actor-1' });
    expect(result).toEqual({ success: true });
  });
});

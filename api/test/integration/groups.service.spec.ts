import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from '../../src/modules/groups/groups.service';
import {
  GROUPS_REPOSITORY,
  IGroupsRepository,
} from '../../src/modules/groups/groups.repository.interface';
import { DATA_STORE } from '../../src/datastore';
import { GroupId } from '../../src/domain/value-objects/GroupId';
import { UserId } from '../../src/domain/value-objects/UserId';
import { Group } from '../../src/domain/entities/Group';
import { ChurchId } from '../../src/domain/value-objects/ChurchId';
import { TestDatabase } from '../support';

describe('GroupsService (Integration)', () => {
  let service: GroupsService;
  let db: any;

  beforeEach(async () => {
    // Create a fresh in-memory database for each test
    db = TestDatabase.createFresh();

    // Create the repository implementation using the in-memory store
    class MockGroupsRepository implements IGroupsRepository {
      async listGroups(): Promise<Group[]> {
        const mockGroups: {
          id: string;
          name: string;
          churchId: string;
          description?: string;
          type: string;
          meetingDay?: string;
          meetingTime?: string;
          tags?: string[];
          leaderId?: string;
        }[] = await db.listGroups();
        return mockGroups.map(mockGroup => this.toDomainGroup(mockGroup));
      }

      async getGroupById(id: GroupId): Promise<Group | null> {
        const mockGroup = await db.getGroupById(id.value);
        return mockGroup ? this.toDomainGroup(mockGroup) : null;
      }

      async getGroupMembers(groupId: GroupId): Promise<any[]> {
        // Mock implementation - return empty array for simplicity
        return [];
      }

      async addGroupMember(groupId: GroupId, input: any): Promise<any> {
        // Mock implementation
        return {
          userId: input.userId,
          role: input.role || 'Member',
          status: 'Active',
          joinedAt: new Date().toISOString(),
          user: null,
        };
      }

      async updateGroupMember(groupId: GroupId, userId: UserId, input: any): Promise<any> {
        // Mock implementation
        return {
          userId: userId.value,
          role: input.role || 'Member',
          status: 'Active',
          joinedAt: new Date().toISOString(),
          user: null,
        };
      }

      async removeGroupMember(
        groupId: GroupId,
        userId: UserId,
        input: any
      ): Promise<{ success: boolean }> {
        // Mock implementation
        return { success: true };
      }

      async getGroupResources(groupId: GroupId): Promise<any[]> {
        // Mock implementation - return empty array for simplicity
        return [];
      }

      async createGroupResource(groupId: GroupId, input: any): Promise<any> {
        // Mock implementation
        return {
          id: 'resource-001',
          groupId: groupId.value,
          churchId: 'church-test-001',
          title: input.title,
          url: input.url,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      async updateGroupResource(resourceId: string, input: any): Promise<any> {
        // Mock implementation
        return {
          id: resourceId,
          groupId: 'group-001',
          churchId: 'church-test-001',
          title: input.title || 'Updated Resource',
          url: input.url || 'https://example.com/updated',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      async deleteGroupResource(resourceId: string, input: any): Promise<{ success: boolean }> {
        // Mock implementation
        return { success: true };
      }

      private toDomainGroup(mockGroup: {
        id: string;
        name: string;
        churchId: string;
        description?: string;
        type: string;
        meetingDay?: string;
        meetingTime?: string;
        tags?: string[];
        leaderId?: string;
      }): Group {
        return Group.create({
          id: GroupId.create(mockGroup.id),
          churchId: ChurchId.create(mockGroup.churchId),
          name: mockGroup.name,
          description: mockGroup.description || '',
          type: mockGroup.type,
          meetingDay: mockGroup.meetingDay,
          meetingTime: mockGroup.meetingTime,
          tags: mockGroup.tags || [],
          leaderId: mockGroup.leaderId ? UserId.create(mockGroup.leaderId) : undefined,
          createdAt: new Date(),
        });
      }
    }

    // Mock DataStore for events
    const mockDataStore = {
      listEventsByGroupId: jest.fn().mockResolvedValue([]),
    };

    const groupsRepository = new MockGroupsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: GROUPS_REPOSITORY,
          useValue: groupsRepository,
        },
        {
          provide: DATA_STORE,
          useValue: mockDataStore,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should list groups', async () => {
    // Arrange - seed some groups
    const group1 = {
      id: 'group-001',
      name: 'Small Group Alpha',
      churchId: 'church-test-001',
      description: 'A small group for fellowship',
      type: 'Small Group',
      meetingDay: 'Wednesday',
      meetingTime: '7:00 PM',
      tags: ['fellowship', 'bible-study'],
    };
    const group2 = {
      id: 'group-002',
      name: 'Worship Ministry',
      churchId: 'church-test-001',
      description: 'Church worship team',
      type: 'Ministry',
      meetingDay: 'Sunday',
      meetingTime: '8:00 AM',
      tags: ['worship', 'music'],
    };

    await db.createGroup(group1);
    await db.createGroup(group2);

    // Act
    const groups = await service.list();

    // Assert
    expect(groups.length).toBe(2);
    expect(groups.map(g => g.name)).toEqual(expect.arrayContaining([group1.name, group2.name]));
  });

  it('should get group detail', async () => {
    // Arrange - seed a group
    const group = {
      id: 'group-001',
      name: 'Small Group Alpha',
      churchId: 'church-test-001',
      description: 'A small group for fellowship',
      type: 'Small Group',
      meetingDay: 'Wednesday',
      meetingTime: '7:00 PM',
      tags: ['fellowship', 'bible-study'],
    };
    await db.createGroup(group);

    // Act
    const detail = await service.detail(group.id);

    // Assert
    expect(detail).toBeDefined();
    expect(detail!.id).toBe(group.id);
    expect(detail!.name).toBe(group.name);
    expect(detail!.members).toEqual([]);
    expect(detail!.events).toEqual([]);
    expect(detail!.resources).toEqual([]);
  });

  it('should return null for non-existent group', async () => {
    // Act
    const detail = await service.detail('non-existent-group');

    // Assert
    expect(detail).toBeNull();
  });

  it('should add group member', async () => {
    // Arrange - seed a group
    const group = {
      id: 'group-001',
      name: 'Small Group Alpha',
      churchId: 'church-test-001',
      type: 'Small Group',
    };
    await db.createGroup(group);

    const addMemberInput = {
      userId: 'user-001',
      role: 'Member' as const,
    };

    // Act
    const result = await service.addMember(group.id, addMemberInput, 'admin-user-id');

    // Assert
    expect(result).toBeDefined();
    expect(result.userId).toBe(addMemberInput.userId);
    expect(result.role).toBe(addMemberInput.role);
  });

  it('should create group resource', async () => {
    // Arrange - seed a group
    const group = {
      id: 'group-001',
      name: 'Small Group Alpha',
      churchId: 'church-test-001',
      type: 'Small Group',
    };
    await db.createGroup(group);

    const createResourceInput = {
      title: 'Bible Study Guide',
      url: 'https://example.com/guide.pdf',
    };

    // Act
    const result = await service.createResource(group.id, createResourceInput, 'admin-user-id');

    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe(createResourceInput.title);
    expect(result.url).toBe(createResourceInput.url);
    expect(result.groupId).toBe(group.id);
  });
});

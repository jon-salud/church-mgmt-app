import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from '../../src/modules/members/members.service';
import { DATA_STORE } from '../../src/datastore/data-store.types';
import { MemberListQueryDto } from '../../src/modules/members/dto/member-list-query.dto';

describe('MembersService', () => {
  let service: MembersService;
  let mockDataStore: any;

  const mockUsers = [
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      primaryEmail: 'john@example.com',
      phone: '1234567890',
      status: 'active',
      roles: [{ name: 'Member', slug: 'member' }],
      groups: [{ id: 'group-1', name: 'Small Group' }],
      lastAttendance: '2024-11-01T10:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      primaryEmail: 'jane@example.com',
      phone: null,
      status: 'active',
      roles: [{ name: 'Leader', slug: 'leader' }],
      groups: [
        { id: 'group-1', name: 'Small Group' },
        { id: 'group-2', name: 'Worship Team' },
      ],
      lastAttendance: '2024-11-08T10:00:00Z',
      createdAt: '2024-02-01T00:00:00Z',
    },
    {
      id: 'user-3',
      firstName: 'Bob',
      lastName: 'Johnson',
      primaryEmail: 'bob@example.com',
      phone: '9876543210',
      status: 'inactive',
      roles: [{ name: 'Member', slug: 'member' }],
      groups: [],
      lastAttendance: null,
      createdAt: '2024-03-01T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    mockDataStore = {
      listUsers: jest.fn().mockResolvedValue([...mockUsers]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: DATA_STORE,
          useValue: mockDataStore,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listMembers', () => {
    it('should return paginated list of members', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25 };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(3);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 25,
        total: 3,
        pages: 1,
      });
      expect(result.meta).toHaveProperty('queryTime');
      expect(result.meta).toHaveProperty('filters');
    });

    it('should filter by search query (name)', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, search: 'jane' };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('Jane');
    });

    it('should filter by search query (email)', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, search: 'bob@' };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('Bob');
    });

    it('should filter by status', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, status: 'inactive' };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('inactive');
    });

    it('should filter by role', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, role: 'leader' };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('Jane');
    });

    it('should filter by hasEmail', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, hasEmail: true };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(3);
      expect(result.data.every(u => u.email)).toBe(true);
    });

    it('should filter by hasPhone', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, hasPhone: false };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('Jane');
    });

    it('should filter by groupsCountMin', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, groupsCountMin: 2 };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('Jane');
      expect(result.data[0].groupsCount).toBe(2);
    });

    it('should filter by lastAttendance (never)', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, lastAttendance: 'never' };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('Bob');
    });

    it('should sort by name ascending', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, sort: 'name:asc' };
      const result = await service.listMembers('church-1', query);

      expect(result.data[0].firstName).toBe('Bob');
      expect(result.data[1].firstName).toBe('Jane');
      expect(result.data[2].firstName).toBe('John');
    });

    it('should sort by name descending', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, sort: 'name:desc' };
      const result = await service.listMembers('church-1', query);

      expect(result.data[0].firstName).toBe('John');
      expect(result.data[1].firstName).toBe('Jane');
      expect(result.data[2].firstName).toBe('Bob');
    });

    it('should sort by groupsCount', async () => {
      const query: MemberListQueryDto = { page: 1, limit: 25, sort: 'groupsCount:desc' };
      const result = await service.listMembers('church-1', query);

      expect(result.data[0].groupsCount).toBe(2);
      expect(result.data[1].groupsCount).toBe(1);
      expect(result.data[2].groupsCount).toBe(0);
    });

    it('should paginate results correctly', async () => {
      const query: MemberListQueryDto = { page: 2, limit: 2 };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 2,
        total: 3,
        pages: 2,
      });
    });

    it('should combine multiple filters', async () => {
      const query: MemberListQueryDto = {
        page: 1,
        limit: 25,
        status: 'active',
        hasPhone: true,
        sort: 'name:asc',
      };
      const result = await service.listMembers('church-1', query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('John');
      expect(result.data[0].status).toBe('active');
      expect(result.data[0].phone).toBeTruthy();
    });

    it('should return active filters in meta', async () => {
      const query: MemberListQueryDto = {
        page: 1,
        limit: 25,
        search: 'test',
        status: 'active',
        role: 'member',
      };
      const result = await service.listMembers('church-1', query);

      expect(result.meta.filters).toEqual({
        search: 'test',
        status: ['active'],
        role: ['member'],
      });
    });
  });
});

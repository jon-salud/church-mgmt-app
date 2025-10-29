import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogCommandService } from '../../src/modules/audit/audit-command.service';
import { DATA_STORE } from '../../src/datastore';
import { EVENT_STORE } from '../../src/common/event-store.interface';
import { AuditLogCreateInput } from '../../src/modules/audit/audit.interfaces';

describe('AuditLogCommandService', () => {
  let service: AuditLogCommandService;
  let mockDataStore: any;
  let mockEventStore: any;

  beforeEach(async () => {
    mockDataStore = {
      createAuditLog: jest.fn(),
      getUserById: jest.fn(),
    };

    mockEventStore = {
      append: jest.fn(),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogCommandService,
        {
          provide: DATA_STORE,
          useValue: mockDataStore,
        },
        {
          provide: EVENT_STORE,
          useValue: mockEventStore,
        },
      ],
    }).compile();

    service = module.get<AuditLogCommandService>(AuditLogCommandService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuditLog', () => {
    it('should create audit log and return read model with actor', async () => {
      const input: AuditLogCreateInput = {
        actorUserId: 'user1',
        action: 'CREATE',
        entity: 'User',
        entityId: 'user1',
        summary: 'User created',
        churchId: 'church1',
      };
      const mockAuditLog = {
        id: '1',
        churchId: 'church1',
        actorUserId: 'user1',
        action: 'CREATE',
        entity: 'User',
        entityId: 'user1',
        summary: 'User created',
        diff: {},
        metadata: {},
        createdAt: '2023-01-01T00:00:00Z',
      };
      const mockUser = {
        id: 'user1',
        primaryEmail: 'user@example.com',
        profile: { firstName: 'John', lastName: 'Doe' },
      };

      mockDataStore.createAuditLog.mockResolvedValue(mockAuditLog);
      mockDataStore.getUserById.mockResolvedValue(mockUser);
      mockEventStore.append.mockResolvedValue({ id: 'event-1' });

      const result = await service.createAuditLog(input);

      expect(mockDataStore.createAuditLog).toHaveBeenCalledWith(input);
      expect(mockDataStore.getUserById).toHaveBeenCalledWith('user1');
      expect(mockEventStore.append).toHaveBeenCalled();
      expect(result).toEqual({
        id: '1',
        churchId: 'church1',
        actorUserId: 'user1',
        actor: mockUser,
        action: 'CREATE',
        entity: 'User',
        entityId: 'user1',
        summary: 'User created',
        diff: {},
        metadata: {},
        createdAt: '2023-01-01T00:00:00Z',
      });
    });

    it('should handle audit log creation without actor', async () => {
      const input: AuditLogCreateInput = {
        actorUserId: 'system',
        action: 'SYSTEM',
        entity: 'System',
        summary: 'System maintenance',
        churchId: 'church1',
      };
      const mockAuditLog = {
        id: '1',
        churchId: 'church1',
        actorUserId: 'system',
        action: 'SYSTEM',
        entity: 'System',
        summary: 'System maintenance',
        diff: {},
        metadata: {},
        createdAt: '2023-01-01T00:00:00Z',
      };

      mockDataStore.createAuditLog.mockResolvedValue(mockAuditLog);
      mockDataStore.getUserById.mockResolvedValue(null); // System user might not exist
      mockEventStore.append.mockResolvedValue({ id: 'event-1' });

      const result = await service.createAuditLog(input);

      expect(mockDataStore.getUserById).toHaveBeenCalledWith('system');
      expect(mockEventStore.append).toHaveBeenCalled();
      expect(result.actor).toBeNull();
    });
  });
});

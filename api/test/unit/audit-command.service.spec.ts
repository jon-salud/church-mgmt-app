import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogCommandService } from '../../src/modules/audit/audit-command.service';
import { DATA_STORE } from '../../src/datastore';
import { AuditLogCreateInput } from '../../src/modules/audit/audit.interfaces';

describe('AuditLogCommandService', () => {
  let service: AuditLogCommandService;
  let mockDataStore: jest.Mocked<any>;

  beforeEach(async () => {
    mockDataStore = {
      createAuditLog: jest.fn(),
      getUserById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogCommandService,
        {
          provide: DATA_STORE,
          useValue: mockDataStore,
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
        actorUserId: 'user-123',
        action: 'user.created',
        entity: 'user',
        entityId: 'user-456',
        summary: 'User created',
        metadata: { some: 'data' },
      };

      const mockAuditLog = {
        id: 'audit-1',
        churchId: 'church-1',
        actorUserId: 'user-123',
        action: 'user.created',
        entity: 'user',
        entityId: 'user-456',
        summary: 'User created',
        metadata: { some: 'data' },
        createdAt: '2023-01-01T00:00:00Z',
      };

      const mockUser = {
        id: 'user-123',
        primaryEmail: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockDataStore.createAuditLog.mockResolvedValue(mockAuditLog);
      mockDataStore.getUserById.mockResolvedValue(mockUser);

      const result = await service.createAuditLog(input);

      expect(mockDataStore.createAuditLog).toHaveBeenCalledWith(input);
      expect(mockDataStore.getUserById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({
        ...mockAuditLog,
        actor: mockUser,
        diff: undefined,
      });
    });

    it('should handle audit log with diff data', async () => {
      const input: AuditLogCreateInput = {
        actorUserId: 'user-123',
        action: 'user.updated',
        entity: 'user',
        entityId: 'user-456',
        summary: 'User updated',
        diff: { name: { previous: 'Old Name', newValue: 'New Name' } },
      };

      const mockAuditLog = {
        id: 'audit-1',
        churchId: 'church-1',
        actorUserId: 'user-123',
        action: 'user.updated',
        entity: 'user',
        entityId: 'user-456',
        summary: 'User updated',
        diff: { name: { previous: 'Old Name', newValue: 'New Name' } },
        createdAt: '2023-01-01T00:00:00Z',
      };

      const mockUser = {
        id: 'user-123',
        primaryEmail: 'test@example.com',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockDataStore.createAuditLog.mockResolvedValue(mockAuditLog);
      mockDataStore.getUserById.mockResolvedValue(mockUser);

      const result = await service.createAuditLog(input);

      expect(result.diff).toEqual({ name: { previous: 'Old Name', newValue: 'New Name' } });
    });
  });
});

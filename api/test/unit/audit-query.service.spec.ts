import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogQueryService } from '../../src/modules/audit/audit-query.service';
import { DATA_STORE } from '../../src/datastore';
import { CACHE_STORE } from '../../src/common/cache-store.interface';
import { CIRCUIT_BREAKER } from '../../src/common/circuit-breaker.interface';
import { CircuitBreakerState } from '../../src/common/circuit-breaker-state.enum';
import { ListAuditQueryDto } from '../../src/modules/audit/dto/list-audit-query.dto';

describe('AuditLogQueryService', () => {
  let service: AuditLogQueryService;
  let mockDataStore: any;
  let mockCacheStore: any;
  let mockCircuitBreaker: any;

  beforeEach(async () => {
    mockDataStore = {
      listAuditLogs: jest.fn(),
      getUserById: jest.fn(),
    };

    mockCacheStore = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    };

    mockCircuitBreaker = {
      execute: jest.fn((fn, fallback) => {
        // Default: execute the function normally, allowing tests to override
        return fn();
      }),
      getState: jest.fn().mockReturnValue(CircuitBreakerState.CLOSED),
      getMetrics: jest.fn(),
      reset: jest.fn(),
      setFailureThreshold: jest.fn(),
      setTimeout: jest.fn(),
      setHalfOpenSuccessThreshold: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogQueryService,
        {
          provide: DATA_STORE,
          useValue: mockDataStore,
        },
        {
          provide: CACHE_STORE,
          useValue: mockCacheStore,
        },
        {
          provide: CIRCUIT_BREAKER,
          useValue: mockCircuitBreaker,
        },
      ],
    }).compile();

    service = module.get<AuditLogQueryService>(AuditLogQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listAuditLogs', () => {
    it('should return audit logs with actor resolution', async () => {
      const query: ListAuditQueryDto = { page: 1, pageSize: 10 };
      const mockAuditLogs = {
        items: [
          {
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
          },
        ],
        meta: { total: 1, page: 1, pageSize: 10 },
      };
      const mockUser = {
        id: 'user1',
        primaryEmail: 'user@example.com',
        profile: { firstName: 'John', lastName: 'Doe' },
      };

      mockDataStore.listAuditLogs.mockResolvedValue(mockAuditLogs);
      mockDataStore.getUserById.mockResolvedValue(mockUser);

      const result = await service.listAuditLogs(query);

      expect(mockDataStore.listAuditLogs).toHaveBeenCalledWith(query);
      expect(mockDataStore.getUserById).toHaveBeenCalledWith('user1');
      expect(result).toEqual({
        items: [
          {
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
          },
        ],
        meta: { total: 1, page: 1, pageSize: 10 },
      });
    });

    it('should handle audit logs without actor', async () => {
      const query: ListAuditQueryDto = { page: 1, pageSize: 10 };
      const mockAuditLogs = {
        items: [
          {
            id: '1',
            churchId: 'church1',
            actorUserId: null,
            action: 'SYSTEM',
            entity: 'System',
            entityId: null,
            summary: 'System maintenance',
            diff: {},
            metadata: {},
            createdAt: '2023-01-01T00:00:00Z',
          },
        ],
        meta: { total: 1, page: 1, pageSize: 10 },
      };

      mockDataStore.listAuditLogs.mockResolvedValue(mockAuditLogs);

      const result = await service.listAuditLogs(query);

      expect(mockDataStore.getUserById).not.toHaveBeenCalled();
      expect(result.items[0].actor).toBeUndefined();
    });
  });
});

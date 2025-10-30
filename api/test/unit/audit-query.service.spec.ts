import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogQueryService } from '../../src/modules/audit/audit-query.service';
import { ObservabilityService } from '../../src/observability/observability.service';
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
  let mockObservability: any;

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

    mockObservability = {
      startSpan: jest.fn().mockReturnValue('span-1'),
      endSpan: jest.fn().mockReturnValue({ durationMs: 10, operationName: 'test' }),
      recordCQRSQuery: jest.fn(),
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
        {
          provide: ObservabilityService,
          useValue: mockObservability,
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
      mockCacheStore.get.mockResolvedValue(null); // Cache miss

      const result = await service.listAuditLogs(query);

      expect(mockDataStore.listAuditLogs).toHaveBeenCalledWith(query);
      expect(mockDataStore.getUserById).toHaveBeenCalledWith('user1');
      expect(mockObservability.startSpan).toHaveBeenCalledWith('audit.listAuditLogs', {
        page: 1,
        pageSize: 10,
        entity: undefined,
      });
      expect(mockObservability.endSpan).toHaveBeenCalledWith('span-1', 'success');
      expect(mockObservability.recordCQRSQuery).toHaveBeenCalledWith('listAuditLogs', 10, 1);
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

    it('should record failed query when error occurs', async () => {
      const query: ListAuditQueryDto = { page: 1, pageSize: 10 };
      mockCacheStore.get.mockResolvedValue(null); // Cache miss
      const error = new Error('Database error');
      mockDataStore.listAuditLogs.mockRejectedValue(error);
      mockObservability.endSpan.mockReturnValue({ durationMs: 50, operationName: 'test' });

      await expect(service.listAuditLogs(query)).rejects.toThrow('Database error');
      expect(mockObservability.recordCQRSQuery).toHaveBeenCalledWith('listAuditLogs', 50, 0);
      expect(mockObservability.endSpan).toHaveBeenCalledWith('span-1', 'error', 'Database error');
    });
  });
});

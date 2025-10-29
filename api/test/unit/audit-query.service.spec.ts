import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogQueryService } from '../../src/modules/audit/audit-query.service';
import { DATA_STORE } from '../../src/datastore';
import { ListAuditQueryDto } from '../../src/modules/audit/dto/list-audit-query.dto';

describe('AuditLogQueryService', () => {
  let service: AuditLogQueryService;
  let mockDataStore: jest.Mocked<any>;

  beforeEach(async () => {
    mockDataStore = {
      listAuditLogs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogQueryService,
        {
          provide: DATA_STORE,
          useValue: mockDataStore,
        },
      ],
    }).compile();

    service = module.get<AuditLogQueryService>(AuditLogQueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listAuditLogs', () => {
    it('should call data store listAuditLogs with correct parameters', async () => {
      const query: ListAuditQueryDto = {
        page: 1,
        pageSize: 20,
        actorUserId: 'user-123',
      };
      const expectedResult = {
        items: [],
        meta: { total: 0, page: 1, pageSize: 20 },
      };

      mockDataStore.listAuditLogs.mockResolvedValue(expectedResult);

      const result = await service.listAuditLogs(query);

      expect(mockDataStore.listAuditLogs).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty query parameters', async () => {
      const query: ListAuditQueryDto = {};
      const expectedResult = {
        items: [],
        meta: { total: 0, page: 1, pageSize: 20 },
      };

      mockDataStore.listAuditLogs.mockResolvedValue(expectedResult);

      const result = await service.listAuditLogs(query);

      expect(mockDataStore.listAuditLogs).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });
});

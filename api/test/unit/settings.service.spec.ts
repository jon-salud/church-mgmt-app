import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from '../../src/modules/settings/settings.service';
import { MockDatabaseService } from '../../src/mock/mock-database.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockDb: MockDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: MockDatabaseService,
          useValue: {
            getSettings: jest.fn(),
            updateSettings: jest.fn(),
            initializeSettings: jest.fn(),
            listRequestTypes: jest.fn(),
            createRequestType: jest.fn(),
            updateRequestType: jest.fn(),
            archiveRequestType: jest.fn(),
            updateRequestTypeStatus: jest.fn(),
            reorderRequestTypes: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    mockDb = module.get<MockDatabaseService>(MockDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should return settings for a church', async () => {
      const mockSettings = { id: '1', churchId: 'church-1', onboardingComplete: false };
      mockDb.getSettings = jest.fn().mockReturnValue(null);
      mockDb.initializeSettings = jest.fn().mockReturnValue(mockSettings);

      const result = await service.getSettings('church-1');

      expect(result).toEqual(mockSettings);
      expect(mockDb.initializeSettings).toHaveBeenCalledWith('church-1');
    });

    it('should return existing settings if they exist', async () => {
      const mockSettings = { id: '1', churchId: 'church-1', onboardingComplete: true };
      mockDb.getSettings = jest.fn().mockReturnValue(mockSettings);

      const result = await service.getSettings('church-1');

      expect(result).toEqual(mockSettings);
      expect(mockDb.initializeSettings).not.toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('should update settings for a church', async () => {
      const mockSettings = { id: '1', churchId: 'church-1', onboardingComplete: true };
      mockDb.updateSettings = jest.fn().mockReturnValue(mockSettings);

      const result = await service.updateSettings('church-1', { onboardingComplete: true });

      expect(result).toEqual(mockSettings);
      expect(mockDb.updateSettings).toHaveBeenCalledWith('church-1', { onboardingComplete: true });
    });
  });

  describe('getRequestTypes', () => {
    it('should return request types for a church', () => {
      const mockRequestTypes = [{ id: '1', name: 'Prayer', hasConfidentialField: true }];
      mockDb.listRequestTypes = jest.fn().mockReturnValue(mockRequestTypes);

      const result = service.getRequestTypes('church-1');

      expect(result).toEqual(mockRequestTypes);
      expect(mockDb.listRequestTypes).toHaveBeenCalledWith('church-1');
    });
  });

  describe('createRequestType', () => {
    it('should create a new request type', () => {
      const mockRequestType = { id: '1', name: 'New Request', hasConfidentialField: false };
      mockDb.createRequestType = jest.fn().mockReturnValue(mockRequestType);

      const result = service.createRequestType('New Request', false, 'user-1', 'Description');

      expect(result).toEqual(mockRequestType);
      expect(mockDb.createRequestType).toHaveBeenCalledWith(
        'New Request',
        false,
        'user-1',
        'Description'
      );
    });
  });

  describe('updateRequestType', () => {
    it('should update a request type', () => {
      mockDb.updateRequestType = jest.fn().mockReturnValue({ id: '1', name: 'Updated Request' });

      const result = service.updateRequestType('1', 'Updated Request', 'user-1');

      expect(result).toEqual({ id: '1', name: 'Updated Request' });
      expect(mockDb.updateRequestType).toHaveBeenCalledWith('1', 'Updated Request', 'user-1');
    });
  });

  describe('archiveRequestType', () => {
    it('should archive a request type', () => {
      mockDb.archiveRequestType = jest.fn().mockReturnValue({ id: '1', status: 'archived' });

      const result = service.archiveRequestType('1', 'user-1');

      expect(result).toEqual({ id: '1', status: 'archived' });
      expect(mockDb.archiveRequestType).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('updateRequestTypeStatus', () => {
    it('should update request type status', () => {
      mockDb.updateRequestTypeStatus = jest.fn().mockReturnValue({ id: '1', status: 'active' });

      const result = service.updateRequestTypeStatus('1', 'active', 'user-1');

      expect(result).toEqual({ id: '1', status: 'active' });
      expect(mockDb.updateRequestTypeStatus).toHaveBeenCalledWith('1', 'active', 'user-1');
    });
  });

  describe('reorderRequestTypes', () => {
    it('should reorder request types', () => {
      mockDb.reorderRequestTypes = jest.fn().mockReturnValue([{ id: '1' }, { id: '2' }]);

      const result = service.reorderRequestTypes(['1', '2'], 'user-1');

      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
      expect(mockDb.reorderRequestTypes).toHaveBeenCalledWith(['1', '2'], 'user-1');
    });
  });
});

import { AuditProjectionsService } from '../../src/modules/audit/projections.service';
import { IEventStore } from '../../src/common/event-store.interface';

describe('Audit Projections Service (Unit Tests)', () => {
  let service: AuditProjectionsService;
  let mockEventStore: Partial<IEventStore>;

  beforeEach(() => {
    mockEventStore = {
      query: jest.fn(),
    };

    // Manually instantiate with mock (no NestJS module needed for simple service)
    service = new AuditProjectionsService(mockEventStore as IEventStore);
  });

  describe('rebuildAuditReadModel', () => {
    it('should rebuild audit read model from events', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          aggregateId: 'church-1',
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: 1,
          timestamp: new Date('2024-01-01T10:00:00Z'),
          data: {
            actorUserId: 'user-1',
            actor: { id: 'user-1', name: 'Admin User' },
            action: 'CREATE',
            entity: 'User',
            entityId: 'user-new-1',
            summary: 'User created',
            diff: null,
            metadata: { source: 'web' },
          },
        },
        {
          id: 'event-2',
          aggregateId: 'church-1',
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: 2,
          timestamp: new Date('2024-01-01T11:00:00Z'),
          data: {
            actorUserId: 'user-2',
            actor: { id: 'user-2', name: 'Leader User' },
            action: 'UPDATE',
            entity: 'User',
            entityId: 'user-1',
            summary: 'User updated',
            diff: { role: { previous: 'Member', newValue: 'Leader' } },
            metadata: {},
          },
        },
      ];

      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: mockEvents,
        totalCount: 2,
        offset: 0,
        limit: 100,
      });

      const result = await service.rebuildAuditReadModel('church-1');

      expect(mockEventStore.query).toHaveBeenCalledWith({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
      });

      expect(result.length).toBe(2);
      expect(result[0] as Record<string, unknown>).toMatchObject({
        id: 'event-1',
        churchId: 'church-1',
        action: 'CREATE',
        entity: 'User',
        summary: 'User created',
      });
      expect(result[1] as Record<string, unknown>).toMatchObject({
        id: 'event-2',
        action: 'UPDATE',
        summary: 'User updated',
      });
    });

    it('should handle metadata gracefully when not provided', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          aggregateId: 'church-1',
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: 1,
          timestamp: new Date('2024-01-01T10:00:00Z'),
          data: {
            actorUserId: 'user-1',
            actor: undefined,
            action: 'CREATE',
            entity: 'User',
            entityId: 'user-1',
            summary: 'Created',
            diff: null,
            // metadata not provided
          },
        },
      ];

      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: mockEvents,
        totalCount: 1,
        offset: 0,
        limit: 100,
      });

      const result = await service.rebuildAuditReadModel('church-1');

      expect((result[0] as Record<string, unknown>).metadata).toEqual({});
    });

    it('should return empty array when no events found', async () => {
      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: [],
        totalCount: 0,
        offset: 0,
        limit: 100,
      });

      const result = await service.rebuildAuditReadModel('church-nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('rebuildAllAuditReadModels', () => {
    it('should rebuild audit read models for all churches', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          aggregateId: 'church-1',
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: 1,
          timestamp: new Date('2024-01-01T10:00:00Z'),
          data: {
            actorUserId: 'user-1',
            actor: { id: 'user-1', name: 'Admin' },
            action: 'CREATE',
            entity: 'User',
            entityId: 'user-1',
            summary: 'User created',
            diff: null,
            metadata: {},
          },
        },
        {
          id: 'event-2',
          aggregateId: 'church-2',
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: 1,
          timestamp: new Date('2024-01-01T11:00:00Z'),
          data: {
            actorUserId: 'user-2',
            actor: { id: 'user-2', name: 'Leader' },
            action: 'UPDATE',
            entity: 'Group',
            entityId: 'group-1',
            summary: 'Group updated',
            diff: { name: { previous: 'Old', newValue: 'New' } },
            metadata: {},
          },
        },
      ];

      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: mockEvents,
        totalCount: 2,
        offset: 0,
        limit: 100,
      });

      const result = await service.rebuildAllAuditReadModels();

      expect(mockEventStore.query).toHaveBeenCalledWith({
        aggregateType: 'AuditLog',
      });

      expect(result.size).toBe(2);
      expect(result.has('church-1')).toBe(true);
      expect(result.has('church-2')).toBe(true);

      const church1Entries = result.get('church-1')!;
      expect(church1Entries.length).toBe(1);
      expect((church1Entries[0] as Record<string, unknown>).entity).toBe('User');

      const church2Entries = result.get('church-2')!;
      expect(church2Entries.length).toBe(1);
      expect((church2Entries[0] as Record<string, unknown>).entity).toBe('Group');
    });

    it('should group events by churchId correctly', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          aggregateId: 'church-1',
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: 1,
          timestamp: new Date('2024-01-01T10:00:00Z'),
          data: {
            actorUserId: 'user-1',
            actor: undefined,
            action: 'CREATE',
            entity: 'User',
            entityId: 'user-1',
            summary: 'Created',
            diff: null,
            metadata: {},
          },
        },
        {
          id: 'event-2',
          aggregateId: 'church-1',
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: 2,
          timestamp: new Date('2024-01-01T11:00:00Z'),
          data: {
            actorUserId: 'user-1',
            actor: undefined,
            action: 'UPDATE',
            entity: 'User',
            entityId: 'user-1',
            summary: 'Updated',
            diff: null,
            metadata: {},
          },
        },
      ];

      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: mockEvents,
        totalCount: 2,
        offset: 0,
        limit: 100,
      });

      const result = await service.rebuildAllAuditReadModels();

      expect(result.size).toBe(1);
      const entries = result.get('church-1')!;
      expect(entries.length).toBe(2);
      expect((entries[0] as Record<string, unknown>).action).toBe('CREATE');
      expect((entries[1] as Record<string, unknown>).action).toBe('UPDATE');
    });

    it('should return empty map when no events found', async () => {
      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: [],
        totalCount: 0,
        offset: 0,
        limit: 100,
      });

      const result = await service.rebuildAllAuditReadModels();

      expect(result.size).toBe(0);
    });
  });

  describe('getAuditEventCount', () => {
    it('should return count of audit events for a specific church', async () => {
      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: Array(5).fill({}),
        totalCount: 5,
        offset: 0,
        limit: 100,
      });

      const count = await service.getAuditEventCount('church-1');

      expect(count).toBe(5);
      expect(mockEventStore.query).toHaveBeenCalledWith({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
      });
    });

    it('should return total count for all churches when churchId not provided', async () => {
      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: Array(10).fill({}),
        totalCount: 10,
        offset: 0,
        limit: 100,
      });

      const count = await service.getAuditEventCount();

      expect(count).toBe(10);
      expect(mockEventStore.query).toHaveBeenCalledWith({
        aggregateId: undefined,
        aggregateType: 'AuditLog',
      });
    });

    it('should return 0 when no events found', async () => {
      (mockEventStore.query as jest.Mock).mockResolvedValue({
        events: [],
        totalCount: 0,
        offset: 0,
        limit: 100,
      });

      const count = await service.getAuditEventCount('church-nonexistent');

      expect(count).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should propagate error when event store query fails', async () => {
      const error = new Error('Event store read failed');
      (mockEventStore.query as jest.Mock).mockRejectedValue(error);

      await expect(service.rebuildAuditReadModel('church-1')).rejects.toThrow(
        'Event store read failed'
      );
    });

    it('should handle errors in rebuildAllAuditReadModels', async () => {
      const error = new Error('Event store failed');
      (mockEventStore.query as jest.Mock).mockRejectedValue(error);

      await expect(service.rebuildAllAuditReadModels()).rejects.toThrow('Event store failed');
    });
  });
});

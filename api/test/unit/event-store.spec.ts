import { FileEventStoreService } from '../../src/event-store/file-event-store.service';
import { DomainEvent } from '../../src/common/event-store.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Event Store (Unit Tests)', () => {
  let eventStore: FileEventStoreService;
  const testFilePath = 'storage/test-event-store.ndjson';

  beforeEach(async () => {
    // Clean up test file before each test
    try {
      await fs.unlink(testFilePath);
    } catch (error) {
      // File may not exist yet, that's fine
    }
    eventStore = new FileEventStoreService(testFilePath);
  });

  afterEach(async () => {
    // Clean up test file after each test
    if (eventStore.clear) {
      await eventStore.clear();
    }
  });

  describe('append', () => {
    it('should append a domain event to the store', async () => {
      const event = await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: {
          action: 'CREATE',
          entity: 'User',
          entityId: 'user-1',
          summary: 'User created',
        },
      });

      expect(event).toHaveProperty('id');
      expect(event.id).toBeTruthy();
      expect(event.aggregateId).toBe('church-1');
      expect(event.aggregateType).toBe('AuditLog');
      expect(event.eventType).toBe('AuditLogCreated');
      expect(event.version).toBe(1);
      expect(event.data.action).toBe('CREATE');
    });

    it('should generate a unique ID for each event', async () => {
      const event1 = await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: { action: 'CREATE' },
      });

      const event2 = await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 2,
        data: { action: 'UPDATE' },
      });

      expect(event1.id).not.toBe(event2.id);
    });

    it('should set timestamp on appended event', async () => {
      const beforeTime = new Date();
      const event = await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: { action: 'CREATE' },
      });
      const afterTime = new Date();

      expect(event.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(event.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('query', () => {
    beforeEach(async () => {
      // Add test data
      await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: { action: 'CREATE', entity: 'User' },
      });

      await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 2,
        data: { action: 'UPDATE', entity: 'User' },
      });

      await eventStore.append({
        aggregateId: 'church-2',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: { action: 'DELETE', entity: 'Group' },
      });
    });

    it('should query all events when no options provided', async () => {
      const result = await eventStore.query();
      expect(result.events.length).toBe(3);
      expect(result.totalCount).toBe(3);
    });

    it('should filter events by aggregateId', async () => {
      const result = await eventStore.query({ aggregateId: 'church-1' });
      expect(result.events.length).toBe(2);
      expect(result.events.every(e => e.aggregateId === 'church-1')).toBe(true);
    });

    it('should filter events by aggregateType', async () => {
      const result = await eventStore.query({ aggregateType: 'AuditLog' });
      expect(result.events.length).toBe(3);
    });

    it('should filter events by eventType', async () => {
      const result = await eventStore.query({ eventType: 'AuditLogCreated' });
      expect(result.events.length).toBe(3);
    });

    it('should support pagination with limit and offset', async () => {
      const result = await eventStore.query({ limit: 2, offset: 0 });
      expect(result.events.length).toBe(2);
      expect(result.limit).toBe(2);
      expect(result.offset).toBe(0);
      expect(result.totalCount).toBe(3);
    });

    it('should filter by version range', async () => {
      const result = await eventStore.query({
        aggregateId: 'church-1',
        fromVersion: 1,
        toVersion: 1,
      });
      expect(result.events.length).toBe(1);
      expect(result.events[0].version).toBe(1);
    });

    it('should combine multiple filters', async () => {
      const result = await eventStore.query({
        aggregateId: 'church-1',
        eventType: 'AuditLogCreated',
        limit: 1,
      });
      expect(result.events.length).toBe(1);
      expect(result.events[0].aggregateId).toBe('church-1');
    });
  });

  describe('getByAggregateId', () => {
    beforeEach(async () => {
      await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: { action: 'CREATE' },
      });

      await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogUpdated',
        version: 2,
        data: { action: 'UPDATE' },
      });
    });

    it('should retrieve all events for an aggregate sorted by version', async () => {
      const events = await eventStore.getByAggregateId('church-1', 'AuditLog');
      expect(events.length).toBe(2);
      expect(events[0].version).toBe(1);
      expect(events[1].version).toBe(2);
    });

    it('should return empty array when aggregate not found', async () => {
      const events = await eventStore.getByAggregateId('church-nonexistent', 'AuditLog');
      expect(events).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all events (for testing)', async () => {
      await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: { action: 'CREATE' },
      });

      let result = await eventStore.query();
      expect(result.events.length).toBe(1);

      if (eventStore.clear) {
        await eventStore.clear();
      }

      result = await eventStore.query();
      expect(result.events.length).toBe(0);
    });
  });

  describe('concurrency and edge cases', () => {
    it('should handle empty event store gracefully', async () => {
      const result = await eventStore.query();
      expect(result.events).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should preserve event order on disk', async () => {
      const events = [];
      for (let i = 1; i <= 5; i++) {
        const event = await eventStore.append({
          aggregateId: 'church-1',
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: i,
          data: { action: `Action${i}` },
        });
        events.push(event);
      }

      const queryResult = await eventStore.query({
        aggregateId: 'church-1',
      });

      expect(queryResult.events.length).toBe(5);
      queryResult.events.forEach((e, idx) => {
        expect(e.version).toBe(idx + 1);
        expect(e.data.action).toBe(`Action${idx + 1}`);
      });
    });

    it('should handle large event payloads', async () => {
      const largeData = {
        action: 'CREATE',
        diff: {
          previous: { field: 'a'.repeat(10000) },
          newValue: { field: 'b'.repeat(10000) },
        },
      };

      const event = await eventStore.append({
        aggregateId: 'church-1',
        aggregateType: 'AuditLog',
        eventType: 'AuditLogCreated',
        version: 1,
        data: largeData,
      });

      const retrieved = await eventStore.getByAggregateId('church-1', 'AuditLog');
      expect(retrieved.length).toBe(1);
      expect(retrieved[0].data.diff).toEqual(largeData.diff);
    });
  });
});

import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
  DomainEvent,
  EventStoreQueryOptions,
  EventStoreQueryResult,
  IEventStore,
} from '../common/event-store.interface';

/**
 * File-based Event Store Implementation (NDJSON format)
 *
 * Appends events to a newline-delimited JSON file for durability and auditability.
 * Suitable for MVP and demo environments with moderate event volume.
 *
 * Events are stored as one JSON object per line (NDJSON):
 * ```
 * {"id":"...","aggregateId":"...","eventType":"AuditLogCreated",...}
 * {"id":"...","aggregateId":"...","eventType":"AuditLogUpdated",...}
 * ```
 *
 * Thread safety: File I/O is handled sequentially via Node.js fs promises.
 */
@Injectable()
export class FileEventStoreService implements IEventStore {
  private readonly logger = new Logger(FileEventStoreService.name);
  private readonly filePath: string;

  constructor(filePath: string = 'storage/event-store.ndjson') {
    this.filePath = filePath;
    this.ensureFile();
  }

  private async ensureFile(): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, '');
        this.logger.log(`Event store file created at ${this.filePath}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure event store file: ${error instanceof Error ? error.message : 'unknown error'}`
      );
      throw error;
    }
  }

  async append(event: Omit<DomainEvent, 'id' | 'timestamp'>): Promise<DomainEvent> {
    const domainEvent: DomainEvent = {
      ...event,
      id: randomUUID(),
      timestamp: new Date(),
    };

    try {
      const line = JSON.stringify(domainEvent);
      await fs.appendFile(this.filePath, line + '\n');
      this.logger.debug(
        `Event appended: ${domainEvent.aggregateType}/${domainEvent.eventType} (id: ${domainEvent.id})`
      );
      return domainEvent;
    } catch (error) {
      this.logger.error(
        `Failed to append event: ${error instanceof Error ? error.message : 'unknown error'}`
      );
      throw error;
    }
  }

  async query(options?: EventStoreQueryOptions): Promise<EventStoreQueryResult> {
    try {
      let content = '';
      try {
        content = await fs.readFile(this.filePath, 'utf-8');
      } catch {
        // File doesn't exist yet, return empty result
        return {
          events: [],
          totalCount: 0,
          offset: options?.offset ?? 0,
          limit: options?.limit ?? 100,
        };
      }

      const lines = content.split('\n').filter(line => line.trim().length > 0);

      let events: DomainEvent[] = lines.map(line => JSON.parse(line));

      // Apply filters
      if (options?.aggregateId) {
        events = events.filter(e => e.aggregateId === options.aggregateId);
      }
      if (options?.aggregateType) {
        events = events.filter(e => e.aggregateType === options.aggregateType);
      }
      if (options?.eventType) {
        events = events.filter(e => e.eventType === options.eventType);
      }
      if (options?.fromVersion !== undefined) {
        events = events.filter(e => e.version >= options.fromVersion!);
      }
      if (options?.toVersion !== undefined) {
        events = events.filter(e => e.version <= options.toVersion!);
      }

      const totalCount = events.length;

      // Apply pagination
      const offset = options?.offset ?? 0;
      const limit = options?.limit ?? totalCount;
      const paginatedEvents = events.slice(offset, offset + limit);

      return {
        events: paginatedEvents,
        totalCount,
        offset,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Failed to query events: ${error instanceof Error ? error.message : 'unknown error'}`
      );
      throw error;
    }
  }

  async getByAggregateId(aggregateId: string, aggregateType: string): Promise<DomainEvent[]> {
    const result = await this.query({
      aggregateId,
      aggregateType,
    });
    return result.events.sort((a: DomainEvent, b: DomainEvent) => a.version - b.version);
  }

  async clear(): Promise<void> {
    try {
      await fs.writeFile(this.filePath, '');
      this.logger.log('Event store cleared (testing only)');
    } catch (error) {
      this.logger.error(
        `Failed to clear event store: ${error instanceof Error ? error.message : 'unknown error'}`
      );
      throw error;
    }
  }
}

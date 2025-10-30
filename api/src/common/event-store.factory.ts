import { Injectable } from '@nestjs/common';
import { FileEventStoreService } from '../event-store/file-event-store.service';
import { IEventStore } from './event-store.interface';

/**
 * Factory to select the appropriate event store implementation
 * based on the EVENT_STORE_MODE environment variable.
 *
 * Currently supports: file (NDJSON)
 * Future: prisma (Prisma database events table)
 */
@Injectable()
export class EventStoreFactory {
  static create(mode: string = 'file'): IEventStore {
    switch (mode.toLowerCase()) {
      case 'file':
        return new FileEventStoreService('storage/event-store.ndjson');
      case 'prisma':
        // TODO: Implement PrismaEventStoreService in Sprint 7
        throw new Error('Prisma event store not yet implemented');
      default:
        throw new Error(`Unknown event store mode: ${mode}. Supported modes: file, prisma`);
    }
  }
}

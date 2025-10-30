import { Injectable, Logger } from '@nestjs/common';
import { InMemoryCacheService } from '../cache-store/in-memory-cache.service';
import { ICacheStore } from '../common/cache-store.interface';

/**
 * Factory to select the appropriate cache store implementation
 * based on the CACHE_MODE environment variable.
 *
 * Currently supports: memory (in-memory with LRU eviction)
 * Future: redis (Redis-backed caching)
 */
@Injectable()
export class CacheFactory {
  private static readonly logger = new Logger(CacheFactory.name);

  static create(mode: string = 'memory'): ICacheStore {
    switch (mode.toLowerCase()) {
      case 'memory':
        this.logger.log('Cache store: In-memory (CACHE_MODE=memory)');
        return new InMemoryCacheService();
      case 'redis':
        // TODO: Implement RedisCacheService in Sprint 6B.2 phase 2
        throw new Error(
          'Redis cache store not yet implemented. Set CACHE_MODE=memory or implement RedisCacheService.'
        );
      default:
        this.logger.warn(
          `Unknown cache mode: ${mode}. Defaulting to in-memory. Supported modes: memory, redis`
        );
        return new InMemoryCacheService();
    }
  }
}

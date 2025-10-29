import { Injectable, Logger } from '@nestjs/common';
import { ICacheStore, CacheGetOptions, CacheSetOptions } from '../common/cache-store.interface';

interface CacheEntry<T> {
  value: T;
  expiresAt?: number;
  createdAt: number;
}

/**
 * In-Memory Cache Store Service
 *
 * Default caching implementation for development and testing.
 * Features:
 * - TTL support (automatic expiration)
 * - LRU eviction when max size reached
 * - Namespace isolation for logical separation
 * - Cache statistics for monitoring
 */
@Injectable()
export class InMemoryCacheService implements ICacheStore {
  private readonly logger = new Logger(InMemoryCacheService.name);
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats = { hits: 0, misses: 0 };
  private readonly maxSize = 1000; // Maximum number of cache entries
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup routine to remove expired entries every 60 seconds
    this.startCleanupRoutine();
  }

  async get<T = unknown>(key: string, options?: CacheGetOptions): Promise<T | undefined> {
    const fullKey = this.buildKey(key, options?.namespace);

    const entry = this.cache.get(fullKey) as CacheEntry<T> | undefined;
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if entry has expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(fullKey);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return entry.value;
  }

  async set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.namespace);

    // Enforce max size with LRU eviction
    if (this.cache.size >= this.maxSize && !this.cache.has(fullKey)) {
      this.evictLRU();
    }

    const expiresAt = options?.ttl ? Date.now() + options.ttl * 1000 : undefined;
    this.cache.set(fullKey, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  async delete(key: string, options?: CacheGetOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.namespace);
    this.cache.delete(fullKey);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  async getStats(): Promise<{ hits: number; misses: number; size: number; entries: number }> {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
        : 'N/A';

    this.logger.debug(
      `Cache stats - Hits: ${this.stats.hits}, Misses: ${this.stats.misses}, Hit Rate: ${hitRate}%, Entries: ${this.cache.size}`
    );

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      entries: this.cache.size,
    };
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Build full cache key with namespace
   */
  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Evict least recently used entry (based on access time via createdAt)
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.logger.debug(`Evicted cache entry: ${oldestKey}`);
    }
  }

  /**
   * Periodically clean up expired entries
   */
  private startCleanupRoutine(): void {
    this.cleanupInterval = setInterval(() => {
      let removed = 0;
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
          this.cache.delete(key);
          removed++;
        }
      }
      if (removed > 0) {
        this.logger.debug(`Cleaned up ${removed} expired cache entries`);
      }
    }, 60000); // Run every 60 seconds
  }
}

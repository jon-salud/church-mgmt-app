/**
 * Cache Store Interface
 *
 * Defines the contract for caching implementations.
 * Supports multiple backends: in-memory, Redis, etc.
 *
 * Used for:
 * - Reducing database queries (especially for audit logs and frequently accessed data)
 * - Improving API response times
 * - Reducing load on data store during peak usage
 */

export interface CacheGetOptions {
  /**
   * Namespace to isolate cache entries across different domains
   * Example: 'audit-logs:church-1', 'users:church-1'
   */
  namespace?: string;
}

export interface CacheSetOptions {
  namespace?: string;
  /**
   * Time to live in seconds (0 = no expiration)
   */
  ttl?: number;
}

/**
 * ICacheStore interface for abstracting caching implementations.
 *
 * - get: Retrieve cached value by key
 * - set: Store value with optional TTL
 * - delete: Remove specific cached entry
 * - clear: Clear all cached entries (for testing)
 */
export interface ICacheStore {
  /**
   * Get a value from the cache.
   * @param key The cache key
   * @param options Get options (namespace)
   * @returns The cached value or undefined if not found/expired
   */
  get<T = unknown>(key: string, options?: CacheGetOptions): Promise<T | undefined>;

  /**
   * Set a value in the cache.
   * @param key The cache key
   * @param value The value to cache
   * @param options Set options (namespace, TTL)
   */
  set<T = unknown>(key: string, value: T, options?: CacheSetOptions): Promise<void>;

  /**
   * Delete a specific cached entry.
   * @param key The cache key to delete
   * @param options Delete options (namespace)
   */
  delete(key: string, options?: CacheGetOptions): Promise<void>;

  /**
   * Clear all cached entries (for testing and cleanup).
   */
  clear?(): Promise<void>;

  /**
   * Get cache statistics (hits, misses, size) for monitoring
   */
  getStats?(): Promise<{
    hits: number;
    misses: number;
    size: number;
    entries: number;
  }>;
}

export const CACHE_STORE = Symbol('CACHE_STORE');

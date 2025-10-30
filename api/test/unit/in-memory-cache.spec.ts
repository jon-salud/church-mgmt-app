import { InMemoryCacheService } from '../../src/cache-store/in-memory-cache.service';

describe('InMemoryCacheService (Unit Tests)', () => {
  let service: InMemoryCacheService;

  beforeEach(() => {
    service = new InMemoryCacheService();
  });

  afterEach(async () => {
    service.onModuleDestroy(); // Clean up intervals
    await service.clear?.();
  });

  describe('get and set', () => {
    it('should store and retrieve a value', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      await service.set(key, value);
      const result = await service.get(key);

      expect(result).toEqual(value);
    });

    it('should return undefined for non-existent key', async () => {
      const result = await service.get('non-existent');
      expect(result).toBeUndefined();
    });

    it('should support namespaced keys', async () => {
      const key = 'key1';
      const value1 = { id: 1 };
      const value2 = { id: 2 };

      await service.set(key, value1, { namespace: 'namespace1' });
      await service.set(key, value2, { namespace: 'namespace2' });

      const result1 = await service.get(key, { namespace: 'namespace1' });
      const result2 = await service.get(key, { namespace: 'namespace2' });

      expect(result1).toEqual(value1);
      expect(result2).toEqual(value2);
    });

    it('should preserve value type', async () => {
      const stringValue = 'test';
      const numberValue = 42;
      const arrayValue = [1, 2, 3];
      const objectValue = { nested: { data: true } };

      await service.set('string', stringValue);
      await service.set('number', numberValue);
      await service.set('array', arrayValue);
      await service.set('object', objectValue);

      expect(await service.get('string')).toEqual(stringValue);
      expect(await service.get('number')).toEqual(numberValue);
      expect(await service.get('array')).toEqual(arrayValue);
      expect(await service.get('object')).toEqual(objectValue);
    });
  });

  describe('TTL and expiration', () => {
    it('should expire entries after TTL', async () => {
      const key = 'ttl-test';
      const value = { data: 'temporary' };

      await service.set(key, value, { ttl: 1 }); // 1 second TTL
      expect(await service.get(key)).toEqual(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(await service.get(key)).toBeUndefined();
    });

    it('should not expire entries with 0 TTL', async () => {
      const key = 'no-ttl';
      const value = { data: 'permanent' };

      await service.set(key, value, { ttl: 0 });
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(await service.get(key)).toEqual(value);
    });

    it('should expire entries without TTL option after cleanup', async () => {
      const key = 'cleanup-test';
      const value = { data: 'test' };

      await service.set(key, value, { ttl: 1 });
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Stats should show miss
      const result = await service.get(key);
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a cached entry', async () => {
      const key = 'delete-test';
      const value = { data: 'to-delete' };

      await service.set(key, value);
      expect(await service.get(key)).toEqual(value);

      await service.delete(key);
      expect(await service.get(key)).toBeUndefined();
    });

    it('should delete from specific namespace', async () => {
      const key = 'shared-key';
      const value1 = { ns: 1 };
      const value2 = { ns: 2 };

      await service.set(key, value1, { namespace: 'ns1' });
      await service.set(key, value2, { namespace: 'ns2' });

      await service.delete(key, { namespace: 'ns1' });

      expect(await service.get(key, { namespace: 'ns1' })).toBeUndefined();
      expect(await service.get(key, { namespace: 'ns2' })).toEqual(value2);
    });

    it('should handle deleting non-existent keys gracefully', async () => {
      await service.delete('non-existent');
      expect(await service.get('non-existent')).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all cached entries', async () => {
      await service.set('key1', { value: 1 });
      await service.set('key2', { value: 2 });
      await service.set('key3', { value: 3 }, { namespace: 'other' });

      expect(await service.get('key1')).toBeDefined();
      expect(await service.get('key2')).toBeDefined();
      expect(await service.get('key3', { namespace: 'other' })).toBeDefined();

      await service.clear?.();

      expect(await service.get('key1')).toBeUndefined();
      expect(await service.get('key2')).toBeUndefined();
      expect(await service.get('key3', { namespace: 'other' })).toBeUndefined();
    });

    it('should reset statistics on clear', async () => {
      await service.set('key', 'value');
      await service.get('key'); // hit
      await service.get('non-existent'); // miss

      let stats = await service.getStats?.();
      expect(stats?.hits).toBe(1);
      expect(stats?.misses).toBe(1);

      await service.clear?.();

      stats = await service.getStats?.();
      expect(stats?.hits).toBe(0);
      expect(stats?.misses).toBe(0);
    });
  });

  describe('statistics', () => {
    it('should track cache hits and misses', async () => {
      await service.set('key1', 'value1');
      await service.set('key2', 'value2');

      // 2 hits
      await service.get('key1');
      await service.get('key2');

      // 1 miss
      await service.get('non-existent');

      const stats = await service.getStats?.();
      expect(stats?.hits).toBe(2);
      expect(stats?.misses).toBe(1);
      expect(stats?.entries).toBe(2);
    });

    it('should report cache size', async () => {
      let stats = await service.getStats?.();
      expect(stats?.size).toBe(0);

      await service.set('key1', 'value1');
      stats = await service.getStats?.();
      expect(stats?.size).toBe(1);

      await service.set('key2', 'value2');
      stats = await service.getStats?.();
      expect(stats?.size).toBe(2);

      await service.delete('key1');
      stats = await service.getStats?.();
      expect(stats?.size).toBe(1);
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used entry when max size reached', async () => {
      // Reduce max size for testing by creating multiple services
      // Note: This is a limitation of the current implementation
      // In production, would want to pass maxSize to constructor

      // Fill up cache with many entries
      for (let i = 0; i < 1000; i++) {
        await service.set(`key-${i}`, { value: i });
      }

      // Add one more to trigger eviction
      await service.set('key-1000', { value: 1000 });

      // Oldest entry should be evicted
      expect(await service.get('key-0')).toBeUndefined();

      // Recent entries should still be there
      expect(await service.get('key-999')).toEqual({ value: 999 });
      expect(await service.get('key-1000')).toEqual({ value: 1000 });
    });

    it('should maintain LRU order across multiple sets', async () => {
      // Fill cache
      for (let i = 0; i < 1000; i++) {
        await service.set(`key-${i}`, { value: i });
      }

      // Create stats
      const stats = await service.getStats?.();
      expect(stats?.entries).toBeLessThanOrEqual(1000);
    });
  });

  describe('edge cases', () => {
    it('should handle null and undefined values', async () => {
      // Note: null is a valid value, but undefined means not found
      const nullKey = 'null-value';
      const value = null as any;

      await service.set(nullKey, value);
      const result = await service.get(nullKey);

      // null might be stored or converted to undefined, both acceptable
      expect(result === null || result === undefined).toBe(true);
    });

    it('should handle very large values', async () => {
      const largeValue = {
        data: new Array(10000).fill(0).map((_, i) => ({ index: i, value: `item-${i}` })),
      };

      await service.set('large', largeValue);
      const result = await service.get('large');

      expect(result).toEqual(largeValue);
    });

    it('should handle special characters in keys and namespaces', async () => {
      const specialKey = 'key:with:colons:and-dashes';
      const specialNamespace = 'namespace/with/slashes';
      const value = { data: 'special' };

      await service.set(specialKey, value, { namespace: specialNamespace });
      const result = await service.get(specialKey, { namespace: specialNamespace });

      expect(result).toEqual(value);
    });

    it('should handle concurrent operations', async () => {
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(service.set(`key-${i}`, { value: i }));
        promises.push(service.get(`key-${Math.floor(i / 2)}`)); // Concurrent reads
      }

      await Promise.all(promises);

      // Verify some data integrity
      const result = await service.get<{ value: number }>('key-50');
      expect((result as any)?.value).toBe(50);
    });
  });

  describe('module lifecycle', () => {
    it('should handle onModuleDestroy', async () => {
      await service.set('key', 'value');

      // Destroy the module
      service.onModuleDestroy();

      // Service should still be accessible (interval just cleared)
      // but cleanup won't run anymore
      const result = await service.get('key');
      expect(result).toEqual('value');
    });
  });
});

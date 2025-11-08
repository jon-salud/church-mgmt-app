'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface UseUrlStateOptions<T> {
  replace?: boolean;
  shallow?: boolean;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

type SetStateAction<T> = T | ((prevState: T) => T);

/**
 * Hook for managing state via URL search parameters
 *
 * @param key - The URL parameter key
 * @param defaultValue - Default value when param doesn't exist
 * @param options - Configuration options
 * @returns Tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * const [page, setPage] = useUrlState('page', 1);
 * const [search, setSearch] = useUrlState('search', '');
 *
 * // With custom serialization
 * const [filters, setFilters] = useUrlState('filters', {}, {
 *   serialize: JSON.stringify,
 *   deserialize: JSON.parse
 * });
 * ```
 */
export function useUrlState<T>(
  key: string,
  defaultValue: T,
  options?: UseUrlStateOptions<T>
): [T, (value: SetStateAction<T>) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();

  const serialize = options?.serialize ?? ((value: T) => String(value));
  const deserialize = options?.deserialize ?? ((value: string) => value as T);

  // Get current value from URL or use default
  const value = useMemo(() => {
    const paramValue = searchParams.get(key);
    if (paramValue === null) {
      return defaultValue;
    }
    try {
      return deserialize(paramValue);
    } catch {
      return defaultValue;
    }
  }, [searchParams, key, defaultValue, deserialize]);

  const setValue = useCallback(
    (newValue: SetStateAction<T>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Resolve new value (handle functional updates)
      const resolvedValue =
        typeof newValue === 'function' ? (newValue as (prevState: T) => T)(value) : newValue;

      // Check if value equals default (should remove from URL)
      const isDefault =
        resolvedValue === defaultValue ||
        resolvedValue === null ||
        (resolvedValue === '' && defaultValue === '');

      if (isDefault) {
        params.delete(key);
      } else {
        const serialized = serialize(resolvedValue);
        const currentParam = params.get(key);

        // Only update if value actually changed
        if (currentParam === serialized) {
          return;
        }

        params.set(key, serialized);
      }

      const url = `?${params.toString()}`;

      if (options?.replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [searchParams, key, value, defaultValue, serialize, options?.replace, router]
  );

  return [value, setValue];
}

/**
 * Members Query State Hook
 * Manages URL-synced query parameters for the members list
 * Phase 1: Discoverability & Speed
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export interface MembersQueryState {
  page: number;
  limit: number;
  sort: string;
  search: string;
  status: string;
  role: string;
  lastAttendance: string;
  groupsCountMin: string;
  hasEmail: string;
  hasPhone: string;
}

const DEFAULT_QUERY_STATE: MembersQueryState = {
  page: 1,
  limit: 25,
  sort: 'name:asc',
  search: '',
  status: '',
  role: '',
  lastAttendance: '',
  groupsCountMin: '',
  hasEmail: '',
  hasPhone: '',
};

/**
 * Hook to manage members list query state synced with URL
 * All filters are persisted in URL query params for shareability
 */
export function useMembersQueryState() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse current state from URL
  const queryState = useMemo<MembersQueryState>(() => {
    return {
      page: parseInt(searchParams.get('page') || String(DEFAULT_QUERY_STATE.page), 10),
      limit: parseInt(searchParams.get('limit') || String(DEFAULT_QUERY_STATE.limit), 10),
      sort: searchParams.get('sort') || DEFAULT_QUERY_STATE.sort,
      search: searchParams.get('search') || DEFAULT_QUERY_STATE.search,
      status: searchParams.get('status') || DEFAULT_QUERY_STATE.status,
      role: searchParams.get('role') || DEFAULT_QUERY_STATE.role,
      lastAttendance: searchParams.get('lastAttendance') || DEFAULT_QUERY_STATE.lastAttendance,
      groupsCountMin: searchParams.get('groupsCountMin') || DEFAULT_QUERY_STATE.groupsCountMin,
      hasEmail: searchParams.get('hasEmail') || DEFAULT_QUERY_STATE.hasEmail,
      hasPhone: searchParams.get('hasPhone') || DEFAULT_QUERY_STATE.hasPhone,
    };
  }, [searchParams]);

  const updateQuery = useCallback(
    (updates: Partial<MembersQueryState>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Reset to page 1 when filters change (except when explicitly setting page)
      const resetPage = !('page' in updates);
      if (resetPage) {
        params.set('page', '1');
      }

      // Apply all updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams();
    // Preserve only page size preference
    params.set('limit', String(queryState.limit));
    params.set('page', '1');
    params.set('sort', DEFAULT_QUERY_STATE.sort);
    router.push(`?${params.toString()}`);
  }, [queryState.limit, router]);

  const hasActiveFilters = useMemo(() => {
    return (
      queryState.search !== '' ||
      queryState.status !== '' ||
      queryState.role !== '' ||
      queryState.lastAttendance !== '' ||
      queryState.groupsCountMin !== '' ||
      queryState.hasEmail !== '' ||
      queryState.hasPhone !== ''
    );
  }, [queryState]);

  return {
    queryState,
    updateQuery,
    resetFilters,
    hasActiveFilters,
  };
}

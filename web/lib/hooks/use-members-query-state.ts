'use client';

import { useUrlState } from './use-url-state';
import type { FilterState } from '@/components/filters/filter-dropdown';

/**
 * Hook for managing member filter state via URL parameters
 *
 * Manages:
 * - roles: Array of role IDs (comma-separated in URL)
 * - status: Status string (active/invited/inactive)
 *
 * @returns Tuple of [filters, setFilters, removeFilter, clearFilters]
 */
export function useMembersQueryState() {
  const [roles, setRoles] = useUrlState<string>('roles', '', {
    serialize: (value: string) => value,
    deserialize: (value: string) => value,
  });

  const [status, setStatus] = useUrlState<string>('status', '', {
    serialize: (value: string) => value,
    deserialize: (value: string) => value,
  });

  const filters: FilterState = {
    roles: roles ? roles.split(',').filter(Boolean) : [],
    status: status || '',
  };

  const setFilters = (newFilters: FilterState) => {
    // Update URL parameters
    setRoles(newFilters.roles.join(','));
    setStatus(newFilters.status);
  };

  const removeFilter = (filterType: 'role' | 'status', value?: string) => {
    if (filterType === 'role' && value) {
      const newRoles = filters.roles.filter(id => id !== value);
      setRoles(newRoles.join(','));
    } else if (filterType === 'status') {
      setStatus('');
    }
  };

  const clearFilters = () => {
    setRoles('');
    setStatus('');
  };

  return { filters, setFilters, removeFilter, clearFilters };
}

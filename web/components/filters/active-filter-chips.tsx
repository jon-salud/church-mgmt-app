'use client';

import { Button } from '@/components/ui-flowbite/button';
import type { FilterState, RoleOption } from './filter-dropdown';

interface ActiveFilterChipsProps {
  filters: FilterState;
  roles: RoleOption[];
  onRemove: (filterType: 'role' | 'status', value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  roles,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  const selectedRoles = filters.roles
    .map(roleId => roles.find(r => r.id === roleId))
    .filter(Boolean);
  const hasActiveFilters = selectedRoles.length > 0 || filters.status;

  if (!hasActiveFilters) {
    return null;
  }

  const statusLabel = filters.status
    ? filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Active filters">
      {selectedRoles.map(role => {
        if (!role) return null;
        return (
          <div
            key={role.id}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
          >
            <span>{role.name}</span>
            <button
              type="button"
              onClick={() => onRemove('role', role.id)}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label={`Remove ${role.name} filter`}
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        );
      })}

      {statusLabel && (
        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm">
          <span>Status: {statusLabel}</span>
          <button
            type="button"
            onClick={() => onRemove('status')}
            className="hover:bg-primary/20 rounded-full p-0.5"
            aria-label="Remove status filter"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {hasActiveFilters && (
        <Button
          size="sm"
          onClick={onClearAll}
          aria-label="Clear all filters"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Clear All
        </Button>
      )}
    </div>
  );
}

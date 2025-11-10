'use client';

import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui-flowbite/dialog';

interface FilterState {
  status?: string;
  role?: string;
  lastAttendance?: string;
  hasEmail?: string;
  hasPhone?: string;
  groupsCountMin?: string;
}

interface RoleOption {
  id: string;
  name: string;
}

interface FilterDropdownProps {
  filters: FilterState;
  roles: RoleOption[];
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearAll: () => void;
}

export function FilterDropdown({
  filters,
  roles,
  onFilterChange,
  onClearAll,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.role) count++;
    if (filters.lastAttendance) count++;
    if (filters.hasEmail === 'true') count++;
    if (filters.hasPhone === 'true') count++;
    if (filters.groupsCountMin) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Filter form content (shared between mobile sheet and desktop popover)
  const FilterForm = () => (
    <div className="space-y-4">
      {/* Status */}
      <div>
        <label className="block text-xs font-medium mb-2">Status</label>
        <select
          value={filters.status || ''}
          onChange={e => onFilterChange({ status: e.target.value || undefined })}
          className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Role */}
      <div>
        <label className="block text-xs font-medium mb-2">Role</label>
        <select
          value={filters.role || ''}
          onChange={e => onFilterChange({ role: e.target.value || undefined })}
          className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="">All</option>
          {roles.map(r => (
            <option key={r.id} value={r.name.toLowerCase()}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Last Attendance */}
      <div>
        <label className="block text-xs font-medium mb-2">Last Attendance</label>
        <select
          value={filters.lastAttendance || ''}
          onChange={e => onFilterChange({ lastAttendance: e.target.value || undefined })}
          className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="">Any</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="60d">Last 60 days</option>
          <option value="90d">Last 90 days</option>
          <option value="never">Never</option>
        </select>
      </div>

      {/* Min Groups */}
      <div>
        <label className="block text-xs font-medium mb-2">Group Involvement</label>
        <select
          value={filters.groupsCountMin || ''}
          onChange={e => onFilterChange({ groupsCountMin: e.target.value || undefined })}
          className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="">Any</option>
          <option value="1">At least 1 group</option>
          <option value="2">At least 2 groups</option>
          <option value="3">At least 3 groups</option>
          <option value="5">At least 5 groups</option>
        </select>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 border-t border-border pt-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hasEmail === 'true'}
            onChange={e => onFilterChange({ hasEmail: e.target.checked ? 'true' : undefined })}
            className="rounded border-border"
          />
          <span className="text-sm">Has Email</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.hasPhone === 'true'}
            onChange={e => onFilterChange({ hasPhone: e.target.checked ? 'true' : undefined })}
            className="rounded border-border"
          />
          <span className="text-sm">Has Phone</span>
        </label>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <button
          type="button"
          onClick={() => {
            onClearAll();
            setIsOpen(false);
          }}
          disabled={!hasActiveFilters}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Apply
        </button>
      </div>
    </div>
  );

  const triggerButton = (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted',
        hasActiveFilters && 'border-primary text-primary'
      )}
    >
      <Filter className="h-4 w-4" />
      Filters
      {hasActiveFilters && (
        <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          {activeFilterCount}
        </span>
      )}
    </button>
  );

  // Use Dialog for all screen sizes
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <FilterForm />
      </DialogContent>
    </Dialog>
  );
}

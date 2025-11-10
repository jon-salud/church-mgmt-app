'use client';

import { X } from 'lucide-react';

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

interface ActiveFilterChipsProps {
  filters: FilterState;
  roles: RoleOption[];
  onRemove: (key: keyof FilterState) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  roles,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  const chips: Array<{ key: keyof FilterState; label: string }> = [];

  if (filters.status) {
    chips.push({ key: 'status', label: `Status: ${filters.status}` });
  }

  if (filters.role) {
    const role = roles.find(r => r.name.toLowerCase() === filters.role);
    chips.push({ key: 'role', label: `Role: ${role?.name || filters.role}` });
  }

  if (filters.lastAttendance) {
    const attendanceLabels: Record<string, string> = {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '60d': 'Last 60 days',
      '90d': 'Last 90 days',
      never: 'Never',
    };
    chips.push({
      key: 'lastAttendance',
      label: `Attendance: ${attendanceLabels[filters.lastAttendance] || filters.lastAttendance}`,
    });
  }

  if (filters.groupsCountMin) {
    chips.push({ key: 'groupsCountMin', label: `Min Groups: ${filters.groupsCountMin}` });
  }

  if (filters.hasEmail === 'true') {
    chips.push({ key: 'hasEmail', label: 'Has Email' });
  }

  if (filters.hasPhone === 'true') {
    chips.push({ key: 'hasPhone', label: 'Has Phone' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
      {chips.map(chip => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

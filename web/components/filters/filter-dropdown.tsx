'use client';

import { useState, useEffect } from 'react';
import { Popover } from 'flowbite-react';
import { Button } from '@/components/ui-flowbite/button';
import { Checkbox, Label } from 'flowbite-react';

export interface FilterState {
  roles: string[];
  status: string;
}

export interface RoleOption {
  id: string;
  name: string;
  slug?: string;
}

interface FilterDropdownProps {
  roles: RoleOption[];
  currentFilters: FilterState;
  onApply: (filters: FilterState) => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'inactive', label: 'Inactive' },
];

export function FilterDropdown({ roles, currentFilters, onApply }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);
  const [allRolesChecked, setAllRolesChecked] = useState(false);

  // Sync local filters with current filters when popover opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters);
      setAllRolesChecked(
        currentFilters.roles.length === 0 || currentFilters.roles.length === roles.length
      );
    }
  }, [isOpen, currentFilters, roles.length]);

  const handleRoleToggle = (roleId: string) => {
    setLocalFilters(prev => {
      const newRoles = prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId];
      setAllRolesChecked(newRoles.length === roles.length);
      return { ...prev, roles: newRoles };
    });
  };

  const handleAllRolesToggle = () => {
    if (allRolesChecked) {
      setLocalFilters(prev => ({ ...prev, roles: [] }));
      setAllRolesChecked(false);
    } else {
      setLocalFilters(prev => ({ ...prev, roles: roles.map(r => r.id) }));
      setAllRolesChecked(true);
    }
  };

  const handleStatusChange = (status: string) => {
    setLocalFilters(prev => ({ ...prev, status }));
  };

  const handleApply = () => {
    // If all roles selected or none selected, treat as "all"
    const normalizedFilters = {
      ...localFilters,
      roles: allRolesChecked || localFilters.roles.length === 0 ? [] : localFilters.roles,
    };
    onApply(normalizedFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const clearedFilters: FilterState = { roles: [], status: '' };
    setLocalFilters(clearedFilters);
    setAllRolesChecked(false);
    onApply(clearedFilters);
    setIsOpen(false);
  };

  const filterContent = (
    <div className="w-80 space-y-4 p-4" role="dialog" aria-label="Filter members">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Roles</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-all-roles"
              checked={allRolesChecked}
              onChange={handleAllRolesToggle}
            />
            <Label htmlFor="filter-all-roles" className="cursor-pointer">
              All Roles
            </Label>
          </div>
          {roles.map(role => (
            <div key={role.id} className="flex items-center gap-2">
              <Checkbox
                id={`filter-role-${role.id}`}
                checked={localFilters.roles.includes(role.id)}
                onChange={() => handleRoleToggle(role.id)}
              />
              <Label htmlFor={`filter-role-${role.id}`} className="cursor-pointer">
                {role.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Status</h3>
        <div className="space-y-2">
          {STATUS_OPTIONS.map(option => (
            <div key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                id={`filter-status-${option.value || 'all'}`}
                name="status"
                value={option.value}
                checked={localFilters.status === option.value}
                onChange={() => handleStatusChange(option.value)}
                className="cursor-pointer"
              />
              <Label htmlFor={`filter-status-${option.value || 'all'}`} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button size="sm" variant="primary" onClick={handleApply} className="flex-1">
          Apply
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear} className="flex-1">
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={filterContent}
      trigger="click"
      placement="bottom-start"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Button
        size="default"
        variant="outline"
        aria-label="Filter members"
        aria-expanded={isOpen}
        id="filter-button"
      >
        <svg
          className="h-4 w-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filter
      </Button>
    </Popover>
  );
}

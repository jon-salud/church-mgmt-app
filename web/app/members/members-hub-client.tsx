'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchMembers, MemberSummary, MemberListResponse } from '../../lib/api/members';
import { useMembersQueryState } from '../../lib/hooks/use-members-query-state';
import { useDebounce } from '../../lib/hooks/use-debounce';
import { useToast } from '../../lib/hooks/use-toast';
import { FilterDropdown } from '@/components/members/filter-dropdown';
import { ActiveFilterChips } from '@/components/members/active-filter-chips';
import { MemberDetailDrawer } from '@/components/members/member-detail-drawer';
import { MemberEditModal, MemberEditData } from '@/components/members/member-edit-modal';

interface RoleOption {
  id: string;
  name: string;
  slug?: string;
}

interface MembersHubClientProps {
  roles: RoleOption[];
  me: any;
  // groups: Array<{ id: string; name: string }>;
}

export function MembersHubClient({ roles, me: _me }: MembersHubClientProps) {
  const { queryState, updateQuery, resetFilters, hasActiveFilters } = useMembersQueryState();
  const debouncedSearch = useDebounce(queryState.search, 300);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [pagination, setPagination] = useState<MemberListResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const toast = useToast();

  const activeSort = queryState.sort || 'name:asc';

  const handleSortChange = (field: string) => {
    const [currentField, currentDir] = activeSort.split(':');
    let next: string;
    if (currentField === field) {
      next = `${field}:${currentDir === 'asc' ? 'desc' : 'asc'}`;
    } else {
      next = `${field}:asc`;
    }
    updateQuery({ sort: next });
  };

  const sortIndicator = (field: string) => {
    const [currentField, currentDir] = activeSort.split(':');
    if (currentField !== field) return '↕';
    return currentDir === 'asc' ? '↑' : '↓';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMembers({
        page: queryState.page,
        limit: queryState.limit,
        sort: queryState.sort,
        search: debouncedSearch || undefined,
        status: queryState.status || undefined,
        role: queryState.role || undefined,
        lastAttendance: (queryState.lastAttendance as any) || undefined,
        groupsCountMin: queryState.groupsCountMin ? Number(queryState.groupsCountMin) : undefined,
        hasEmail:
          queryState.hasEmail === 'true'
            ? true
            : queryState.hasEmail === 'false'
              ? false
              : undefined,
        hasPhone:
          queryState.hasPhone === 'true'
            ? true
            : queryState.hasPhone === 'false'
              ? false
              : undefined,
      });
      setMembers(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      const message = err?.message || 'Failed to load members';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryState, debouncedSearch]); // toast is stable, no need to include it

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    updateQuery({ page });
  };

  const handleLimitChange = (e: React.ChangeEvent<any>) => {
    updateQuery({ limit: Number(e.target.value), page: 1 });
  };

  const openMemberDrawer = (member: MemberSummary) => {
    setSelectedMember(member);
    setIsDrawerOpen(true);
  };

  const handleEdit = (member: MemberSummary) => {
    setSelectedMember(member);
    setIsDrawerOpen(false);
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async (_memberId: string, _data: MemberEditData) => {
    // TODO: Implement API call to update member
    // For now, just show success and refresh
    toast.success('Member updated successfully');
    await fetchData();
    setIsEditModalOpen(false);
    setSelectedMember(null);
  };

  const handleRemoveFilter = (key: keyof typeof queryState) => {
    updateQuery({ [key]: undefined });
  };

  const rows = useMemo(() => {
    return members.map(m => (
      <tr key={m.id} className="cursor-pointer hover:bg-accent" onClick={() => openMemberDrawer(m)}>
        <td className="px-3 py-2 text-sm font-medium">
          {m.firstName} {m.lastName}
        </td>
        <td className="px-3 py-2 text-sm">{m.email || '—'}</td>
        <td className="px-3 py-2 text-sm">{m.phone || '—'}</td>
        <td className="px-3 py-2 text-sm">{m.status}</td>
        <td className="px-3 py-2 text-sm">{m.roles.join(', ') || '—'}</td>
        <td className="px-3 py-2 text-sm text-center">{m.groupsCount}</td>
        <td className="px-3 py-2 text-sm">{m.lastAttendance || '—'}</td>
      </tr>
    ));
  }, [members]);
  return (
    <>
      <section className="space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="heading-1">Members Hub</h1>
            <p className="caption-text">Search, filter, and explore member records.</p>
          </div>
        </header>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <label htmlFor="member-search" className="sr-only">
              Search members
            </label>
            <input
              id="member-search"
              value={queryState.search}
              onChange={e => updateQuery({ search: e.target.value })}
              placeholder="Search name, email, phone"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <FilterDropdown
              filters={queryState}
              roles={roles}
              onFilterChange={updateQuery}
              onClearAll={resetFilters}
            />
          </div>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50 hover:bg-muted"
          >
            Reset All
          </button>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <ActiveFilterChips
            filters={queryState}
            roles={roles}
            onRemove={handleRemoveFilter}
            onClearAll={resetFilters}
          />
        )}

        {/* Table Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {loading && <span>Loading…</span>}
              {!loading && pagination && (
                <span>
                  Showing {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total}
                </span>
              )}
              {error && <span className="text-red-600">{error}</span>}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="page-size-select" className="text-xs">
                Page Size
              </label>
              <select
                id="page-size-select"
                value={queryState.limit}
                onChange={handleLimitChange}
                className="rounded border border-border bg-background px-2 py-1 text-xs"
              >
                {[10, 25, 50, 100].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            className="overflow-auto rounded border border-border"
            role="region"
            aria-label="Members table"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th
                    className="px-3 py-2 text-left cursor-pointer"
                    onClick={() => handleSortChange('name')}
                  >
                    Name {sortIndicator('name')}
                  </th>
                  <th
                    className="px-3 py-2 text-left cursor-pointer"
                    onClick={() => handleSortChange('email')}
                  >
                    Email {sortIndicator('email')}
                  </th>
                  <th
                    className="px-3 py-2 text-left cursor-pointer"
                    onClick={() => handleSortChange('phone')}
                  >
                    Phone {sortIndicator('phone')}
                  </th>
                  <th
                    className="px-3 py-2 text-left cursor-pointer"
                    onClick={() => handleSortChange('status')}
                  >
                    Status {sortIndicator('status')}
                  </th>
                  <th className="px-3 py-2 text-left" role="columnheader">
                    Roles
                  </th>
                  <th
                    className="px-3 py-2 text-center cursor-pointer"
                    onClick={() => handleSortChange('groupsCount')}
                  >
                    Groups {sortIndicator('groupsCount')}
                  </th>
                  <th
                    className="px-3 py-2 text-left cursor-pointer"
                    onClick={() => handleSortChange('lastAttendance')}
                  >
                    Last Attendance {sortIndicator('lastAttendance')}
                  </th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled={queryState.page <= 1}
                onClick={() => handlePageChange(queryState.page - 1)}
                className="rounded border border-border px-3 py-1 text-xs disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-xs">
                Page {queryState.page} of {pagination.pages}
              </span>
              <button
                disabled={queryState.page >= pagination.pages}
                onClick={() => handlePageChange(queryState.page + 1)}
                className="rounded border border-border px-3 py-1 text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Member Detail Drawer */}
      <MemberDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onEdit={handleEdit}
      />

      {/* Member Edit Modal */}
      <MemberEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSave={handleSaveMember}
      />
    </>
  );
}

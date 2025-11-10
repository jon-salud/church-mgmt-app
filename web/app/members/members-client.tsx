'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui-flowbite/modal';
import { createMemberAction } from '../actions';
import { clientApi } from '../../lib/api.client';
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { ActiveFilterChips } from '@/components/filters/active-filter-chips';
import { useMembersQueryState } from '@/lib/hooks/use-members-query-state';
import { MemberDrawer } from '@/components/members/member-drawer';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { BulkActionBar } from '@/components/members/bulk-action-bar';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { toast } from '@/lib/toast';

type RoleOption = {
  id: string;
  name: string;
  slug?: string;
};

type GroupOption = {
  id: string;
  name: string;
};

type MembersClientProps = {
  members: Array<any>;
  roles: RoleOption[];
  initialQuery: string;
  me: any;
  groups: GroupOption[];
};

export function MembersClient({ members, roles, initialQuery, me, groups }: MembersClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedMembers, setArchivedMembers] = useState<any[]>([]);
  const defaultRoleId = roles.find(role => role.slug === 'member')?.id ?? roles[0]?.id ?? '';
  const isAdmin = me?.user?.roles?.some((role: any) => role.slug === 'admin') ?? false;

  // Filter state from URL
  const { filters, setFilters, removeFilter, clearFilters } = useMembersQueryState();
  const [, setMemberId] = useUrlState('memberId', '');

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecoverMember = async (memberId: string) => {
    try {
      await clientApi.recoverUser(memberId);
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Failed to recover member:', error);
      window.alert('Failed to recover member. Please try again.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length && filteredMembers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: 'addToGroup' | 'setStatus' | 'delete', params: any) => {
    setIsProcessing(true);
    try {
      const memberIds = Array.from(selectedIds);
      let result;

      if (action === 'addToGroup') {
        result = await clientApi.bulkAddMembersToGroup(memberIds, params.groupId);
      } else if (action === 'setStatus') {
        result = await clientApi.bulkSetMemberStatus(memberIds, params.status);
      } else if (action === 'delete') {
        result = await clientApi.bulkDeleteMembers(memberIds);
      }

      if (result) {
        if (result.failed > 0) {
          toast.error(`Success: ${result.success}, Failed: ${result.failed}`);
        } else {
          const actionText =
            action === 'addToGroup'
              ? 'added to group'
              : action === 'setStatus'
                ? 'status updated'
                : 'deleted';
          toast.success(`${result.success} member(s) ${actionText}`);
        }
      }

      // Clear selection after action
      setSelectedIds(new Set());

      // Refresh the page to see changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
      toast.error(`Failed to ${action}. Please try again.`);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (showArchived && isAdmin && archivedMembers.length === 0) {
      clientApi
        .listDeletedUsers()
        .then(users => {
          // Normalize the data structure - archived users have id as {value: string}
          const normalized = users.map(user => ({
            ...user,
            id: typeof user.id === 'object' && user.id?.value ? user.id.value : user.id,
            primaryEmail:
              typeof user.primaryEmail === 'object' && user.primaryEmail?.value
                ? user.primaryEmail.value
                : user.primaryEmail,
            churchId:
              typeof user.churchId === 'object' && user.churchId?.value
                ? user.churchId.value
                : user.churchId,
          }));
          setArchivedMembers(normalized);
        })
        .catch(console.error);
    }
  }, [showArchived, isAdmin, archivedMembers.length]);

  // Filter members based on archived status
  const displayedMembers = showArchived ? [...members, ...archivedMembers] : members;

  // Apply filters to displayed members
  const filteredMembers = displayedMembers.filter(member => {
    // Role filter
    if (filters.roles.length > 0) {
      const memberRoleIds = member.roles?.map((role: any) => role.roleId) ?? [];
      const hasMatchingRole = filters.roles.some(roleId => memberRoleIds.includes(roleId));
      if (!hasMatchingRole) return false;
    }

    // Status filter
    if (filters.status) {
      if (member.status !== filters.status) return false;
    }

    return true;
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="heading-1">Member Directory</h1>
          <p className="caption-text">
            Search and drill into profiles, roles, and group involvement.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <FilterDropdown roles={roles} currentFilters={filters} onApply={setFilters} />
          <form className="flex gap-2" action="">
            <label htmlFor="member-search" className="sr-only">
              Search members
            </label>
            <input
              id="member-search-input"
              name="q"
              defaultValue={initialQuery}
              placeholder="Search name or email"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <button
              id="search-button"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Search
            </button>
          </form>
          {isAdmin && (
            <label htmlFor="show-archived-checkbox" className="flex items-center gap-2 text-sm">
              <input
                id="show-archived-checkbox"
                type="checkbox"
                checked={showArchived}
                onChange={e => setShowArchived(e.target.checked)}
                className="rounded border border-border"
              />
              Show archived members
            </label>
          )}
          <button
            id="add-member-button"
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Add Member
          </button>
        </div>
      </header>

      <ActiveFilterChips
        filters={filters}
        roles={roles}
        onRemove={removeFilter}
        onClearAll={clearFilters}
      />

      {/* Bulk Action Bar */}
      {isAdmin && (
        <BulkActionBar
          members={filteredMembers}
          roles={roles}
          groups={groups}
          selectedIds={selectedIds}
          onSelectAll={toggleSelectAll}
          onAction={handleBulkAction}
          isProcessing={isProcessing}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-md">
        <table className="min-w-full text-sm" aria-describedby="members-table-caption">
          <caption
            id="members-table-caption"
            className="px-4 py-2 text-left text-xs uppercase text-muted-foreground"
          >
            Members matching the current search query
          </caption>
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {isAdmin && (
                <th scope="col" className="px-4 py-3 w-12">
                  <Checkbox
                    checked={
                      selectedIds.size === filteredMembers.length && filteredMembers.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all members"
                  />
                </th>
              )}
              <th scope="col" className="px-4 py-3">
                Name
              </th>
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3">
                Role
              </th>
              <th scope="col" className="px-4 py-3">
                Groups
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              {showArchived && (
                <th scope="col" className="px-4 py-3">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredMembers.map(member => (
              <tr
                key={member.id}
                className="transition hover:bg-muted/70 cursor-pointer"
                onClick={() => setMemberId(member.id)}
              >
                {isAdmin && (
                  <td className="px-4 py-3 w-12" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(member.id)}
                      onCheckedChange={() => toggleSelect(member.id)}
                    />
                  </td>
                )}
                <td className="px-4 py-3 font-medium">
                  <Link
                    id={`member-link-${member.id}`}
                    href={`/members/${member.id}`}
                    className="hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    {member.profile?.firstName} {member.profile?.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{member.primaryEmail}</td>
                <td className="px-4 py-3 text-foreground">
                  {member.roles?.map((role: any) => role.role).join(', ') || 'Member'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {member.groups?.map((g: any) => g.name).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">
                  {member.status || '—'}
                </td>
                {showArchived && (
                  <td className="px-4 py-3">
                    {member.deletedAt && (
                      <button
                        onClick={() => handleRecoverMember(member.id)}
                        className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                      >
                        Recover
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Member"
        footer={
          <p className="text-xs text-muted-foreground">
            Records are added to the demo datastore instantly. You can edit the profile after
            creation.
          </p>
        }
      >
        <form
          action={createMemberAction}
          className="grid gap-4 md:grid-cols-2"
          onSubmit={() => setIsAddOpen(false)}
        >
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            First Name
            <input
              id="add-member-first-name-input"
              name="firstName"
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Last Name
            <input
              id="add-member-last-name-input"
              name="lastName"
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground md:col-span-2">
            Email
            <input
              id="add-member-email-input"
              name="primaryEmail"
              type="email"
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Phone
            <input
              id="add-member-phone-input"
              name="phone"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Address
            <input
              id="add-member-address-input"
              name="address"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Status
            <select
              id="add-member-status-select"
              name="status"
              defaultValue="active"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="active">Active</option>
              <option value="invited">Invited</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Role
            <select
              id="add-member-role-select"
              name="roleId"
              defaultValue={defaultRoleId}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
              disabled={roles.length === 0}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground md:col-span-2">
            Notes
            <textarea
              id="add-member-notes-textarea"
              name="notes"
              rows={3}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              id="add-member-cancel-button"
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              id="add-member-create-button"
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Create Member
            </button>
          </div>
        </form>
      </Modal>

      <MemberDrawer />
    </section>
  );
}

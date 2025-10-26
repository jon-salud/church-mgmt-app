'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal } from '../../components/ui/modal';
import { createMemberAction } from '../actions';
import { clientApi } from '../../lib/api.client';

type RoleOption = {
  id: string;
  name: string;
  slug?: string;
};

type MembersClientProps = {
  members: Array<any>;
  roles: RoleOption[];
  initialQuery: string;
  me: any;
};

export function MembersClient({ members, roles, initialQuery, me }: MembersClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedMembers, setArchivedMembers] = useState<any[]>([]);
  const defaultRoleId = roles.find(role => role.slug === 'member')?.id ?? roles[0]?.id ?? '';
  const isAdmin = me?.user?.roles?.some((role: any) => role.slug === 'admin') ?? false;

  const handleRecoverMember = async (memberId: string) => {
    try {
      await clientApi.recoverUser(memberId);
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Failed to recover member:', error);
      alert('Failed to recover member. Please try again.');
    }
  };

  useEffect(() => {
    if (showArchived && isAdmin && archivedMembers.length === 0) {
      clientApi.listDeletedUsers().then(setArchivedMembers).catch(console.error);
    }
  }, [showArchived, isAdmin, archivedMembers.length]);

  // Filter members based on archived status
  const displayedMembers = showArchived ? [...members, ...archivedMembers] : members;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Member Directory</h1>
          <p className="text-sm text-muted-foreground">
            Search and drill into profiles, roles, and group involvement.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
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
            <label className="flex items-center gap-2 text-sm">
              <input
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

      <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
        <table className="min-w-full text-sm" aria-describedby="members-table-caption">
          <caption
            id="members-table-caption"
            className="px-4 py-2 text-left text-xs uppercase text-muted-foreground"
          >
            Members matching the current search query
          </caption>
          <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
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
              {showArchived && (
                <th scope="col" className="px-4 py-3">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayedMembers.map(member => (
              <tr key={member.id} className="transition hover:bg-muted/70">
                <td className="px-4 py-3 font-medium">
                  <Link
                    id={`member-link-${member.id}`}
                    href={`/members/${member.id}`}
                    className="hover:underline"
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
                {showArchived && (
                  <td className="px-4 py-3">
                    {member.deletedAt && (
                      <button
                        onClick={() => handleRecoverMember(member.id)}
                        className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-700"
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
    </section>
  );
}

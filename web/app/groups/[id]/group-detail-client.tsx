'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Modal } from '../../../components/ui/modal';

type GroupDetailClientProps = {
  group: any;
  allMembers: Array<any>;
};

type EditableMember = {
  userId: string;
  name: string;
  role: string;
  status: string;
};

export function GroupDetailClient({ group, allMembers }: GroupDetailClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberModal, setMemberModal] = useState<EditableMember | null>(null);

  const availableMembers = useMemo(() => {
    const currentIds = new Set((group.members ?? []).map((member: any) => member.userId));
    return allMembers.filter(member => !currentIds.has(member.id));
  }, [allMembers, group.members]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{group.name}</h1>
        <p className="text-sm text-muted-foreground">
          {group.description || 'No description yet.'}
        </p>
        <p className="text-xs text-muted-foreground">
          Meeting {group.meetingDay || 'TBA'} {group.meetingTime && `· ${group.meetingTime}`} •
          Tags: {group.tags?.join(', ') || 'None'}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">Members</h2>
          <button
            id="add-member-button"
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Add member
          </button>
        </div>
        <table className="mt-3 min-w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2">Joined</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {group.members?.map((member: any) => (
              <tr key={member.userId}>
                <td className="py-2">
                  <Link
                    id={`member-link-${member.userId}`}
                    href={`/members/${member.user.id}`}
                    className="hover:underline"
                  >
                    {member.user.profile.firstName} {member.user.profile.lastName}
                  </Link>
                </td>
                <td className="py-2 text-muted-foreground">{member.role}</td>
                <td className="py-2 text-muted-foreground">{member.status}</td>
                <td className="py-2 text-muted-foreground">
                  {format(new Date(member.joinedAt), 'd MMM yyyy')}
                </td>
                <td className="py-2">
                  <button
                    id={`manage-member-button-${member.userId}`}
                    type="button"
                    onClick={() =>
                      setMemberModal({
                        userId: member.userId,
                        name: `${member.user.profile.firstName} ${member.user.profile.lastName}`,
                        role: member.role,
                        status: member.status,
                      })
                    }
                    className="rounded-md border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Upcoming events</h2>
        {group.events?.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {group.events.map((event: any) => (
              <li key={event.id} className="rounded-md border border-border bg-background p-3">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.startAt), 'd MMM yyyy, h:mma')} · {event.location || 'TBA'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No scheduled events yet.</p>
        )}
      </section>

      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add member to group"
        footer={
          <p className="text-xs text-muted-foreground">
            Members can have different roles across groups. Use this dialog to invite them to{' '}
            {group.name}.
          </p>
        }
      >
        {availableMembers.length ? (
          <form className="grid gap-4" onSubmit={() => setIsAddOpen(false)}>
            <input type="hidden" name="groupId" value={group.id} />
            <label className="grid gap-1 text-xs uppercase text-muted-foreground">
              Member
              <select
                id="add-member-select"
                name="userId"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Select member
                </option>
                {availableMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.profile?.firstName} {member.profile?.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs uppercase text-muted-foreground">
              Role
              <select
                id="add-member-role-select"
                name="role"
                defaultValue="Member"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="Member">Member</option>
                <option value="Leader">Leader</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs uppercase text-muted-foreground">
              Status
              <select
                id="add-member-status-select"
                name="status"
                defaultValue="Active"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button
                id="add-member-cancel-button"
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                id="add-member-submit-button"
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Add Member
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-foreground">
            All members are already part of this group. Remove someone first to invite them again.
          </p>
        )}
      </Modal>

      <Modal
        open={Boolean(memberModal)}
        onClose={() => setMemberModal(null)}
        title={memberModal ? `Manage ${memberModal.name}` : 'Manage member'}
        footer={
          <p className="text-xs text-muted-foreground">
            Changes update the member&apos;s record for this group only and trigger revalidation
            right away.
          </p>
        }
      >
        {memberModal ? (
          <div className="space-y-6">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={() => setMemberModal(null)}>
              <input type="hidden" name="groupId" value={group.id} />
              <input type="hidden" name="userId" value={memberModal.userId} />
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Role
                <select
                  id="manage-member-role-select"
                  name="role"
                  defaultValue={memberModal.role}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="Member">Member</option>
                  <option value="Leader">Leader</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Status
                <select
                  id="manage-member-status-select"
                  name="status"
                  defaultValue={memberModal.status}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  id="manage-member-close-button"
                  type="button"
                  onClick={() => setMemberModal(null)}
                  className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
                >
                  Close
                </button>
                <button
                  id="manage-member-save-button"
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <form
              className="rounded-lg border border-destructive/50 bg-destructive/20 px-4 py-3"
              onSubmit={() => setMemberModal(null)}
            >
              <input type="hidden" name="groupId" value={group.id} />
              <input type="hidden" name="userId" value={memberModal.userId} />
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-destructive-foreground">
                    Remove from group
                  </h3>
                  <p className="text-xs text-destructive-foreground/80">
                    This only affects membership in {group.name}. Attendance history remains intact.
                  </p>
                </div>
                <button
                  id="remove-member-button"
                  className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
                >
                  Remove Member
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

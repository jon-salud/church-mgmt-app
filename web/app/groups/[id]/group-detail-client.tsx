"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Modal } from "../../../components/ui/modal";
import {
  addGroupMemberAction,
  removeGroupMemberAction,
  updateGroupMemberAction,
} from "../../actions";

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
        <p className="text-sm text-slate-400">{group.description || "No description yet."}</p>
        <p className="text-xs text-slate-500">
          Meeting {group.meetingDay || "TBA"} {group.meetingTime && `· ${group.meetingTime}`} • Tags:{" "}
          {group.tags?.join(", ") || "None"}
        </p>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Members</h2>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Add member
          </button>
        </div>
        <table className="mt-3 min-w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2">Joined</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {group.members?.map((member: any) => (
              <tr key={member.userId}>
                <td className="py-2">
                  <Link href={`/members/${member.user.id}`} className="hover:underline">
                    {member.user.profile.firstName} {member.user.profile.lastName}
                  </Link>
                </td>
                <td className="py-2 text-slate-300">{member.role}</td>
                <td className="py-2 text-slate-400">{member.status}</td>
                <td className="py-2 text-slate-400">{format(new Date(member.joinedAt), "d MMM yyyy")}</td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() =>
                      setMemberModal({
                        userId: member.userId,
                        name: `${member.user.profile.firstName} ${member.user.profile.lastName}`,
                        role: member.role,
                        status: member.status,
                      })
                    }
                    className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-900"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="text-lg font-semibold">Upcoming events</h2>
        {group.events?.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {group.events.map((event: any) => (
              <li key={event.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-slate-400">
                  {format(new Date(event.startAt), "d MMM yyyy, h:mma")} · {event.location || "TBA"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No scheduled events yet.</p>
        )}
      </section>

      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add member to group"
        footer={
          <p className="text-xs text-slate-500">
            Members can have different roles across groups. Use this dialog to invite them to {group.name}.
          </p>
        }
      >
        {availableMembers.length ? (
          <form
            action={addGroupMemberAction}
            className="grid gap-4"
            onSubmit={() => setIsAddOpen(false)}
          >
            <input type="hidden" name="groupId" value={group.id} />
            <label className="grid gap-1 text-xs uppercase text-slate-400">
              Member
              <select
                name="userId"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
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
            <label className="grid gap-1 text-xs uppercase text-slate-400">
              Role
              <select
                name="role"
                defaultValue="Member"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                <option value="Member">Member</option>
                <option value="Leader">Leader</option>
                <option value="Coordinator">Coordinator</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs uppercase text-slate-400">
              Status
              <select
                name="status"
                defaultValue="Active"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
              >
                Add Member
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-300">
            All members are already part of this group. Remove someone first to invite them again.
          </p>
        )}
      </Modal>

      <Modal
        open={Boolean(memberModal)}
        onClose={() => setMemberModal(null)}
        title={memberModal ? `Manage ${memberModal.name}` : "Manage member"}
        footer={
          <p className="text-xs text-slate-500">
            Changes update the member&apos;s record for this group only and trigger revalidation right away.
          </p>
        }
      >
        {memberModal ? (
          <div className="space-y-6">
            <form
              action={updateGroupMemberAction}
              className="grid gap-4 md:grid-cols-2"
              onSubmit={() => setMemberModal(null)}
            >
              <input type="hidden" name="groupId" value={group.id} />
              <input type="hidden" name="userId" value={memberModal.userId} />
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                Role
                <select
                  name="role"
                  defaultValue={memberModal.role}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="Member">Member</option>
                  <option value="Leader">Leader</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                Status
                <select
                  name="status"
                  defaultValue={memberModal.status}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMemberModal(null)}
                  className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <form
              action={removeGroupMemberAction}
              className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3"
              onSubmit={() => setMemberModal(null)}
            >
              <input type="hidden" name="groupId" value={group.id} />
              <input type="hidden" name="userId" value={memberModal.userId} />
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-red-200">Remove from group</h3>
                  <p className="text-xs text-red-200/80">
                    This only affects membership in {group.name}. Attendance history remains intact.
                  </p>
                </div>
                <button className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-red-950 transition hover:bg-red-400">
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

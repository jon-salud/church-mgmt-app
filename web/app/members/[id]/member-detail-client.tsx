"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Modal } from "../../../components/ui/modal";
import { updateMemberAction, deleteMemberAction } from "../../actions";
import { api } from "../../../lib/api";

type MemberDetailClientProps = {
  member: any;
  roles: Array<{ id: string; name: string; slug?: string }>;
};

export function MemberDetailClient({ member, roles }: MemberDetailClientProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [enabledFields, setEnabledFields] = useState<Record<string, boolean>>({});
  const primaryRoleId = member.roles?.[0]?.roleId ?? roles.find(role => role.slug === "member")?.id ?? roles[0]?.id ?? "";

  useEffect(() => {
    async function fetchSettings() {
      const me = await api.currentUser();
      const churchId = me?.user?.roles[0]?.churchId;
      if (churchId) {
        const settings = await api.getSettings(churchId);
        setEnabledFields(settings.optionalFields ?? {});
      }
    }
    fetchSettings();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            {member.profile?.firstName} {member.profile?.lastName}
          </h1>
          <p className="text-sm text-slate-400">{member.primaryEmail}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsRemoveOpen(true)}
            className="rounded-md border border-red-700 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-900/40"
          >
            Remove Member
          </button>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Contact">
          <p className="text-sm text-slate-200">Phone: {member.profile?.phone || "—"}</p>
          <p className="text-sm text-slate-200">Address: {member.household?.address || "—"}</p>
          <p className="text-xs text-slate-500">Joined: {format(new Date(member.createdAt), "d MMM yyyy")}</p>
        </InfoCard>
        <InfoCard title="Roles">
          {member.roles?.length ? (
            <ul className="text-sm text-slate-200">
              {member.roles.map((role: any)_ => (
                <li key={`${role.churchId}-${role.roleId}`}>
                  <span className="font-medium text-slate-100">{role.role}</span>
                  {role.permissions?.length ? (
                    <span className="block text-xs text-slate-400">
                      Permissions: {role.permissions.slice(0, 4).join(", ")}
                      {role.permissions.length > 4 ? "…" : ""}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Member</p>
          )}
        </InfoCard>
      </div>

      <InfoCard title="Details">
        <div className="grid grid-cols-2 gap-4">
          {enabledFields.membershipStatus && <p className="text-sm text-slate-200">Membership Status: {member.profile?.membershipStatus || "—"}</p>}
          {enabledFields.joinMethod && <p className="text-sm text-slate-200">Join Method: {member.profile?.joinMethod || "—"}</p>}
          {enabledFields.joinDate && <p className="text-sm text-slate-200">Join Date: {member.profile?.joinDate ? format(new Date(member.profile.joinDate), "d MMM yyyy") : "—"}</p>}
          {enabledFields.baptismDate && <p className="text-sm text-slate-200">Baptism Date: {member.profile?.baptismDate ? format(new Date(member.profile.baptismDate), "d MMM yyyy") : "—"}</p>}
          {enabledFields.maritalStatus && <p className="text-sm text-slate-200">Marital Status: {member.profile?.maritalStatus || "—"}</p>}
        </div>
      </InfoCard>

      <InfoCard title="Groups">
        {member.groups?.length ? (
          <ul className="grid gap-2 md:grid-cols-2">
            {member.groups.map((group: any) => (
              <li key={group.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm">
                <p className="font-medium text-slate-100">{group.name}</p>
                <p className="text-xs text-slate-400">Role: {group.role}</p>
                <Link href={`/groups/${group.id}`} className="mt-2 inline-block text-xs text-sky-400 hover:underline">
                  View group
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No groups assigned.</p>
        )}
      </InfoCard>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Attendance (recent)">
          {member.attendance?.length ? (
            <ul className="space-y-2 text-sm">
              {member.attendance.slice(0, 5).map((record: any) => (
                <li key={`${record.eventId}-${record.startAt}`} className="flex justify-between">
                  <span>{record.title}</span>
                  <span className="text-slate-400">{record.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No attendance yet.</p>
          )}
        </InfoCard>
        <InfoCard title="Contributions">
          {member.contributions?.length ? (
            <ul className="space-y-2 text-sm">
              {member.contributions.slice(0, 5).map((entry: any) => (
                <li key={entry.contributionId} className="flex justify-between">
                  <span>{format(new Date(entry.date), "d MMM")}</span>
                  <span>${entry.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No contributions on record.</p>
          )}
        </InfoCard>
      </div>

      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Member Profile"
        footer={
          <p className="text-xs text-slate-500">Saving applies immediately and revalidates any dependent listings.</p>
        }
      >
        <form
          action={updateMemberAction}
          className="grid gap-4 md:grid-cols-2"
          onSubmit={() => setIsEditOpen(false)}
        >
          <input type="hidden" name="userId" value={member.id} />
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            First Name
            <input
              name="firstName"
              defaultValue={member.profile?.firstName ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Last Name
            <input
              name="lastName"
              defaultValue={member.profile?.lastName ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400 md:col-span-2">
            Email
            <input
              name="primaryEmail"
              type="email"
              defaultValue={member.primaryEmail}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Phone
            <input
              name="phone"
              defaultValue={member.profile?.phone ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Address
            <input
              name="address"
              defaultValue={member.household?.address ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          {enabledFields.membershipStatus && <label className="grid gap-1 text-xs uppercase text-slate-400">
            Membership Status
            <input
              name="membershipStatus"
              defaultValue={member.profile?.membershipStatus ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>}
          {enabledFields.joinMethod && <label className="grid gap-1 text-xs uppercase text-slate-400">
            Join Method
            <input
              name="joinMethod"
              defaultValue={member.profile?.joinMethod ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>}
          {enabledFields.maritalStatus && <label className="grid gap-1 text-xs uppercase text-slate-400">
            Marital Status
            <input
              name="maritalStatus"
              defaultValue={member.profile?.maritalStatus ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>}
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Status
            <select
              name="status"
              defaultValue={member.status ?? "active"}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="active">Active</option>
              <option value="invited">Invited</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Role
            <select
              name="roleId"
              defaultValue={primaryRoleId}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-50"
              disabled={roles.length === 0}
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400 md:col-span-2">
            Notes
            <textarea
              name="notes"
              rows={3}
              defaultValue={member.profile?.notes ?? ""}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Remove Member"
        footer={
          <p className="text-xs text-slate-500">
            This removes the member from the demo datastore along with related group memberships and attendance.
          </p>
        }
      >
        <p className="text-sm text-slate-200">
          Are you sure you want to remove{" "}
          <span className="font-medium">
            {member.profile?.firstName} {member.profile?.lastName}
          </span>{" "}
          from the directory?
        </p>
        <form
          action={deleteMemberAction}
          className="mt-6 flex justify-end gap-3"
          onSubmit={() => setIsRemoveOpen(false)}
        >
          <input type="hidden" name="userId" value={member.id} />
          <button
            type="button"
            onClick={() => setIsRemoveOpen(false)}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-red-950 transition hover:bg-red-400"
          >
            Remove Member
          </button>
        </form>
      </Modal>
    </section>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-lg shadow-slate-950/40">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

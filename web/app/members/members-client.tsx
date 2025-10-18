"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "../../components/ui/modal";
import { createMemberAction } from "../actions";

type MembersClientProps = {
  members: Array<any>;
  initialQuery: string;
};

export function MembersClient({ members, initialQuery }: MembersClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Member Directory</h1>
          <p className="text-sm text-slate-400">Search and drill into profiles, roles, and group involvement.</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <form className="flex gap-2" action="">
            <label htmlFor="member-search" className="sr-only">
              Search members
            </label>
            <input
              id="member-search"
              name="q"
              defaultValue={initialQuery}
              placeholder="Search name or email"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
            <button className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">Search</button>
          </form>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Add Member
          </button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-sm" aria-describedby="members-table-caption">
          <caption id="members-table-caption" className="px-4 py-2 text-left text-xs uppercase text-slate-500">
            Members matching the current search query
          </caption>
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {members.map(member => (
              <tr key={member.id} className="transition hover:bg-slate-900/70">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/members/${member.id}`} className="hover:underline">
                    {member.profile?.firstName} {member.profile?.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{member.primaryEmail}</td>
                <td className="px-4 py-3 text-slate-300">{member.roles?.[0]?.role ?? "Member"}</td>
                <td className="px-4 py-3 text-slate-400">
                  {member.groups?.map((g: any) => g.name).join(", ") || "—"}
                </td>
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
          <p className="text-xs text-slate-500">
            Records are added to the demo datastore instantly. You can edit the profile after creation.
          </p>
        }
      >
        <form action={createMemberAction} className="grid gap-4 md:grid-cols-2" onSubmit={() => setIsAddOpen(false)}>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            First Name
            <input
              name="firstName"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Last Name
            <input
              name="lastName"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400 md:col-span-2">
            Email
            <input
              name="primaryEmail"
              type="email"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Phone
            <input
              name="phone"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Address
            <input
              name="address"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Status
            <select
              name="status"
              defaultValue="active"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="active">Active</option>
              <option value="invited">Invited</option>
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
              <option value="Admin">Admin</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400 md:col-span-2">
            Notes
            <textarea
              name="notes"
              rows={3}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
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
              Create Member
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

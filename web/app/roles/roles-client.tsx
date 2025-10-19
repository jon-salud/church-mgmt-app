"use client";

import { useMemo, useState } from "react";
import { Modal } from "../../components/ui/modal";
import { createRoleAction, updateRoleAction, deleteRoleAction } from "../actions";
import { PERMISSION_GROUPS } from "./permission-schema";

type RoleRecord = {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  slug?: string;
  isSystem: boolean;
  isDeletable: boolean;
  assignmentCount: number;
};

type RolesClientProps = {
  roles: RoleRecord[];
};

export function RolesClient({ roles }: RolesClientProps) {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleRecord | null>(null);

  const sortedRoles = useMemo(
    () =>
      [...roles].sort((a, b) => {
        if (a.isSystem && !b.isSystem) return -1;
        if (!a.isSystem && b.isSystem) return 1;
        return a.name.localeCompare(b.name);
      }),
    [roles],
  );

  const reassignCandidates = useMemo(() => {
    if (!deletingRole) return [];
    return sortedRoles.filter(role => role.id !== deletingRole.id);
  }, [deletingRole, sortedRoles]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Roles & Permissions</h1>
          <p className="text-sm text-slate-400">
            Configure role templates and granular permissions. The Admin role is system protected.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="self-start rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
        >
          Create Role
        </button>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-sm" aria-describedby="roles-table-caption">
          <caption id="roles-table-caption" className="px-4 py-2 text-left text-xs uppercase text-slate-500">
            All roles available to assign to members
          </caption>
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th scope="col" className="px-4 py-3">
                Role
              </th>
              <th scope="col" className="px-4 py-3">
                Description
              </th>
              <th scope="col" className="px-4 py-3">
                Permissions
              </th>
              <th scope="col" className="px-4 py-3">
                Members
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedRoles.map(role => (
              <tr key={role.id} className="transition hover:bg-slate-900/70">
                <td className="px-4 py-3 font-medium text-slate-100">
                  <div className="flex items-center gap-2">
                    <span>{role.name}</span>
                    {role.slug === "admin" ? (
                      <span className="rounded-full border border-red-500 px-2 py-0.5 text-xs uppercase tracking-wide text-red-300">
                        Admin
                      </span>
                    ) : role.isSystem ? (
                      <span className="rounded-full border border-slate-600 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-300">
                        System
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{role.description || "—"}</td>
                <td className="px-4 py-3 text-slate-400">
                  {role.permissions.length ? role.permissions.join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-slate-300">{role.assignmentCount}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingRole(role)}
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingRole(role)}
                      className="rounded-md border border-red-600 px-3 py-1 text-xs font-medium text-red-200 transition hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!role.isDeletable || role.slug === "admin"}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Role"
        footer={<p className="text-xs text-slate-500">Permissions accept dotted keys, e.g. users.manage</p>}
      >
        <form action={createRoleAction} className="grid gap-3" onSubmit={() => setCreateOpen(false)}>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Name
            <input
              name="name"
              required
              maxLength={100}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Description
            <input
              name="description"
              maxLength={255}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <fieldset className="grid gap-3 rounded-md border border-slate-800 p-3">
            <legend className="px-1 text-xs uppercase text-slate-400">Permissions</legend>
            <div className="grid gap-4 md:grid-cols-2">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.module} className="space-y-2 rounded-md border border-slate-800 p-3">
                  <p className="text-sm font-medium text-slate-100">{group.label}</p>
                  <div className="grid gap-2 text-sm text-slate-200">
                    {group.permissions.map(permission => (
                      <label key={permission.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="permissions"
                          value={permission.key}
                          className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
                        />
                        <span>{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
            >
              Save Role
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editingRole)}
        onClose={() => setEditingRole(null)}
        title={`Edit ${editingRole?.name ?? "Role"}`}
        footer={
          <p className="text-xs text-slate-500">
            Admin role cannot be renamed or have its permissions reduced.
          </p>
        }
      >
        {editingRole ? (
          <form action={updateRoleAction} className="grid gap-3" onSubmit={() => setEditingRole(null)}>
            <input type="hidden" name="roleId" value={editingRole.id} />
            {editingRole.slug === "admin"
              ? editingRole.permissions.map(permission => (
                  <input key={permission} type="hidden" name="permissions" value={permission} />
                ))
              : null}
            <label className="grid gap-1 text-xs uppercase text-slate-400">
              Name
              <input
                name="name"
                maxLength={100}
                defaultValue={editingRole.name}
                disabled={editingRole.slug === "admin"}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-50"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase text-slate-400">
              Description
              <input
                name="description"
                maxLength={255}
                defaultValue={editingRole.description ?? ""}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <fieldset className="grid gap-3 rounded-md border border-slate-800 p-3">
              <legend className="px-1 text-xs uppercase text-slate-400">Permissions</legend>
              <div className="grid gap-4 md:grid-cols-2">
                {PERMISSION_GROUPS.map(group => (
                  <div key={group.module} className="space-y-2 rounded-md border border-slate-800 p-3">
                    <p className="text-sm font-medium text-slate-100">{group.label}</p>
                    <div className="grid gap-2 text-sm text-slate-200">
                      {group.permissions.map(permission => (
                        <label key={permission.key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="permissions"
                            value={permission.key}
                            defaultChecked={editingRole.permissions.includes(permission.key)}
                            className="h-4 w-4 rounded border border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
                            disabled={editingRole.slug === "admin"}
                          />
                          <span>{permission.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
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
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deletingRole)}
        onClose={() => setDeletingRole(null)}
        title={`Delete ${deletingRole?.name ?? "Role"}`}
        footer={
          <p className="text-xs text-slate-500">
            Roles in use must be reassigned before deletion. Admin role is not deletable.
          </p>
        }
      >
        {deletingRole ? (
          <form action={deleteRoleAction} className="grid gap-3" onSubmit={() => setDeletingRole(null)}>
            <input type="hidden" name="roleId" value={deletingRole.id} />
            <p className="text-sm text-slate-200">
              Are you sure you want to delete the <strong>{deletingRole.name}</strong> role?
            </p>
            {deletingRole.assignmentCount > 0 ? (
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                Reassign Members To
                <select
                  name="reassignRoleId"
                  required
                  defaultValue={reassignCandidates[0]?.id ?? ""}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="" disabled>
                    Select a replacement role
                  </option>
                  {reassignCandidates.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <input type="hidden" name="reassignRoleId" value="" />
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-red-400"
              >
                Delete Role
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </section>
  );
}

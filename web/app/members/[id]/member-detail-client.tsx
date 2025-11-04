'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Modal } from '@/components/ui-flowbite/modal';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { Button } from '@/components/ui-flowbite/button';
import { updateMemberAction, deleteMemberAction, updatePrayerRequestAction } from '../../actions';
import { clientApi } from '@/lib/api.client';
import { hasRole } from '@/lib/utils';
import { Archive, ArchiveRestore } from 'lucide-react';
import { PrayerRequest, User } from '@/lib/types';

type ViewMode = 'active' | 'deleted';

type Child = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  allergies?: string;
  medicalNotes?: string;
  deletedAt?: string;
};

type MemberDetailClientProps = {
  member: any;
  roles: Array<{ id: string; name: string; slug?: string }>;
  settings: any;
  children: Child[];
  deletedChildren: Child[];
  prayerRequests: PrayerRequest[];
  user: User | null;
};

export function MemberDetailClient({
  member,
  roles,
  settings,
  children: initialChildren,
  deletedChildren: initialDeletedChildren,
  prayerRequests,
  user,
}: MemberDetailClientProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isManageChildrenOpen, setIsManageChildrenOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [deletedChildren, setDeletedChildren] = useState<Child[]>(initialDeletedChildren);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const enabledFields = settings?.optionalFields ?? {};
  const primaryRoleId =
    member.roles?.[0]?.roleId ??
    roles.find(role => role.slug === 'member')?.id ??
    roles[0]?.id ??
    '';

  const canManageSoftDelete = hasRole(user?.roles, 'admin') || hasRole(user?.roles, 'leader');
  const displayedChildren = viewMode === 'active' ? children : deletedChildren;

  const handleToggleSelect = (id: string) => {
    setSelectedChildren(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedChildren(checked ? displayedChildren.map(c => c.id) : []);
  };

  const handleArchive = async (id: string) => {
    setIsLoading(true);
    try {
      await clientApi.deleteChild(id);
      const archived = children.find(c => c.id === id);
      if (archived) {
        setChildren(prev => prev.filter(c => c.id !== id));
        setDeletedChildren(prev => [...prev, { ...archived, deletedAt: new Date().toISOString() }]);
      }
      setSelectedChildren([]);
    } catch (error) {
      console.error('Failed to archive child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    setIsLoading(true);
    try {
      await clientApi.undeleteChild(id);
      const restored = deletedChildren.find(c => c.id === id);
      if (restored) {
        setDeletedChildren(prev => prev.filter(c => c.id !== id));
        setChildren(prev => [...prev, { ...restored, deletedAt: undefined }]);
      }
      setSelectedChildren([]);
    } catch (error) {
      console.error('Failed to restore child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    setIsLoading(true);
    try {
      await clientApi.bulkDeleteChildren(selectedChildren);
      const archived = children.filter(c => selectedChildren.includes(c.id));
      setChildren(prev => prev.filter(c => !selectedChildren.includes(c.id)));
      setDeletedChildren(prev => [
        ...prev,
        ...archived.map(c => ({ ...c, deletedAt: new Date().toISOString() })),
      ]);
      setSelectedChildren([]);
    } catch (error) {
      console.error('Failed to bulk archive children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    setIsLoading(true);
    try {
      await clientApi.bulkUndeleteChildren(selectedChildren);
      const restored = deletedChildren.filter(c => selectedChildren.includes(c.id));
      setDeletedChildren(prev => prev.filter(c => !selectedChildren.includes(c.id)));
      setChildren(prev => [...prev, ...restored.map(c => ({ ...c, deletedAt: undefined }))]);
      setSelectedChildren([]);
    } catch (error) {
      console.error('Failed to bulk restore children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            {member.profile?.firstName} {member.profile?.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">{member.primaryEmail}</p>
        </div>
        <div className="flex gap-2">
          <button
            id="remove-member-button"
            type="button"
            onClick={() => setIsRemoveOpen(true)}
            className="rounded-md border border-destructive bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
          >
            Remove Member
          </button>
          <button
            id="edit-profile-button"
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Edit Profile
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Contact">
          <p className="text-sm text-foreground">Phone: {member.profile?.phone || '—'}</p>
          <p className="text-xs text-muted-foreground">
            Joined: {format(new Date(member.createdAt), 'd MMM yyyy')}
          </p>
        </InfoCard>
        <InfoCard title="Household">
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground">Address: {member.household?.address || '—'}</p>
            <button
              id="manage-children-button"
              type="button"
              onClick={() => setIsManageChildrenOpen(true)}
              className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted/90"
            >
              Manage Children
            </button>
          </div>
          <div className="mt-4">
            <h3 className="text-xs uppercase text-muted-foreground">Children</h3>
            <ul className="mt-2 space-y-2">
              <li className="text-sm text-muted-foreground">No children in this household.</li>
            </ul>
          </div>
        </InfoCard>
        <InfoCard title="Roles">
          {member.roles?.length ? (
            <ul className="text-sm text-foreground">
              {member.roles.map((role: any) => (
                <li key={`${role.churchId}-${role.roleId}`}>
                  <span className="font-medium text-foreground">{role.role}</span>
                  {role.permissions?.length ? (
                    <span className="block text-xs text-muted-foreground">
                      Permissions: {role.permissions.slice(0, 4).join(', ')}
                      {role.permissions.length > 4 ? '…' : ''}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Member</p>
          )}
        </InfoCard>
      </div>
      <InfoCard title="My Prayer Requests">
        {prayerRequests?.length ? (
          <ul className="grid gap-2 md:grid-cols-2">
            {prayerRequests.map((request: any) => (
              <li key={request.id} className="rounded-md border border-border bg-card p-3 text-sm">
                <p className="font-medium text-card-foreground">{request.title}</p>
                <p className="text-xs text-muted-foreground">{request.description}</p>
                <form action={updatePrayerRequestAction} className="mt-2">
                  <input type="hidden" name="prayerRequestId" value={request.id} />
                  <button
                    id={`mark-as-answered-button-${request.id}`}
                    type="submit"
                    className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    Mark as Answered
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No prayer requests submitted.</p>
        )}
      </InfoCard>
      <InfoCard title="Details">
        <div className="grid grid-cols-2 gap-4">
          {enabledFields.membershipStatus && (
            <p className="text-sm text-foreground">
              Membership Status: {member.profile?.membershipStatus || '—'}
            </p>
          )}
          {enabledFields.joinMethod && (
            <p className="text-sm text-foreground">
              Join Method: {member.profile?.joinMethod || '—'}
            </p>
          )}
          {enabledFields.joinDate && (
            <p className="text-sm text-foreground">
              Join Date:{' '}
              {member.profile?.joinDate
                ? format(new Date(member.profile.joinDate), 'd MMM yyyy')
                : '—'}
            </p>
          )}
          {enabledFields.baptismDate && (
            <p className="text-sm text-foreground">
              Baptism Date:{' '}
              {member.profile?.baptismDate
                ? format(new Date(member.profile.baptismDate), 'd MMM yyyy')
                : '—'}
            </p>
          )}
          {enabledFields.maritalStatus && (
            <p className="text-sm text-foreground">
              Marital Status: {member.profile?.maritalStatus || '—'}
            </p>
          )}
        </div>
      </InfoCard>
      <InfoCard title="Groups">
        {member.groups?.length ? (
          <ul className="grid gap-2 md:grid-cols-2">
            {member.groups.map((group: any) => (
              <li key={group.id} className="rounded-md border border-border bg-card p-3 text-sm">
                <p className="font-medium text-card-foreground">{group.name}</p>
                <p className="text-xs text-muted-foreground">Role: {group.role}</p>
                <Link
                  id={`view-group-link-${group.id}`}
                  href={`/groups/${group.id}`}
                  className="mt-2 inline-block text-xs text-primary hover:underline"
                >
                  View group
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No groups assigned.</p>
        )}
      </InfoCard>
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Attendance (recent)">
          {member.attendance?.length ? (
            <ul className="space-y-2 text-sm">
              {member.attendance.slice(0, 5).map((record: any) => (
                <li key={`${record.eventId}-${record.startAt}`} className="flex justify-between">
                  <span>{record.title}</span>
                  <span className="text-muted-foreground">{record.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No attendance yet.</p>
          )}
        </InfoCard>
        <InfoCard title="Contributions">
          {member.contributions?.length ? (
            <ul className="space-y-2 text-sm">
              {member.contributions.slice(0, 5).map((entry: any) => (
                <li key={entry.contributionId} className="flex justify-between">
                  <span>{format(new Date(entry.date), 'd MMM')}</span>
                  <span>${entry.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No contributions on record.</p>
          )}
        </InfoCard>
      </div>
      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Member Profile"
        footer={
          <p className="text-xs text-muted-foreground">
            Saving applies immediately and revalidates any dependent listings.
          </p>
        }
      >
        <form
          action={updateMemberAction}
          className="grid gap-4 md:grid-cols-2"
          onSubmit={() => setIsEditOpen(false)}
        >
          <input type="hidden" name="userId" value={member.id} />
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            First Name
            <input
              id="edit-first-name-input"
              name="firstName"
              defaultValue={member.profile?.firstName ?? ''}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Last Name
            <input
              id="edit-last-name-input"
              name="lastName"
              defaultValue={member.profile?.lastName ?? ''}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground md:col-span-2">
            Email
            <input
              id="edit-email-input"
              name="primaryEmail"
              type="email"
              defaultValue={member.primaryEmail}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Phone
            <input
              id="edit-phone-input"
              name="phone"
              defaultValue={member.profile?.phone ?? ''}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Address
            <input
              id="edit-address-input"
              name="address"
              defaultValue={member.household?.address ?? ''}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          {enabledFields.membershipStatus && (
            <label className="grid gap-1 text-xs uppercase text-muted-foreground">
              Membership Status
              <input
                id="edit-membership-status-input"
                name="membershipStatus"
                defaultValue={member.profile?.membershipStatus ?? ''}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          )}
          {enabledFields.joinDate && (
            <label className="grid gap-1 text-xs uppercase text-muted-foreground">
              Join Date
              <input
                id="edit-join-date-input"
                name="joinDate"
                type="date"
                defaultValue={
                  member.profile?.joinDate
                    ? format(new Date(member.profile.joinDate), 'yyyy-MM-dd')
                    : ''
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          )}
          {enabledFields.baptismDate && (
            <label className="grid gap-1 text-xs uppercase text-muted-foreground">
              Baptism Date
              <input
                id="edit-baptism-date-input"
                name="baptismDate"
                type="date"
                defaultValue={
                  member.profile?.baptismDate
                    ? format(new Date(member.profile.baptismDate), 'yyyy-MM-dd')
                    : ''
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          )}
          {enabledFields.joinMethod && (
            <label className="grid gap-1 text-xs uppercase text-muted-foreground">
              Join Method
              <input
                id="edit-join-method-input"
                name="joinMethod"
                defaultValue={member.profile?.joinMethod ?? ''}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          )}
          {enabledFields.maritalStatus && (
            <label className="grid gap-1 text-xs uppercase text-muted-foreground">
              Marital Status
              <input
                id="edit-marital-status-input"
                name="maritalStatus"
                defaultValue={member.profile?.maritalStatus ?? ''}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          )}
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Status
            <select
              id="edit-status-select"
              name="status"
              defaultValue={member.status ?? 'active'}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="active">Active</option>
              <option value="invited">Invited</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Role
            <select
              id="edit-role-select"
              name="roleId"
              defaultValue={primaryRoleId}
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
              id="edit-notes-textarea"
              name="notes"
              rows={3}
              defaultValue={member.profile?.notes ?? ''}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              id="edit-cancel-button"
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              id="edit-save-changes-button"
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
      <Modal
        open={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Archive Member"
        footer={
          <p className="text-xs text-muted-foreground">
            This archives the member and hides them from the directory. They can be recovered by an
            admin. Group memberships and attendance records will be preserved.
          </p>
        }
      >
        <p className="text-sm text-foreground">
          Are you sure you want to archive{' '}
          <span className="font-medium">
            {member.profile?.firstName} {member.profile?.lastName}
          </span>{' '}
          from the directory?
        </p>
        <form
          action={deleteMemberAction}
          className="mt-6 flex justify-end gap-3"
          onSubmit={() => setIsRemoveOpen(false)}
        >
          <input type="hidden" name="userId" value={member.id} />
          <button
            id="remove-member-cancel-button"
            type="button"
            onClick={() => setIsRemoveOpen(false)}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            id="remove-member-confirm-button"
            type="submit"
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
          >
            Archive Member
          </button>
        </form>
      </Modal>
      // ...
      <Modal
        open={isManageChildrenOpen}
        onClose={() => setIsManageChildrenOpen(false)}
        title="Manage Children"
      >
        <form action={''} className="space-y-4">
          <input type="hidden" name="householdId" value={member.household?.id} />
          <input type="hidden" name="userId" value={member.id} />
          <div>
            <h3 className="text-lg font-medium text-foreground">Add a New Child</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Full Name
                <input
                  id="add-child-full-name-input"
                  name="fullName"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Date of Birth
                <input
                  id="add-child-dob-input"
                  name="dateOfBirth"
                  type="date"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="col-span-2 grid gap-1 text-xs uppercase text-muted-foreground">
                Allergies
                <input
                  id="add-child-allergies-input"
                  name="allergies"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="col-span-2 grid gap-1 text-xs uppercase text-muted-foreground">
                Medical Notes
                <textarea
                  id="add-child-medical-notes-textarea"
                  name="medicalNotes"
                  rows={3}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                id="add-child-button"
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Add Child
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Existing Children</h3>
              {canManageSoftDelete && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewMode(viewMode === 'active' ? 'deleted' : 'active');
                    setSelectedChildren([]);
                  }}
                  data-testid="toggle-children-view"
                >
                  {viewMode === 'active' ? 'Show Archived' : 'Show Active'}
                </Button>
              )}
            </div>

            {canManageSoftDelete && displayedChildren.length > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <Checkbox
                  id="select-all-children"
                  checked={
                    selectedChildren.length === displayedChildren.length &&
                    displayedChildren.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  disabled={isLoading}
                  className="cursor-pointer"
                  data-testid="select-all-children"
                />
                <label htmlFor="select-all-children" className="text-sm text-muted-foreground">
                  Select All ({displayedChildren.length})
                </label>
                {selectedChildren.length > 0 && (
                  <div className="ml-auto flex gap-2">
                    {viewMode === 'active' ? (
                      <Button
                        variant="outline"
                        onClick={handleBulkArchive}
                        disabled={isLoading}
                        data-testid="bulk-archive-children"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive ({selectedChildren.length})
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleBulkRestore}
                        disabled={isLoading}
                        data-testid="bulk-restore-children"
                      >
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Restore ({selectedChildren.length})
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            <ul className="mt-2 space-y-2">
              {displayedChildren.length > 0 ? (
                displayedChildren.map(child => (
                  <li
                    key={child.id}
                    className={`flex items-center gap-3 rounded-md border border-border p-3 text-sm ${
                      child.deletedAt ? 'bg-muted/50 opacity-60' : 'bg-card'
                    }`}
                    data-testid={`child-${child.id}`}
                  >
                    {canManageSoftDelete && (
                      <>
                        <Checkbox
                          id={`select-child-${child.id}`}
                          checked={selectedChildren.includes(child.id)}
                          onCheckedChange={() => handleToggleSelect(child.id)}
                          disabled={isLoading}
                          className="cursor-pointer"
                        />
                        <label htmlFor={`select-child-${child.id}`} className="sr-only">
                          Select {child.fullName}
                        </label>
                      </>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-card-foreground">{child.fullName}</p>
                        {child.deletedAt && (
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Born: {format(new Date(child.dateOfBirth), 'd MMM yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!child.deletedAt && (
                        <button
                          id={`edit-child-button-${child.id}`}
                          type="button"
                          className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted/90"
                        >
                          Edit
                        </button>
                      )}
                      {canManageSoftDelete && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            child.deletedAt ? handleRestore(child.id) : handleArchive(child.id)
                          }
                          disabled={isLoading}
                          data-testid={`${child.deletedAt ? 'restore' : 'archive'}-child-${child.id}`}
                        >
                          {child.deletedAt ? (
                            <>
                              <ArchiveRestore className="mr-1 h-3 w-3" />
                              Restore
                            </>
                          ) : (
                            <>
                              <Archive className="mr-1 h-3 w-3" />
                              Archive
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">
                  {viewMode === 'active'
                    ? 'No children in this household.'
                    : 'No archived children.'}
                </li>
              )}
            </ul>
          </div>
        </form>
      </Modal>
    </section>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-lg">
      <h2 className="text-lg font-semibold text-card-foreground">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { Button } from '@/components/ui-flowbite/button';
import { clientApi } from '@/lib/api.client';
import { hasRole } from '@/lib/utils';
import { Archive, ArchiveRestore } from 'lucide-react';
import { User } from '@/lib/types';

type ViewMode = 'active' | 'deleted';

type Child = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  allergies?: string;
  medicalNotes?: string;
  deletedAt?: string;
};

type Household = {
  id: string;
  name: string;
  address: string;
  members?: Array<{
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      householdRole: string;
    };
  }>;
};

type HouseholdDetailClientProps = {
  household: Household;
  children: Child[];
  deletedChildren: Child[];
  user: User | null;
};

export function HouseholdDetailClient({
  household,
  children: initialChildren,
  deletedChildren: initialDeletedChildren,
  user,
}: HouseholdDetailClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [deletedChildren, setDeletedChildren] = useState<Child[]>(initialDeletedChildren);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{household.name}</h1>
        <p className="text-sm text-muted-foreground">{household.address}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold">Members</h2>
        <div className="mt-4 flex flex-col gap-4">
          {household.members?.length ? (
            household.members.map(member => (
              <Link
                id={`member-link-${member.id}`}
                key={member.id}
                href={`/members/${member.id}`}
                className="block rounded-lg border border-border p-4 transition hover:bg-muted"
              >
                <h3 className="text-lg font-semibold">
                  {member.profile?.firstName} {member.profile?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{member.profile?.householdRole}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No members in this household.</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Children</h2>
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
                selectedChildren.length === displayedChildren.length && displayedChildren.length > 0
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

        <div className="mt-4 flex flex-col gap-3">
          {displayedChildren.length > 0 ? (
            displayedChildren.map(child => (
              <div
                key={child.id}
                className={`flex items-center gap-3 rounded-lg border border-border p-4 ${
                  child.deletedAt ? 'bg-muted/50 opacity-60' : ''
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
                    <h3 className="text-lg font-semibold">{child.fullName}</h3>
                    {child.deletedAt && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Born: {format(new Date(child.dateOfBirth), 'd MMM yyyy')}
                  </p>
                  {child.allergies && (
                    <p className="text-sm text-muted-foreground">Allergies: {child.allergies}</p>
                  )}
                </div>
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
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Restore
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              {viewMode === 'active' ? 'No children in this household.' : 'No archived children.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

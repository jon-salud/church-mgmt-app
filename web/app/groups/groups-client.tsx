'use client';

import Link from 'next/link';
import { useState } from 'react';
import { clientApi } from '@/lib/api.client';
import { hasRole } from '@/lib/utils';
import { User } from '@/lib/types';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { Button } from '@/components/ui-flowbite/button';
import { Archive, ArchiveRestore } from 'lucide-react';

type Group = {
  id: string;
  name: string;
  type: string;
  description?: string;
  meetingDay?: string;
  meetingTime?: string;
  members?: any[];
  deletedAt?: string;
};

type GroupsClientProps = {
  groups: Group[];
  deletedGroups: Group[];
  user: User | null;
};

export function GroupsClient({
  groups: initialGroups,
  deletedGroups: initialDeletedGroups,
  user,
}: GroupsClientProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [deletedGroups, setDeletedGroups] = useState(initialDeletedGroups);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = hasRole(user?.roles, 'admin');
  const displayGroups = showArchived ? deletedGroups : groups;
  const allSelected = selectedIds.size === displayGroups.length && displayGroups.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayGroups.map(g => g.id)));
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

  const handleArchive = async (id: string) => {
    setIsProcessing(true);
    try {
      await clientApi.deleteGroup(id);
      const archived = groups.find(g => g.id === id);
      if (archived) {
        setGroups(groups.filter(g => g.id !== id));
        setDeletedGroups([...deletedGroups, { ...archived, deletedAt: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Failed to archive group:', error);
      window.alert('Failed to archive group. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (id: string) => {
    setIsProcessing(true);
    try {
      await clientApi.undeleteGroup(id);
      const restored = deletedGroups.find(g => g.id === id);
      if (restored) {
        setDeletedGroups(deletedGroups.filter(g => g.id !== id));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { deletedAt, ...restoredGroup } = restored;
        setGroups([...groups, restoredGroup]);
      }
    } catch (error) {
      console.error('Failed to restore group:', error);
      window.alert('Failed to restore group. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Archive ${selectedIds.size} group(s)?`)) return;

    setIsProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      const result = await clientApi.bulkDeleteGroups(idsArray);
      if (result.success) {
        const archivedGroups = groups.filter(g => selectedIds.has(g.id));
        setGroups(groups.filter(g => !selectedIds.has(g.id)));
        setDeletedGroups([
          ...deletedGroups,
          ...archivedGroups.map(g => ({ ...g, deletedAt: new Date().toISOString() })),
        ]);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to bulk archive groups:', error);
      window.alert('Failed to archive groups. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Restore ${selectedIds.size} group(s)?`)) return;

    setIsProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      const result = await clientApi.bulkUndeleteGroups(idsArray);
      if (result.success) {
        const restoredGroups = deletedGroups.filter(g => selectedIds.has(g.id));
        setDeletedGroups(deletedGroups.filter(g => !selectedIds.has(g.id)));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setGroups([...groups, ...restoredGroups.map(({ deletedAt, ...g }) => g)]);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to bulk restore groups:', error);
      window.alert('Failed to restore groups. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Groups & Ministries</h1>
          <p className="text-sm text-muted-foreground">
            Track life groups, ministries, and their leaders.
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                id="show-archived-groups"
                checked={showArchived}
                onCheckedChange={checked => {
                  setShowArchived(checked === true);
                  setSelectedIds(new Set());
                }}
              />
              <span>Show Archived ({deletedGroups.length})</span>
            </label>
          </div>
        )}
      </div>

      {isAdmin && displayGroups.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3">
          <Checkbox
            id="select-all-groups"
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
          />
          <label
            htmlFor="select-all-groups"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
          </label>
          {selectedIds.size > 0 && (
            <div className="ml-auto flex gap-2">
              {showArchived ? (
                <Button
                  id="bulk-restore-groups-button"
                  variant="outline"
                  onClick={handleBulkRestore}
                  disabled={isProcessing}
                >
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Restore Selected
                </Button>
              ) : (
                <Button
                  id="bulk-archive-groups-button"
                  variant="outline"
                  onClick={handleBulkArchive}
                  disabled={isProcessing}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Selected
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {displayGroups.map(group => (
          <article
            key={group.id}
            className={`rounded-xl border border-border bg-card/60 p-4 transition ${
              showArchived ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {isAdmin && (
                <>
                  <Checkbox
                    id={`select-group-${group.id}`}
                    checked={selectedIds.has(group.id)}
                    onCheckedChange={() => toggleSelect(group.id)}
                    className="mt-1"
                  />
                  <label htmlFor={`select-group-${group.id}`} className="sr-only">
                    Select {group.name}
                  </label>
                </>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    id={`group-link-${group.id}`}
                    href={`/groups/${group.id}`}
                    className="hover:underline"
                  >
                    <h2 className="text-lg font-semibold text-foreground">{group.name}</h2>
                  </Link>
                  {group.deletedAt && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{group.type}</p>
                <p className="mt-2 text-sm text-foreground">
                  {group.description || 'No description added yet.'}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Meeting: {group.meetingDay || 'TBA'}{' '}
                  {group.meetingTime ? `· ${group.meetingTime}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  Members: {group.members?.length ?? 0}
                </p>
                {isAdmin && (
                  <div className="mt-3 flex gap-2">
                    {showArchived ? (
                      <Button
                        id={`restore-group-${group.id}`}
                        variant="outline"
                        onClick={() => handleRestore(group.id)}
                        disabled={isProcessing}
                      >
                        <ArchiveRestore className="mr-1 h-4 w-4" />
                        Restore
                      </Button>
                    ) : (
                      <Button
                        id={`archive-group-${group.id}`}
                        variant="outline"
                        onClick={() => handleArchive(group.id)}
                        disabled={isProcessing}
                      >
                        <Archive className="mr-1 h-4 w-4" />
                        Archive
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {displayGroups.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {showArchived ? 'No archived groups' : 'No groups found'}
        </div>
      )}
    </section>
  );
}

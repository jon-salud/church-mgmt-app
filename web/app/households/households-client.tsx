'use client';

import Link from 'next/link';
import { useState } from 'react';
import { clientApi } from '@/lib/api.client';
import { hasRole } from '@/lib/utils';
import { User, HouseholdDependents } from '@/lib/types';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { Button } from '@/components/ui-flowbite/button';
import { Modal } from '@/components/ui-flowbite/modal';
import { Archive, ArchiveRestore, AlertTriangle } from 'lucide-react';

type Household = {
  id: string;
  name: string;
  memberCount: number;
  deletedAt?: string;
};

type HouseholdsClientProps = {
  households: Household[];
  deletedHouseholds: Household[];
  user: User | null;
};

export function HouseholdsClient({
  households: initialHouseholds,
  deletedHouseholds: initialDeletedHouseholds,
  user,
}: HouseholdsClientProps) {
  const [households, setHouseholds] = useState(initialHouseholds);
  const [deletedHouseholds, setDeletedHouseholds] = useState(initialDeletedHouseholds);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    name: string;
    dependents: HouseholdDependents | null;
  } | null>(null);
  const [isLoadingDependents, setIsLoadingDependents] = useState(false);

  const isAdmin = hasRole(user?.roles, 'admin');
  const displayHouseholds = showArchived ? deletedHouseholds : households;
  const allSelected = selectedIds.size === displayHouseholds.length && displayHouseholds.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayHouseholds.map(h => h.id)));
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

  const openDeleteModal = async (household: Household) => {
    setIsLoadingDependents(true);
    setDeleteModal({
      id: household.id,
      name: household.name,
      dependents: null,
    });

    try {
      const dependents = await clientApi.getHouseholdDependents(household.id);
      setDeleteModal({
        id: household.id,
        name: household.name,
        dependents,
      });
    } catch (error) {
      console.error('Failed to load household dependents:', error);
      setDeleteModal({
        id: household.id,
        name: household.name,
        dependents: null,
      });
    } finally {
      setIsLoadingDependents(false);
    }
  };

  const handleArchive = async () => {
    if (!deleteModal) return;

    setIsProcessing(true);
    try {
      await clientApi.deleteHousehold(deleteModal.id);
      const archived = households.find(h => h.id === deleteModal.id);
      if (archived) {
        setHouseholds(households.filter(h => h.id !== deleteModal.id));
        setDeletedHouseholds([
          ...deletedHouseholds,
          { ...archived, deletedAt: new Date().toISOString() },
        ]);
      }
      setDeleteModal(null);
    } catch (error) {
      console.error('Failed to archive household:', error);
      window.alert('Failed to archive household. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (id: string) => {
    setIsProcessing(true);
    try {
      await clientApi.undeleteHousehold(id);
      const restored = deletedHouseholds.find(h => h.id === id);
      if (restored) {
        setDeletedHouseholds(deletedHouseholds.filter(h => h.id !== id));
        // Remove deletedAt when restoring
        setHouseholds([...households, { ...restored, deletedAt: undefined }]);
      }
    } catch (error) {
      console.error('Failed to restore household:', error);
      window.alert('Failed to restore household. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Archive ${selectedIds.size} household(s)?`)) return;

    setIsProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      const result = await clientApi.bulkDeleteHouseholds(idsArray);
      if (result.success) {
        const archivedHouseholds = households.filter(h => selectedIds.has(h.id));
        setHouseholds(households.filter(h => !selectedIds.has(h.id)));
        setDeletedHouseholds([
          ...deletedHouseholds,
          ...archivedHouseholds.map(h => ({ ...h, deletedAt: new Date().toISOString() })),
        ]);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to bulk archive households:', error);
      window.alert('Failed to archive households. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Restore ${selectedIds.size} household(s)?`)) return;

    setIsProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      const result = await clientApi.bulkUndeleteHouseholds(idsArray);
      if (result.success) {
        const restoredHouseholds = deletedHouseholds.filter(h => selectedIds.has(h.id));
        setDeletedHouseholds(deletedHouseholds.filter(h => !selectedIds.has(h.id)));
        // Remove deletedAt when restoring
        setHouseholds([
          ...households,
          ...restoredHouseholds.map(h => ({ ...h, deletedAt: undefined })),
        ]);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to bulk restore households:', error);
      window.alert('Failed to restore households. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasDependents = (deps: HouseholdDependents | null): boolean => {
    if (!deps) return false;
    return deps.activeMemberCount > 0 || deps.activeChildrenCount > 0;
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Households</h1>
          <p className="text-sm text-muted-foreground">
            Manage household groups and their members.
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                id="show-archived-households"
                checked={showArchived}
                onCheckedChange={checked => {
                  setShowArchived(checked === true);
                  setSelectedIds(new Set());
                }}
              />
              <span>Show Archived ({deletedHouseholds.length})</span>
            </label>
          </div>
        )}
      </div>

      {isAdmin && displayHouseholds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3">
          <Checkbox
            id="select-all-households"
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
            className="cursor-pointer"
          />
          <label htmlFor="select-all-households" className="text-sm text-muted-foreground">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
          </label>
          {selectedIds.size > 0 && (
            <div className="ml-auto flex gap-2">
              {showArchived ? (
                <Button
                  id="bulk-restore-households-button"
                  variant="outline"
                  onClick={handleBulkRestore}
                  disabled={isProcessing}
                >
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Restore Selected
                </Button>
              ) : (
                <Button
                  id="bulk-archive-households-button"
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
        {displayHouseholds.map(household => (
          <article
            key={household.id}
            className={`rounded-xl border border-border bg-card/60 p-4 transition ${
              showArchived ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {isAdmin && (
                <>
                  <Checkbox
                    id={`select-household-${household.id}`}
                    checked={selectedIds.has(household.id)}
                    onCheckedChange={() => toggleSelect(household.id)}
                    className="mt-1"
                  />
                  <label htmlFor={`select-household-${household.id}`} className="sr-only">
                    Select {household.name}
                  </label>
                </>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    id={`household-link-${household.id}`}
                    href={`/households/${household.id}`}
                    className="hover:underline"
                  >
                    <h2 className="text-lg font-semibold text-foreground">{household.name}</h2>
                  </Link>
                  {household.deletedAt && (
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                      Archived
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {household.memberCount} member{household.memberCount === 1 ? '' : 's'}
                </p>
                {isAdmin && (
                  <div className="mt-3 flex gap-2">
                    {showArchived ? (
                      <Button
                        id={`restore-household-${household.id}`}
                        variant="outline"
                        onClick={() => handleRestore(household.id)}
                        disabled={isProcessing}
                      >
                        <ArchiveRestore className="mr-1 h-4 w-4" />
                        Restore
                      </Button>
                    ) : (
                      <Button
                        id={`archive-household-${household.id}`}
                        variant="outline"
                        onClick={() => openDeleteModal(household)}
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

      {displayHouseholds.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {showArchived ? 'No archived households' : 'No households found'}
        </div>
      )}

      <Modal
        open={Boolean(deleteModal)}
        onClose={() => !isProcessing && setDeleteModal(null)}
        title={`Archive ${deleteModal?.name || 'Household'}`}
      >
        <div className="space-y-4">
          {isLoadingDependents ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Checking household dependencies...</p>
            </div>
          ) : deleteModal && hasDependents(deleteModal.dependents) ? (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground">
                    This household has active dependents
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {deleteModal.dependents && deleteModal.dependents.activeMemberCount > 0 && (
                      <p>
                        • {deleteModal.dependents.activeMemberCount} active member
                        {deleteModal.dependents.activeMemberCount === 1 ? '' : 's'}
                      </p>
                    )}
                    {deleteModal.dependents && deleteModal.dependents.activeChildrenCount > 0 && (
                      <p>
                        • {deleteModal.dependents.activeChildrenCount} active child
                        {deleteModal.dependents.activeChildrenCount === 1 ? '' : 'ren'}
                      </p>
                    )}
                  </div>
                  {deleteModal.dependents &&
                    deleteModal.dependents.children &&
                    deleteModal.dependents.children.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-foreground">Children:</p>
                        <ul className="text-sm text-muted-foreground space-y-0.5">
                          {deleteModal.dependents.children.map(child => (
                            <li key={child.id}>• {child.fullName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Archiving this household will also archive all its members and children.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Are you sure you want to archive this household? You can restore it later from the
              archived view.
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteModal(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              id="confirm-archive-household-button"
              variant="destructive"
              onClick={handleArchive}
              disabled={isProcessing || isLoadingDependents}
            >
              <Archive className="mr-2 h-4 w-4" />
              {isProcessing ? 'Archiving...' : 'Archive Household'}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

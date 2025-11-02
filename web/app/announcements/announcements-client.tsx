'use client';

import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui-flowbite/modal';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import { Button } from '@/components/ui-flowbite/button';
import { Archive, ArchiveRestore } from 'lucide-react';
import {
  createAnnouncementAction,
  markAnnouncementReadAction,
  updateAnnouncementAction,
} from '../actions';
import { loadOfflineSnapshot, persistOfflineSnapshot } from '../../lib/offline-cache';
import { useOfflineStatus } from '../../lib/use-offline-status';
import { clientApi } from '@/lib/api.client';
import { hasRole } from '@/lib/utils';
import { User } from '@/lib/types';

type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'custom';
  groupIds?: string[];
  publishAt: string;
  expireAt?: string | null;
  reads?: Array<{ userId: string }>;
  deletedAt?: string;
};

type Group = {
  id: string;
  name: string;
};

type AnnouncementsClientProps = {
  announcements: Announcement[];
  groups: Group[];
  deletedAnnouncements: Announcement[];
  user: User | null;
};

type AnnouncementDraft = {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'custom';
  groupIds: string[];
  publishAt: string;
  expireAt?: string | null;
};

const formatInputDate = (iso?: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

const statusBadge = (announcement: Announcement) => {
  const now = Date.now();
  const publishAt = new Date(announcement.publishAt).getTime();
  const expireAt = announcement.expireAt ? new Date(announcement.expireAt).getTime() : undefined;
  if (expireAt && expireAt < now) {
    return { label: 'Expired', className: 'bg-muted text-muted-foreground' };
  }
  if (publishAt > now) {
    return { label: 'Scheduled', className: 'bg-amber-400 text-amber-900' };
  }
  return { label: 'Published', className: 'bg-emerald-400 text-emerald-900' };
};

const audienceLabel = (announcement: Announcement, groupMap: Map<string, Group>) => {
  if (announcement.audience === 'all') {
    return 'Whole church';
  }
  if (!announcement.groupIds || announcement.groupIds.length === 0) {
    return 'Selected groups (none set)';
  }
  return announcement.groupIds.map(id => groupMap.get(id)?.name || id).join(', ');
};

export function AnnouncementsClient({
  announcements,
  groups,
  deletedAnnouncements,
  user,
}: AnnouncementsClientProps) {
  const [announcementState, setAnnouncementState] = useState(announcements);
  const [deletedAnnouncementState, setDeletedAnnouncementState] = useState(deletedAnnouncements);
  const [groupState, setGroupState] = useState(groups);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const isOffline = useOfflineStatus();
  const isAdmin = hasRole(user?.roles, 'admin');

  useEffect(() => {
    setAnnouncementState(announcements);
    setDeletedAnnouncementState(deletedAnnouncements);
    setGroupState(groups);
  }, [announcements, deletedAnnouncements, groups]);

  useEffect(() => {
    persistOfflineSnapshot('announcements', {
      announcements: announcementState,
      groups: groupState,
    });
  }, [announcementState, groupState]);

  useEffect(() => {
    if (!isOffline) {
      return;
    }
    if (announcementState.length > 0 || groupState.length > 0) {
      return;
    }
    loadOfflineSnapshot<'announcements'>('announcements').then(snapshot => {
      if (!snapshot) {
        return;
      }
      const offlineAnnouncements = Array.isArray(snapshot.announcements)
        ? (snapshot.announcements as Announcement[])
        : [];
      const offlineGroups = Array.isArray(snapshot.groups) ? (snapshot.groups as Group[]) : [];
      if (offlineAnnouncements.length > 0) {
        setAnnouncementState(offlineAnnouncements);
      }
      if (offlineGroups.length > 0) {
        setGroupState(offlineGroups);
      }
    });
  }, [isOffline, announcementState.length, groupState.length]);

  const groupMap = useMemo(() => new Map(groupState.map(group => [group.id, group])), [groupState]);
  const displayAnnouncements = showArchived ? deletedAnnouncementState : announcementState;
  const sortedAnnouncements = useMemo(
    () =>
      [...displayAnnouncements].sort(
        (a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime()
      ),
    [displayAnnouncements]
  );
  const allSelected =
    selectedIds.size === sortedAnnouncements.length && sortedAnnouncements.length > 0;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createAudience, setCreateAudience] = useState<'all' | 'custom'>('all');
  const [editModal, setEditModal] = useState<AnnouncementDraft | null>(null);
  const [editAudience, setEditAudience] = useState<'all' | 'custom'>('all');

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedAnnouncements.map(a => a.id)));
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
      await clientApi.deleteAnnouncement(id);
      const archived = announcementState.find(a => a.id === id);
      if (archived) {
        setAnnouncementState(announcementState.filter(a => a.id !== id));
        setDeletedAnnouncementState([
          ...deletedAnnouncementState,
          { ...archived, deletedAt: new Date().toISOString() },
        ]);
      }
    } catch (error) {
      console.error('Failed to archive announcement:', error);
      window.alert('Failed to archive announcement. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (id: string) => {
    setIsProcessing(true);
    try {
      await clientApi.undeleteAnnouncement(id);
      const restored = deletedAnnouncementState.find(a => a.id === id);
      if (restored) {
        setDeletedAnnouncementState(deletedAnnouncementState.filter(a => a.id !== id));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { deletedAt, ...restoredAnnouncement } = restored;
        setAnnouncementState([...announcementState, restoredAnnouncement]);
      }
    } catch (error) {
      console.error('Failed to restore announcement:', error);
      window.alert('Failed to restore announcement. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Archive ${selectedIds.size} announcement(s)?`)) return;

    setIsProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      const result = await clientApi.bulkDeleteAnnouncements(idsArray);
      if (result.success) {
        const archivedAnnouncements = announcementState.filter(a => selectedIds.has(a.id));
        setAnnouncementState(announcementState.filter(a => !selectedIds.has(a.id)));
        setDeletedAnnouncementState([
          ...deletedAnnouncementState,
          ...archivedAnnouncements.map(a => ({ ...a, deletedAt: new Date().toISOString() })),
        ]);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to bulk archive announcements:', error);
      window.alert('Failed to archive announcements. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Restore ${selectedIds.size} announcement(s)?`)) return;

    setIsProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      const result = await clientApi.bulkUndeleteAnnouncements(idsArray);
      if (result.success) {
        const restoredAnnouncements = deletedAnnouncementState.filter(a => selectedIds.has(a.id));
        setDeletedAnnouncementState(deletedAnnouncementState.filter(a => !selectedIds.has(a.id)));
        setAnnouncementState([
          ...announcementState,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ...restoredAnnouncements.map(({ deletedAt, ...a }) => a),
        ]);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('Failed to bulk restore announcements:', error);
      window.alert('Failed to restore announcements. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Announcements</h1>
          <p className="text-sm text-muted-foreground">
            Share updates across the church or target specific groups with scheduling controls.
          </p>
          {isOffline ? (
            <p className="text-xs text-amber-300">
              Offline mode: showing the most recent announcements saved on this device.
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                id="show-archived-announcements"
                checked={showArchived}
                onCheckedChange={checked => {
                  setShowArchived(checked === true);
                  setSelectedIds(new Set());
                }}
              />
              <span>Show Archived ({deletedAnnouncementState.length})</span>
            </label>
          )}
          <button
            id="new-announcement-button"
            type="button"
            onClick={() => {
              setCreateAudience('all');
              setIsCreateOpen(true);
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            New announcement
          </button>
        </div>
      </header>

      {isAdmin && sortedAnnouncements.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3">
          <Checkbox
            id="select-all-announcements"
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
          />
          <label
            htmlFor="select-all-announcements"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
          </label>
          {selectedIds.size > 0 && (
            <div className="ml-auto flex gap-2">
              {showArchived ? (
                <Button
                  id="bulk-restore-announcements-button"
                  variant="outline"
                  onClick={handleBulkRestore}
                  disabled={isProcessing}
                >
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Restore Selected
                </Button>
              ) : (
                <Button
                  id="bulk-archive-announcements-button"
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

      <div className="space-y-4">
        {sortedAnnouncements.map(announcement => {
          const badge = statusBadge(announcement);
          const publishDisplay = format(new Date(announcement.publishAt), 'd MMM yyyy, h:mma');
          const expireDisplay = announcement.expireAt
            ? format(new Date(announcement.expireAt), 'd MMM yyyy, h:mma')
            : null;
          const readCount = announcement.reads?.length ?? 0;
          return (
            <article
              key={announcement.id}
              className={`rounded-xl border border-border bg-card/60 p-5 shadow-lg shadow-black/5 ${
                announcement.deletedAt ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {isAdmin && (
                  <>
                    <Checkbox
                      id={`select-announcement-${announcement.id}`}
                      checked={selectedIds.has(announcement.id)}
                      onCheckedChange={() => toggleSelect(announcement.id)}
                      className="mt-1"
                    />
                    <label htmlFor={`select-announcement-${announcement.id}`} className="sr-only">
                      Select {announcement.title}
                    </label>
                  </>
                )}
                <div className="flex-1 min-w-0">
                  <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-foreground">
                          {announcement.title}
                        </h2>
                        {announcement.deletedAt && (
                          <span className="rounded-full border border-border px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                            Archived
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className={`rounded-full px-3 py-1 font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span>
                          Publishes {publishDisplay}
                          {expireDisplay ? ` · Expires ${expireDisplay}` : ''}
                        </span>
                        <span>Audience: {audienceLabel(announcement, groupMap)}</span>
                        <span>Reads: {readCount}</span>
                      </div>
                    </div>
                    {!showArchived && (
                      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                        <form action={markAnnouncementReadAction.bind(null, announcement.id)}>
                          <button
                            id={`mark-read-button-${announcement.id}`}
                            className="rounded-md border border-border px-3 py-1 text-xs uppercase tracking-wide text-foreground transition hover:bg-muted"
                          >
                            Mark read
                          </button>
                        </form>
                        <button
                          id={`edit-button-${announcement.id}`}
                          type="button"
                          onClick={() => {
                            setEditAudience(announcement.audience);
                            setEditModal({
                              id: announcement.id,
                              title: announcement.title,
                              body: announcement.body,
                              audience: announcement.audience,
                              groupIds: announcement.groupIds ?? [],
                              publishAt: announcement.publishAt,
                              expireAt: announcement.expireAt ?? undefined,
                            });
                          }}
                          className="rounded-md border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </header>

                  <p className="mt-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {announcement.body}
                  </p>

                  {isAdmin && (
                    <div className="mt-3 flex gap-2">
                      {showArchived ? (
                        <Button
                          id={`restore-announcement-${announcement.id}`}
                          variant="outline"
                          onClick={() => handleRestore(announcement.id)}
                          disabled={isProcessing}
                        >
                          <ArchiveRestore className="mr-1 h-3 w-3" />
                          Restore
                        </Button>
                      ) : (
                        <Button
                          id={`archive-announcement-${announcement.id}`}
                          variant="outline"
                          onClick={() => handleArchive(announcement.id)}
                          disabled={isProcessing}
                        >
                          <Archive className="mr-1 h-3 w-3" />
                          Archive
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {sortedAnnouncements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {showArchived ? 'No archived announcements' : 'No announcements found'}
          </div>
        )}
      </div>

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create announcement"
        footer={
          <p className="text-xs text-muted-foreground">
            Schedule publishes ahead of time or leave blank to post immediately.
          </p>
        }
      >
        <form
          action={createAnnouncementAction}
          className="grid gap-3 text-sm"
          onSubmit={() => setIsCreateOpen(false)}
        >
          <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
            Title
            <input
              id="create-title-input"
              name="title"
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
            Message
            <textarea
              id="create-body-textarea"
              name="body"
              required
              rows={4}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
            Audience
            <select
              id="create-audience-select"
              name="audience"
              value={createAudience}
              onChange={event => setCreateAudience(event.target.value as 'all' | 'custom')}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="all">Whole church</option>
              <option value="custom">Specific groups</option>
            </select>
          </label>
          {createAudience === 'custom' ? (
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Target groups
              <select
                id="create-groups-select"
                name="groupIds"
                multiple
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {groupState.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Publish at
              <input
                id="create-publish-at-input"
                type="datetime-local"
                name="publishAt"
                defaultValue={formatInputDate(new Date().toISOString())}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Expire at (optional)
              <input
                id="create-expire-at-input"
                type="datetime-local"
                name="expireAt"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>
          <button
            id="create-save-button"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Save announcement
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(editModal)}
        onClose={() => {
          setEditModal(null);
          setEditAudience('all');
        }}
        title={editModal ? `Edit ${editModal.title}` : 'Edit announcement'}
        footer={
          <p className="text-xs text-muted-foreground">
            Leave a field blank to keep the existing value.
          </p>
        }
      >
        {editModal ? (
          <form
            action={updateAnnouncementAction}
            className="grid gap-3 text-sm"
            onSubmit={() => {
              setEditModal(null);
              setEditAudience('all');
            }}
          >
            <input type="hidden" name="announcementId" value={editModal.id} />
            {editAudience === 'custom' ? (
              <input type="hidden" name="groupIdsMarker" value="true" />
            ) : null}
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Title
              <input
                id="edit-title-input"
                name="title"
                defaultValue={editModal.title}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Message
              <textarea
                id="edit-body-textarea"
                name="body"
                defaultValue={editModal.body}
                rows={4}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Audience
              <select
                id="edit-audience-select"
                name="audience"
                value={editAudience}
                onChange={event => setEditAudience(event.target.value as 'all' | 'custom')}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="all">Whole church</option>
                <option value="custom">Specific groups</option>
              </select>
            </label>
            {editAudience === 'custom' ? (
              <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Target groups
                <select
                  id="edit-groups-select"
                  name="groupIds"
                  multiple
                  defaultValue={editModal.groupIds}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  {groupState.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-muted-foreground">
                  Leave empty to remove all targeted groups.
                </span>
              </label>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Publish at
                <input
                  id="edit-publish-at-input"
                  type="datetime-local"
                  name="publishAt"
                  defaultValue={formatInputDate(editModal.publishAt)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Expire at
                <input
                  id="edit-expire-at-input"
                  type="datetime-local"
                  name="expireAt"
                  defaultValue={formatInputDate(editModal.expireAt)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
                <span className="text-[10px] text-muted-foreground">
                  Clear the value to remove the expiry.
                </span>
              </label>
            </div>
            <button
              id="edit-save-button"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Update announcement
            </button>
          </form>
        ) : null}
      </Modal>
    </section>
  );
}

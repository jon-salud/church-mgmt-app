"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Modal } from "../../components/ui/modal";
import {
  createAnnouncementAction,
  markAnnouncementReadAction,
  updateAnnouncementAction,
} from "../actions";

type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: "all" | "custom";
  groupIds?: string[];
  publishAt: string;
  expireAt?: string | null;
  reads?: Array<{ userId: string }>;
};

type Group = {
  id: string;
  name: string;
};

type AnnouncementsClientProps = {
  announcements: Announcement[];
  groups: Group[];
};

type AnnouncementDraft = {
  id: string;
  title: string;
  body: string;
  audience: "all" | "custom";
  groupIds: string[];
  publishAt: string;
  expireAt?: string | null;
};

const formatInputDate = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

const statusBadge = (announcement: Announcement) => {
  const now = Date.now();
  const publishAt = new Date(announcement.publishAt).getTime();
  const expireAt = announcement.expireAt ? new Date(announcement.expireAt).getTime() : undefined;
  if (expireAt && expireAt < now) {
    return { label: "Expired", className: "bg-slate-800 text-slate-200" };
  }
  if (publishAt > now) {
    return { label: "Scheduled", className: "bg-amber-400 text-slate-900" };
  }
  return { label: "Published", className: "bg-emerald-400 text-slate-900" };
};

const audienceLabel = (announcement: Announcement, groupMap: Map<string, Group>) => {
  if (announcement.audience === "all") {
    return "Whole church";
  }
  if (!announcement.groupIds || announcement.groupIds.length === 0) {
    return "Selected groups (none set)";
  }
  return announcement.groupIds
    .map(id => groupMap.get(id)?.name || id)
    .join(", ");
};

export function AnnouncementsClient({ announcements, groups }: AnnouncementsClientProps) {
  const groupMap = useMemo(() => new Map(groups.map(group => [group.id, group])), [groups]);
  const sortedAnnouncements = useMemo(
    () =>
      [...announcements].sort(
        (a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime(),
      ),
    [announcements],
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createAudience, setCreateAudience] = useState<"all" | "custom">("all");
  const [editModal, setEditModal] = useState<AnnouncementDraft | null>(null);
  const [editAudience, setEditAudience] = useState<"all" | "custom">("all");

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Announcements</h1>
          <p className="text-sm text-slate-400">
            Share updates across the church or target specific groups with scheduling controls.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateAudience("all");
            setIsCreateOpen(true);
          }}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
        >
          New announcement
        </button>
      </header>

      <div className="space-y-4">
        {sortedAnnouncements.map(announcement => {
          const badge = statusBadge(announcement);
          const publishDisplay = format(new Date(announcement.publishAt), "d MMM yyyy, h:mma");
          const expireDisplay = announcement.expireAt
            ? format(new Date(announcement.expireAt), "d MMM yyyy, h:mma")
            : null;
          const readCount = announcement.reads?.length ?? 0;
          return (
            <article
              key={announcement.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 shadow-lg shadow-slate-950/20"
            >
              <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-slate-100">{announcement.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className={`rounded-full px-3 py-1 font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span>
                      Publishes {publishDisplay}
                      {expireDisplay ? ` · Expires ${expireDisplay}` : ""}
                    </span>
                    <span>Audience: {audienceLabel(announcement, groupMap)}</span>
                    <span>Reads: {readCount}</span>
                  </div>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                  <form action={markAnnouncementReadAction.bind(null, announcement.id)}>
                    <button className="rounded-md border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-200 transition hover:bg-slate-900">
                      Mark read
                    </button>
                  </form>
                  <button
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
                    className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-900"
                  >
                    Edit
                  </button>
                </div>
              </header>

              <p className="mt-3 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                {announcement.body}
              </p>
            </article>
          );
        })}
      </div>

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create announcement"
        footer={<p className="text-xs text-slate-500">Schedule publishes ahead of time or leave blank to post immediately.</p>}
      >
        <form
          action={createAnnouncementAction}
          className="grid gap-3 text-sm"
          onSubmit={() => setIsCreateOpen(false)}
        >
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Title
            <input
              name="title"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Message
            <textarea
              name="body"
              required
              rows={4}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Audience
            <select
              name="audience"
              value={createAudience}
              onChange={event => setCreateAudience(event.target.value as "all" | "custom")}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="all">Whole church</option>
              <option value="custom">Specific groups</option>
            </select>
          </label>
          {createAudience === "custom" ? (
            <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
              Target groups
              <select
                name="groupIds"
                multiple
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
              Publish at
              <input
                type="datetime-local"
                name="publishAt"
                defaultValue={formatInputDate(new Date().toISOString())}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
              Expire at (optional)
              <input
                type="datetime-local"
                name="expireAt"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
          </div>
          <button className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">
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
        title={editModal ? `Edit ${editModal.title}` : "Edit announcement"}
        footer={<p className="text-xs text-slate-500">Leave a field blank to keep the existing value.</p>}
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
            {editAudience === "custom" ? <input type="hidden" name="groupIdsMarker" value="true" /> : null}
            <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
              Title
              <input
                name="title"
                defaultValue={editModal.title}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
              Message
              <textarea
                name="body"
                defaultValue={editModal.body}
                rows={4}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
              Audience
              <select
                name="audience"
                value={editAudience}
                onChange={event => setEditAudience(event.target.value as "all" | "custom")}
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              >
                <option value="all">Whole church</option>
                <option value="custom">Specific groups</option>
              </select>
            </label>
            {editAudience === "custom" ? (
              <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
                Target groups
                <select
                  name="groupIds"
                  multiple
                  defaultValue={editModal.groupIds}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                >
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500">Leave empty to remove all targeted groups.</span>
              </label>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
                Publish at
                <input
                  type="datetime-local"
                  name="publishAt"
                  defaultValue={formatInputDate(editModal.publishAt)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
                Expire at
                <input
                  type="datetime-local"
                  name="expireAt"
                  defaultValue={formatInputDate(editModal.expireAt)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
                <span className="text-[10px] text-slate-500">Clear the value to remove the expiry.</span>
              </label>
            </div>
            <button className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">
              Update announcement
            </button>
          </form>
        ) : null}
      </Modal>
    </section>
  );
}

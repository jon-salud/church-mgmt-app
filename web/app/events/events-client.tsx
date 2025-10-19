"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Modal } from "../../components/ui/modal";
import {
  createEventAction,
  deleteEventAction,
  recordAttendanceAction,
  updateEventAction,
} from "../actions";
import { loadOfflineSnapshot, persistOfflineSnapshot } from "../../lib/offline-cache";
import { useOfflineStatus } from "../../lib/use-offline-status";

type EventsClientProps = {
  events: Array<any>;
  members: Array<any>;
  groups: Array<any>;
};

type EventDraft = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location?: string;
  visibility: string;
  groupId?: string | null;
  tags?: string[] | null;
  description?: string | null;
};

export function EventsClient({ events, members, groups }: EventsClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [eventModal, setEventModal] = useState<EventDraft | null>(null);
  const [eventState, setEventState] = useState(events);
  const [memberState, setMemberState] = useState(members);
  const [groupState, setGroupState] = useState(groups);
  const isOffline = useOfflineStatus();

  useEffect(() => {
    setEventState(events);
    setMemberState(members);
    setGroupState(groups);
  }, [events, members, groups]);

  useEffect(() => {
    persistOfflineSnapshot("events", {
      events: eventState,
      members: memberState,
      groups: groupState,
    });
  }, [eventState, memberState, groupState]);

  useEffect(() => {
    if (!isOffline) {
      return;
    }
    if (eventState.length > 0 || memberState.length > 0 || groupState.length > 0) {
      return;
    }
    loadOfflineSnapshot<'events'>("events").then(snapshot => {
      if (!snapshot) {
        return;
      }
      const offlineEvents = Array.isArray(snapshot.events) ? (snapshot.events as Array<any>) : [];
      const offlineMembers = Array.isArray(snapshot.members) ? (snapshot.members as Array<any>) : [];
      const offlineGroups = Array.isArray(snapshot.groups) ? (snapshot.groups as Array<any>) : [];
      if (offlineEvents.length > 0) {
        setEventState(offlineEvents);
      }
      if (offlineMembers.length > 0) {
        setMemberState(offlineMembers);
      }
      if (offlineGroups.length > 0) {
        setGroupState(offlineGroups);
      }
    });
  }, [isOffline, eventState.length, memberState.length, groupState.length]);

  const sortedEvents = useMemo(
    () =>
      [...eventState].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      ),
    [eventState],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Events & Attendance</h1>
          <p className="text-sm text-slate-400">Record attendance for services, rehearsals, and training.</p>
          {isOffline ? (
            <p className="text-xs text-amber-300">
              Offline mode: displaying the last synced events, groups, and members available on this device.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
        >
          Schedule event
        </button>
      </div>

      <div className="space-y-6">
        {sortedEvents.map(event => {
          const startDisplay = format(new Date(event.startAt), "EEE d MMM, h:mma");
          const endDisplay = format(new Date(event.endAt), "h:mma");
          return (
            <article key={event.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <header className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">{event.title}</h2>
                  <p className="text-xs text-slate-400">
                    {startDisplay} – {endDisplay} · {event.location || "TBA"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
                    {event.visibility}
                  </span>
                  <a
                    href={event.attendanceCsvUrl}
                    className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-900"
                  >
                    Download CSV
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setEventModal({
                        id: event.id,
                        title: event.title,
                        startAt: event.startAt,
                        endAt: event.endAt,
                        location: event.location,
                        visibility: event.visibility,
                        groupId: event.groupId ?? null,
                        tags: event.tags ?? [],
                        description: event.description ?? "",
                      })
                    }
                    className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:bg-slate-900"
                  >
                    Edit
                  </button>
                </div>
              </header>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Attendance Status</h3>
                  <ul className="mt-2 grid gap-2 text-sm">
                    {event.attendance.map((record: any) => (
                      <li
                        key={record.userId}
                        className="flex justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                      >
                        <span>
                          {memberState.find(m => m.id === record.userId)?.profile?.firstName || record.userId}
                        </span>
                        <span className="text-slate-400">{record.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Quick update</h3>
                  <form action={recordAttendanceAction} className="mt-2 grid gap-2 text-sm">
                    <input type="hidden" name="eventId" value={event.id} />
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
                      Member
                      <select
                        name="userId"
                        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                      >
                        {memberState.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.profile?.firstName} {member.profile?.lastName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
                      Status
                      <select
                        name="status"
                        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                      >
                        <option value="checkedIn">Checked-in</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
                      Note (optional)
                      <input
                        name="note"
                        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                        placeholder="Late arrival, family event, etc."
                      />
                    </label>
                    <button className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">
                      Update
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule event"
        footer={<p className="text-xs text-slate-500">Visibility controls who sees the event invitations.</p>}
      >
        <form
          action={createEventAction}
          className="grid gap-3 md:grid-cols-2"
          onSubmit={() => setIsCreateOpen(false)}
        >
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Title
            <input
              name="title"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Location
            <input
              name="location"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Start
            <input
              name="startAt"
              type="datetime-local"
              required
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            End
            <input
              name="endAt"
              type="datetime-local"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Visibility
            <select
              name="visibility"
              defaultValue="private"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400">
            Group (optional)
            <select
              name="groupId"
              defaultValue=""
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">No linked group</option>
              {groupState.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400 md:col-span-2">
            Tags (comma separated)
            <input
              name="tags"
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
              placeholder="Worship, Training"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-slate-400 md:col-span-2">
            Description
            <textarea
              name="description"
              rows={3}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
            >
              Create Event
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(eventModal)}
        onClose={() => setEventModal(null)}
        title={eventModal ? `Edit ${eventModal.title}` : "Edit event"}
        footer={<p className="text-xs text-slate-500">Deleting an event also clears its attendance records.</p>}
      >
        {eventModal ? (
          <div className="space-y-6">
            <form
              action={updateEventAction}
              className="grid gap-3 md:grid-cols-2"
              onSubmit={() => setEventModal(null)}
            >
              <input type="hidden" name="eventId" value={eventModal.id} />
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                Title
                <input
                  name="title"
                  defaultValue={eventModal.title}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                Location
                <input
                  name="location"
                  defaultValue={eventModal.location ?? ""}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                Start
                <input
                  name="startAt"
                  type="datetime-local"
                  defaultValue={eventModal.startAt.slice(0, 16)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                End
                <input
                  name="endAt"
                  type="datetime-local"
                  defaultValue={eventModal.endAt.slice(0, 16)}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                Visibility
                <select
                  name="visibility"
                  defaultValue={eventModal.visibility}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs uppercase text-slate-400">
                Group
                <select
                  name="groupId"
                  defaultValue={eventModal.groupId ?? ""}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="">No linked group</option>
                  {groupState.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs uppercase text-slate-400 md:col-span-2">
                Tags
                <input
                  name="tags"
                  defaultValue={(eventModal.tags ?? []).join(", ")}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-slate-400 md:col-span-2">
                Description
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={eventModal.description ?? ""}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
              </label>
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEventModal(null)}
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

            <form
              action={deleteEventAction}
              className="rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3"
              onSubmit={() => setEventModal(null)}
            >
              <input type="hidden" name="eventId" value={eventModal.id} />
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-red-200">Delete event</h3>
                  <p className="text-xs text-red-200/70">
                    Attendees will no longer see this on the calendar. Attendance logs are discarded.
                  </p>
                </div>
                <button className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-red-950 transition hover:bg-red-400">
                  Delete Event
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

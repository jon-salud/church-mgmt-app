'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/modal';
import {
  createEventAction,
  createEventVolunteerRoleAction,
  createEventVolunteerSignupAction,
  deleteEventAction,
  deleteEventVolunteerRoleAction,
  deleteEventVolunteerSignupAction,
  recordAttendanceAction,
  updateEventAction,
} from '../actions';
import { clientApi } from '../../lib/api.client';
import { loadOfflineSnapshot, persistOfflineSnapshot } from '../../lib/offline-cache';
import { useOfflineStatus } from '../../lib/use-offline-status';

type EventsClientProps = {
  events: Array<any>;
  members: Array<any>;
  groups: Array<any>;
  me: any;
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
  volunteerRoles?: any[];
};

export function EventsClient({ events, members, groups, me }: EventsClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [eventModal, setEventModal] = useState<EventDraft | null>(null);
  const [eventState, setEventState] = useState(events);
  const [memberState, setMemberState] = useState(members);
  const [groupState, setGroupState] = useState(groups);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedEvents, setArchivedEvents] = useState<any[]>([]);
  const isOffline = useOfflineStatus();
  const isAdmin = me?.user?.roles?.some((role: any) => role.slug === 'admin') ?? false;

  const handleRecoverEvent = async (eventId: string) => {
    try {
      await clientApi.recoverEvent(eventId);
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Failed to recover event:', error);
      window.alert('Failed to recover event. Please try again.');
    }
  };

  useEffect(() => {
    setEventState(events);
    setMemberState(members);
    setGroupState(groups);
  }, [events, members, groups]);

  useEffect(() => {
    persistOfflineSnapshot('events', {
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
    loadOfflineSnapshot<'events'>('events').then(snapshot => {
      if (!snapshot) {
        return;
      }
      const offlineEvents = Array.isArray(snapshot.events) ? (snapshot.events as Array<any>) : [];
      const offlineMembers = Array.isArray(snapshot.members)
        ? (snapshot.members as Array<any>)
        : [];
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

  useEffect(() => {
    if (showArchived && isAdmin && archivedEvents.length === 0) {
      clientApi.listDeletedEvents().then(setArchivedEvents).catch(console.error);
    }
  }, [showArchived, isAdmin, archivedEvents.length]);

  const sortedEvents = useMemo(() => {
    const allEvents = showArchived ? [...eventState, ...archivedEvents] : eventState;
    return [...allEvents].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
  }, [eventState, showArchived, archivedEvents]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Events & Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Record attendance for services, rehearsals, and training.
          </p>
          {isOffline ? (
            <p className="text-xs text-amber-300">
              Offline mode: displaying the last synced events, groups, and members available on this
              device.
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={e => setShowArchived(e.target.checked)}
                className="rounded border border-border"
              />
              Show archived events
            </label>
          )}
          <button
            id="schedule-event-button"
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Schedule event
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {sortedEvents.map(event => {
          const startDisplay = format(new Date(event.startAt), 'EEE d MMM, h:mma');
          const endDisplay = format(new Date(event.endAt), 'h:mma');
          return (
            <article key={event.id} className="rounded-xl border border-border bg-card/60 p-5">
              <header className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{event.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {startDisplay} – {endDisplay} · {event.location || 'TBA'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {event.visibility}
                  </span>
                  <a
                    id={`download-csv-link-${event.id}`}
                    href={event.attendanceCsvUrl}
                    className="rounded-md border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted"
                  >
                    Download CSV
                  </a>
                  <button
                    id={`edit-event-button-${event.id}`}
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
                        description: event.description ?? '',
                        volunteerRoles: event.volunteerRoles ?? [],
                      })
                    }
                    className="rounded-md border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted"
                  >
                    Edit
                  </button>
                  {event.deletedAt && isAdmin && (
                    <button
                      onClick={() => handleRecoverEvent(event.id)}
                      className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-green-700"
                    >
                      Recover
                    </button>
                  )}
                </div>
              </header>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Attendance Status</h3>
                  <ul className="mt-2 grid gap-2 text-sm">
                    {event.attendance.map((record: any) => (
                      <li
                        key={record.userId}
                        className="flex justify-between rounded-md border border-border bg-card/60 px-3 py-2"
                      >
                        <span>
                          {memberState.find(m => m.id === record.userId)?.profile?.firstName ||
                            record.userId}
                        </span>
                        <span className="text-muted-foreground">{record.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">Volunteer Roles</h3>
                  <ul className="mt-2 grid gap-2 text-sm">
                    {event.volunteerRoles?.map((role: any) => {
                      const userId = me?.user?.id;
                      const userSignup = role.signups?.find((s: any) => s.userId === userId);
                      return (
                        <li
                          key={role.id}
                          className="flex justify-between rounded-md border border-border bg-card/60 px-3 py-2"
                        >
                          <span>
                            {role.name} ({role.signups?.length || 0}/{role.needed})
                          </span>
                          {userSignup ? (
                            <form action={deleteEventVolunteerSignupAction}>
                              <input type="hidden" name="signupId" value={userSignup.id} />
                              <button type="submit" className="text-xs text-destructive">
                                Cancel Signup
                              </button>
                            </form>
                          ) : (
                            <form action={createEventVolunteerSignupAction}>
                              <input type="hidden" name="roleId" value={role.id} />
                              <button type="submit" className="text-xs text-primary">
                                Sign Up
                              </button>
                            </form>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">Quick update</h3>
                  <form action={recordAttendanceAction} className="mt-2 grid gap-2 text-sm">
                    <input type="hidden" name="eventId" value={event.id} />
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Member
                      <select
                        id={`attendance-member-select-${event.id}`}
                        name="userId"
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      >
                        {memberState.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.profile?.firstName} {member.profile?.lastName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Status
                      <select
                        id={`attendance-status-select-${event.id}`}
                        name="status"
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                      >
                        <option value="checkedIn">Checked-in</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Note (optional)
                      <input
                        id={`attendance-note-input-${event.id}`}
                        name="note"
                        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                        placeholder="Late arrival, family event, etc."
                      />
                    </label>
                    <button
                      id={`attendance-update-button-${event.id}`}
                      className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                    >
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
        footer={
          <p className="text-xs text-muted-foreground">
            Visibility controls who sees the event invitations.
          </p>
        }
      >
        <form
          action={createEventAction}
          className="grid gap-3 md:grid-cols-2"
          onSubmit={() => setIsCreateOpen(false)}
        >
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Title
            <input
              id="create-title-input"
              name="title"
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Location
            <input
              id="create-location-input"
              name="location"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Start
            <input
              id="create-start-at-input"
              name="startAt"
              type="datetime-local"
              required
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            End
            <input
              id="create-end-at-input"
              name="endAt"
              type="datetime-local"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Visibility
            <select
              id="create-visibility-select"
              name="visibility"
              defaultValue="private"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground">
            Group (optional)
            <select
              id="create-group-select"
              name="groupId"
              defaultValue=""
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">No linked group</option>
              {groupState.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground md:col-span-2">
            Tags (comma separated)
            <input
              id="create-tags-input"
              name="tags"
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Worship, Training"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase text-muted-foreground md:col-span-2">
            Description
            <textarea
              id="create-description-textarea"
              name="description"
              rows={3}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              id="create-cancel-button"
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              id="create-event-button"
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Create Event
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(eventModal)}
        onClose={() => setEventModal(null)}
        title={eventModal ? `Edit ${eventModal.title}` : 'Edit event'}
        footer={
          <p className="text-xs text-muted-foreground">
            Deleting an event also clears its attendance records.
          </p>
        }
      >
        {eventModal ? (
          <div className="space-y-6">
            <form
              action={updateEventAction}
              className="grid gap-3 md:grid-cols-2"
              onSubmit={() => setEventModal(null)}
            >
              <input type="hidden" name="eventId" value={eventModal.id} />
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Title
                <input
                  id="edit-title-input"
                  name="title"
                  defaultValue={eventModal.title}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Location
                <input
                  id="edit-location-input"
                  name="location"
                  defaultValue={eventModal.location ?? ''}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Start
                <input
                  id="edit-start-at-input"
                  name="startAt"
                  type="datetime-local"
                  defaultValue={eventModal.startAt.slice(0, 16)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                End
                <input
                  id="edit-end-at-input"
                  name="endAt"
                  type="datetime-local"
                  defaultValue={eventModal.endAt.slice(0, 16)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Visibility
                <select
                  id="edit-visibility-select"
                  name="visibility"
                  defaultValue={eventModal.visibility}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground">
                Group
                <select
                  id="edit-group-select"
                  name="groupId"
                  defaultValue={eventModal.groupId ?? ''}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">No linked group</option>
                  {groupState.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground md:col-span-2">
                Tags
                <input
                  id="edit-tags-input"
                  name="tags"
                  defaultValue={(eventModal.tags ?? []).join(', ')}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase text-muted-foreground md:col-span-2">
                Description
                <textarea
                  id="edit-description-textarea"
                  name="description"
                  rows={3}
                  defaultValue={eventModal.description ?? ''}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>

              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-foreground">Volunteer Roles</h3>
                <div className="mt-2 space-y-2">
                  {eventModal.volunteerRoles?.map((role: any) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between rounded-md border border-border bg-card/60 px-3 py-2"
                    >
                      <span>
                        {role.name} ({role.needed})
                      </span>
                      <form action={deleteEventVolunteerRoleAction}>
                        <input type="hidden" name="roleId" value={role.id} />
                        <button type="submit" className="text-xs text-destructive">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
                <form
                  action={createEventVolunteerRoleAction}
                  className="mt-2 flex items-center gap-2"
                >
                  <input type="hidden" name="eventId" value={eventModal.id} />
                  <input
                    name="name"
                    placeholder="Role name"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                  <input
                    name="needed"
                    type="number"
                    placeholder="Needed"
                    className="w-20 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
                  >
                    Add Role
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  id="edit-cancel-button"
                  type="button"
                  onClick={() => setEventModal(null)}
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

            <form
              action={deleteEventAction}
              className="rounded-lg border border-destructive/40 bg-destructive/30 px-4 py-3"
              onSubmit={() => setEventModal(null)}
            >
              <input type="hidden" name="eventId" value={eventModal.id} />
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-destructive-foreground">
                    Archive event
                  </h3>
                  <p className="text-xs text-destructive-foreground/70">
                    This event will be hidden from the calendar but can be recovered by an admin.
                    Attendance logs will be preserved.
                  </p>
                </div>
                <button
                  id="delete-event-button"
                  className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/80"
                >
                  Archive Event
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}

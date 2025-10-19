import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  MockUser,
  mockUsers,
  MockGroup,
  MockGroupMember,
  mockGroups,
  MockEvent,
  mockEvents,
  MockAnnouncement,
  mockAnnouncements,
  MockAnnouncementRead,
  mockAnnouncementReads,
  MockContribution,
  mockContributions,
  MockFund,
  mockFunds,
  mockSessions,
  DemoSession,
  createSessionToken,
  Role,
  MembershipStatus,
  AttendanceStatus,
  MockAuditLog,
  mockAuditLogs,
  mockChurches,
} from './mock-data';

interface AttendanceInput {
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  note?: string;
  recordedBy?: string;
}

interface ContributionInput {
  memberId: string;
  amount: number;
  date: string;
  fundId?: string;
  method: MockContribution['method'];
  note?: string;
  recordedBy?: string;
}

interface ContributionUpdateInput {
  memberId?: string;
  amount?: number;
  date?: string;
  fundId?: string | null;
  method?: MockContribution['method'];
  note?: string | null;
  actorUserId: string;
}

interface UserCreateInput {
  primaryEmail: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: MockUser['status'];
  roles?: Role[];
  actorUserId: string;
}

interface UserUpdateInput {
  primaryEmail?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: MockUser['status'];
  roles?: Role[];
  actorUserId: string;
}

interface UserDeleteInput {
  actorUserId: string;
}

interface GroupMemberCreateInput {
  userId: string;
  role?: MockGroupMember['role'];
  status?: MembershipStatus;
  joinedAt?: string;
  actorUserId: string;
}

interface GroupMemberUpdateInput {
  role?: MockGroupMember['role'];
  status?: MembershipStatus;
  actorUserId: string;
}

interface GroupMemberRemoveInput {
  actorUserId: string;
}

interface EventCreateInput {
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  location?: string;
  visibility?: MockEvent['visibility'];
  groupId?: string;
  tags?: string[];
  actorUserId: string;
}

interface EventUpdateInput {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  visibility?: MockEvent['visibility'];
  groupId?: string | null;
  tags?: string[];
  actorUserId: string;
}

interface EventDeleteInput {
  actorUserId: string;
}

interface AuditLogFilter {
  churchId?: string;
  actorUserId?: string;
  entity?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

interface AuditLogCreateInput {
  churchId?: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  diff?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

interface AnnouncementCreateInput {
  title: string;
  body: string;
  audience: MockAnnouncement['audience'];
  groupIds?: string[];
  publishAt?: string;
  expireAt?: string | null;
  actorUserId: string;
}

interface AnnouncementUpdateInput {
  title?: string;
  body?: string;
  audience?: MockAnnouncement['audience'];
  groupIds?: string[];
  publishAt?: string;
  expireAt?: string | null;
  actorUserId: string;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function formatMonthKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class MockDatabaseService {
  private users: MockUser[] = clone(mockUsers);
  private groups: MockGroup[] = clone(mockGroups);
  private events: MockEvent[] = clone(mockEvents);
  private announcements: MockAnnouncement[] = clone(mockAnnouncements);
  private announcementReads: MockAnnouncementRead[] = clone(mockAnnouncementReads);
  private funds: MockFund[] = clone(mockFunds);
  private contributions: MockContribution[] = clone(mockContributions);
  private auditLogs: MockAuditLog[] = clone(mockAuditLogs);
  private sessions: DemoSession[] = clone(mockSessions);
  private oauthAccounts: Array<{ provider: 'google' | 'facebook'; providerUserId: string; userId: string }> = [];

  getChurch() {
    return clone(mockChurches[0]);
  }

  listUsers(query?: string) {
    const lower = query?.toLowerCase();
    const list = this.users.filter(user => {
      if (!lower) return true;
      const profile = user.profile;
      return (
        user.primaryEmail.toLowerCase().includes(lower) ||
        profile.firstName.toLowerCase().includes(lower) ||
        profile.lastName.toLowerCase().includes(lower)
      );
    }).map(user => ({
      ...user,
      groups: this.groups
        .filter(group => group.members.some(member => member.userId === user.id))
        .map(group => ({ id: group.id, name: group.name, role: group.members.find(member => member.userId === user.id)?.role })),
    }));
    return clone(list);
  }

  getUserById(id: string) {
    return clone(this.users.find(user => user.id === id) || null);
  }

  getUserProfile(id: string) {
    const user = this.getUserById(id);
    if (!user) return null;
    const groups = this.groups
      .filter(group => group.members.some(member => member.userId === id))
      .map(group => ({
        id: group.id,
        name: group.name,
        role:
          group.members.find(member => member.userId === id)?.role ?? 'Member',
        type: group.type,
      }));
    const attendance = this.events
      .filter(event => event.attendance.some(record => record.userId === id))
      .map(event => ({
        eventId: event.id,
        title: event.title,
        startAt: event.startAt,
        status: event.attendance.find(record => record.userId === id)?.status,
      }));
    const contributions = this.contributions
      .filter(contribution => contribution.memberId === id)
      .map(contribution => ({
        contributionId: contribution.id,
        amount: contribution.amount,
        date: contribution.date,
        fundId: contribution.fundId,
        method: contribution.method,
      }));
    return {
      ...user,
      groups,
      attendance,
      contributions,
    };
  }

  createUser(input: UserCreateInput) {
    const emailTaken = this.users.some(
      user => user.primaryEmail.toLowerCase() === input.primaryEmail.toLowerCase(),
    );
    if (emailTaken) {
      throw new Error('A user with that email already exists');
    }
    const churchId = this.getChurch().id;
    const now = new Date().toISOString();
    const roles =
      input.roles && input.roles.length
        ? input.roles.map(role => ({ churchId, role }))
        : [{ churchId, role: 'Member' as Role }];
    const user: MockUser = {
      id: `user-${randomUUID()}`,
      primaryEmail: input.primaryEmail,
      status: input.status ?? 'active',
      createdAt: now,
      roles,
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        address: input.address,
        notes: input.notes,
      },
    };
    this.users.push(user);
    const actorName = this.getUserName(input.actorUserId);
    const targetName = this.getUserName(user.id);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'user.created',
      entity: 'user',
      entityId: user.id,
      summary: `${actorName} added ${targetName} to the directory`,
      metadata: {
        userId: user.id,
        email: user.primaryEmail,
        roles: roles.map(role => role.role),
      },
    });
    return this.getUserProfile(user.id);
  }

  updateUser(id: string, input: UserUpdateInput) {
    const user = this.users.find(record => record.id === id);
    if (!user) return null;
    if (
      input.primaryEmail &&
      input.primaryEmail.toLowerCase() !== user.primaryEmail.toLowerCase() &&
      this.users.some(
        record => record.id !== id && record.primaryEmail.toLowerCase() === input.primaryEmail!.toLowerCase(),
      )
    ) {
      throw new Error('A user with that email already exists');
    }
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const track = (key: string, previous: unknown, next: unknown) => {
      if (previous !== next) {
        diff[key] = { previous, newValue: next };
      }
    };
    if (input.primaryEmail && input.primaryEmail !== user.primaryEmail) {
      track('primaryEmail', user.primaryEmail, input.primaryEmail);
      user.primaryEmail = input.primaryEmail;
    }
    if (input.status && input.status !== user.status) {
      track('status', user.status, input.status);
      user.status = input.status;
    }
    if (typeof input.firstName === 'string' && input.firstName !== user.profile.firstName) {
      track('profile.firstName', user.profile.firstName, input.firstName);
      user.profile.firstName = input.firstName;
    }
    if (typeof input.lastName === 'string' && input.lastName !== user.profile.lastName) {
      track('profile.lastName', user.profile.lastName, input.lastName);
      user.profile.lastName = input.lastName;
    }
    if (typeof input.phone === 'string' && input.phone !== user.profile.phone) {
      track('profile.phone', user.profile.phone ?? null, input.phone);
      user.profile.phone = input.phone;
    }
    if (typeof input.address === 'string' && input.address !== user.profile.address) {
      track('profile.address', user.profile.address ?? null, input.address);
      user.profile.address = input.address;
    }
    if (typeof input.notes === 'string' && input.notes !== user.profile.notes) {
      track('profile.notes', user.profile.notes ?? null, input.notes);
      user.profile.notes = input.notes;
    }
    if (input.roles) {
      const churchId = this.getChurch().id;
      const normalised = input.roles.map(role => ({ churchId, role }));
      const previousRoles = user.roles.map(role => role.role);
      const newRoles = normalised.map(role => role.role);
      if (previousRoles.join(',') !== newRoles.join(',')) {
        track('roles', previousRoles, newRoles);
        user.roles = normalised;
      }
    }
    const actorName = this.getUserName(input.actorUserId);
    const targetName = this.getUserName(user.id);
    if (Object.keys(diff).length > 0) {
      this.createAuditLog({
        actorUserId: input.actorUserId,
        action: 'user.updated',
        entity: 'user',
        entityId: user.id,
        summary: `${actorName} updated ${targetName}'s profile`,
        diff,
        metadata: {
          userId: user.id,
        },
      });
    }
    return this.getUserProfile(user.id);
  }

  deleteUser(id: string, input: UserDeleteInput) {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return { success: false };
    }
    const [removed] = this.users.splice(index, 1);
    this.groups.forEach(group => {
      group.members = group.members.filter(member => member.userId !== id);
      if (group.leaderUserId === id) {
        group.leaderUserId = group.members[0]?.userId;
      }
    });
    this.events.forEach(event => {
      event.attendance = event.attendance.filter(record => record.userId !== id);
    });
    this.contributions = this.contributions.filter(contribution => contribution.memberId !== id);
    this.announcementReads = this.announcementReads.filter(read => read.userId !== id);
    this.sessions = this.sessions.filter(session => session.userId !== id);
    this.oauthAccounts = this.oauthAccounts.filter(account => account.userId !== id);
    const actorName = this.getUserName(input.actorUserId);
    const targetName = `${removed.profile.firstName} ${removed.profile.lastName}`.trim() || removed.primaryEmail;
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'user.deleted',
      entity: 'user',
      entityId: removed.id,
      summary: `${actorName} removed ${targetName} from the directory`,
      metadata: {
        userId: removed.id,
        email: removed.primaryEmail,
      },
    });
    return { success: true };
  }

  getUserByEmail(email: string) {
    return this.users.find(user => user.primaryEmail.toLowerCase() === email.toLowerCase()) || null;
  }

  listGroups(churchId?: string) {
    const list = this.groups.filter(group => !churchId || group.churchId === churchId);
    return clone(list);
  }

  getGroupById(id: string) {
    return clone(this.groups.find(group => group.id === id) || null);
  }

  getGroupMembers(groupId: string) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) return [];
    return group.members.map(member => ({
      ...clone(member),
      user: clone(this.users.find(user => user.id === member.userId)!),
    }));
  }

  addGroupMember(groupId: string, input: GroupMemberCreateInput) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    const existing = group.members.find(member => member.userId === input.userId);
    if (existing) {
      throw new Error('User is already a member of this group');
    }
    const user = this.users.find(record => record.id === input.userId);
    if (!user) {
      throw new Error('User not found');
    }
    const member: MockGroupMember = {
      userId: input.userId,
      role: input.role ?? 'Member',
      status: input.status ?? 'Active',
      joinedAt: input.joinedAt ?? new Date().toISOString(),
    };
    group.members.push(member);
    const actorName = this.getUserName(input.actorUserId);
    const memberName = this.getUserName(input.userId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'group.members.added',
      entity: 'group',
      entityId: group.id,
      summary: `${actorName} added ${memberName} to ${group.name}`,
      metadata: {
        groupId,
        userId: input.userId,
        role: member.role,
        status: member.status,
      },
    });
    return {
      ...clone(member),
      user: clone(user),
    };
  }

  updateGroupMember(groupId: string, userId: string, input: GroupMemberUpdateInput) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    const member = group.members.find(record => record.userId === userId);
    if (!member) {
      throw new Error('Member not found in group');
    }
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const track = (key: string, previous: unknown, next: unknown) => {
      if (previous !== next) {
        diff[key] = { previous, newValue: next };
      }
    };
    if (input.role && input.role !== member.role) {
      track('role', member.role, input.role);
      member.role = input.role;
    }
    if (input.status && input.status !== member.status) {
      track('status', member.status, input.status);
      member.status = input.status;
    }
    if (Object.keys(diff).length > 0) {
      const actorName = this.getUserName(input.actorUserId);
      const memberName = this.getUserName(userId);
      this.createAuditLog({
        actorUserId: input.actorUserId,
        action: 'group.members.updated',
        entity: 'group',
        entityId: group.id,
        summary: `${actorName} updated ${memberName}'s membership in ${group.name}`,
        diff,
        metadata: {
          groupId,
          userId,
        },
      });
    }
    const user = this.users.find(record => record.id === userId);
    return {
      ...clone(member),
      user: user ? clone(user) : null,
    };
  }

  removeGroupMember(groupId: string, userId: string, input: GroupMemberRemoveInput) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    const index = group.members.findIndex(member => member.userId === userId);
    if (index === -1) {
      return { success: false };
    }
    const [removed] = group.members.splice(index, 1);
    const actorName = this.getUserName(input.actorUserId);
    const memberName = this.getUserName(userId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'group.members.removed',
      entity: 'group',
      entityId: group.id,
      summary: `${actorName} removed ${memberName} from ${group.name}`,
      metadata: {
        groupId,
        userId,
        role: removed.role,
      },
    });
    return { success: true };
  }

  listEvents() {
    return clone(this.events);
  }

  getEventById(id: string) {
    return clone(this.events.find(event => event.id === id) || null);
  }

  createEvent(input: EventCreateInput) {
    const event: MockEvent = {
      id: `event-${randomUUID()}`,
      churchId: this.getChurch().id,
      title: input.title,
      description: input.description,
      startAt: input.startAt,
      endAt: input.endAt ?? input.startAt,
      location: input.location,
      visibility: input.visibility ?? 'private',
      groupId: input.groupId ?? undefined,
      tags: input.tags ?? [],
      attendance: [],
    };
    this.events.push(event);
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'event.created',
      entity: 'event',
      entityId: event.id,
      summary: `${actorName} scheduled ${event.title}`,
      metadata: {
        eventId: event.id,
        startAt: event.startAt,
        groupId: event.groupId ?? null,
      },
    });
    return clone(event);
  }

  updateEvent(id: string, input: EventUpdateInput) {
    const event = this.events.find(record => record.id === id);
    if (!event) return null;
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const track = (key: string, previous: unknown, next: unknown) => {
      if (previous !== next) {
        diff[key] = { previous, newValue: next };
      }
    };
    if (typeof input.title === 'string' && input.title !== event.title) {
      track('title', event.title, input.title);
      event.title = input.title;
    }
    if (typeof input.description === 'string' && input.description !== event.description) {
      track('description', event.description ?? null, input.description);
      event.description = input.description;
    }
    if (typeof input.startAt === 'string' && input.startAt !== event.startAt) {
      track('startAt', event.startAt, input.startAt);
      event.startAt = input.startAt;
    }
    if (typeof input.endAt === 'string' && input.endAt !== event.endAt) {
      track('endAt', event.endAt, input.endAt);
      event.endAt = input.endAt;
    }
    if (typeof input.location === 'string' && input.location !== event.location) {
      track('location', event.location ?? null, input.location);
      event.location = input.location;
    }
    if (typeof input.visibility === 'string' && input.visibility !== event.visibility) {
      track('visibility', event.visibility, input.visibility);
      event.visibility = input.visibility;
    }
    if (input.groupId !== undefined) {
      const newGroupId = input.groupId ?? undefined;
      if (newGroupId !== event.groupId) {
        track('groupId', event.groupId ?? null, newGroupId ?? null);
        event.groupId = newGroupId;
      }
    }
    if (input.tags) {
      const prev = event.tags ?? [];
      const next = input.tags;
      if (prev.length !== next.length || prev.some((value, index) => value !== next[index])) {
        track('tags', prev, next);
        event.tags = [...next];
      }
    }
    if (Object.keys(diff).length > 0) {
      const actorName = this.getUserName(input.actorUserId);
      this.createAuditLog({
        actorUserId: input.actorUserId,
        action: 'event.updated',
        entity: 'event',
        entityId: event.id,
        summary: `${actorName} updated ${event.title}`,
        diff,
        metadata: {
          eventId: event.id,
        },
      });
    }
    return clone(event);
  }

  deleteEvent(id: string, input: EventDeleteInput) {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) {
      return { success: false };
    }
    const [removed] = this.events.splice(index, 1);
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'event.deleted',
      entity: 'event',
      entityId: removed.id,
      summary: `${actorName} deleted event ${removed.title}`,
      metadata: {
        eventId: removed.id,
        startAt: removed.startAt,
      },
    });
    return { success: true };
  }

  recordAttendance(input: AttendanceInput) {
    const event = this.events.find(e => e.id === input.eventId);
    if (!event) return null;
    const existing = event.attendance.find(a => a.userId === input.userId);
    const attendee = this.users.find(user => user.id === input.userId);
    const actorUserId = input.recordedBy ?? input.userId;
    const actor = this.users.find(user => user.id === actorUserId);
    const attendeeName = attendee
      ? `${attendee.profile.firstName} ${attendee.profile.lastName}`.trim()
      : input.userId;
    const actorName = actor ? `${actor.profile.firstName} ${actor.profile.lastName}`.trim() : actorUserId;
    if (existing) {
      const previousStatus = existing.status;
      existing.status = input.status;
      existing.note = input.note;
      existing.recordedBy = actorUserId;
      existing.recordedAt = new Date().toISOString();
      this.createAuditLog({
        actorUserId,
        action: 'attendance.updated',
        entity: 'event',
        entityId: event.id,
        summary:
          actorUserId === input.userId
            ? `${attendeeName} recorded their attendance as ${input.status} for ${event.title}`
            : `${actorName} marked ${attendeeName} as ${input.status} for ${event.title}`,
        diff:
          previousStatus !== input.status
            ? { previousStatus, newStatus: input.status }
            : undefined,
        metadata: {
          userId: input.userId,
          newStatus: input.status,
          previousStatus,
          note: input.note ?? null,
        },
      });
      return clone(existing);
    }
    const record = {
      eventId: input.eventId,
      userId: input.userId,
      status: input.status,
      note: input.note,
      recordedBy: actorUserId,
      recordedAt: new Date().toISOString(),
    };
    event.attendance.push(record);
    this.createAuditLog({
      actorUserId,
      action: 'attendance.updated',
      entity: 'event',
      entityId: event.id,
      summary:
        actorUserId === input.userId
          ? `${attendeeName} recorded their attendance as ${input.status} for ${event.title}`
          : `${actorName} marked ${attendeeName} as ${input.status} for ${event.title}`,
      metadata: {
        userId: input.userId,
        newStatus: input.status,
        previousStatus: null,
        note: input.note ?? null,
      },
    });
    return clone(record);
  }

  listAnnouncements(churchId?: string) {
    const filtered = this.announcements.filter(a => !churchId || a.churchId === churchId);
    return filtered
      .map(announcement => ({
        ...clone(announcement),
        reads: this.announcementReads.filter(read => read.announcementId === announcement.id),
      }))
      .sort(
        (a, b) =>
          new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime(),
      );
  }

  markAnnouncementRead(announcementId: string, userId: string) {
    const already = this.announcementReads.find(
      read => read.announcementId === announcementId && read.userId === userId,
    );
    if (already) {
      return clone(already);
    }
    const announcement = this.announcements.find(a => a.id === announcementId);
    const user = this.users.find(u => u.id === userId);
    const userName = user ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : userId;
    const record = {
      announcementId,
      userId,
      readAt: new Date().toISOString(),
    };
    this.announcementReads.push(record);
    if (announcement) {
      this.createAuditLog({
        actorUserId: userId,
        action: 'announcement.read',
        entity: 'announcement',
        entityId: announcement.id,
        summary: `${userName} read announcement "${announcement.title}"`,
        metadata: {
          userId,
          announcementId,
        },
      });
    }
    return clone(record);
  }

  createAnnouncement(input: AnnouncementCreateInput) {
    const publishAt = input.publishAt ?? new Date().toISOString();
    const expireAt = input.expireAt ?? undefined;
    const announcement: MockAnnouncement = {
      id: `announcement-${randomUUID()}`,
      churchId: this.getChurch().id,
      title: input.title,
      body: input.body,
      audience: input.audience,
      groupIds: input.audience === 'custom' ? [...(input.groupIds ?? [])] : undefined,
      publishAt,
      expireAt: expireAt ?? undefined,
    };
    this.announcements.push(announcement);
    const actorName = this.getUserName(input.actorUserId);
    const publishDate = new Date(publishAt);
    const now = new Date();
    const actionVerb = publishDate.getTime() > now.getTime() ? 'scheduled' : 'published';
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'announcement.created',
      entity: 'announcement',
      entityId: announcement.id,
      summary: `${actorName} ${actionVerb} announcement "${announcement.title}"`,
      metadata: {
        audience: announcement.audience,
        groupIds: announcement.groupIds ?? [],
        publishAt: announcement.publishAt,
        expireAt: announcement.expireAt ?? null,
      },
    });
    return clone(announcement);
  }

  updateAnnouncement(id: string, input: AnnouncementUpdateInput) {
    const announcement = this.announcements.find(item => item.id === id);
    if (!announcement) {
      return null;
    }
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const apply = <K extends keyof MockAnnouncement>(key: K, next: MockAnnouncement[K]) => {
      const previous = announcement[key];
      const isArray = Array.isArray(previous) || Array.isArray(next);
      const hasChanged = isArray
        ? JSON.stringify(previous) !== JSON.stringify(next)
        : previous !== next;
      if (hasChanged) {
        diff[String(key)] = { previous, newValue: next };
        if (next === undefined) {
          delete (announcement as any)[key];
        } else {
          (announcement as any)[key] = next;
        }
      }
    };

    if (input.title !== undefined) {
      apply('title', input.title);
    }
    if (input.body !== undefined) {
      apply('body', input.body);
    }
    if (input.publishAt !== undefined) {
      apply('publishAt', input.publishAt);
    }
    if (input.expireAt !== undefined) {
      apply('expireAt', input.expireAt ?? undefined);
    }
    if (input.audience !== undefined) {
      apply('audience', input.audience);
      if (input.audience === 'custom') {
        const nextGroups = input.groupIds ?? announcement.groupIds ?? [];
        apply('groupIds', nextGroups);
      } else {
        apply('groupIds', undefined);
      }
    } else if (input.groupIds !== undefined) {
      apply('groupIds', input.groupIds);
    }

    if (Object.keys(diff).length > 0) {
      const actorName = this.getUserName(input.actorUserId);
      this.createAuditLog({
        actorUserId: input.actorUserId,
        action: 'announcement.updated',
        entity: 'announcement',
        entityId: announcement.id,
        summary: `${actorName} updated announcement "${announcement.title}"`,
        diff,
      });
    }

    return clone(announcement);
  }

  listFunds() {
    return clone(this.funds);
  }

  listContributions(filter?: { memberId?: string; fundId?: string; from?: string; to?: string }) {
    let list = this.contributions;
    if (filter?.memberId) {
      list = list.filter(contribution => contribution.memberId === filter.memberId);
    }
    if (filter?.fundId) {
      list = list.filter(contribution => contribution.fundId === filter.fundId);
    }
    if (filter?.from) {
      const fromTime = new Date(filter.from).getTime();
      list = list.filter(contribution => new Date(contribution.date).getTime() >= fromTime);
    }
    if (filter?.to) {
      const toTime = new Date(filter.to).getTime();
      list = list.filter(contribution => new Date(contribution.date).getTime() <= toTime);
    }
    const sorted = [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return clone(sorted);
  }

  recordContribution(input: ContributionInput) {
    const contribution: MockContribution = {
      id: `contribution-${Date.now()}`,
      churchId: this.getChurch().id,
      memberId: input.memberId,
      amount: input.amount,
      date: input.date,
      fundId: input.fundId,
      method: input.method,
      note: input.note,
    };
    this.contributions.push(contribution);
    const actorUserId = input.recordedBy ?? input.memberId;
    const member = this.users.find(user => user.id === contribution.memberId);
    const actor = this.users.find(user => user.id === actorUserId);
    const memberName = member
      ? `${member.profile.firstName} ${member.profile.lastName}`.trim()
      : contribution.memberId;
    const actorName = actor ? `${actor.profile.firstName} ${actor.profile.lastName}`.trim() : actorUserId;
    const fund = contribution.fundId ? this.funds.find(f => f.id === contribution.fundId) : undefined;
    const fundLabel = fund?.name ?? 'General Offering';
    const methodLabel = contribution.method.replace(/-/g, ' ');
    const amountDisplay = contribution.amount.toFixed(2);
    this.createAuditLog({
      actorUserId,
      action: 'giving.recorded',
      entity: 'contribution',
      entityId: contribution.id,
      summary:
        actorUserId === contribution.memberId
          ? `${memberName} logged a $${amountDisplay} ${methodLabel} gift to ${fundLabel}`
          : `${actorName} recorded $${amountDisplay} ${methodLabel} gift for ${memberName}`,
      metadata: {
        memberId: contribution.memberId,
        amount: contribution.amount,
        fundId: contribution.fundId ?? null,
        method: contribution.method,
      },
    });
    return clone(contribution);
  }

  updateContribution(id: string, input: ContributionUpdateInput) {
    const contribution = this.contributions.find(item => item.id === id);
    if (!contribution) {
      return null;
    }
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const apply = <K extends keyof MockContribution>(key: K, next: MockContribution[K]) => {
      const previous = contribution[key];
      if (previous !== next) {
        diff[String(key)] = { previous, newValue: next };
        if (next === undefined) {
          delete (contribution as any)[key];
        } else {
          (contribution as any)[key] = next;
        }
      }
    };

    if (input.memberId !== undefined) {
      apply('memberId', input.memberId);
    }
    if (input.amount !== undefined) {
      apply('amount', input.amount);
    }
    if (input.date !== undefined) {
      apply('date', input.date);
    }
    if (input.fundId !== undefined) {
      apply('fundId', input.fundId ?? undefined);
    }
    if (input.method !== undefined) {
      apply('method', input.method);
    }
    if (input.note !== undefined) {
      apply('note', input.note ?? undefined);
    }

    if (Object.keys(diff).length > 0) {
      const actorName = this.getUserName(input.actorUserId);
      const memberName = this.getUserName(contribution.memberId);
      this.createAuditLog({
        actorUserId: input.actorUserId,
        action: 'giving.updated',
        entity: 'contribution',
        entityId: contribution.id,
        summary: `${actorName} updated $${contribution.amount.toFixed(2)} gift for ${memberName}`,
        diff,
      });
    }

    return clone(contribution);
  }

  getGivingSummary(churchId: string) {
    const contributions = this.contributions.filter(entry => entry.churchId === churchId);
    const totals = contributions.reduce(
      (acc, entry) => {
        acc.overall += entry.amount;
        acc.count += 1;
        const monthKey = formatMonthKey(entry.date);
        acc.monthTotals.set(monthKey, (acc.monthTotals.get(monthKey) ?? 0) + entry.amount);
        acc.fundTotals.set(entry.fundId ?? 'general', (acc.fundTotals.get(entry.fundId ?? 'general') ?? 0) + entry.amount);
        return acc;
      },
      {
        overall: 0,
        count: 0,
        monthTotals: new Map<string, number>(),
        fundTotals: new Map<string, number>(),
      },
    );

    const now = new Date();
    const currentMonthKey = formatMonthKey(now.toISOString());
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthKey = formatMonthKey(previousMonth.toISOString());

    const byFund = Array.from(totals.fundTotals.entries()).map(([fundId, amount]) => {
      const fund = fundId === 'general' ? undefined : this.funds.find(f => f.id === fundId);
      return {
        fundId: fund?.id ?? null,
        name: fund?.name ?? 'General',
        amount,
      };
    });

    const monthly = Array.from(totals.monthTotals.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => (a.month < b.month ? 1 : -1))
      .slice(0, 6);

    return {
      totals: {
        overall: totals.overall,
        monthToDate: totals.monthTotals.get(currentMonthKey) ?? 0,
        previousMonth: totals.monthTotals.get(previousMonthKey) ?? 0,
        averageGift: totals.count > 0 ? totals.overall / totals.count : 0,
      },
      byFund,
      monthly,
    };
  }

  exportContributionsCsv(filter?: { memberId?: string; fundId?: string; from?: string; to?: string }) {
    const contributions = this.listContributions(filter);
    const escape = (value: string | number | null | undefined) => {
      if (value === undefined || value === null) {
        return '';
      }
      const stringValue = String(value);
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    const fundMap = new Map(this.funds.map(fund => [fund.id, fund.name]));
    const userMap = new Map(this.users.map(user => [user.id, user]));
    const lines = [
      ['Generated At', escape(new Date().toISOString())].join(','),
      ['Total Records', String(contributions.length)].join(','),
      '',
      ['Contribution ID', 'Date', 'Member', 'Email', 'Fund', 'Amount', 'Method', 'Note'].join(','),
      ...contributions.map(entry => {
        const user = userMap.get(entry.memberId);
        const memberName = user
          ? `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim() || user.primaryEmail
          : entry.memberId;
        const fundName = entry.fundId ? fundMap.get(entry.fundId) ?? entry.fundId : 'General';
        return [
          escape(entry.id),
          escape(entry.date),
          escape(memberName),
          escape(user?.primaryEmail ?? ''),
          escape(fundName),
          escape(entry.amount.toFixed(2)),
          escape(entry.method),
          escape(entry.note ?? ''),
        ].join(',');
      }),
    ];
    return {
      filename: `giving-contributions-${new Date().toISOString().slice(0, 10)}.csv`,
      content: lines.join('\n'),
    };
  }

  listAuditLogs(filter: AuditLogFilter = {}) {
    const churchId = filter.churchId ?? this.getChurch().id;
    const fromTime = filter.from ? new Date(filter.from).getTime() : undefined;
    const toTime = filter.to ? new Date(filter.to).getTime() : undefined;
    let logs = this.auditLogs.filter(log => log.churchId === churchId);
    if (filter.actorUserId) {
      logs = logs.filter(log => log.actorUserId === filter.actorUserId);
    }
    if (filter.entity) {
      logs = logs.filter(log => log.entity === filter.entity);
    }
    if (filter.entityId) {
      logs = logs.filter(log => log.entityId === filter.entityId);
    }
    if (fromTime) {
      logs = logs.filter(log => new Date(log.createdAt).getTime() >= fromTime);
    }
    if (toTime) {
      logs = logs.filter(log => new Date(log.createdAt).getTime() <= toTime);
    }
    logs = [...logs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const pageSizeRaw = filter.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const pageSize = Math.min(pageSizeRaw, 100);
    const start = (page - 1) * pageSize;
    const paged = logs.slice(start, start + pageSize);
    const items = paged.map(log => ({
      ...clone(log),
      actor: this.getUserById(log.actorUserId),
    }));
    return {
      items,
      meta: {
        total: logs.length,
        page,
        pageSize,
      },
    };
  }

  private getUserName(userId: string) {
    const user = this.users.find(record => record.id === userId);
    if (!user) {
      return userId;
    }
    const fullName = `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim();
    return fullName || user.primaryEmail || userId;
  }

  createAuditLog(input: AuditLogCreateInput) {
    const churchId = input.churchId ?? this.getChurch().id;
    const record: MockAuditLog = {
      id: input.entityId
        ? `audit-${input.entity}-${input.entityId}-${Date.now()}`
        : `audit-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      churchId,
      actorUserId: input.actorUserId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      summary: input.summary,
      diff: input.diff,
      metadata: input.metadata,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };
    this.auditLogs.push(record);
    return clone(record);
  }

  getDashboardSnapshot(churchId: string) {
    const members = this.users.filter(user => user.roles.some(r => r.churchId === churchId));
    const groups = this.groups.filter(group => group.churchId === churchId);
    const upcomingEvents = this.events.filter(event => new Date(event.startAt) >= new Date());
    const unreadAnnouncements = this.announcements.filter(announcement => {
      const reads = this.announcementReads.filter(r => r.announcementId === announcement.id);
      return reads.length < members.length;
    });
    const contributionsLast30 = this.contributions.filter(contribution => {
      const contributionDate = new Date(contribution.date);
      const diff = (Date.now() - contributionDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    });
    const totalGivingLast30 = contributionsLast30.reduce((sum, entry) => sum + entry.amount, 0);
    return {
      memberCount: members.length,
      groupCount: groups.length,
      upcomingEvents: upcomingEvents.length,
      unreadAnnouncements: unreadAnnouncements.length,
      totalGivingLast30,
    };
  }

  createSession(email: string, provider: DemoSession['provider'], requestedRole?: Role) {
    const user = this.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found for demo login. Use one of the seeded accounts.');
    }
    const role = requestedRole || user.roles[0]?.role || 'Member';
    if (!user.roles.some(r => r.role === role)) {
      user.roles.push({ churchId: this.getChurch().id, role });
    }
    const token = createSessionToken();
    const session: DemoSession = {
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
      provider,
    };
    this.sessions.push(session);
    return { session, user: clone(user) };
  }

  getSessionByToken(token?: string) {
    if (!token) return null;
    const session = this.sessions.find(s => s.token === token);
    if (!session) return null;
    const user = this.getUserById(session.userId);
    if (!user) return null;
    return { session: clone(session), user };
  }

  upsertUserFromOAuth(input: {
    provider: 'google' | 'facebook';
    providerUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  }) {
    const churchId = this.getChurch().id;
    let user = this.getUserByEmail(input.email);
    let created = false;
    if (!user) {
      const id = `user-${randomUUID()}`;
      user = {
        id,
        primaryEmail: input.email,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        roles: [{ churchId, role: 'Member' }],
        profile: {
          firstName: input.firstName || 'New',
          lastName: input.lastName || 'Member',
          photoUrl: input.picture,
        },
      };
      this.users.push(user);
      created = true;
    } else {
      user.lastLoginAt = new Date().toISOString();
      if (input.firstName) {
        user.profile.firstName = input.firstName;
      }
      if (input.lastName) {
        user.profile.lastName = input.lastName;
      }
      if (input.picture) {
        user.profile.photoUrl = input.picture;
      }
      if (!user.roles.some(role => role.churchId === churchId)) {
        user.roles.push({ churchId, role: 'Member' });
      }
    }

    if (!this.oauthAccounts.some(account => account.provider === input.provider && account.providerUserId === input.providerUserId)) {
      this.oauthAccounts.push({ provider: input.provider, providerUserId: input.providerUserId, userId: user.id });
    }

    return { user: clone(user), created };
  }
}

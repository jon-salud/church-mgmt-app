import { Injectable } from '@nestjs/common';
import {
  MockUser,
  mockUsers,
  MockGroup,
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
  AttendanceStatus,
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
}

function clone<T>(value: T): T {
  return structuredClone(value);
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
  private sessions: DemoSession[] = clone(mockSessions);

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

  listEvents() {
    return clone(this.events);
  }

  getEventById(id: string) {
    return clone(this.events.find(event => event.id === id) || null);
  }

  recordAttendance(input: AttendanceInput) {
    const event = this.events.find(e => e.id === input.eventId);
    if (!event) return null;
    const existing = event.attendance.find(a => a.userId === input.userId);
    if (existing) {
      existing.status = input.status;
      existing.note = input.note;
      existing.recordedBy = input.recordedBy;
      existing.recordedAt = new Date().toISOString();
      return clone(existing);
    }
    const record = {
      eventId: input.eventId,
      userId: input.userId,
      status: input.status,
      note: input.note,
      recordedBy: input.recordedBy,
      recordedAt: new Date().toISOString(),
    };
    event.attendance.push(record);
    return clone(record);
  }

  listAnnouncements(churchId?: string) {
    const filtered = this.announcements.filter(a => !churchId || a.churchId === churchId);
    return filtered.map(announcement => ({
      ...clone(announcement),
      reads: this.announcementReads.filter(read => read.announcementId === announcement.id),
    }));
  }

  markAnnouncementRead(announcementId: string, userId: string) {
    const already = this.announcementReads.find(
      read => read.announcementId === announcementId && read.userId === userId,
    );
    if (already) {
      return clone(already);
    }
    const record = {
      announcementId,
      userId,
      readAt: new Date().toISOString(),
    };
    this.announcementReads.push(record);
    return clone(record);
  }

  listFunds() {
    return clone(this.funds);
  }

  listContributions(filter?: { memberId?: string; fundId?: string }) {
    let list = this.contributions;
    if (filter?.memberId) {
      list = list.filter(contribution => contribution.memberId === filter.memberId);
    }
    if (filter?.fundId) {
      list = list.filter(contribution => contribution.fundId === filter.fundId);
    }
    return clone(list);
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
    return clone(contribution);
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
}

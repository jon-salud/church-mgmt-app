import { randomUUID } from 'node:crypto';

export type Role = 'Member' | 'Leader' | 'Admin';

export type MembershipStatus = 'Active' | 'Inactive';

export type AttendanceStatus = 'checkedIn' | 'absent' | 'excused';

export type ContributionMethod = 'cash' | 'bank-transfer' | 'eftpos' | 'other';

export interface MockProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  birthday?: string;
  notes?: string;
  photoUrl?: string;
}

export interface MockUser {
  id: string;
  primaryEmail: string;
  status: 'active' | 'invited';
  createdAt: string;
  lastLoginAt?: string;
  roles: Array<{ churchId: string; role: Role }>;
  profile: MockProfile;
}

export interface MockGroupMember {
  userId: string;
  role: Role | 'Coordinator' | 'Volunteer';
  status: MembershipStatus;
  joinedAt: string;
}

export type GroupType =
  | 'GeographicalMinistry'
  | 'ServiceMinistry'
  | 'VolunteerTeam'
  | 'SmallGroup'
  | 'Other';

export interface MockGroup {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  type: GroupType;
  meetingDay?: string;
  meetingTime?: string;
  tags: string[];
  leaderUserId?: string;
  members: MockGroupMember[];
}

export interface MockAttendance {
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  note?: string;
  recordedBy?: string;
  recordedAt: string;
}

export interface MockEvent {
  id: string;
  churchId: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  location?: string;
  visibility: 'public' | 'private';
  groupId?: string;
  tags: string[];
  attendance: MockAttendance[];
}

export interface MockAnnouncementRead {
  announcementId: string;
  userId: string;
  readAt: string;
}

export interface MockAnnouncement {
  id: string;
  churchId: string;
  title: string;
  body: string;
  audience: 'all' | 'custom';
  groupIds?: string[];
  publishAt: string;
  expireAt?: string;
}

export interface MockFund {
  id: string;
  churchId: string;
  name: string;
}

export interface MockContribution {
  id: string;
  churchId: string;
  memberId: string;
  date: string;
  amount: number;
  method: ContributionMethod;
  fundId?: string;
  note?: string;
}

export interface MockAuditLog {
  id: string;
  churchId: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  diff?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MockChurch {
  id: string;
  name: string;
  timezone: string;
}

export interface DemoSession {
  token: string;
  userId: string;
  createdAt: string;
  provider: 'google' | 'facebook';
}

const today = new Date();

const makeDate = (offsetDays: number, hour = 10): string => {
  const d = new Date(today);
  d.setDate(today.getDate() + offsetDays);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

const churchId = 'church-acc';

export const mockChurches: MockChurch[] = [
  {
    id: churchId,
    name: 'Auckland Community Church',
    timezone: 'Pacific/Auckland',
  },
];

export const mockUsers: MockUser[] = [
  {
    id: 'user-admin',
    primaryEmail: 'admin@example.com',
    status: 'active',
    createdAt: makeDate(-90),
    lastLoginAt: makeDate(-1, 9),
    roles: [{ churchId, role: 'Admin' }],
    profile: {
      firstName: 'Ariana',
      lastName: 'Matau',
      phone: '+64 21 000 0001',
      address: '12 Karaka Street, Auckland',
      notes: 'Lead administrator',
    },
  },
  {
    id: 'user-leader',
    primaryEmail: 'leader@example.com',
    status: 'active',
    createdAt: makeDate(-60),
    lastLoginAt: makeDate(-2, 8),
    roles: [{ churchId, role: 'Leader' }],
    profile: {
      firstName: 'Sione',
      lastName: 'Latu',
      phone: '+64 21 000 0002',
      address: '48 Dominion Road, Auckland',
      notes: 'Worship leader',
    },
  },
  {
    id: 'user-member-1',
    primaryEmail: 'member1@example.com',
    status: 'active',
    createdAt: makeDate(-45),
    lastLoginAt: makeDate(-3, 11),
    roles: [{ churchId, role: 'Member' }],
    profile: {
      firstName: 'Maria',
      lastName: 'Taulagi',
      phone: '+64 21 000 0003',
      notes: 'Soprano',
    },
  },
  {
    id: 'user-member-2',
    primaryEmail: 'member2@example.com',
    status: 'active',
    createdAt: makeDate(-20),
    lastLoginAt: makeDate(-5, 12),
    roles: [{ churchId, role: 'Member' }],
    profile: {
      firstName: 'Tomas',
      lastName: 'Perenise',
      phone: '+64 21 000 0004',
      notes: 'Sound desk volunteer',
    },
  },
  {
    id: 'user-member-3',
    primaryEmail: 'member3@example.com',
    status: 'active',
    createdAt: makeDate(-10),
    roles: [{ churchId, role: 'Member' }],
    profile: {
      firstName: 'Lydia',
      lastName: 'Ngata',
      phone: '+64 21 000 0005',
      notes: 'Kids ministry helper',
    },
  },
];

export const mockGroups: MockGroup[] = [
  {
    id: 'group-worship',
    churchId,
    name: 'Worship Team',
    description: 'Sunday service music ministry',
    type: 'ServiceMinistry',
    meetingDay: 'Thursday',
    meetingTime: '19:00',
    tags: ['music', 'sunday'],
    leaderUserId: 'user-leader',
    members: [
      { userId: 'user-leader', role: 'Leader', status: 'Active', joinedAt: makeDate(-120) },
      { userId: 'user-member-1', role: 'Member', status: 'Active', joinedAt: makeDate(-90) },
      { userId: 'user-member-2', role: 'Volunteer', status: 'Active', joinedAt: makeDate(-80) },
    ],
  },
  {
    id: 'group-kids',
    churchId,
    name: 'Kids Connect',
    description: 'Wānanga for primary-aged kids during Sunday service',
    type: 'ServiceMinistry',
    meetingDay: 'Sunday',
    meetingTime: '10:00',
    tags: ['kids', 'teaching'],
    leaderUserId: 'user-member-3',
    members: [
      { userId: 'user-admin', role: 'Coordinator', status: 'Active', joinedAt: makeDate(-200) },
      { userId: 'user-member-3', role: 'Leader', status: 'Active', joinedAt: makeDate(-40) },
    ],
  },
  {
    id: 'group-east',
    churchId,
    name: 'East Auckland Life Group',
    description: 'Fortnightly life group in Howick',
    type: 'SmallGroup',
    meetingDay: 'Tuesday',
    meetingTime: '19:30',
    tags: ['life-group'],
    leaderUserId: 'user-admin',
    members: [
      { userId: 'user-admin', role: 'Leader', status: 'Active', joinedAt: makeDate(-365) },
      { userId: 'user-member-1', role: 'Member', status: 'Active', joinedAt: makeDate(-200) },
      { userId: 'user-member-2', role: 'Member', status: 'Active', joinedAt: makeDate(-120) },
    ],
  },
];

export const mockEvents: MockEvent[] = [
  {
    id: 'event-sunday-service',
    churchId,
    title: 'Sunday Service',
    description: 'Weekly gathering with worship and teaching.',
    startAt: makeDate(3, 10),
    endAt: makeDate(3, 12),
    location: 'Main Auditorium',
    visibility: 'public',
    groupId: 'group-worship',
    tags: ['service', 'worship'],
    attendance: [
      {
        eventId: 'event-sunday-service',
        userId: 'user-leader',
        status: 'checkedIn',
        recordedBy: 'user-admin',
        recordedAt: makeDate(-7, 10),
      },
      {
        eventId: 'event-sunday-service',
        userId: 'user-member-1',
        status: 'checkedIn',
        recordedBy: 'user-admin',
        recordedAt: makeDate(-7, 10),
      },
    ],
  },
  {
    id: 'event-team-rehearsal',
    churchId,
    title: 'Worship Team Rehearsal',
    description: 'Weekly rehearsal for the worship ministry.',
    startAt: makeDate(2, 19),
    endAt: makeDate(2, 21),
    location: 'Music Room',
    visibility: 'private',
    groupId: 'group-worship',
    tags: ['music'],
    attendance: [
      {
        eventId: 'event-team-rehearsal',
        userId: 'user-leader',
        status: 'checkedIn',
        recordedBy: 'user-leader',
        recordedAt: makeDate(-6, 19),
      },
    ],
  },
  {
    id: 'event-kids-training',
    churchId,
    title: 'Kids Ministry Training',
    description: 'Quarterly upskilling session for Kids Connect volunteers.',
    startAt: makeDate(10, 9),
    endAt: makeDate(10, 12),
    location: 'Youth Room',
    visibility: 'private',
    groupId: 'group-kids',
    tags: ['training'],
    attendance: [],
  },
];

export const mockAnnouncements: MockAnnouncement[] = [
  {
    id: 'announcement-welcome',
    churchId,
    title: 'Welcome to the new app!',
    body: 'We are excited to launch our new member portal. Please explore the features and share feedback.',
    audience: 'all',
    publishAt: makeDate(-2, 9),
  },
  {
    id: 'announcement-fundraiser',
    churchId,
    title: 'Youth Missions Fundraiser',
    body: 'Youth ministry is hosting a bake sale fundraiser after the service this Sunday.',
    audience: 'custom',
    groupIds: ['group-east'],
    publishAt: makeDate(-1, 14),
  },
];

export const mockAnnouncementReads: MockAnnouncementRead[] = [
  {
    announcementId: 'announcement-welcome',
    userId: 'user-admin',
    readAt: makeDate(-2, 10),
  },
  {
    announcementId: 'announcement-welcome',
    userId: 'user-leader',
    readAt: makeDate(-2, 12),
  },
];

export const mockFunds: MockFund[] = [
  { id: 'fund-general', churchId, name: 'General Offering' },
  { id: 'fund-missions', churchId, name: 'Missions' },
];

export const mockContributions: MockContribution[] = [
  {
    id: 'contribution-1',
    churchId,
    memberId: 'user-member-1',
    date: makeDate(-12, 11),
    amount: 120.0,
    method: 'bank-transfer',
    fundId: 'fund-general',
    note: 'Monthly pledge',
  },
  {
    id: 'contribution-2',
    churchId,
    memberId: 'user-member-2',
    date: makeDate(-7, 11),
    amount: 40.0,
    method: 'cash',
    fundId: 'fund-missions',
  },
];

export const mockAuditLogs: MockAuditLog[] = [
  {
    id: 'audit-1',
    churchId,
    actorUserId: 'user-admin',
    action: 'attendance.updated',
    entity: 'event',
    entityId: 'event-sunday-service',
    summary: 'Admin marked Maria Taulagi as checked in for Sunday Service',
    metadata: { userId: 'user-member-1', newStatus: 'checkedIn' },
    createdAt: makeDate(-2, 10),
  },
  {
    id: 'audit-2',
    churchId,
    actorUserId: 'user-admin',
    action: 'giving.recorded',
    entity: 'contribution',
    entityId: 'contribution-2',
    summary: 'Admin recorded $40.00 cash gift for Tomas Perenise',
    metadata: { memberId: 'user-member-2', amount: 40, fundId: 'fund-missions' },
    createdAt: makeDate(-2, 11),
  },
  {
    id: 'audit-3',
    churchId,
    actorUserId: 'user-leader',
    action: 'announcement.read',
    entity: 'announcement',
    entityId: 'announcement-welcome',
    summary: 'Sione Latu read announcement "Welcome to the new app!"',
    metadata: { userId: 'user-leader' },
    createdAt: makeDate(-2, 12),
  },
];

export const mockSessions: DemoSession[] = [
  {
    token: 'demo-admin',
    userId: 'user-admin',
    createdAt: makeDate(-1),
    provider: 'google',
  },
  {
    token: 'demo-leader',
    userId: 'user-leader',
    createdAt: makeDate(-1),
    provider: 'facebook',
  },
  {
    token: 'demo-member',
    userId: 'user-member-1',
    createdAt: makeDate(-1),
    provider: 'google',
  },
];

export const createSessionToken = () => randomUUID();

import { randomUUID } from 'node:crypto';
import { MockPrayerRequest } from './mock-data/prayer-request';
export type { MockChild } from './mock-data/child';
export type { MockPastoralCareTicket } from './mock-data/pastoral-care-ticket';
export type { MockPastoralCareComment } from './mock-data/pastoral-care-comment';
export type { MockPrayerRequest } from './mock-data/prayer-request';

export const DEFAULT_ROLE_SLUGS = ['admin', 'leader', 'member'] as const;
export type DefaultRoleSlug = (typeof DEFAULT_ROLE_SLUGS)[number];

export interface MockRole {
  id: string;
  churchId: string;
  slug: DefaultRoleSlug | string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  isDeletable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MembershipStatus = 'Active' | 'Inactive';
export type AttendanceStatus = 'checkedIn' | 'absent' | 'excused';
export type ContributionMethod = 'cash' | 'bank-transfer' | 'eftpos' | 'other';
export type HouseholdRole = 'Head' | 'Spouse' | 'Child' | 'Other';
export type MemberJoinMethod = 'Baptism' | 'Transfer of Letter' | 'Restoration' | 'Statement of Faith' | 'New Believer';
export type MaritalStatus = 'Single' | 'Married' | 'Engaged' | 'Divorced' | 'Widowed';
export type BackgroundCheckStatus = 'Not Started' | 'Pending' | 'Approved' | 'Expired';

export interface MockHousehold {
  id: string;
  churchId: string;
  name: string; // e.g., "Matau Family"
  address?: string;
  phoneNumber?: string;
  anniversaryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockProfile {
  // Core Fields
  firstName: string;
  lastName: string;
  phone?: string;
  birthday?: string;
  notes?: string;
  photoUrl?: string;

  // Household linking
  householdId: string;
  householdRole: HouseholdRole;

  // Optional Fields (Configurable by Tenant)
  membershipStatus?: 'Inquirer' | 'Attender' | 'Member' | 'Paused' | 'Inactive';
  joinMethod?: MemberJoinMethod;
  joinDate?: string;
  previousChurch?: string;
  baptismDate?: string;
  spiritualGifts?: string[];
  coursesAttended?: string[];
  maritalStatus?: MaritalStatus;
  occupation?: string;
  school?: string;
  gradeLevel?: string;
  graduationYear?: number;
  skillsAndInterests?: string[];
  backgroundCheckStatus?: BackgroundCheckStatus;
  backgroundCheckDate?: string;
  onboardingComplete?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergiesOrMedicalNotes?: string;
  parentalConsentOnFile?: boolean;
  pastoralNotes?: string;
}

export interface MockUser {
  id: string;
  primaryEmail: string;
  status: 'active' | 'invited';
  createdAt: string;
  lastLoginAt?: string;
  roles: Array<{ churchId: string; roleId: string }>;
  profile: MockProfile;
}

export interface MockGroupMember {
  userId: string;
  role: 'Member' | 'Leader' | 'Admin' | 'Coordinator' | 'Volunteer';
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

export interface MockCheckin {
  id: string;
  churchId: string;
  eventId: string;
  childId: string;
  status: 'pending' | 'checked-in' | 'checked-out';
  checkinTime?: string;
  checkoutTime?: string;
  checkedInBy?: string;
  checkedOutBy?: string;
}

export interface DemoSession {
  token: string;
  userId: string;
  createdAt: string;
  provider: 'google' | 'facebook' | 'demo';
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

export const mockPrayerRequests: MockPrayerRequest[] = [
  {
    id: 'prayer-1',
    churchId,
    title: 'Healing for my mother',
    body: 'Please pray for my mother, who is battling a serious illness. Pray for strength, comfort, and complete healing.',
    authorName: 'John D.',
    isAnonymous: false,
    createdAt: makeDate(-5),
  },
  {
    id: 'prayer-2',
    churchId,
    title: 'Guidance in career change',
    body: 'I am considering a career change and feel uncertain about the future. Please pray for clarity and wisdom as I make this decision.',
    authorName: 'Anonymous',
    isAnonymous: true,
    createdAt: makeDate(-3),
  },
  {
    id: 'prayer-3',
    churchId,
    title: 'Safe travels for mission trip',
    body: 'Our youth group is going on a mission trip next week. Please pray for their safety and for the hearts of the people they will be serving.',
    authorName: 'Sarah L.',
    isAnonymous: false,
    createdAt: makeDate(-1),
  },
];

export const mockRoles: MockRole[] = [
  {
    id: 'role-admin',
    churchId,
    slug: 'admin',
    name: 'Admin',
    description: 'Full access to manage people, groups, events, announcements, giving, and audit logs.',
    permissions: [
      'people.manage',
      'groups.manage',
      'events.manage',
      'announcements.manage',
      'giving.manage',
      'audit.read',
      'settings.manage',
    ],
    isSystem: true,
    isDeletable: false,
    createdAt: makeDate(-365),
    updatedAt: makeDate(-7),
  },
  {
    id: 'role-leader',
    churchId,
    slug: 'leader',
    name: 'Leader',
    description: 'Manage assigned groups and record attendance.',
    permissions: ['groups.own.manage', 'attendance.record', 'announcements.read'],
    isSystem: false,
    isDeletable: true,
    createdAt: makeDate(-365),
    updatedAt: makeDate(-7),
  },
  {
    id: 'role-member',
    churchId,
    slug: 'member',
    name: 'Member',
    description: 'View personal profile, announcements, and events.',
    permissions: ['self.view', 'announcements.read', 'events.view'],
    isSystem: false,
    isDeletable: true,
    createdAt: makeDate(-365),
    updatedAt: makeDate(-7),
  },
];

export const mockHouseholds: MockHousehold[] = [
  {
    id: 'hh-matau',
    churchId,
    name: 'Matau Family',
    address: '12 Karaka Street, Auckland',
    createdAt: makeDate(-90),
    updatedAt: makeDate(-1),
  },
  {
    id: 'hh-latu',
    churchId,
    name: 'Latu Family',
    address: '48 Dominion Road, Auckland',
    createdAt: makeDate(-60),
    updatedAt: makeDate(-2),
  },
  {
    id: 'hh-taulagi',
    churchId,
    name: 'Taulagi Family',
    createdAt: makeDate(-45),
    updatedAt: makeDate(-3),
  },
  {
    id: 'hh-perenise',
    churchId,
    name: 'Perenise Family',
    createdAt: makeDate(-20),
    updatedAt: makeDate(-5),
  },
  {
    id: 'hh-ngata',
    churchId,
    name: 'Ngata Family',
    createdAt: makeDate(-10),
    updatedAt: makeDate(-1),
  }
];

export const mockUsers: MockUser[] = [
  {
    id: 'user-admin',
    primaryEmail: 'admin@example.com',
    status: 'active',
    createdAt: makeDate(-90),
    lastLoginAt: makeDate(-1, 9),
    roles: [{ churchId, roleId: 'role-admin' }],
    profile: {
      firstName: 'Ariana',
      lastName: 'Matau',
      phone: '+64 21 000 0001',
      householdId: 'hh-matau',
      householdRole: 'Head',
      notes: 'Lead administrator',
      membershipStatus: 'Member',
      joinMethod: 'Transfer of Letter',
      joinDate: makeDate(-365),
      baptismDate: makeDate(-1000),
      maritalStatus: 'Married',
      occupation: 'Church Administrator',
    },
  },
  {
    id: 'user-leader',
    primaryEmail: 'leader@example.com',
    status: 'active',
    createdAt: makeDate(-60),
    lastLoginAt: makeDate(-2, 8),
    roles: [{ churchId, roleId: 'role-leader' }],
    profile: {
      firstName: 'Sione',
      lastName: 'Latu',
      phone: '+64 21 000 0002',
      householdId: 'hh-latu',
      householdRole: 'Head',
      notes: 'Worship leader',
      membershipStatus: 'Member',
      joinMethod: 'Baptism',
      joinDate: makeDate(-200),
      baptismDate: makeDate(-200),
      maritalStatus: 'Married',
      skillsAndInterests: ['Music', 'Guitar'],
      backgroundCheckStatus: 'Approved',
      backgroundCheckDate: makeDate(-300),
      onboardingComplete: true,
    },
  },
  {
    id: 'user-member-1',
    primaryEmail: 'member1@example.com',
    status: 'active',
    createdAt: makeDate(-45),
    lastLoginAt: makeDate(-3, 11),
    roles: [{ churchId, roleId: 'role-member' }],
    profile: {
      firstName: 'Maria',
      lastName: 'Taulagi',
      phone: '+64 21 000 0003',
      householdId: 'hh-taulagi',
      householdRole: 'Head',
      notes: 'Soprano',
      membershipStatus: 'Member',
      joinMethod: 'New Believer',
      joinDate: makeDate(-50),
      baptismDate: makeDate(-50),
      maritalStatus: 'Single',
    },
  },
  {
    id: 'user-member-2',
    primaryEmail: 'member2@example.com',
    status: 'active',
    createdAt: makeDate(-20),
    lastLoginAt: makeDate(-5, 12),
    roles: [{ churchId, roleId: 'role-member' }],
    profile: {
      firstName: 'Tomas',
      lastName: 'Perenise',
      phone: '+64 21 000 0004',
      householdId: 'hh-perenise',
      householdRole: 'Head',
      notes: 'Sound desk volunteer',
      membershipStatus: 'Attender',
    },
  },
  {
    id: 'user-member-3',
    primaryEmail: 'member3@example.com',
    status: 'active',
    createdAt: makeDate(-10),
    roles: [{ churchId, roleId: 'role-member' }],
    profile: {
      firstName: 'Lydia',
      lastName: 'Ngata',
      phone: '+64 21 000 0005',
      householdId: 'hh-ngata',
      householdRole: 'Head',
      notes: 'Kids ministry helper',
      membershipStatus: 'Member',
      joinMethod: 'Restoration',
      joinDate: makeDate(-15),
      backgroundCheckStatus: 'Pending',
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

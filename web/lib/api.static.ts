// Static API functions for GitHub Pages deployment
// These provide demo data instead of making HTTP calls with cookies

import type { PastoralCareTicket, PrayerRequest } from './types';

type AuditLogActor = {
  id: string;
  primaryEmail: string;
  profile?: { firstName?: string; lastName?: string };
};

type AuditLogEntry = {
  id: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  diff?: Record<string, unknown>;
  actor?: AuditLogActor | null;
};

type AuditLogResponse = {
  items: AuditLogEntry[];
  meta: { total: number; page: number; pageSize: number };
};

// Demo data for static export
const demoMembers = [
  {
    id: '1',
    primaryEmail: 'john.doe@example.com',
    profile: { firstName: 'John', lastName: 'Doe', phone: '555-0101' },
    status: 'active',
    groups: [{ id: '1', name: 'Worship Team', type: 'ServiceMinistry' }],
    household: { id: '1', name: 'Doe Family' },
  },
  {
    id: '2',
    primaryEmail: 'jane.smith@example.com',
    profile: { firstName: 'Jane', lastName: 'Smith', phone: '555-0102' },
    status: 'active',
    groups: [{ id: '2', name: 'Youth Group', type: 'SmallGroup' }],
    household: { id: '2', name: 'Smith Family' },
  },
  {
    id: '3',
    primaryEmail: 'bob.johnson@example.com',
    profile: { firstName: 'Bob', lastName: 'Johnson', phone: '555-0103' },
    status: 'active',
    groups: [],
    household: { id: '3', name: 'Johnson Family' },
  },
  {
    id: '4',
    primaryEmail: 'alice.brown@example.com',
    profile: { firstName: 'Alice', lastName: 'Brown', phone: '555-0104' },
    status: 'active',
    groups: [{ id: '1', name: 'Worship Team', type: 'ServiceMinistry' }],
    household: { id: '4', name: 'Brown Family' },
  },
  {
    id: '5',
    primaryEmail: 'charlie.wilson@example.com',
    profile: { firstName: 'Charlie', lastName: 'Wilson', phone: '555-0105' },
    status: 'active',
    groups: [{ id: '2', name: 'Youth Group', type: 'SmallGroup' }],
    household: { id: '5', name: 'Wilson Family' },
  },
];

const demoHouseholds = [
  { id: '1', name: 'Doe Family', memberCount: 2 },
  { id: '2', name: 'Smith Family', memberCount: 3 },
  { id: '3', name: 'Johnson Family', memberCount: 1 },
  { id: '4', name: 'Brown Family', memberCount: 4 },
  { id: '5', name: 'Wilson Family', memberCount: 2 },
];

const demoGroups = [
  {
    id: '1',
    name: 'Worship Team',
    type: 'ServiceMinistry',
    description: 'Leading worship services',
    memberCount: 12,
  },
  {
    id: '2',
    name: 'Youth Group',
    type: 'SmallGroup',
    description: 'Teens and young adults fellowship',
    memberCount: 8,
  },
  {
    id: '3',
    name: 'Welcome Team',
    type: 'VolunteerTeam',
    description: 'Greeting visitors and members',
    memberCount: 6,
  },
  {
    id: '4',
    name: 'Prayer Ministry',
    type: 'ServiceMinistry',
    description: 'Prayer support and intercession',
    memberCount: 10,
  },
  {
    id: '5',
    name: "Children's Ministry",
    type: 'ServiceMinistry',
    description: "Sunday school and children's programs",
    memberCount: 15,
  },
];

const demoEvents = [
  {
    id: '1',
    title: 'Sunday Service',
    startAt: '2024-01-14T10:00:00Z',
    location: 'Main Sanctuary',
  },
  {
    id: '2',
    title: 'Youth Group Meeting',
    startAt: '2024-01-16T19:00:00Z',
    location: 'Fellowship Hall',
  },
  {
    id: '3',
    title: 'Prayer Meeting',
    startAt: '2024-01-18T19:30:00Z',
    location: 'Prayer Room',
  },
  {
    id: '4',
    title: 'Community Outreach',
    startAt: '2024-01-20T09:00:00Z',
    location: 'Downtown Park',
  },
  {
    id: '5',
    title: 'Bible Study',
    startAt: '2024-01-23T19:00:00Z',
    location: 'Library',
  },
];

const demoAnnouncements = [
  {
    id: '1',
    title: 'Welcome New Members',
    body: "We're excited to welcome several new families to our church community!",
    audience: 'all',
    publishAt: '2024-01-10T08:00:00Z',
  },
  {
    id: '2',
    title: 'Youth Retreat',
    body: 'Join us for our annual youth retreat February 15-17 at Camp Hope.',
    audience: 'youth',
    publishAt: '2024-01-12T08:00:00Z',
  },
  {
    id: '3',
    title: 'Volunteer Sign-up',
    body: 'We need volunteers for the community food drive this Saturday.',
    audience: 'all',
    publishAt: '2024-01-13T08:00:00Z',
  },
];

const demoRoles = [
  { id: 'admin', name: 'Admin', permissions: ['*'], isSystem: true },
  { id: 'staff', name: 'Staff', permissions: ['read', 'write'], isSystem: true },
  { id: 'member', name: 'Member', permissions: ['read'], isSystem: true },
];

const demoFunds = [
  { id: 'general', name: 'General Fund' },
  { id: 'missions', name: 'Missions Fund' },
  { id: 'building', name: 'Building Fund' },
];

const demoContributions = [
  {
    id: '1',
    memberId: '1',
    amount: 150.0,
    date: '2024-01-07',
    fundId: 'general',
    method: 'cash',
  },
  {
    id: '2',
    memberId: '2',
    amount: 75.0,
    date: '2024-01-07',
    fundId: 'missions',
    method: 'check',
  },
  {
    id: '3',
    memberId: '3',
    amount: 200.0,
    date: '2024-01-14',
    fundId: 'general',
    method: 'online',
  },
  {
    id: '4',
    memberId: '4',
    amount: 50.0,
    date: '2024-01-14',
    fundId: 'building',
    method: 'cash',
  },
  {
    id: '5',
    memberId: '5',
    amount: 100.0,
    date: '2024-01-21',
    fundId: 'general',
    method: 'check',
  },
];

const demoAuditLogs: AuditLogEntry[] = [
  {
    id: '1',
    entity: 'member',
    entityId: '1',
    action: 'create',
    summary: 'Created member John Doe',
    createdAt: '2024-01-10T10:00:00Z',
    actorUserId: 'admin',
    actor: {
      id: 'admin',
      primaryEmail: 'admin@church.org',
      profile: { firstName: 'Admin', lastName: 'User' },
    },
    metadata: { email: 'john.doe@example.com' },
  },
  {
    id: '2',
    entity: 'group',
    entityId: '1',
    action: 'update',
    summary: 'Updated Worship Team description',
    createdAt: '2024-01-11T14:30:00Z',
    actorUserId: 'admin',
    actor: {
      id: 'admin',
      primaryEmail: 'admin@church.org',
      profile: { firstName: 'Admin', lastName: 'User' },
    },
    metadata: { oldDescription: 'Leading worship', newDescription: 'Leading worship services' },
  },
];

const demoPastoralCareTickets: PastoralCareTicket[] = [
  {
    id: '1',
    title: 'Prayer Request for Healing',
    description: 'Please pray for my mother who is recovering from surgery.',
    status: 'NEW',
    priority: 'NORMAL',
    author: {
      profile: { firstName: 'John', lastName: 'Doe' },
    },
    createdAt: '2024-01-12T09:00:00Z',
    comments: [],
  },
  {
    id: '2',
    title: 'Counseling Request',
    description: 'I would like to speak with a pastor about some personal concerns.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    author: {
      profile: { firstName: 'Jane', lastName: 'Smith' },
    },
    createdAt: '2024-01-13T11:30:00Z',
    comments: [
      {
        id: '1',
        body: "I've scheduled a meeting for tomorrow at 2 PM. Please let me know if this works for you.",
        author: {
          profile: { firstName: 'Pastor', lastName: 'Johnson' },
        },
        createdAt: '2024-01-13T12:00:00Z',
      },
    ],
  },
];

const demoPrayerRequests: PrayerRequest[] = [
  {
    id: '1',
    title: 'Healing for Family',
    description: 'Please pray for my family as we go through this difficult time.',
    prayerCount: 12,
  },
  {
    id: '2',
    title: 'Guidance for Career',
    description: 'Seeking wisdom and direction for my career path.',
    prayerCount: 8,
  },
];

const demoRequestTypes = [
  {
    id: '1',
    name: 'Baptism',
    churchId: 'demo-church',
    hasConfidentialField: false,
    description: 'Request for baptism ceremony',
    status: 'active' as const,
    isBuiltIn: true,
    displayOrder: 1,
  },
  {
    id: '2',
    name: 'Marriage Counseling',
    churchId: 'demo-church',
    hasConfidentialField: true,
    description: 'Pre-marital counseling',
    status: 'active' as const,
    isBuiltIn: true,
    displayOrder: 2,
  },
  {
    id: '3',
    name: 'Funeral Services',
    churchId: 'demo-church',
    hasConfidentialField: false,
    description: 'Funeral planning and services',
    status: 'active' as const,
    isBuiltIn: true,
    displayOrder: 3,
  },
];

const demoCheckins = {
  pending: [
    {
      id: '1',
      memberId: '1',
      eventId: '1',
      status: 'pending',
      checkedInAt: null,
      member: demoMembers[0],
      event: demoEvents[0],
    },
    {
      id: '2',
      memberId: '2',
      eventId: '1',
      status: 'pending',
      checkedInAt: null,
      member: demoMembers[1],
      event: demoEvents[0],
    },
  ],
  'checked-in': [
    {
      id: '3',
      memberId: '3',
      eventId: '1',
      status: 'checked-in',
      checkedInAt: '2024-01-14T09:45:00Z',
      member: demoMembers[2],
      event: demoEvents[0],
    },
    {
      id: '4',
      memberId: '4',
      eventId: '2',
      status: 'checked-in',
      checkedInAt: '2024-01-16T18:30:00Z',
      member: demoMembers[3],
      event: demoEvents[1],
    },
  ],
};

// Static API functions that return demo data instead of making HTTP calls
export const api = {
  async dashboardSummary() {
    return {
      memberCount: demoMembers.length,
      groupCount: demoGroups.length,
      upcomingEvents: demoEvents.length,
      unreadAnnouncements: demoAnnouncements.length,
      totalGivingLast30: demoContributions.reduce((sum, c) => sum + c.amount, 0),
    };
  },
  async dashboardOverview() {
    return {
      church: { id: 'demo-church', name: 'Demo Church', timezone: 'America/New_York' },
      events: demoEvents
        .slice(0, 3)
        .map(e => ({ id: e.id, title: e.title, startAt: e.startAt, location: e.location })),
      announcements: demoAnnouncements
        .slice(0, 3)
        .map(a => ({ id: a.id, title: a.title, publishAt: a.publishAt })),
      contributions: demoContributions.slice(0, 5),
    };
  },
  async currentUser() {
    return null; // No authentication in static version
  },
  async members(search?: string) {
    let filtered = demoMembers;
    if (search) {
      const query = search.toLowerCase();
      filtered = demoMembers.filter(
        m =>
          m.primaryEmail.toLowerCase().includes(query) ||
          m.profile?.firstName?.toLowerCase().includes(query) ||
          m.profile?.lastName?.toLowerCase().includes(query)
      );
    }
    return filtered;
  },
  async member(id: string) {
    return demoMembers.find(m => m.id === id) || null;
  },
  async households() {
    return demoHouseholds;
  },
  async household(id: string) {
    const household = demoHouseholds.find(h => h.id === id);
    if (!household) return null;

    // Add members to household
    const members = demoMembers.filter(m => m.household?.id === id);
    return { ...household, members };
  },
  async getChildren(householdId: string) {
    // Demo children data
    return [
      { id: 'child1', name: 'Timmy Doe', age: 8, householdId },
      { id: 'child2', name: 'Sally Doe', age: 6, householdId },
    ];
  },
  async getCheckins(status: 'pending' | 'checked-in') {
    return demoCheckins[status] || [];
  },
  async groups() {
    return demoGroups;
  },
  async group(id: string) {
    const group = demoGroups.find(g => g.id === id);
    if (!group) return null;

    // Add members to group
    const members = demoMembers.filter(m => m.groups.some(g => g.id === id));
    return { ...group, members };
  },
  async events() {
    return demoEvents;
  },
  async event(id: string) {
    return demoEvents.find(e => e.id === id) || null;
  },
  async announcements() {
    return demoAnnouncements;
  },
  async roles() {
    return demoRoles;
  },
  async funds() {
    return demoFunds;
  },
  async contributions(params?: { memberId?: string; fundId?: string; from?: string; to?: string }) {
    let filtered = demoContributions;
    if (params?.memberId) {
      filtered = filtered.filter(c => c.memberId === params.memberId);
    }
    if (params?.fundId) {
      filtered = filtered.filter(c => c.fundId === params.fundId);
    }
    return filtered;
  },
  async givingSummary() {
    const total = demoContributions.reduce((sum, c) => sum + c.amount, 0);
    return {
      totalAmount: total,
      contributionCount: demoContributions.length,
      averageContribution: total / demoContributions.length,
      funds: demoFunds.map(fund => ({
        fundId: fund.id,
        fundName: fund.name,
        totalAmount: demoContributions
          .filter(c => c.fundId === fund.id)
          .reduce((sum, c) => sum + c.amount, 0),
      })),
    };
  },
  async auditLogs(params?: {
    actorUserId?: string;
    entity?: string;
    entityId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }) {
    let filtered = demoAuditLogs;
    if (params?.actorUserId) {
      filtered = filtered.filter(log => log.actorUserId === params.actorUserId);
    }
    if (params?.entity) {
      filtered = filtered.filter(log => log.entity === params.entity);
    }
    if (params?.entityId) {
      filtered = filtered.filter(log => log.entityId === params.entityId);
    }

    const pageSize = params?.pageSize || 20;
    const page = params?.page || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      meta: {
        total: filtered.length,
        page,
        pageSize,
      },
    };
  },
  async getSettings(churchId: string) {
    return {
      churchId,
      requestTypes: demoRequestTypes,
    };
  },
  async updateSettings(churchId: string, settings: any) {
    // No-op for static version
    return settings;
  },
  async getPastoralCareTickets() {
    return demoPastoralCareTickets;
  },
  async getPastoralCareTicket(id: string) {
    return demoPastoralCareTickets.find(t => t.id === id) || null;
  },
  async getPrayerRequests() {
    return demoPrayerRequests;
  },
  async getRequestTypes(churchId: string) {
    return demoRequestTypes;
  },
  async get<T>(path: string): Promise<T> {
    throw new Error('Static API does not support dynamic GET requests');
  },
  async post<T>(path: string, body: any): Promise<T> {
    throw new Error('Static API does not support POST requests');
  },
  async put<T>(path: string, body: any): Promise<T> {
    throw new Error('Static API does not support PUT requests');
  },
  async delete<T>(path: string): Promise<T> {
    throw new Error('Static API does not support DELETE requests');
  },
};

// Dummy functions for compatibility
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  throw new Error('Static API does not support HTTP requests');
}

export async function postToApi<T>(path: string, body?: unknown): Promise<T> {
  throw new Error('Static API does not support HTTP requests');
}

import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  MockUser,
  mockUsers,
  MockGroup,
  MockGroupMember,
  mockGroups,
  MockGroupResource,
  mockGroupResources,
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
  MockRole,
  mockRoles,
  DefaultRoleSlug,
  MockAuditLog,
  mockAuditLogs,
  mockChurches,
  MockHousehold,
  MockSettings,
  mockSettings,
  MockInvitation,
  mockInvitations,
  mockHouseholds,
  MockChild,
  MockCheckin,
  MockPastoralCareTicket,
  MockPastoralCareComment,
  MockPrayerRequest,
  mockPrayerRequests,
  MockRequest,
  mockRequests,
  MockRequestType,
  mockRequestTypes,
  MockDocument,
  mockDocuments,
  MockDocumentPermission,
  mockDocumentPermissions,
  MockPushSubscription,
  MemberJoinMethod,
  MaritalStatus,
  BackgroundCheckStatus,
} from '../mock/mock-data';
import {
  PastoralCareTicketCreateInput,
  PastoralCareTicketUpdateInput,
  PastoralCareCommentCreateInput,
  AttendanceInput,
  ContributionInput,
  ContributionUpdateInput,
  UserCreateInput,
  UserUpdateInput,
  UserDeleteInput,
  GroupMemberCreateInput,
  GroupMemberUpdateInput,
  GroupMemberRemoveInput,
  GroupResourceCreateInput,
  GroupResourceUpdateInput,
  GroupResourceDeleteInput,
  EventCreateInput,
  EventUpdateInput,
  EventDeleteInput,
  EventVolunteerRoleCreateInput,
  EventVolunteerRoleUpdateInput,
  EventVolunteerSignupCreateInput,
  RoleCreateInput,
  RoleUpdateInput,
  RoleDeleteInput,
  AuditLogFilter,
  AuditLogCreateInput,
  AnnouncementCreateInput,
  AnnouncementUpdateInput,
} from '../types/input-types';

interface EventVolunteerRole {
  id: string;
  eventId: string;
  name: string;
  needed: number;
}

interface EventVolunteerSignup {
  id: string;
  volunteerRoleId: string;
  userId: string;
}

interface UserPayload extends Omit<MockUser, 'roles'> {
  roles: Array<{
    churchId: string;
    roleId: string;
    role: string;
    slug?: string;
    permissions: string[];
    isSystem: boolean;
    isDeletable: boolean;
  }>;
  household?: MockHousehold | null;
  groups?: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function formatMonthKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

@Injectable()
export class InMemoryDataStore {
  private readonly logger = new Logger(InMemoryDataStore.name);

  // In-memory data storage
  private users: MockUser[] = [];
  private households: MockHousehold[] = [];
  private children: MockChild[] = [];
  private checkins: MockCheckin[] = [];
  private roles: MockRole[] = [];
  private groups: MockGroup[] = [];
  private groupResources: MockGroupResource[] = [];
  private events: MockEvent[] = [];
  private announcements: MockAnnouncement[] = [];
  private announcementReads: MockAnnouncementRead[] = [];
  private funds: MockFund[] = [];
  private contributions: MockContribution[] = [];
  private pastoralCareTickets: MockPastoralCareTicket[] = [];
  private pastoralCareComments: MockPastoralCareComment[] = [];
  private prayerRequests: MockPrayerRequest[] = [];
  private requests: MockRequest[] = [];
  private requestTypes: MockRequestType[] = [];
  private auditLogs: MockAuditLog[] = [];
  private sessions: DemoSession[] = [];
  private oauthAccounts: Array<{
    provider: 'google' | 'facebook';
    providerUserId: string;
    userId: string;
  }> = [];
  private settings: MockSettings[] = [];
  private invitations: MockInvitation[] = [];
  private pushSubscriptions: MockPushSubscription[] = [];
  private eventVolunteerRoles: EventVolunteerRole[] = [];
  private eventVolunteerSignups: EventVolunteerSignup[] = [];
  private documents: MockDocument[] = [];
  private documentPermissions: MockDocumentPermission[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    this.logger.log('Seeding in-memory data store with mock data...');

    // Clone and assign mock data
    // We clone the canonical mock data arrays here to ensure that mutations to the in-memory store
    // do not affect the original mock data. This provides isolation between test runs and prevents
    // accidental side effects if the mock data is imported elsewhere. If this is ever proven unnecessary
    // (e.g., if the mock data is only ever used here and the store is always instantiated fresh), this
    // could be replaced with direct assignment for performance, but cloning is a defensive measure.
    this.users = clone(mockUsers);
    this.households = clone(mockHouseholds);
    this.roles = clone(mockRoles);
    this.groups = clone(mockGroups);
    this.groupResources = clone(mockGroupResources);
    this.events = clone(mockEvents);
    this.announcements = clone(mockAnnouncements);
    this.announcementReads = clone(mockAnnouncementReads);
    this.funds = clone(mockFunds);
    this.contributions = clone(mockContributions);
    this.prayerRequests = clone(mockPrayerRequests);
    this.requests = clone(mockRequests);
    this.auditLogs = clone(mockAuditLogs);
    this.sessions = clone(mockSessions);
    this.settings = clone(mockSettings);
    this.invitations = clone(mockInvitations);
    this.documents = clone(mockDocuments);
    this.documentPermissions = clone(mockDocumentPermissions);

    // Set up church-specific data
    const churchId = mockChurches[0].id;
    this.requestTypes = mockRequestTypes.map(rt => ({
      ...rt,
      churchId,
    }));

    this.logger.log('In-memory data store seeded successfully');
  }

  private getRoleById(roleId: string) {
    return this.roles.find(role => role.id === roleId) ?? null;
  }

  private getRoleBySlug(slug: string) {
    return this.roles.find(role => role.slug?.toLowerCase() === slug.toLowerCase()) ?? null;
  }

  private getDefaultRoleId(slug: DefaultRoleSlug): string {
    const role = this.getRoleBySlug(slug);
    if (role) {
      return role.id;
    }
    return this.roles[0]?.id ?? `role-${slug}`;
  }

  private resolveRoleId(identifier?: string | null) {
    if (!identifier) {
      return this.getDefaultRoleId('member');
    }
    const byId = this.getRoleById(identifier);
    if (byId) {
      return byId.id;
    }
    const lowered = identifier.toLowerCase();
    const bySlug = this.roles.find(role => role.slug?.toLowerCase() === lowered);
    if (bySlug) {
      return bySlug.id;
    }
    const byName = this.roles.find(role => role.name.toLowerCase() === lowered);
    if (byName) {
      return byName.id;
    }
    return this.getDefaultRoleId('member');
  }

  private buildUserRolePayload(role: MockUser['roles'][number]) {
    const definition = this.getRoleById(role.roleId);
    return {
      churchId: role.churchId,
      roleId: role.roleId,
      role: definition?.name ?? 'Unknown Role',
      slug: definition?.slug,
      permissions: definition?.permissions ?? [],
      isSystem: definition?.isSystem ?? false,
      isDeletable: definition?.isDeletable ?? true,
    };
  }

  private buildUserPayload(user: MockUser): UserPayload {
    const { roles, ...userWithoutRoles } = clone(user);
    const payload: UserPayload = {
      ...userWithoutRoles,
      roles: roles.map(role => this.buildUserRolePayload(role)),
      household: this.households.find(h => h.id === user.profile.householdId) ?? null,
    };
    return payload;
  }

  private withAssignmentCount(role: MockRole) {
    const count = this.users.filter(user => user.roles.some(r => r.roleId === role.id)).length;
    return {
      ...clone(role),
      assignmentCount: count,
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

  // Data access methods - implementing the same interface as MockDatabaseService

  async getChurch() {
    return clone(mockChurches[0]);
  }

  async listHouseholds(churchId?: string) {
    const list = this.households
      .filter(h => !churchId || h.churchId === churchId)
      .map(h => {
        const members = this.users
          .filter(u => u.profile && u.profile.householdId === h.id)
          .map(u => ({
            userId: u.id,
            firstName: u.profile.firstName,
            lastName: u.profile.lastName,
            householdRole: u.profile.householdRole,
          }));
        return {
          ...clone(h),
          memberCount: members.length,
          members,
        };
      });
    return list;
  }

  async getHouseholdById(id: string) {
    const household = this.households.find(h => h.id === id);
    if (!household) return null;
    const members = this.users
      .filter(u => u.profile.householdId === id)
      .map(u => this.buildUserPayload(u));
    return {
      ...clone(household),
      members,
    };
  }

  async getHouseholdMembers(householdId: string) {
    return this.users
      .filter(u => u.profile.householdId === householdId)
      .map(u => this.buildUserPayload(u));
  }

  async listDeletedHouseholds() {
    return clone(
      this.households.filter(h => h.deletedAt).map(h => ({ ...h, deletedAt: h.deletedAt }))
    );
  }

  async deleteHousehold(id: string, _actorUserId: string) {
    const household = this.households.find(h => h.id === id && !h.deletedAt);
    if (!household) {
      return { success: false };
    }
    household.deletedAt = new Date().toISOString();
    return { success: true };
  }

  async undeleteHousehold(id: string, _actorUserId: string) {
    const household = this.households.find(h => h.id === id && h.deletedAt);
    if (!household) {
      return { success: false };
    }
    household.deletedAt = undefined;
    return { success: true };
  }

  async hardDeleteHousehold(id: string, _actorUserId: string) {
    const index = this.households.findIndex(h => h.id === id);
    if (index === -1) {
      return { success: false };
    }
    this.households.splice(index, 1);
    return { success: true };
  }

  async bulkDeleteHouseholds(
    ids: string[],
    _actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    const result = { success: 0, failed: [] as Array<{ id: string; reason: string }> };
    ids.forEach(id => {
      const deleted = this.deleteHousehold(id, _actorUserId);
      if ((deleted as any).success) {
        result.success += 1;
      } else {
        result.failed.push({ id, reason: 'Household not found or already deleted' });
      }
    });
    return result;
  }

  async bulkUndeleteHouseholds(
    ids: string[],
    _actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    const result = { success: 0, failed: [] as Array<{ id: string; reason: string }> };
    ids.forEach(id => {
      const undeleted = this.undeleteHousehold(id, _actorUserId);
      if ((undeleted as any).success) {
        result.success += 1;
      } else {
        result.failed.push({ id, reason: 'Household not found or not deleted' });
      }
    });
    return result;
  }

  async listUsers(query?: string) {
    const lower = query?.toLowerCase();
    const list = this.users
      .filter(user => {
        // Filter out soft-deleted users
        if (user.deletedAt) return false;
        if (!lower) return true;
        const profile = user.profile;
        return (
          user.primaryEmail.toLowerCase().includes(lower) ||
          profile.firstName.toLowerCase().includes(lower) ||
          profile.lastName.toLowerCase().includes(lower)
        );
      })
      .map(user => {
        const payload = this.buildUserPayload(user);
        payload.groups = this.groups
          .filter(group => group.members.some(member => member.userId === user.id))
          .map(group => ({
            id: group.id,
            name: group.name,
            role: group.members.find(member => member.userId === user.id)?.role,
          }));
        return payload;
      });
    return clone(list);
  }

  async getUserById(id: string) {
    const user = this.users.find(record => record.id === id && !record.deletedAt);
    if (!user) return null;
    return this.buildUserPayload(user);
  }

  async getUserProfile(id: string) {
    const user = await this.getUserById(id);
    if (!user) return null;
    const groups = this.groups
      .filter(group => group.members.some(member => member.userId === id))
      .map(group => ({
        id: group.id,
        name: group.name,
        role: group.members.find(member => member.userId === id)?.role ?? 'Member',
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

  async createUser(input: UserCreateInput) {
    const emailTaken = this.users.some(
      user => user.primaryEmail.toLowerCase() === input.primaryEmail.toLowerCase()
    );
    if (emailTaken) {
      throw new Error('A user with that email already exists');
    }
    const churchId = (await this.getChurch()).id;
    const now = new Date().toISOString();
    const roleIdsSource =
      input.roleIds && input.roleIds.length
        ? Array.from(new Set(input.roleIds))
        : [this.getDefaultRoleId('member')];
    const roles = roleIdsSource.map(identifier => ({
      churchId,
      roleId: this.resolveRoleId(identifier),
    }));

    const household: MockHousehold = {
      id: `hh-${randomUUID()}`,
      churchId,
      name: `${input.lastName} Family`,
      address: input.address,
      createdAt: now,
      updatedAt: now,
    };
    this.households.push(household);

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
        notes: input.notes,
        householdId: household.id,
        householdRole: 'Head',
      },
    };
    this.users.push(user);
    const actorName = this.getUserName(input.actorUserId);
    const targetName = this.getUserName(user.id);
    const roleSummaries = roles.map(role => this.buildUserRolePayload(role).role);
    await this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'user.created',
      entity: 'user',
      entityId: user.id,
      summary: `${actorName} added ${targetName} to the directory`,
      metadata: {
        userId: user.id,
        email: user.primaryEmail,
        roles: roleSummaries,
      },
    });
    return await this.getUserProfile(user.id);
  }

  async updateUser(id: string, input: UserUpdateInput) {
    const user = this.users.find(record => record.id === id);
    if (!user) return null;

    // Handle email uniqueness check
    if (input.primaryEmail) {
      const newEmail = input.primaryEmail;
      const emailTaken = this.users.some(
        record => record.id !== id && record.primaryEmail.toLowerCase() === newEmail.toLowerCase()
      );
      if (emailTaken) {
        throw new Error('A user with that email already exists');
      }
    }

    // Update primary fields
    if (input.primaryEmail !== undefined) user.primaryEmail = input.primaryEmail;
    if (input.status !== undefined) user.status = input.status;

    // Update roles if provided
    if (input.roleIds !== undefined) {
      const churchId = user.roles.length > 0 ? user.roles[0].churchId : (await this.getChurch()).id;
      const roleIdsSource =
        input.roleIds && input.roleIds.length
          ? Array.from(new Set(input.roleIds))
          : [this.getDefaultRoleId('member')];
      user.roles = roleIdsSource.map(identifier => ({
        churchId,
        roleId: this.resolveRoleId(identifier),
      }));
    }

    // Update profile fields
    if (input.firstName !== undefined) user.profile.firstName = input.firstName;
    if (input.lastName !== undefined) user.profile.lastName = input.lastName;
    if (input.phone !== undefined) user.profile.phone = input.phone;
    if (input.notes !== undefined) user.profile.notes = input.notes;

    // Handle address - update household
    if (input.address !== undefined) {
      const household = this.households.find(h => h.id === user.profile.householdId);
      if (household) {
        household.address = input.address;
      }
    }

    // Update additional profile fields
    if (input.membershipStatus !== undefined)
      user.profile.membershipStatus = input.membershipStatus as
        | 'Inquirer'
        | 'Attender'
        | 'Member'
        | 'Paused'
        | 'Inactive';
    if (input.joinMethod !== undefined)
      user.profile.joinMethod = input.joinMethod as MemberJoinMethod;
    if (input.joinDate !== undefined) user.profile.joinDate = input.joinDate;
    if (input.previousChurch !== undefined) user.profile.previousChurch = input.previousChurch;
    if (input.baptismDate !== undefined) user.profile.baptismDate = input.baptismDate;
    if (input.spiritualGifts !== undefined) user.profile.spiritualGifts = input.spiritualGifts;
    if (input.coursesAttended !== undefined) user.profile.coursesAttended = input.coursesAttended;
    if (input.maritalStatus !== undefined)
      user.profile.maritalStatus = input.maritalStatus as MaritalStatus;
    if (input.occupation !== undefined) user.profile.occupation = input.occupation;
    if (input.school !== undefined) user.profile.school = input.school;
    if (input.gradeLevel !== undefined) user.profile.gradeLevel = input.gradeLevel;
    if (input.graduationYear !== undefined) user.profile.graduationYear = input.graduationYear;
    if (input.skillsAndInterests !== undefined)
      user.profile.skillsAndInterests = input.skillsAndInterests;
    if (input.backgroundCheckStatus !== undefined)
      user.profile.backgroundCheckStatus = input.backgroundCheckStatus as BackgroundCheckStatus;
    if (input.backgroundCheckDate !== undefined)
      user.profile.backgroundCheckDate = input.backgroundCheckDate;
    if (input.onboardingComplete !== undefined)
      user.profile.onboardingComplete = input.onboardingComplete;
    if (input.emergencyContactName !== undefined)
      user.profile.emergencyContactName = input.emergencyContactName;
    if (input.emergencyContactPhone !== undefined)
      user.profile.emergencyContactPhone = input.emergencyContactPhone;
    if (input.allergiesOrMedicalNotes !== undefined)
      user.profile.allergiesOrMedicalNotes = input.allergiesOrMedicalNotes;
    if (input.parentalConsentOnFile !== undefined)
      user.profile.parentalConsentOnFile = input.parentalConsentOnFile;
    if (input.pastoralNotes !== undefined) user.profile.pastoralNotes = input.pastoralNotes;

    // Create audit log
    await this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'user.updated',
      entity: 'user',
      entityId: user.id,
      summary: `${this.getUserName(input.actorUserId)} updated ${this.getUserName(user.id)}'s profile`,
      metadata: {
        userId: user.id,
      },
    });

    return await this.getUserProfile(user.id);
  }

  async deleteUser(id: string, _input: UserDeleteInput) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return { success: false };
    }
    user.deletedAt = new Date().toISOString();
    return { success: true };
  }

  async getUserByEmail(email: string) {
    return (
      this.users.find(
        user => user.primaryEmail.toLowerCase() === email.toLowerCase() && !user.deletedAt
      ) || null
    );
  }

  async listGroups(churchId?: string) {
    const list = this.groups.filter(
      group => (!churchId || group.churchId === churchId) && !group.deletedAt
    );
    return clone(list);
  }

  async getGroupById(id: string) {
    return clone(this.groups.find(group => group.id === id && !group.deletedAt) || null);
  }

  async getGroupMembers(groupId: string) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) return [];
    return group.members.map(member => ({
      ...clone(member),
      user: clone(this.users.find(user => user.id === member.userId)!),
    }));
  }

  async addGroupMember(groupId: string, input: GroupMemberCreateInput) {
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
    return {
      ...clone(member),
      user: clone(user),
    };
  }

  async updateGroupMember(groupId: string, userId: string, input: GroupMemberUpdateInput) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    const member = group.members.find(record => record.userId === userId);
    if (!member) {
      throw new Error('Member not found in group');
    }
    if (input.role) member.role = input.role;
    if (input.status) member.status = input.status;
    const user = this.users.find(record => record.id === userId);
    return {
      ...clone(member),
      user: user ? clone(user) : null,
    };
  }

  async removeGroupMember(groupId: string, userId: string, _input: GroupMemberRemoveInput) {
    const group = this.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error('Group not found');
    }
    const index = group.members.findIndex(member => member.userId === userId);
    if (index === -1) {
      return { success: false };
    }
    group.members.splice(index, 1);
    return { success: true };
  }

  async getGroupResources(groupId: string) {
    return clone(this.groupResources.filter(resource => resource.groupId === groupId));
  }

  async createGroupResource(groupId: string, input: GroupResourceCreateInput) {
    const group = this.groups.find(g => g.id === groupId && !g.deletedAt);
    if (!group) {
      throw new Error('Group not found');
    }
    const resource: MockGroupResource = {
      id: `resource-${randomUUID()}`,
      groupId,
      churchId: group.churchId,
      title: input.title,
      url: input.url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.groupResources.push(resource);
    return clone(resource);
  }

  async updateGroupResource(resourceId: string, input: GroupResourceUpdateInput) {
    const resource = this.groupResources.find(r => r.id === resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }
    if (input.title) resource.title = input.title;
    if (input.url) resource.url = input.url;
    resource.updatedAt = new Date().toISOString();
    return clone(resource);
  }

  async deleteGroupResource(resourceId: string, _input: GroupResourceDeleteInput) {
    const index = this.groupResources.findIndex(r => r.id === resourceId);
    if (index === -1) {
      throw new Error('Resource not found');
    }
    this.groupResources.splice(index, 1);
    return { success: true };
  }

  async deleteGroup(_id: string, _input: { actorUserId: string }): Promise<{ success: boolean }> {
    throw new Error('deleteGroup is not yet implemented for InMemory data store');
  }

  async undeleteGroup(
    _id: string,
    _input: { actorUserId: string }
  ): Promise<{ success: boolean; reason?: string }> {
    throw new Error('undeleteGroup is not yet implemented for InMemory data store');
  }

  async listDeletedGroups(): Promise<any[]> {
    throw new Error('listDeletedGroups is not yet implemented for InMemory data store');
  }

  async bulkDeleteGroups(
    _ids: string[],
    _input: { actorUserId: string }
  ): Promise<{ success: boolean; count: number }> {
    throw new Error('bulkDeleteGroups is not yet implemented for InMemory data store');
  }

  async bulkUndeleteGroups(
    _ids: string[],
    _input: { actorUserId: string }
  ): Promise<{ success: boolean; count: number }> {
    throw new Error('bulkUndeleteGroups is not yet implemented for InMemory data store');
  }

  async listEvents() {
    return clone(this.events.filter(event => !event.deletedAt));
  }

  async listEventsByGroupId(groupId: string) {
    return clone(this.events.filter(event => event.groupId === groupId && !event.deletedAt));
  }

  async getEventById(id: string) {
    return clone(this.events.find(event => event.id === id && !event.deletedAt) || null);
  }

  async createEvent(input: EventCreateInput) {
    const event: MockEvent = {
      id: `event-${randomUUID()}`,
      churchId: (await this.getChurch()).id,
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
    return clone(event);
  }

  async updateEvent(id: string, input: EventUpdateInput) {
    const event = this.events.find(record => record.id === id);
    if (!event) return null;
    if (input.title) event.title = input.title;
    if (input.description !== undefined) event.description = input.description;
    if (input.startAt) event.startAt = input.startAt;
    if (input.endAt) event.endAt = input.endAt;
    if (input.location !== undefined) event.location = input.location;
    if (input.visibility) event.visibility = input.visibility;
    if (input.groupId !== undefined) event.groupId = input.groupId ?? undefined;
    if (input.tags) event.tags = [...input.tags];
    return clone(event);
  }

  async deleteEvent(id: string, _input: EventDeleteInput) {
    const event = this.events.find(e => e.id === id);
    if (!event) {
      return { success: false };
    }
    event.deletedAt = new Date().toISOString();
    return { success: true };
  }

  async createEventVolunteerRole(input: EventVolunteerRoleCreateInput) {
    const role = {
      id: `evt-role-${randomUUID()}`,
      eventId: input.eventId,
      name: input.name,
      needed: input.needed,
    };
    this.eventVolunteerRoles.push(role);
    return clone(role);
  }

  async updateEventVolunteerRole(id: string, input: EventVolunteerRoleUpdateInput) {
    const role = this.eventVolunteerRoles.find(r => r.id === id);
    if (!role) {
      return null;
    }
    if (input.name) role.name = input.name;
    if (input.needed) role.needed = input.needed;
    return clone(role);
  }

  async deleteEventVolunteerRole(id: string) {
    const index = this.eventVolunteerRoles.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false };
    }
    this.eventVolunteerRoles.splice(index, 1);
    this.eventVolunteerSignups = this.eventVolunteerSignups.filter(s => s.volunteerRoleId !== id);
    return { success: true };
  }

  async createEventVolunteerSignup(input: EventVolunteerSignupCreateInput) {
    const signup = {
      id: `evt-signup-${randomUUID()}`,
      volunteerRoleId: input.volunteerRoleId,
      userId: input.userId,
    };
    this.eventVolunteerSignups.push(signup);
    return clone(signup);
  }

  async deleteEventVolunteerSignup(id: string) {
    const index = this.eventVolunteerSignups.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false };
    }
    this.eventVolunteerSignups.splice(index, 1);
    return { success: true };
  }

  async getEventVolunteerSignupById(id: string) {
    return clone(this.eventVolunteerSignups.find(s => s.id === id) || null);
  }

  async createSession(email: string, provider: DemoSession['provider'], requestedRole?: string) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found for demo login. Use one of the seeded accounts.');
    }
    const churchId = (await this.getChurch()).id;
    const roleId = this.resolveRoleId(requestedRole);
    if (!user.roles.some(r => r.roleId === roleId && r.churchId === churchId)) {
      user.roles.push({ churchId, roleId });
    }
    const token = createSessionToken();
    const session: DemoSession = {
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
      provider,
    };
    this.sessions.push(session);
    return { session: clone(session), user: this.buildUserPayload(user) };
  }

  async getSessionByToken(token?: string) {
    if (!token) return null;
    const session = this.sessions.find(s => s.token === token);
    if (!session) return null;
    const user = await this.getUserById(session.userId);
    if (!user) return null;
    return { session: clone(session), user };
  }

  async upsertUserFromOAuth(input: {
    provider: 'google' | 'facebook';
    providerUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  }) {
    const churchId = (await this.getChurch()).id;
    let user = await this.getUserByEmail(input.email);
    let created = false;
    if (!user) {
      const now = new Date().toISOString();
      const household: MockHousehold = {
        id: `hh-${randomUUID()}`,
        churchId,
        name: `${input.lastName || 'New'} Family`,
        createdAt: now,
        updatedAt: now,
      };
      this.households.push(household);

      const id = `user-${randomUUID()}`;
      const defaultRoleId = this.getDefaultRoleId('member');
      user = {
        id,
        primaryEmail: input.email,
        status: 'active',
        createdAt: now,
        lastLoginAt: now,
        roles: [{ churchId, roleId: defaultRoleId }],
        profile: {
          firstName: input.firstName || 'New',
          lastName: input.lastName || 'Member',
          photoUrl: input.picture,
          householdId: household.id,
          householdRole: 'Head',
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
        user.roles.push({ churchId, roleId: this.getDefaultRoleId('member') });
      }
    }

    if (
      !this.oauthAccounts.some(
        account =>
          account.provider === input.provider && account.providerUserId === input.providerUserId
      )
    ) {
      this.oauthAccounts.push({
        provider: input.provider,
        providerUserId: input.providerUserId,
        userId: user.id,
      });
    }

    return { user: this.buildUserPayload(user), created };
  }

  async getSettings(churchId: string): Promise<MockSettings | null> {
    return clone(this.settings.find(s => s.churchId === churchId)) ?? null;
  }

  async initializeSettings(churchId: string): Promise<MockSettings> {
    const settings: MockSettings = {
      id: randomUUID(),
      churchId,
      logoUrl: undefined,
      brandColor: undefined,
      onboardingComplete: false,
      enabledFields: [],
      requestTypes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.settings.push(clone(settings));
    return clone(settings);
  }

  async updateSettings(churchId: string, update: Partial<MockSettings>): Promise<MockSettings> {
    let settings = this.settings.find(s => s.churchId === churchId);
    if (!settings) {
      settings = await this.initializeSettings(churchId);
    }

    const now = new Date().toISOString();
    settings = {
      ...settings,
      ...update,
      updatedAt: now,
    };

    const index = this.settings.findIndex(s => s.churchId === churchId);
    if (index >= 0) {
      this.settings[index] = clone(settings!);
    } else {
      this.settings.push(clone(settings!));
    }

    return clone(settings!);
  }

  async listAnnouncements(churchId?: string) {
    const filtered = this.announcements.filter(a => !churchId || a.churchId === churchId);
    return filtered
      .map(announcement => ({
        ...clone(announcement),
        reads: this.announcementReads.filter(read => read.announcementId === announcement.id),
      }))
      .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
  }

  async markAnnouncementRead(announcementId: string, userId: string) {
    const already = this.announcementReads.find(
      read => read.announcementId === announcementId && read.userId === userId
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

  async createAnnouncement(input: AnnouncementCreateInput) {
    const publishAt = input.publishAt ?? new Date().toISOString();
    const announcement: MockAnnouncement = {
      id: `announcement-${randomUUID()}`,
      churchId: (await this.getChurch()).id,
      title: input.title,
      body: input.body,
      audience: input.audience,
      groupIds: input.audience === 'custom' ? [...(input.groupIds ?? [])] : undefined,
      publishAt,
      expireAt: input.expireAt ?? undefined,
    };
    this.announcements.push(announcement);
    return clone(announcement);
  }

  async updateAnnouncement(id: string, input: AnnouncementUpdateInput) {
    const announcement = this.announcements.find(item => item.id === id);
    if (!announcement) {
      return null;
    }
    if (input.title) announcement.title = input.title;
    if (input.body) announcement.body = input.body;
    if (input.publishAt) announcement.publishAt = input.publishAt;
    if (input.expireAt !== undefined) announcement.expireAt = input.expireAt ?? undefined;
    if (input.audience) announcement.audience = input.audience;
    if (input.groupIds) announcement.groupIds = input.groupIds;
    return clone(announcement);
  }

  async deleteAnnouncement(
    _id: string,
    _input: { actorUserId: string }
  ): Promise<{ success: boolean }> {
    throw new Error('deleteAnnouncement is not yet implemented for InMemory data store');
  }

  async undeleteAnnouncement(
    _id: string,
    _input: { actorUserId: string }
  ): Promise<{ success: boolean; reason?: string }> {
    throw new Error('undeleteAnnouncement is not yet implemented for InMemory data store');
  }

  async listDeletedAnnouncements(): Promise<any[]> {
    throw new Error('listDeletedAnnouncements is not yet implemented for InMemory data store');
  }

  async bulkDeleteAnnouncements(
    _ids: string[],
    _input: { actorUserId: string }
  ): Promise<{ success: boolean; count: number }> {
    throw new Error('bulkDeleteAnnouncements is not yet implemented for InMemory data store');
  }

  async bulkUndeleteAnnouncements(
    _ids: string[],
    _input: { actorUserId: string }
  ): Promise<{ success: boolean; count: number }> {
    throw new Error('bulkUndeleteAnnouncements is not yet implemented for InMemory data store');
  }

  async listFunds() {
    return clone(this.funds.filter(f => !f.deletedAt));
  }

  async listDeletedFunds() {
    return clone(this.funds.filter(f => f.deletedAt)) as any[];
  }

  async createFund(input: { name: string; description?: string }) {
    const fund = {
      id: `fund-${Date.now()}`,
      churchId: (await this.getChurch()).id,
      name: input.name,
      description: input.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.funds.push(fund as any);
    return clone(fund);
  }

  async updateFund(id: string, input: Partial<{ name: string; description?: string }>) {
    const fund = this.funds.find(f => f.id === id && !f.deletedAt);
    if (!fund) {
      return null;
    }
    if (input.name !== undefined) (fund as any).name = input.name;
    if (input.description !== undefined) (fund as any).description = input.description;
    (fund as any).updatedAt = new Date().toISOString();
    return clone(fund);
  }

  async deleteFund(id: string, _input: { actorUserId: string }) {
    const fund = this.funds.find(f => f.id === id && !f.deletedAt);
    if (!fund) {
      return { success: false };
    }
    (fund as any).deletedAt = new Date().toISOString();
    return { success: true };
  }

  async hardDeleteFund(id: string, _input: { actorUserId: string }) {
    const index = this.funds.findIndex(f => f.id === id);
    if (index === -1) {
      return { success: false };
    }
    this.funds.splice(index, 1);
    // Orphan contributions
    this.contributions.forEach(contribution => {
      if (contribution.fundId === id) {
        contribution.fundId = undefined;
      }
    });
    return { success: true };
  }

  async undeleteFund(id: string, _input: { actorUserId: string }) {
    const fund = this.funds.find(f => f.id === id && f.deletedAt);
    if (!fund) {
      return { success: false };
    }
    (fund as any).deletedAt = undefined;
    return { success: true };
  }

  async bulkDeleteFunds(
    ids: string[],
    _input: { actorUserId: string }
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    let count = 0;
    const failed: Array<{ id: string; reason: string }> = [];
    for (const id of ids) {
      const fund = this.funds.find(f => f.id === id && !f.deletedAt);
      if (fund) {
        (fund as any).deletedAt = new Date().toISOString();
        count++;
      } else {
        failed.push({ id, reason: 'Not found or already deleted' });
      }
    }
    return { success: count, failed };
  }

  async bulkUndeleteFunds(
    ids: string[],
    _input: { actorUserId: string }
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    let count = 0;
    const failed: Array<{ id: string; reason: string }> = [];
    for (const id of ids) {
      const fund = this.funds.find(f => f.id === id && f.deletedAt);
      if (fund) {
        (fund as any).deletedAt = undefined;
        count++;
      } else {
        failed.push({ id, reason: 'Not found or not deleted' });
      }
    }
    return { success: count, failed };
  }

  async listContributions(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }) {
    let list = this.contributions.filter(c => !c.deletedAt);
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
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return clone(sorted);
  }

  async listDeletedContributions(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }) {
    let list = this.contributions.filter(c => c.deletedAt);
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
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return clone(sorted);
  }

  async recordContribution(input: ContributionInput) {
    const contribution: MockContribution = {
      id: `contribution-${Date.now()}`,
      churchId: (await this.getChurch()).id,
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

  async updateContribution(id: string, input: ContributionUpdateInput) {
    const contribution = this.contributions.find(item => item.id === id && !item.deletedAt);
    if (!contribution) {
      return null;
    }
    if (input.memberId) contribution.memberId = input.memberId;
    if (input.amount) contribution.amount = input.amount;
    if (input.date) contribution.date = input.date;
    if (input.fundId !== undefined) contribution.fundId = input.fundId ?? undefined;
    if (input.method) contribution.method = input.method;
    if (input.note !== undefined) contribution.note = input.note ?? undefined;
    return clone(contribution);
  }

  async deleteContribution(id: string, _input: { actorUserId: string }) {
    const contribution = this.contributions.find(c => c.id === id && !c.deletedAt);
    if (!contribution) {
      return { success: false };
    }
    (contribution as any).deletedAt = new Date().toISOString();
    return { success: true };
  }

  async hardDeleteContribution(id: string, _input: { actorUserId: string }) {
    const index = this.contributions.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false };
    }
    this.contributions.splice(index, 1);
    return { success: true };
  }

  async undeleteContribution(id: string, _input: { actorUserId: string }) {
    const contribution = this.contributions.find(c => c.id === id && c.deletedAt);
    if (!contribution) {
      return { success: false };
    }
    (contribution as any).deletedAt = undefined;
    return { success: true };
  }

  async bulkDeleteContributions(
    ids: string[],
    _input: { actorUserId: string }
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    let count = 0;
    const failed: Array<{ id: string; reason: string }> = [];
    for (const id of ids) {
      const contribution = this.contributions.find(c => c.id === id && !c.deletedAt);
      if (contribution) {
        (contribution as any).deletedAt = new Date().toISOString();
        count++;
      } else {
        failed.push({ id, reason: 'Not found or already deleted' });
      }
    }
    return { success: count, failed };
  }

  async bulkUndeleteContributions(
    ids: string[],
    _input: { actorUserId: string }
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    let count = 0;
    const failed: Array<{ id: string; reason: string }> = [];
    for (const id of ids) {
      const contribution = this.contributions.find(c => c.id === id && c.deletedAt);
      if (contribution) {
        (contribution as any).deletedAt = undefined;
        count++;
      } else {
        failed.push({ id, reason: 'Not found or not deleted' });
      }
    }
    return { success: count, failed };
  }

  async getGivingSummary(churchId: string) {
    const contributions = this.contributions.filter(
      entry => entry.churchId === churchId && !entry.deletedAt
    );
    const totals = contributions.reduce(
      (acc, entry) => {
        acc.overall += entry.amount;
        acc.count += 1;
        const monthKey = formatMonthKey(entry.date);
        acc.monthTotals.set(monthKey, (acc.monthTotals.get(monthKey) ?? 0) + entry.amount);
        acc.fundTotals.set(
          entry.fundId ?? 'general',
          (acc.fundTotals.get(entry.fundId ?? 'general') ?? 0) + entry.amount
        );
        return acc;
      },
      {
        overall: 0,
        count: 0,
        monthTotals: new Map<string, number>(),
        fundTotals: new Map<string, number>(),
      }
    );

    const now = new Date();
    const currentMonthKey = formatMonthKey(now.toISOString());
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthKey = formatMonthKey(previousMonth.toISOString());

    const byFund = Array.from(totals.fundTotals.entries()).map(([fundId, amount]) => {
      const fund =
        fundId === 'general' ? undefined : this.funds.find(f => f.id === fundId && !f.deletedAt);
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

  async exportContributionsCsv(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }) {
    const contributions = await this.listContributions(filter);
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
          ? `${user.profile.firstName ?? ''} ${user.profile.lastName ?? ''}`.trim() ||
            user.primaryEmail
          : entry.memberId;
        const fundName = entry.fundId ? (fundMap.get(entry.fundId) ?? entry.fundId) : 'General';
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

  async listAuditLogs(filter: AuditLogFilter = {}) {
    const churchId = filter.churchId ?? (await this.getChurch()).id;
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
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const pageSizeRaw = filter.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const pageSize = Math.min(pageSizeRaw, 100);
    const start = (page - 1) * pageSize;
    const paged = logs.slice(start, start + pageSize);
    const items = await Promise.all(
      paged.map(async log => ({
        ...clone(log),
        actor: await this.getUserById(log.actorUserId),
      }))
    );
    return {
      items,
      meta: {
        total: logs.length,
        page,
        pageSize,
      },
    };
  }

  async createAuditLog(input: AuditLogCreateInput) {
    const churchId = input.churchId ?? (await this.getChurch()).id;
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

  async getDashboardSnapshot(churchId: string) {
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

  async listRoles() {
    return this.roles.map(role => this.withAssignmentCount(role));
  }

  async getRole(id: string) {
    const role = this.getRoleById(id);
    return role ? this.withAssignmentCount(role) : undefined;
  }

  async createRole(input: RoleCreateInput) {
    const churchId = (await this.getChurch()).id;
    const name = input.name?.trim();
    if (!name) {
      throw new Error('Role name is required.');
    }
    if (
      this.roles.some(
        role => role.churchId === churchId && role.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      throw new Error('A role with that name already exists.');
    }
    const permissions = input.permissions
      ? Array.from(new Set(input.permissions.map(entry => entry.trim()).filter(Boolean))).sort()
      : [];
    const now = new Date().toISOString();
    const role: MockRole = {
      id: `role-${randomUUID()}`,
      churchId,
      slug: input.slug?.trim() || slugify(name),
      name,
      description: input.description,
      permissions,
      isSystem: false,
      isDeletable: true,
      createdAt: now,
      updatedAt: now,
    };
    this.roles.push(role);
    return this.withAssignmentCount(role);
  }

  async updateRole(id: string, input: RoleUpdateInput) {
    const role = this.roles.find(record => record.id === id);
    if (!role) {
      return null;
    }
    if (input.name) {
      const name = input.name.trim();
      if (!name) {
        throw new Error('Role name is required.');
      }
      if (
        this.roles.some(
          other =>
            other.id !== id &&
            other.churchId === role.churchId &&
            other.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        throw new Error('Another role with that name already exists.');
      }
      role.name = name;
      if (!role.isSystem) {
        role.slug = slugify(name);
      }
    }
    if (input.description !== undefined) role.description = input.description ?? undefined;
    if (input.permissions) {
      role.permissions = Array.from(
        new Set(input.permissions.map(entry => entry.trim()).filter(Boolean))
      ).sort();
    }
    role.updatedAt = new Date().toISOString();
    return this.withAssignmentCount(role);
  }

  async deleteRole(id: string, input: RoleDeleteInput) {
    const roleIndex = this.roles.findIndex(record => record.id === id);
    if (roleIndex === -1) {
      return { deleted: false, reassigned: 0 };
    }
    const role = this.roles[roleIndex];
    if (!role.isDeletable || role.slug === 'admin') {
      throw new Error('This role cannot be deleted.');
    }
    const assignments = this.users.filter(user => user.roles.some(r => r.roleId === id));
    let reassigned = 0;
    if (assignments.length > 0) {
      if (!input.reassignRoleId) {
        throw new Error(
          'Role is assigned to users. Provide reassignRoleId to transfer assignments.'
        );
      }
      const resolved = this.resolveRoleId(input.reassignRoleId);
      if (resolved === id) {
        throw new Error('Reassignment role must be different from the role being deleted.');
      }
      const church = await this.getChurch();
      for (const user of this.users) {
        if (!user.roles.some(r => r.roleId === id)) continue;
        user.roles = user.roles.filter(r => r.roleId !== id);
        if (!user.roles.some(r => r.roleId === resolved)) {
          user.roles.push({ churchId: church.id, roleId: resolved });
        }
        reassigned += 1;
      }
    }
    this.roles.splice(roleIndex, 1);
    return { deleted: true, reassigned };
  }

  // Document methods
  async listDocuments(churchId: string, userRoleIds: string[]): Promise<MockDocument[]> {
    return this.documents
      .filter(doc => {
        if (doc.churchId !== churchId || doc.deletedAt) return false;
        const hasPermission = this.documentPermissions.some(
          perm => perm.documentId === doc.id && userRoleIds.includes(perm.roleId) && !perm.deletedAt
        );
        return hasPermission;
      })
      .map(doc => clone(doc));
  }

  async getDocument(id: string): Promise<MockDocument | undefined> {
    const doc = this.documents.find(d => d.id === id && !d.deletedAt);
    return doc ? clone(doc) : undefined;
  }

  async getDocumentWithPermissions(
    id: string,
    userRoleIds: string[]
  ): Promise<(MockDocument & { permissions: string[] }) | undefined> {
    const doc = this.documents.find(d => d.id === id && !d.deletedAt);
    if (!doc) return undefined;

    const permissions = this.documentPermissions
      .filter(p => p.documentId === id && !p.deletedAt)
      .map(p => p.roleId);

    const hasPermission = permissions.some(roleId => userRoleIds.includes(roleId));
    if (!hasPermission) return undefined;

    return { ...clone(doc), permissions };
  }

  async createDocument(
    churchId: string,
    uploaderProfileId: string,
    fileName: string,
    fileType: string,
    title: string,
    description: string | undefined,
    fileData: string,
    roleIds: string[],
    _actorUserId: string
  ): Promise<MockDocument> {
    const id = randomUUID();
    const storageKey = `documents/${id}/${fileName}`;
    const now = new Date().toISOString();

    const doc: MockDocument = {
      id,
      churchId,
      uploaderProfileId,
      fileName,
      fileType,
      title,
      description,
      storageKey,
      fileData,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.push(doc);

    roleIds.forEach(roleId => {
      this.documentPermissions.push({
        documentId: id,
        roleId,
      });
    });

    return clone(doc);
  }

  async updateDocument(
    id: string,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    _actorUserId: string
  ): Promise<MockDocument | undefined> {
    const doc = this.documents.find(d => d.id === id && !d.deletedAt);
    if (!doc) return undefined;

    if (title !== undefined) doc.title = title;
    if (description !== undefined) doc.description = description;

    if (roleIds !== undefined) {
      this.documentPermissions = this.documentPermissions.filter(p => p.documentId !== id);
      roleIds.forEach(roleId => {
        this.documentPermissions.push({
          documentId: id,
          roleId,
        });
      });
    }

    doc.updatedAt = new Date().toISOString();
    return clone(doc);
  }

  async deleteDocument(id: string, _actorUserId: string): Promise<boolean> {
    const doc = this.documents.find(d => d.id === id && !d.deletedAt);
    if (!doc) return false;
    doc.deletedAt = new Date().toISOString();
    return true;
  }

  async hardDeleteDocument(id: string, _actorUserId: string): Promise<boolean> {
    const index = this.documents.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.documents.splice(index, 1);
    this.documentPermissions = this.documentPermissions.filter(p => p.documentId !== id);
    return true;
  }

  async undeleteDocument(id: string, _actorUserId: string): Promise<boolean> {
    const doc = this.documents.find(d => d.id === id && d.deletedAt);
    if (!doc) return false;
    doc.deletedAt = undefined;
    return true;
  }

  async listDeletedDocuments(churchId: string): Promise<MockDocument[]> {
    return this.documents
      .filter(doc => doc.churchId === churchId && doc.deletedAt)
      .map(doc => clone(doc));
  }

  // Placeholder implementations for remaining methods
  async createPastoralCareTicket(input: PastoralCareTicketCreateInput) {
    const ticket: MockPastoralCareTicket = {
      id: `ticket-${randomUUID()}`,
      churchId: input.churchId,
      title: input.title,
      description: input.description,
      priority: input.priority || 'normal',
      status: 'open',
      authorId: input.authorId,
      assigneeId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.pastoralCareTickets.push(ticket);
    return ticket;
  }

  async updatePastoralCareTicket(id: string, input: PastoralCareTicketUpdateInput) {
    const ticket = this.pastoralCareTickets.find(t => t.id === id);
    if (!ticket) return null;
    if (input.status) ticket.status = input.status;
    if (input.assigneeId !== undefined) ticket.assigneeId = input.assigneeId;
    ticket.updatedAt = new Date().toISOString();
    return ticket;
  }

  async listPastoralCareTickets(churchId: string) {
    return Promise.all(
      this.pastoralCareTickets
        .filter(t => t.churchId === churchId)
        .map(async t => ({
          ...clone(t),
          author: await this.getUserById(t.authorId),
          assignee: t.assigneeId ? await this.getUserById(t.assigneeId) : undefined,
        }))
    );
  }

  async getPastoralCareTicket(id: string) {
    const ticket = this.pastoralCareTickets.find(t => t.id === id);
    if (!ticket) {
      return null;
    }
    const comments = await Promise.all(
      this.pastoralCareComments
        .filter(c => c.ticketId === id)
        .map(async c => ({
          ...c,
          author: await this.getUserById(c.authorId),
        }))
    );
    return {
      ...clone(ticket),
      author: await this.getUserById(ticket.authorId),
      assignee: ticket.assigneeId ? await this.getUserById(ticket.assigneeId) : undefined,
      comments,
    };
  }

  async createPastoralCareComment(input: PastoralCareCommentCreateInput) {
    const comment: MockPastoralCareComment = {
      id: `comment-${randomUUID()}`,
      ticketId: input.ticketId,
      body: input.body,
      authorId: input.authorId,
      createdAt: new Date().toISOString(),
    };
    this.pastoralCareComments.push(comment);
    return comment;
  }

  async listPastoralCareComments(ticketId: string) {
    return this.pastoralCareComments.filter(c => c.ticketId === ticketId);
  }

  async listPrayerRequests(churchId: string): Promise<MockPrayerRequest[]> {
    return this.prayerRequests.filter(p => p.churchId === churchId);
  }

  async createPrayerRequest(
    churchId: string,
    title: string,
    body: string,
    authorName: string,
    isAnonymous: boolean
  ): Promise<MockPrayerRequest> {
    const request: MockPrayerRequest = {
      id: `prayer-${randomUUID()}`,
      churchId,
      title,
      body,
      authorName,
      isAnonymous,
      createdAt: new Date().toISOString(),
    };
    this.prayerRequests.push(request);
    return request;
  }

  async listRequests(churchId: string): Promise<MockRequest[]> {
    return this.requests.filter(r => r.churchId === churchId);
  }

  async createRequest(
    input: Omit<MockRequest, 'id' | 'createdAt' | 'churchId'>,
    actorUserId: string
  ): Promise<MockRequest> {
    const now = new Date().toISOString();
    const request: MockRequest = {
      id: `req-${randomUUID()}`,
      churchId: (await this.getChurch()).id,
      ...input,
      createdAt: now,
    };
    this.requests.push(request);
    const actorName = this.getUserName(actorUserId);
    await this.createAuditLog({
      actorUserId,
      action: 'request.created',
      entity: 'request',
      entityId: request.id,
      summary: `${actorName} created a new request`,
      metadata: {
        requestId: request.id,
        requestTypeId: request.requestTypeId,
      },
    });
    return clone(request);
  }

  async updateRequest(id: string, status: string, _assigneeId?: string) {
    const request = this.requests.find(r => r.id === id);
    if (!request) return null;
    request.status = status as 'Pending' | 'InProgress' | 'Closed';
    return request;
  }

  async listRequestTypes(churchId: string) {
    return this.requestTypes.filter(rt => rt.churchId === churchId);
  }

  async createRequestType(
    name: string,
    hasConfidentialField: boolean,
    actorUserId: string,
    description: string = ''
  ): Promise<MockRequestType> {
    const churchId = (await this.getChurch()).id;
    const newRequestType: MockRequestType = {
      id: `req-type-${randomUUID()}`,
      name,
      description,
      churchId,
      status: 'active',
      isBuiltIn: false,
      displayOrder: this.requestTypes.length + 1,
      hasConfidentialField,
    };
    this.requestTypes.push(newRequestType);
    const actorName = this.getUserName(actorUserId);
    await this.createAuditLog({
      actorUserId,
      action: 'requestType.created',
      entity: 'requestType',
      entityId: newRequestType.id,
      summary: `${actorName} created a new request type: ${name}`,
    });
    return clone(newRequestType);
  }

  async updateRequestType(id: string, name: string, actorUserId: string): Promise<MockRequestType> {
    const requestType = this.requestTypes.find(rt => rt.id === id);
    if (!requestType) {
      throw new Error('Request type not found');
    }
    if (requestType.isBuiltIn) {
      throw new Error('Cannot edit a built-in request type');
    }
    const oldName = requestType.name;
    requestType.name = name;
    const actorName = this.getUserName(actorUserId);
    await this.createAuditLog({
      actorUserId,
      action: 'requestType.updated',
      entity: 'requestType',
      entityId: id,
      summary: `${actorName} renamed request type from "${oldName}" to "${name}"`,
    });
    return clone(requestType);
  }

  // Additional placeholder methods to satisfy the interface
  async createInvitation(
    churchId: string,
    email: string,
    roleId: string | undefined,
    actorUserId: string,
    type: 'team' | 'member' = 'team'
  ): Promise<MockInvitation> {
    const invitation: MockInvitation = {
      id: `invitation-${randomUUID()}`,
      churchId,
      email: email.toLowerCase(),
      roleId,
      invitationToken: randomUUID(),
      type,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.invitations.push(invitation);
    return invitation;
  }

  async getInvitationByToken(token: string) {
    return this.invitations.find(inv => inv.invitationToken === token) || null;
  }

  async acceptInvitation(token: string, _userId: string) {
    const invitation = this.invitations.find(inv => inv.invitationToken === token);
    if (!invitation || invitation.status !== 'pending') {
      return false;
    }
    if (new Date(invitation.expiresAt) < new Date()) {
      invitation.status = 'expired';
      return false;
    }
    invitation.status = 'accepted';
    invitation.updatedAt = new Date().toISOString();
    return true;
  }

  async listInvitations(churchId: string) {
    return this.invitations.filter(inv => inv.churchId === churchId);
  }

  async bulkCreateInvitations(
    churchId: string,
    emails: string[],
    roleId: string | undefined,
    actorUserId: string,
    type: 'team' | 'member' = 'team'
  ): Promise<MockInvitation[]> {
    const invitations = await Promise.all(
      emails.map(email => this.createInvitation(churchId, email, roleId, actorUserId, type))
    );
    return invitations;
  }

  // Soft delete and hard delete methods
  async hardDeleteUser(id: string, _input: UserDeleteInput) {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return { success: false };
    this.users.splice(index, 1);
    return { success: true };
  }

  async hardDeleteEvent(id: string, _input: EventDeleteInput) {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return { success: false };
    this.events.splice(index, 1);
    return { success: true };
  }

  async hardDeleteRole(id: string, _input: RoleDeleteInput) {
    const roleIndex = this.roles.findIndex(record => record.id === id);
    if (roleIndex === -1) return { deleted: false, reassigned: 0 };
    this.roles.splice(roleIndex, 1);
    return { deleted: true, reassigned: 0 };
  }

  async undeleteUser(id: string, _input: { actorUserId: string }) {
    const user = this.users.find(u => u.id === id);
    if (!user || !user.deletedAt) return { success: false };
    user.deletedAt = undefined;
    return { success: true };
  }

  async undeleteEvent(id: string, _input: { actorUserId: string }) {
    const event = this.events.find(e => e.id === id);
    if (!event || !event.deletedAt) return { success: false };
    event.deletedAt = undefined;
    return { success: true };
  }

  async undeleteRole(id: string, _input: { actorUserId: string }) {
    const role = this.roles.find(r => r.id === id);
    if (!role || !role.deletedAt) return { success: false };
    role.deletedAt = undefined;
    return { success: true };
  }

  async listDeletedUsers(query?: string) {
    const lower = query?.toLowerCase();
    return this.users
      .filter(user => user.deletedAt && (!lower || user.primaryEmail.toLowerCase().includes(lower)))
      .map(user => ({ ...user, deletedAt: user.deletedAt }));
  }

  async listDeletedEvents() {
    return this.events
      .filter(event => event.deletedAt)
      .map(event => ({ ...event, deletedAt: event.deletedAt }));
  }

  async listDeletedRoles() {
    return this.roles
      .filter(role => role.deletedAt)
      .map(role => ({ ...role, deletedAt: role.deletedAt }));
  }

  async recordAttendance(input: AttendanceInput) {
    const event = this.events.find(e => e.id === input.eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    const existing = event.attendance.find(a => a.userId === input.userId);
    if (existing) {
      existing.status = input.status;
      existing.note = input.note;
      existing.recordedBy = input.recordedBy ?? input.userId;
      existing.recordedAt = new Date().toISOString();
      return clone(existing);
    }
    const record = {
      eventId: input.eventId,
      userId: input.userId,
      status: input.status,
      note: input.note,
      recordedBy: input.recordedBy ?? input.userId,
      recordedAt: new Date().toISOString(),
    };
    event.attendance.push(record);
    return clone(record);
  }

  async createChild(data: {
    householdId: string;
    fullName: string;
    dateOfBirth: string;
    allergies?: string;
    medicalNotes?: string;
    actorUserId: string;
  }): Promise<MockChild> {
    const household = this.households.find(h => h.id === data.householdId);
    if (!household) {
      throw new Error('Household not found');
    }
    const child: MockChild = {
      id: `child-${randomUUID()}`,
      householdId: data.householdId,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      allergies: data.allergies,
      medicalNotes: data.medicalNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.children.push(child);
    await this.createAuditLog({
      actorUserId: data.actorUserId,
      action: 'child.created',
      entity: 'child',
      entityId: child.id,
      summary: `${this.getUserName(data.actorUserId)} added a child to household ${household.name}`,
      metadata: {
        householdId: household.id,
        childId: child.id,
        fullName: child.fullName,
      },
    });
    return clone(child);
  }

  async updateChild(
    id: string,
    data: Partial<Omit<MockChild, 'id' | 'householdId' | 'createdAt' | 'updatedAt'>> & {
      actorUserId: string;
    }
  ): Promise<MockChild | null> {
    const child = this.children.find(c => c.id === id);
    if (!child) {
      return null;
    }
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const track = (key: string, previous: unknown, next: unknown) => {
      if (previous !== next) {
        diff[key] = { previous, newValue: next };
      }
    };
    if (data.fullName && data.fullName !== child.fullName) {
      track('fullName', child.fullName, data.fullName);
      child.fullName = data.fullName;
    }
    if (data.dateOfBirth && data.dateOfBirth !== child.dateOfBirth) {
      track('dateOfBirth', child.dateOfBirth, data.dateOfBirth);
      child.dateOfBirth = data.dateOfBirth;
    }
    if (data.allergies && data.allergies !== child.allergies) {
      track('allergies', child.allergies, data.allergies);
      child.allergies = data.allergies;
    }
    if (data.medicalNotes && data.medicalNotes !== child.medicalNotes) {
      track('medicalNotes', child.medicalNotes, data.medicalNotes);
      child.medicalNotes = data.medicalNotes;
    }
    if (Object.keys(diff).length > 0) {
      child.updatedAt = new Date().toISOString();
      await this.createAuditLog({
        actorUserId: data.actorUserId,
        action: 'child.updated',
        entity: 'child',
        entityId: child.id,
        summary: `${this.getUserName(data.actorUserId)} updated information for child ${child.fullName}`,
        diff,
        metadata: {
          childId: child.id,
        },
      });
    }
    return clone(child);
  }

  async deleteChild(id: string, { actorUserId: _actorUserId }: { actorUserId: string }) {
    const child = this.children.find(c => c.id === id && !c.deletedAt);
    if (!child) {
      return { success: false };
    }
    child.deletedAt = new Date().toISOString();
    return { success: true };
  }

  async undeleteChild(id: string, _actorUserId: string) {
    const child = this.children.find(c => c.id === id && c.deletedAt);
    if (!child) {
      return { success: false };
    }
    child.deletedAt = undefined;
    return { success: true };
  }

  async hardDeleteChild(id: string, _actorUserId: string) {
    const index = this.children.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false };
    }
    this.children.splice(index, 1);
    return { success: true };
  }

  async bulkDeleteChildren(
    ids: string[],
    _actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    const result = { success: 0, failed: [] as Array<{ id: string; reason: string }> };
    const deletePromises = ids.map(id => this.deleteChild(id, { actorUserId: _actorUserId }));
    const deleteResults = await Promise.all(deletePromises);

    deleteResults.forEach((res, idx) => {
      if (res.success) {
        result.success += 1;
      } else {
        result.failed.push({ id: ids[idx], reason: 'Child not found or already deleted' });
      }
    });

    return result;
  }

  async bulkUndeleteChildren(
    ids: string[],
    _actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    const result = { success: 0, failed: [] as Array<{ id: string; reason: string }> };
    const undeletePromises = ids.map(id => this.undeleteChild(id, _actorUserId));
    const undeleteResults = await Promise.all(undeletePromises);

    undeleteResults.forEach((res, idx) => {
      if (res.success) {
        result.success += 1;
      } else {
        result.failed.push({ id: ids[idx], reason: 'Child not found or not deleted' });
      }
    });

    return result;
  }

  async listDeletedChildren() {
    return clone(
      this.children.filter(c => c.deletedAt).map(c => ({ ...c, deletedAt: c.deletedAt }))
    );
  }

  async getChildById(id: string) {
    const child = this.children.find(c => c.id === id);
    return child ? clone(child) : null;
  }

  async createPushSubscription(data: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userId: string;
  }): Promise<MockPushSubscription> {
    const subscription = {
      id: `sub-${randomUUID()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.pushSubscriptions.push(subscription);
    return clone(subscription);
  }

  async getPushSubscriptionsByUserId(userId: string) {
    return clone(this.pushSubscriptions.filter(sub => sub.userId === userId));
  }

  async getChildren(householdId: string) {
    return clone(this.children.filter(child => child.householdId === householdId));
  }

  async getCheckinsByEventId(eventId: string) {
    return clone(this.checkins.filter(checkin => checkin.eventId === eventId));
  }

  async getCheckins(status: 'pending' | 'checked-in') {
    const filtered = this.checkins.filter(checkin => checkin.status === status);
    return clone(
      filtered.map(checkin => {
        const child = this.children.find(c => c.id === checkin.childId);
        return { ...checkin, child: clone(child) };
      })
    );
  }

  async getCheckinById(id: string) {
    const checkin = this.checkins.find(c => c.id === id);
    if (!checkin) return null;
    const child = this.children.find(c => c.id === checkin.childId);
    return { ...clone(checkin), child: clone(child) };
  }

  async createCheckin(data: { eventId: string; childId: string; actorUserId: string }) {
    const checkin: MockCheckin = {
      id: `checkin-${randomUUID()}`,
      churchId: (await this.getChurch()).id,
      eventId: data.eventId,
      childId: data.childId,
      status: 'pending',
    };
    this.checkins.push(checkin);
    await this.createAuditLog({
      actorUserId: data.actorUserId,
      action: 'checkin.created',
      entity: 'checkin',
      entityId: checkin.id,
      summary: `${this.getUserName(data.actorUserId)} initiated check-in for a child`,
      metadata: {
        eventId: checkin.eventId,
        childId: checkin.childId,
      },
    });
    return clone(checkin);
  }

  async updateCheckin(
    id: string,
    data: Partial<Omit<MockCheckin, 'id' | 'churchId' | 'eventId' | 'childId'>> & {
      actorUserId: string;
    }
  ): Promise<MockCheckin | null> {
    const checkin = this.checkins.find(c => c.id === id);
    if (!checkin) {
      return null;
    }
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const track = (key: string, previous: unknown, next: unknown) => {
      if (previous !== next) {
        diff[key] = { previous, newValue: next };
      }
    };
    if (data.status && data.status !== checkin.status) {
      track('status', checkin.status, data.status);
      checkin.status = data.status;
    }
    if (data.checkinTime && data.checkinTime !== checkin.checkinTime) {
      track('checkinTime', checkin.checkinTime, data.checkinTime);
      checkin.checkinTime = data.checkinTime;
    }
    if (data.checkoutTime && data.checkoutTime !== checkin.checkoutTime) {
      track('checkoutTime', checkin.checkoutTime, data.checkoutTime);
      checkin.checkoutTime = data.checkoutTime;
    }
    if (data.checkedInBy && data.checkedInBy !== checkin.checkedInBy) {
      track('checkedInBy', checkin.checkedInBy, data.checkedInBy);
      checkin.checkedInBy = data.checkedInBy;
    }
    if (data.checkedOutBy && data.checkedOutBy !== checkin.checkedOutBy) {
      track('checkedOutBy', checkin.checkedOutBy, data.checkedOutBy);
      checkin.checkedOutBy = data.checkedOutBy;
    }
    if (Object.keys(diff).length > 0) {
      await this.createAuditLog({
        actorUserId: data.actorUserId,
        action: 'checkin.updated',
        entity: 'checkin',
        entityId: checkin.id,
        summary: `${this.getUserName(data.actorUserId)} updated check-in status`,
        diff,
        metadata: {
          checkinId: checkin.id,
        },
      });
    }
    return clone(checkin);
  }

  async getPrayerRequests() {
    return clone(this.prayerRequests);
  }

  async getRequests() {
    return Promise.all(
      clone(this.requests).map(async request => {
        const author = await this.getUserById(request.userId);
        const requestType = this.requestTypes.find(rt => rt.id === request.requestTypeId);
        return {
          ...request,
          author,
          requestType,
        };
      })
    );
  }

  async archiveRequestType(id: string, actorUserId: string) {
    const requestType = this.requestTypes.find(rt => rt.id === id);
    if (!requestType) {
      throw new Error('Request type not found');
    }
    if (requestType.isBuiltIn) {
      throw new Error('Cannot archive a built-in request type');
    }
    const openRequests = this.requests.filter(r => r.requestTypeId === id && r.status !== 'Closed');
    if (openRequests.length > 0) {
      throw new Error('Cannot archive a request type with open requests');
    }
    requestType.status = 'archived';
    const actorName = this.getUserName(actorUserId);
    await this.createAuditLog({
      actorUserId,
      action: 'requestType.archived',
      entity: 'requestType',
      entityId: id,
      summary: `${actorName} archived request type "${requestType.name}"`,
    });
    return clone(requestType);
  }

  async updateRequestTypeStatus(id: string, status: 'active' | 'archived', actorUserId: string) {
    const requestType = this.requestTypes.find(rt => rt.id === id);
    if (!requestType) {
      throw new Error('Request type not found');
    }
    requestType.status = status;
    const actorName = this.getUserName(actorUserId);
    await this.createAuditLog({
      actorUserId,
      action: 'requestType.status.updated',
      entity: 'requestType',
      entityId: id,
      summary: `${actorName} updated status of request type "${requestType.name}" to ${status}`,
    });
    return clone(requestType);
  }

  async reorderRequestTypes(ids: string[], actorUserId: string) {
    const idSet = new Set(ids);
    const reordered: MockRequestType[] = [];
    const unchanged: MockRequestType[] = [];

    this.requestTypes.forEach(rt => {
      if (idSet.has(rt.id)) {
        reordered.push(rt);
      } else {
        unchanged.push(rt);
      }
    });

    ids.forEach((id, index) => {
      const rt = reordered.find(rt => rt.id === id);
      if (rt) {
        rt.displayOrder = index + 1;
      }
    });

    this.requestTypes = [...reordered, ...unchanged].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    const actorName = this.getUserName(actorUserId);
    await this.createAuditLog({
      actorUserId,
      action: 'requestType.reordered',
      entity: 'requestType',
      summary: `${actorName} reordered request types`,
    });

    return clone(this.requestTypes);
  }

  async getDocumentPermissions(documentId: string) {
    return this.documentPermissions
      .filter(p => p.documentId === documentId && !p.deletedAt)
      .map(p => p.roleId);
  }
}

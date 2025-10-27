import { Injectable, Logger } from '@nestjs/common';
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
  MockRole,
  mockRoles,
  DefaultRoleSlug,
  MembershipStatus,
  AttendanceStatus,
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
} from './mock-data';
import { AuditLogPersistence } from './audit-log.persistence';

interface PastoralCareTicketCreateInput {
  churchId: string;
  title: string;
  description: string;
  priority?: string;
  authorId: string;
  actorUserId: string;
}

interface PastoralCareTicketUpdateInput {
  status?: string;
  assigneeId?: string;
  actorUserId: string;
}

interface PastoralCareCommentCreateInput {
  ticketId: string;
  body: string;
  authorId: string;
  actorUserId: string;
}

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
  roleIds?: string[];
  actorUserId: string;
  membershipStatus?: string;
  joinMethod?: string;
  joinDate?: string;
  previousChurch?: string;
  baptismDate?: string;
  spiritualGifts?: string[];
  coursesAttended?: string[];
  maritalStatus?: string;
  occupation?: string;
  school?: string;
  gradeLevel?: string;
  graduationYear?: number;
  skillsAndInterests?: string[];
  backgroundCheckStatus?: string;
  backgroundCheckDate?: string;
  onboardingComplete?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergiesOrMedicalNotes?: string;
  parentalConsentOnFile?: boolean;
  pastoralNotes?: string;
}

interface UserUpdateInput {
  primaryEmail?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: MockUser['status'];
  roleIds?: string[];
  actorUserId: string;
  membershipStatus?: string;
  joinMethod?: string;
  joinDate?: string;
  previousChurch?: string;
  baptismDate?: string;
  spiritualGifts?: string[];
  coursesAttended?: string[];
  maritalStatus?: string;
  occupation?: string;
  school?: string;
  gradeLevel?: string;
  graduationYear?: number;
  skillsAndInterests?: string[];
  backgroundCheckStatus?: string;
  backgroundCheckDate?: string;
  onboardingComplete?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergiesOrMedicalNotes?: string;
  parentalConsentOnFile?: boolean;
  pastoralNotes?: string;
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

interface EventVolunteerRoleCreateInput {
  eventId: string;
  name: string;
  needed: number;
}

interface EventVolunteerRoleUpdateInput {
  name?: string;
  needed?: number;
}

interface EventVolunteerSignupCreateInput {
  volunteerRoleId: string;
  userId: string;
}

interface RoleCreateInput {
  name: string;
  description?: string;
  permissions?: string[];
  actorUserId: string;
  slug?: string;
}

interface RoleUpdateInput {
  name?: string;
  description?: string | null;
  permissions?: string[];
  actorUserId: string;
}

interface RoleDeleteInput {
  actorUserId: string;
  reassignRoleId?: string;
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

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

@Injectable()
export class MockDatabaseService {
  private readonly logger = new Logger(MockDatabaseService.name);
  private users: MockUser[] = clone(mockUsers);
  private households: MockHousehold[] = clone(mockHouseholds);
  private children: MockChild[] = [];
  private checkins: MockCheckin[] = [];
  private roles: MockRole[] = clone(mockRoles);
  private groups: MockGroup[] = clone(mockGroups);
  private events: MockEvent[] = clone(mockEvents);
  private announcements: MockAnnouncement[] = clone(mockAnnouncements);
  private announcementReads: MockAnnouncementRead[] = clone(mockAnnouncementReads);
  private funds: MockFund[] = clone(mockFunds);
  private contributions: MockContribution[] = clone(mockContributions);
  private pastoralCareTickets: MockPastoralCareTicket[] = [];
  private pastoralCareComments: MockPastoralCareComment[] = [];
  private prayerRequests: MockPrayerRequest[] = clone(mockPrayerRequests);
  private requests: MockRequest[] = clone(mockRequests);
  private requestTypes: MockRequestType[] = clone(mockRequestTypes);
  private auditLogs: MockAuditLog[] = clone(mockAuditLogs);
  private sessions: DemoSession[] = clone(mockSessions);
  private oauthAccounts: Array<{
    provider: 'google' | 'facebook';
    providerUserId: string;
    userId: string;
  }> = [];
  private settings: MockSettings[] = clone(mockSettings);
  private invitations: MockInvitation[] = clone(mockInvitations);
  private pushSubscriptions: any[] = [];
  private eventVolunteerRoles: any[] = [];
  private eventVolunteerSignups: any[] = [];
  private documents: MockDocument[] = clone(mockDocuments);
  private documentPermissions: MockDocumentPermission[] = clone(mockDocumentPermissions);

  constructor(private readonly auditPersistence: AuditLogPersistence) {
    this.hydrateAuditLogSnapshot();
    const churchId = this.getChurch().id;
    this.requestTypes.forEach(rt => {
      rt.churchId = churchId;
    });
  }

  private hydrateAuditLogSnapshot() {
    try {
      const persisted = this.auditPersistence.load();
      if (Array.isArray(persisted) && persisted.length > 0) {
        this.auditLogs = persisted.map(log => clone(log));
        this.logger.log(`Loaded ${this.auditLogs.length} audit log entries from disk.`);
        return;
      }
      this.auditPersistence.save(this.auditLogs);
    } catch (error) {
      this.logger.warn('Falling back to in-memory audit log only; persistence unavailable.');
      if (error instanceof Error) {
        this.logger.verbose(error.message);
      }
    }
  }

  private persistAuditLogs() {
    try {
      this.auditPersistence.save(this.auditLogs);
    } catch (error) {
      this.logger.error(
        'Failed to persist audit logs after mutation.',
        error instanceof Error ? error.stack : undefined
      );
    }
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

  private buildUserPayload(user: MockUser) {
    const payload = clone(user) as any;
    payload.roles = user.roles.map(role => this.buildUserRolePayload(role));
    payload.household = this.households.find(h => h.id === user.profile.householdId) ?? null;
    return payload;
  }

  listHouseholds(churchId?: string) {
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

  getHouseholdById(id: string) {
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

  getHouseholdMembers(householdId: string) {
    return this.users
      .filter(u => u.profile.householdId === householdId)
      .map(u => this.buildUserPayload(u));
  }

  private withAssignmentCount(role: MockRole) {
    const count = this.users.filter(user => user.roles.some(r => r.roleId === role.id)).length;
    return {
      ...clone(role),
      assignmentCount: count,
    };
  }

  getChurch() {
    return clone(mockChurches[0]);
  }

  listUsers(query?: string) {
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
    return clone(list) as any;
  }

  getUserById(id: string) {
    const user = this.users.find(record => record.id === id && !record.deletedAt);
    if (!user) return null;
    return this.buildUserPayload(user);
  }

  getUserProfile(id: string) {
    const user = this.getUserById(id);
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

  createUser(input: UserCreateInput) {
    const emailTaken = this.users.some(
      user => user.primaryEmail.toLowerCase() === input.primaryEmail.toLowerCase()
    );
    if (emailTaken) {
      throw new Error('A user with that email already exists');
    }
    const churchId = this.getChurch().id;
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
    this.createAuditLog({
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
    return this.getUserProfile(user.id);
  }

  updateUser(id: string, input: UserUpdateInput) {
    const user = this.users.find(record => record.id === id);
    if (!user) return null;
    if (
      input.primaryEmail &&
      input.primaryEmail.toLowerCase() !== user.primaryEmail.toLowerCase() &&
      this.users.some(
        record =>
          record.id !== id &&
          record.primaryEmail.toLowerCase() === input.primaryEmail!.toLowerCase()
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
    if (typeof input.address === 'string') {
      const household = this.households.find(h => h.id === user.profile.householdId);
      if (household && input.address !== household.address) {
        track('household.address', household.address ?? null, input.address);
        household.address = input.address;
      }
    }
    if (typeof input.notes === 'string' && input.notes !== user.profile.notes) {
      track('profile.notes', user.profile.notes ?? null, input.notes);
      user.profile.notes = input.notes;
    }
    if (
      typeof input.membershipStatus === 'string' &&
      input.membershipStatus !== user.profile.membershipStatus
    ) {
      track(
        'profile.membershipStatus',
        user.profile.membershipStatus ?? null,
        input.membershipStatus
      );
      user.profile.membershipStatus = input.membershipStatus as any;
    }
    if (typeof input.joinMethod === 'string' && input.joinMethod !== user.profile.joinMethod) {
      track('profile.joinMethod', user.profile.joinMethod ?? null, input.joinMethod);
      user.profile.joinMethod = input.joinMethod as any;
    }
    if (typeof input.joinDate === 'string' && input.joinDate !== user.profile.joinDate) {
      track('profile.joinDate', user.profile.joinDate ?? null, input.joinDate);
      user.profile.joinDate = input.joinDate;
    }
    if (
      typeof input.previousChurch === 'string' &&
      input.previousChurch !== user.profile.previousChurch
    ) {
      track('profile.previousChurch', user.profile.previousChurch ?? null, input.previousChurch);
      user.profile.previousChurch = input.previousChurch;
    }
    if (typeof input.baptismDate === 'string' && input.baptismDate !== user.profile.baptismDate) {
      track('profile.baptismDate', user.profile.baptismDate ?? null, input.baptismDate);
      user.profile.baptismDate = input.baptismDate;
    }
    if (input.spiritualGifts) {
      track('profile.spiritualGifts', user.profile.spiritualGifts ?? null, input.spiritualGifts);
      user.profile.spiritualGifts = input.spiritualGifts;
    }
    if (input.coursesAttended) {
      track('profile.coursesAttended', user.profile.coursesAttended ?? null, input.coursesAttended);
      user.profile.coursesAttended = input.coursesAttended;
    }
    if (
      typeof input.maritalStatus === 'string' &&
      input.maritalStatus !== user.profile.maritalStatus
    ) {
      track('profile.maritalStatus', user.profile.maritalStatus ?? null, input.maritalStatus);
      user.profile.maritalStatus = input.maritalStatus as any;
    }
    if (typeof input.occupation === 'string' && input.occupation !== user.profile.occupation) {
      track('profile.occupation', user.profile.occupation ?? null, input.occupation);
      user.profile.occupation = input.occupation;
    }
    if (typeof input.school === 'string' && input.school !== user.profile.school) {
      track('profile.school', user.profile.school ?? null, input.school);
      user.profile.school = input.school;
    }
    if (typeof input.gradeLevel === 'string' && input.gradeLevel !== user.profile.gradeLevel) {
      track('profile.gradeLevel', user.profile.gradeLevel ?? null, input.gradeLevel);
      user.profile.gradeLevel = input.gradeLevel;
    }
    if (
      typeof input.graduationYear === 'number' &&
      input.graduationYear !== user.profile.graduationYear
    ) {
      track('profile.graduationYear', user.profile.graduationYear ?? null, input.graduationYear);
      user.profile.graduationYear = input.graduationYear;
    }
    if (input.skillsAndInterests) {
      track(
        'profile.skillsAndInterests',
        user.profile.skillsAndInterests ?? null,
        input.skillsAndInterests
      );
      user.profile.skillsAndInterests = input.skillsAndInterests;
    }
    if (
      typeof input.backgroundCheckStatus === 'string' &&
      input.backgroundCheckStatus !== user.profile.backgroundCheckStatus
    ) {
      track(
        'profile.backgroundCheckStatus',
        user.profile.backgroundCheckStatus ?? null,
        input.backgroundCheckStatus
      );
      user.profile.backgroundCheckStatus = input.backgroundCheckStatus as any;
    }
    if (
      typeof input.backgroundCheckDate === 'string' &&
      input.backgroundCheckDate !== user.profile.backgroundCheckDate
    ) {
      track(
        'profile.backgroundCheckDate',
        user.profile.backgroundCheckDate ?? null,
        input.backgroundCheckDate
      );
      user.profile.backgroundCheckDate = input.backgroundCheckDate;
    }
    if (
      typeof input.onboardingComplete === 'boolean' &&
      input.onboardingComplete !== user.profile.onboardingComplete
    ) {
      track(
        'profile.onboardingComplete',
        user.profile.onboardingComplete ?? null,
        input.onboardingComplete
      );
      user.profile.onboardingComplete = input.onboardingComplete;
    }
    if (
      typeof input.emergencyContactName === 'string' &&
      input.emergencyContactName !== user.profile.emergencyContactName
    ) {
      track(
        'profile.emergencyContactName',
        user.profile.emergencyContactName ?? null,
        input.emergencyContactName
      );
      user.profile.emergencyContactName = input.emergencyContactName;
    }
    if (
      typeof input.emergencyContactPhone === 'string' &&
      input.emergencyContactPhone !== user.profile.emergencyContactPhone
    ) {
      track(
        'profile.emergencyContactPhone',
        user.profile.emergencyContactPhone ?? null,
        input.emergencyContactPhone
      );
      user.profile.emergencyContactPhone = input.emergencyContactPhone;
    }
    if (
      typeof input.allergiesOrMedicalNotes === 'string' &&
      input.allergiesOrMedicalNotes !== user.profile.allergiesOrMedicalNotes
    ) {
      track(
        'profile.allergiesOrMedicalNotes',
        user.profile.allergiesOrMedicalNotes ?? null,
        input.allergiesOrMedicalNotes
      );
      user.profile.allergiesOrMedicalNotes = input.allergiesOrMedicalNotes;
    }
    if (
      typeof input.parentalConsentOnFile === 'boolean' &&
      input.parentalConsentOnFile !== user.profile.parentalConsentOnFile
    ) {
      track(
        'profile.parentalConsentOnFile',
        user.profile.parentalConsentOnFile ?? null,
        input.parentalConsentOnFile
      );
      user.profile.parentalConsentOnFile = input.parentalConsentOnFile;
    }
    if (
      typeof input.pastoralNotes === 'string' &&
      input.pastoralNotes !== user.profile.pastoralNotes
    ) {
      track('profile.pastoralNotes', user.profile.pastoralNotes ?? null, input.pastoralNotes);
      user.profile.pastoralNotes = input.pastoralNotes;
    }
    if (input.roleIds) {
      const churchId = this.getChurch().id;
      const unique = Array.from(new Set(input.roleIds));
      const normalised =
        unique.length > 0
          ? unique.map(identifier => ({ churchId, roleId: this.resolveRoleId(identifier) }))
          : [{ churchId, roleId: this.getDefaultRoleId('member') }];
      const previousRoles = user.roles.map(role => this.buildUserRolePayload(role).role);
      const newRoles = normalised.map(role => this.buildUserRolePayload(role).role);
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
    const user = this.users.find(u => u.id === id);
    if (!user) {
      return { success: false };
    }
    // Soft delete - set deletedAt timestamp
    user.deletedAt = new Date().toISOString();
    const actorName = this.getUserName(input.actorUserId);
    const targetName =
      `${user.profile.firstName} ${user.profile.lastName}`.trim() || user.primaryEmail;
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'user.soft-deleted',
      entity: 'user',
      entityId: user.id,
      summary: `${actorName} soft-deleted ${targetName} from the directory`,
      metadata: {
        userId: user.id,
        email: user.primaryEmail,
      },
    });
    return { success: true };
  }

  getUserByEmail(email: string) {
    return (
      this.users.find(
        user => user.primaryEmail.toLowerCase() === email.toLowerCase() && !user.deletedAt
      ) || null
    );
  }

  listGroups(churchId?: string) {
    const list = this.groups.filter(
      group => (!churchId || group.churchId === churchId) && !group.deletedAt
    );
    return clone(list);
  }

  getGroupById(id: string) {
    return clone(this.groups.find(group => group.id === id && !group.deletedAt) || null);
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
    return clone(this.events.filter(event => !event.deletedAt));
  }

  getEventById(id: string) {
    return clone(this.events.find(event => event.id === id && !event.deletedAt) || null);
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
    const event = this.events.find(e => e.id === id);
    if (!event) {
      return { success: false };
    }
    // Soft delete - set deletedAt timestamp
    event.deletedAt = new Date().toISOString();
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'event.soft-deleted',
      entity: 'event',
      entityId: event.id,
      summary: `${actorName} soft-deleted event ${event.title}`,
      metadata: {
        eventId: event.id,
        startAt: event.startAt,
      },
    });
    return { success: true };
  }

  createEventVolunteerRole(input: EventVolunteerRoleCreateInput) {
    const role = {
      id: `evt-role-${randomUUID()}`,
      eventId: input.eventId,
      name: input.name,
      needed: input.needed,
    };
    this.eventVolunteerRoles.push(role);
    return clone(role);
  }

  updateEventVolunteerRole(id: string, input: EventVolunteerRoleUpdateInput) {
    const role = this.eventVolunteerRoles.find(r => r.id === id);
    if (!role) {
      return null;
    }
    if (input.name) {
      role.name = input.name;
    }
    if (input.needed) {
      role.needed = input.needed;
    }
    return clone(role);
  }

  deleteEventVolunteerRole(id: string) {
    const index = this.eventVolunteerRoles.findIndex(r => r.id === id);
    if (index === -1) {
      return { success: false };
    }
    this.eventVolunteerRoles.splice(index, 1);
    this.eventVolunteerSignups = this.eventVolunteerSignups.filter(s => s.volunteerRoleId !== id);
    return { success: true };
  }

  createEventVolunteerSignup(input: EventVolunteerSignupCreateInput) {
    const signup = {
      id: `evt-signup-${randomUUID()}`,
      volunteerRoleId: input.volunteerRoleId,
      userId: input.userId,
    };
    this.eventVolunteerSignups.push(signup);
    return clone(signup);
  }

  deleteEventVolunteerSignup(id: string) {
    const index = this.eventVolunteerSignups.findIndex(s => s.id === id);
    if (index === -1) {
      return { success: false };
    }
    this.eventVolunteerSignups.splice(index, 1);
    return { success: true };
  }

  getEventVolunteerSignupById(id: string) {
    return clone(this.eventVolunteerSignups.find(s => s.id === id) || null);
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
    const actorName = actor
      ? `${actor.profile.firstName} ${actor.profile.lastName}`.trim()
      : actorUserId;
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
          previousStatus !== input.status ? { previousStatus, newStatus: input.status } : undefined,
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
      .sort((a, b) => new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime());
  }

  markAnnouncementRead(announcementId: string, userId: string) {
    const already = this.announcementReads.find(
      read => read.announcementId === announcementId && read.userId === userId
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
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
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
    const actorName = actor
      ? `${actor.profile.firstName} ${actor.profile.lastName}`.trim()
      : actorUserId;
    const fund = contribution.fundId
      ? this.funds.find(f => f.id === contribution.fundId)
      : undefined;
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

  exportContributionsCsv(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }) {
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
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
    this.persistAuditLogs();
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

  listRoles() {
    return this.roles.map(role => this.withAssignmentCount(role));
  }

  getRole(id: string) {
    const role = this.getRoleById(id);
    return role ? this.withAssignmentCount(role) : undefined;
  }

  createRole(input: RoleCreateInput) {
    const churchId = this.getChurch().id;
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
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'role.created',
      entity: 'role',
      entityId: role.id,
      summary: `${actorName} created role ${role.name}`,
      metadata: {
        roleId: role.id,
        permissions: role.permissions,
      },
    });
    return this.withAssignmentCount(role);
  }

  updateRole(id: string, input: RoleUpdateInput) {
    const role = this.roles.find(record => record.id === id);
    if (!role) {
      return null;
    }
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const track = (key: string, previous: unknown, next: unknown) => {
      if (previous !== next) {
        diff[key] = { previous, newValue: next };
      }
    };
    if (role.isSystem && role.slug === 'admin') {
      if (input.name && input.name.trim() !== role.name) {
        throw new Error('The Admin role cannot be renamed.');
      }
      if (input.permissions && input.permissions.length > 0) {
        throw new Error('The Admin role permissions cannot be modified.');
      }
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
      track('name', role.name, name);
      role.name = name;
      if (!role.isSystem) {
        const newSlug = slugify(name);
        track('slug', role.slug, newSlug);
        role.slug = newSlug;
      }
    }
    if (input.description !== undefined) {
      const description = input.description ?? undefined;
      track('description', role.description ?? null, description ?? null);
      role.description = description;
    }
    if (input.permissions) {
      const permissions = Array.from(
        new Set(input.permissions.map(entry => entry.trim()).filter(Boolean))
      ).sort();
      track('permissions', role.permissions, permissions);
      role.permissions = permissions;
    }
    if (Object.keys(diff).length > 0) {
      role.updatedAt = new Date().toISOString();
      const actorName = this.getUserName(input.actorUserId);
      this.createAuditLog({
        actorUserId: input.actorUserId,
        action: 'role.updated',
        entity: 'role',
        entityId: role.id,
        summary: `${actorName} updated role ${role.name}`,
        diff,
      });
    }
    return this.withAssignmentCount(role);
  }

  deleteRole(id: string, input: RoleDeleteInput) {
    const role = this.roles.find(r => r.id === id);
    if (!role) {
      return { deleted: false, reassigned: 0 };
    }
    if (!role.isDeletable || role.slug === 'admin') {
      throw new Error('This role cannot be deleted.');
    }

    // Handle role reassignment before soft delete
    const assignments = this.users.filter(user => user.roles.some(r => r.roleId === id));
    let reassigned = 0;
    let targetRoleId: string | null = null;
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
      const targetRole = this.getRoleById(resolved);
      if (!targetRole) {
        throw new Error('Target role not found.');
      }
      targetRoleId = targetRole.id;
      this.users.forEach(user => {
        if (!user.roles.some(r => r.roleId === id)) return;
        user.roles = user.roles.filter(r => r.roleId !== id);
        if (!user.roles.some(r => r.roleId === targetRole.id)) {
          user.roles.push({ churchId: targetRole.churchId, roleId: targetRole.id });
        }
        reassigned += 1;
      });
    }

    // Soft delete - set deletedAt timestamp
    role.deletedAt = new Date().toISOString();
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'role.soft-deleted',
      entity: 'role',
      entityId: role.id,
      summary: `${actorName} soft-deleted role ${role.name}`,
      metadata: {
        roleId: role.id,
        reassignedTo: targetRoleId,
        reassignedCount: reassigned,
      },
    });
    return { deleted: true, reassigned };
  }

  createSession(email: string, provider: DemoSession['provider'], requestedRole?: string) {
    const user = this.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found for demo login. Use one of the seeded accounts.');
    }
    const churchId = this.getChurch().id;
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
    return { session, user: this.buildUserPayload(user) };
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

  getSettings(churchId: string): MockSettings | null {
    return clone(this.settings.find(s => s.churchId === churchId)) ?? null;
  }

  initializeSettings(churchId: string): MockSettings {
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

  updateSettings(churchId: string, update: any): MockSettings {
    let settings = this.settings.find(s => s.churchId === churchId);
    if (!settings) {
      settings = this.initializeSettings(churchId);
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

  createChild(data: {
    householdId: string;
    fullName: string;
    dateOfBirth: string;
    allergies?: string;
    medicalNotes?: string;
    actorUserId: string;
  }) {
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
    this.createAuditLog({
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

  updateChild(
    id: string,
    data: Partial<Omit<MockChild, 'id' | 'householdId' | 'createdAt' | 'updatedAt'>> & {
      actorUserId: string;
    }
  ) {
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
      this.createAuditLog({
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

  deleteChild(id: string, { actorUserId }: { actorUserId: string }) {
    const index = this.children.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false };
    }
    const [removed] = this.children.splice(index, 1);
    this.createAuditLog({
      actorUserId,
      action: 'child.deleted',
      entity: 'child',
      entityId: removed.id,
      summary: `${this.getUserName(actorUserId)} removed child ${removed.fullName} from household`,
      metadata: {
        householdId: removed.householdId,
        childId: removed.id,
      },
    });
    return { success: true };
  }

  createPushSubscription(data: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userId: string;
  }) {
    const subscription = {
      id: `sub-${randomUUID()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    this.pushSubscriptions.push(subscription);
    return clone(subscription);
  }

  getPushSubscriptionsByUserId(userId: string) {
    return clone(this.pushSubscriptions.filter(sub => sub.userId === userId));
  }

  getChildren(householdId: string) {
    return clone(this.children.filter(child => child.householdId === householdId));
  }

  getCheckinsByEventId(eventId: string) {
    return clone(this.checkins.filter(checkin => checkin.eventId === eventId));
  }

  getCheckinById(id: string) {
    const checkin = this.checkins.find(c => c.id === id);
    if (!checkin) return null;
    const child = this.children.find(c => c.id === checkin.childId);
    return { ...clone(checkin), child: clone(child) };
  }

  createCheckin(data: { eventId: string; childId: string; actorUserId: string }) {
    const checkin: MockCheckin = {
      id: `checkin-${randomUUID()}`,
      churchId: this.getChurch().id,
      eventId: data.eventId,
      childId: data.childId,
      status: 'pending',
    };
    this.checkins.push(checkin);
    this.createAuditLog({
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

  updateCheckin(
    id: string,
    data: Partial<Omit<MockCheckin, 'id' | 'churchId' | 'eventId' | 'childId'>> & {
      actorUserId: string;
    }
  ) {
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
      this.createAuditLog({
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

  createPastoralCareTicket(input: PastoralCareTicketCreateInput) {
    const now = new Date().toISOString();
    const ticket: MockPastoralCareTicket = {
      id: `pc-ticket-${randomUUID()}`,
      churchId: input.churchId,
      title: input.title,
      description: input.description,
      status: 'NEW',
      priority: input.priority ?? 'NORMAL',
      authorId: input.authorId,
      createdAt: now,
      updatedAt: now,
    };
    this.pastoralCareTickets.push(ticket);
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'pastoralCare.ticket.created',
      entity: 'pastoralCareTicket',
      entityId: ticket.id,
      summary: `${actorName} created a new pastoral care ticket`,
      metadata: {
        ticketId: ticket.id,
        title: ticket.title,
      },
    });
    return clone(ticket);
  }

  updatePastoralCareTicket(id: string, input: PastoralCareTicketUpdateInput) {
    const ticket = this.pastoralCareTickets.find(t => t.id === id);
    if (!ticket) {
      return null;
    }
    const diff: Record<string, { previous: unknown; newValue: unknown }> = {};
    const track = (key: string, previous: unknown, next: unknown) => {
      if (previous !== next) {
        diff[key] = { previous, newValue: next };
      }
    };
    if (input.status && input.status !== ticket.status) {
      track('status', ticket.status, input.status);
      ticket.status = input.status;
    }
    if (input.assigneeId && input.assigneeId !== ticket.assigneeId) {
      track('assigneeId', ticket.assigneeId, input.assigneeId);
      ticket.assigneeId = input.assigneeId;
    }
    if (Object.keys(diff).length > 0) {
      ticket.updatedAt = new Date().toISOString();
      const actorName = this.getUserName(input.actorUserId);
      this.createAuditLog({
        actorUserId: input.actorUserId,
        action: 'pastoralCare.ticket.updated',
        entity: 'pastoralCareTicket',
        entityId: ticket.id,
        summary: `${actorName} updated pastoral care ticket #${ticket.id}`,
        diff,
        metadata: {
          ticketId: ticket.id,
        },
      });
    }
    return clone(ticket);
  }

  createPastoralCareComment(input: PastoralCareCommentCreateInput) {
    const now = new Date().toISOString();
    const comment: MockPastoralCareComment = {
      id: `pc-comment-${randomUUID()}`,
      ticketId: input.ticketId,
      authorId: input.authorId,
      body: input.body,
      createdAt: now,
    };
    this.pastoralCareComments.push(comment);
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'pastoralCare.comment.created',
      entity: 'pastoralCareComment',
      entityId: comment.id,
      summary: `${actorName} added a comment to pastoral care ticket #${input.ticketId}`,
      metadata: {
        ticketId: input.ticketId,
        commentId: comment.id,
      },
    });
    return clone(comment);
  }

  getPastoralCareTicket(id: string) {
    const ticket = this.pastoralCareTickets.find(t => t.id === id);
    if (!ticket) {
      return null;
    }
    const comments = this.pastoralCareComments
      .filter(c => c.ticketId === id)
      .map(c => ({
        ...c,
        author: this.getUserById(c.authorId),
      }));
    return {
      ...clone(ticket),
      author: this.getUserById(ticket.authorId),
      assignee: ticket.assigneeId ? this.getUserById(ticket.assigneeId) : undefined,
      comments,
    };
  }

  listPastoralCareTickets(churchId: string) {
    return this.pastoralCareTickets
      .filter(t => t.churchId === churchId)
      .map(t => ({
        ...clone(t),
        author: this.getUserById(t.authorId),
        assignee: t.assigneeId ? this.getUserById(t.assigneeId) : undefined,
      }));
  }

  getPrayerRequests() {
    return clone(this.prayerRequests);
  }

  getRequests() {
    return clone(this.requests).map(request => {
      const author = this.getUserById(request.userId);
      const requestType = this.requestTypes.find(rt => rt.id === request.requestTypeId);
      return {
        ...request,
        author,
        requestType,
      };
    });
  }

  createRequest(input: Omit<MockRequest, 'id' | 'createdAt' | 'churchId'>, actorUserId: string) {
    const now = new Date().toISOString();
    const request: MockRequest = {
      id: `req-${randomUUID()}`,
      churchId: this.getChurch().id,
      ...input,
      createdAt: now,
    };
    this.requests.push(request);
    const actorName = this.getUserName(actorUserId);
    this.createAuditLog({
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

  listRequestTypes(churchId: string) {
    return clone(this.requestTypes.filter(rt => rt.churchId === churchId));
  }

  createRequestType(
    name: string,
    hasConfidentialField: boolean,
    actorUserId: string,
    description: string = ''
  ) {
    const churchId = this.getChurch().id;
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
    this.createAuditLog({
      actorUserId,
      action: 'requestType.created',
      entity: 'requestType',
      entityId: newRequestType.id,
      summary: `${actorName} created a new request type: ${name}`,
    });
    return clone(newRequestType);
  }

  updateRequestType(id: string, name: string, actorUserId: string) {
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
    this.createAuditLog({
      actorUserId,
      action: 'requestType.updated',
      entity: 'requestType',
      entityId: id,
      summary: `${actorName} renamed request type from "${oldName}" to "${name}"`,
    });
    return clone(requestType);
  }

  archiveRequestType(id: string, actorUserId: string) {
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
    this.createAuditLog({
      actorUserId,
      action: 'requestType.archived',
      entity: 'requestType',
      entityId: id,
      summary: `${actorName} archived request type "${requestType.name}"`,
    });
    return clone(requestType);
  }

  updateRequestTypeStatus(id: string, status: 'active' | 'archived', actorUserId: string) {
    const requestType = this.requestTypes.find(rt => rt.id === id);
    if (!requestType) {
      throw new Error('Request type not found');
    }
    requestType.status = status;
    const actorName = this.getUserName(actorUserId);
    this.createAuditLog({
      actorUserId,
      action: 'requestType.status.updated',
      entity: 'requestType',
      entityId: id,
      summary: `${actorName} updated status of request type "${requestType.name}" to ${status}`,
    });
    return clone(requestType);
  }

  reorderRequestTypes(ids: string[], actorUserId: string) {
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
    this.createAuditLog({
      actorUserId,
      action: 'requestType.reordered',
      entity: 'requestType',
      summary: `${actorName} reordered request types`,
    });

    return clone(this.requestTypes);
  }

  // Document Library methods
  listDocuments(churchId: string, userRoleIds: string[]): MockDocument[] {
    return this.documents
      .filter(doc => {
        if (doc.churchId !== churchId || doc.deletedAt) return false;
        // Check if user has permission to view this document
        const hasPermission = this.documentPermissions.some(
          perm => perm.documentId === doc.id && userRoleIds.includes(perm.roleId) && !perm.deletedAt
        );
        return hasPermission;
      })
      .map(doc => clone(doc));
  }

  getDocument(id: string): MockDocument | undefined {
    const doc = this.documents.find(d => d.id === id && !d.deletedAt);
    return doc ? clone(doc) : undefined;
  }

  getDocumentWithPermissions(
    id: string,
    userRoleIds: string[]
  ): (MockDocument & { permissions: string[] }) | undefined {
    const doc = this.documents.find(d => d.id === id && !d.deletedAt);
    if (!doc) return undefined;

    const permissions = this.documentPermissions
      .filter(p => p.documentId === id && !p.deletedAt)
      .map(p => p.roleId);

    // Check if user has permission
    const hasPermission = permissions.some(roleId => userRoleIds.includes(roleId));
    if (!hasPermission) return undefined;

    return { ...clone(doc), permissions };
  }

  createDocument(
    churchId: string,
    uploaderProfileId: string,
    fileName: string,
    fileType: string,
    title: string,
    description: string | undefined,
    fileData: string,
    roleIds: string[],
    actorUserId: string
  ): MockDocument {
    const actorName = this.getUserName(actorUserId);
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

    // Create permissions
    roleIds.forEach(roleId => {
      this.documentPermissions.push({
        documentId: id,
        roleId,
      });
    });

    this.createAuditLog({
      actorUserId,
      action: 'document.created',
      entity: 'document',
      entityId: id,
      summary: `${actorName} uploaded document "${title}"`,
      metadata: { fileName, roleIds },
    });

    return clone(doc);
  }

  updateDocument(
    id: string,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    actorUserId: string
  ): MockDocument | undefined {
    const actorName = this.getUserName(actorUserId);
    const doc = this.documents.find(d => d.id === id && !d.deletedAt);
    if (!doc) return undefined;

    const oldTitle = doc.title;
    const changes: string[] = [];

    if (title !== undefined && title !== doc.title) {
      doc.title = title;
      changes.push(`title: "${oldTitle}" → "${title}"`);
    }

    if (description !== undefined && description !== doc.description) {
      doc.description = description;
      changes.push('description updated');
    }

    if (roleIds !== undefined) {
      // Remove old permissions
      this.documentPermissions = this.documentPermissions.filter(p => p.documentId !== id);
      // Add new permissions
      roleIds.forEach(roleId => {
        this.documentPermissions.push({
          documentId: id,
          roleId,
        });
      });
      changes.push('permissions updated');
    }

    doc.updatedAt = new Date().toISOString();

    this.createAuditLog({
      actorUserId,
      action: 'document.updated',
      entity: 'document',
      entityId: id,
      summary: `${actorName} updated document "${doc.title}"${changes.length > 0 ? `: ${changes.join(', ')}` : ''}`,
      metadata: { changes },
    });

    return clone(doc);
  }

  deleteDocument(id: string, actorUserId: string): boolean {
    const actorName = this.getUserName(actorUserId);
    const doc = this.documents.find(d => d.id === id && !d.deletedAt);
    if (!doc) return false;

    doc.deletedAt = new Date().toISOString();

    this.createAuditLog({
      actorUserId,
      action: 'document.deleted',
      entity: 'document',
      entityId: id,
      summary: `${actorName} archived document "${doc.title}"`,
    });

    return true;
  }

  hardDeleteDocument(id: string, actorUserId: string): boolean {
    const actorName = this.getUserName(actorUserId);
    const index = this.documents.findIndex(d => d.id === id);
    if (index === -1) return false;

    const doc = this.documents[index];
    this.documents.splice(index, 1);
    this.documentPermissions = this.documentPermissions.filter(p => p.documentId !== id);

    this.createAuditLog({
      actorUserId,
      action: 'document.hardDeleted',
      entity: 'document',
      entityId: id,
      summary: `${actorName} permanently deleted document "${doc.title}"`,
    });

    return true;
  }

  undeleteDocument(id: string, actorUserId: string): boolean {
    const actorName = this.getUserName(actorUserId);
    const doc = this.documents.find(d => d.id === id && d.deletedAt);
    if (!doc) return false;

    doc.deletedAt = undefined;

    this.createAuditLog({
      actorUserId,
      action: 'document.restored',
      entity: 'document',
      entityId: id,
      summary: `${actorName} restored document "${doc.title}"`,
    });

    return true;
  }

  listDeletedDocuments(churchId: string): MockDocument[] {
    return this.documents
      .filter(doc => doc.churchId === churchId && doc.deletedAt)
      .map(doc => clone(doc));
  }

  getDocumentPermissions(documentId: string): string[] {
    return this.documentPermissions
      .filter(p => p.documentId === documentId && !p.deletedAt)
      .map(p => p.roleId);
  }

  // Invitation methods
  createInvitation(
    churchId: string,
    email: string,
    roleId: string | undefined,
    actorUserId: string,
    type: 'team' | 'member' = 'team'
  ): MockInvitation {
    const existing = this.invitations.find(
      inv =>
        inv.email.toLowerCase() === email.toLowerCase() &&
        inv.churchId === churchId &&
        inv.type === type &&
        inv.status === 'pending'
    );
    if (existing) {
      throw new Error('An invitation has already been sent to this email address');
    }

    const invitation: MockInvitation = {
      id: `invitation-${randomUUID()}`,
      churchId,
      email: email.toLowerCase(),
      roleId,
      invitationToken: randomUUID(),
      type,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.invitations.push(invitation);

    const actorName = this.getUserName(actorUserId);
    const inviteType = type === 'team' ? 'team member' : 'member registration';
    this.createAuditLog({
      actorUserId,
      action: 'invitation.created',
      entity: 'invitation',
      entityId: invitation.id,
      summary: `${actorName} sent a ${inviteType} invitation to ${email}`,
      metadata: {
        email,
        roleId,
        type,
      },
    });

    return clone(invitation);
  }

  getInvitationByToken(token: string): MockInvitation | null {
    return clone(this.invitations.find(inv => inv.invitationToken === token)) ?? null;
  }

  acceptInvitation(token: string, userId: string): boolean {
    const invitation = this.invitations.find(inv => inv.invitationToken === token);
    if (!invitation || invitation.status !== 'pending') {
      return false;
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      invitation.status = 'expired';
      return false;
    }

    invitation.status = 'accepted';
    invitation.updatedAt = new Date().toISOString();

    // Add the role to the user
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const churchId = invitation.churchId;
      const roleIdToAssign = invitation.roleId || this.getDefaultRoleId('member');
      if (!user.roles.some(r => r.roleId === roleIdToAssign && r.churchId === churchId)) {
        user.roles.push({ churchId, roleId: roleIdToAssign });
      }

      const userName = this.getUserName(userId);
      this.createAuditLog({
        actorUserId: userId,
        action: 'invitation.accepted',
        entity: 'invitation',
        entityId: invitation.id,
        summary: `${userName} accepted invitation to join the church`,
        metadata: {
          email: invitation.email,
          roleId: invitation.roleId,
        },
      });
    }

    return true;
  }

  listInvitations(churchId: string): MockInvitation[] {
    return clone(this.invitations.filter(inv => inv.churchId === churchId));
  }

  // Soft Delete Management Methods

  // Hard delete methods (admin only, with audit logging)
  hardDeleteUser(id: string, input: UserDeleteInput) {
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
    const targetName =
      `${removed.profile.firstName} ${removed.profile.lastName}`.trim() || removed.primaryEmail;
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'user.hard-deleted',
      entity: 'user',
      entityId: removed.id,
      summary: `${actorName} permanently deleted ${targetName} from the directory`,
      metadata: {
        userId: removed.id,
        email: removed.primaryEmail,
        deletedAt: removed.deletedAt,
      },
    });
    return { success: true };
  }

  hardDeleteEvent(id: string, input: EventDeleteInput) {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) {
      return { success: false };
    }
    const [removed] = this.events.splice(index, 1);
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'event.hard-deleted',
      entity: 'event',
      entityId: removed.id,
      summary: `${actorName} permanently deleted event ${removed.title}`,
      metadata: {
        eventId: removed.id,
        startAt: removed.startAt,
        deletedAt: removed.deletedAt,
      },
    });
    return { success: true };
  }

  hardDeleteRole(id: string, input: RoleDeleteInput) {
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
    let targetRoleId: string | null = null;
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
      const targetRole = this.getRoleById(resolved);
      if (!targetRole) {
        throw new Error('Target role not found.');
      }
      targetRoleId = targetRole.id;
      this.users.forEach(user => {
        if (!user.roles.some(r => r.roleId === id)) return;
        user.roles = user.roles.filter(r => r.roleId !== id);
        if (!user.roles.some(r => r.roleId === targetRole.id)) {
          user.roles.push({ churchId: targetRole.churchId, roleId: targetRole.id });
        }
        reassigned += 1;
      });
    }
    this.roles.splice(roleIndex, 1);
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'role.hard-deleted',
      entity: 'role',
      entityId: role.id,
      summary: `${actorName} permanently deleted role ${role.name}`,
      metadata: {
        reassignedTo: targetRoleId,
        reassignedCount: reassigned,
      },
    });
    return { deleted: true, reassigned };
  }

  // Undelete methods (admin only)
  undeleteUser(id: string, input: { actorUserId: string }) {
    const user = this.users.find(u => u.id === id);
    if (!user || !user.deletedAt) {
      return { success: false, reason: 'User not found or not deleted' };
    }
    user.deletedAt = undefined;
    const actorName = this.getUserName(input.actorUserId);
    const targetName =
      `${user.profile.firstName} ${user.profile.lastName}`.trim() || user.primaryEmail;
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'user.undeleted',
      entity: 'user',
      entityId: user.id,
      summary: `${actorName} restored ${targetName} to the directory`,
      metadata: {
        userId: user.id,
        email: user.primaryEmail,
      },
    });
    return { success: true };
  }

  undeleteEvent(id: string, input: { actorUserId: string }) {
    const event = this.events.find(e => e.id === id);
    if (!event || !event.deletedAt) {
      return { success: false, reason: 'Event not found or not deleted' };
    }
    event.deletedAt = undefined;
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'event.undeleted',
      entity: 'event',
      entityId: event.id,
      summary: `${actorName} restored event ${event.title}`,
      metadata: {
        eventId: event.id,
        startAt: event.startAt,
      },
    });
    return { success: true };
  }

  undeleteRole(id: string, input: { actorUserId: string }) {
    const role = this.roles.find(r => r.id === id);
    if (!role || !role.deletedAt) {
      return { success: false, reason: 'Role not found or not deleted' };
    }
    role.deletedAt = undefined;
    const actorName = this.getUserName(input.actorUserId);
    this.createAuditLog({
      actorUserId: input.actorUserId,
      action: 'role.undeleted',
      entity: 'role',
      entityId: role.id,
      summary: `${actorName} restored role ${role.name}`,
      metadata: {
        roleId: role.id,
      },
    });
    return { success: true };
  }

  // Admin methods to view deleted items
  listDeletedUsers(query?: string) {
    const lower = query?.toLowerCase();
    const list = this.users
      .filter(user => {
        if (!user.deletedAt) return false;
        if (!lower) return true;
        const profile = user.profile;
        return (
          user.primaryEmail.toLowerCase().includes(lower) ||
          profile.firstName.toLowerCase().includes(lower) ||
          profile.lastName.toLowerCase().includes(lower)
        );
      })
      .map(user => ({
        ...this.buildUserPayload(user),
        deletedAt: user.deletedAt,
      }));
    return clone(list) as any;
  }

  listDeletedEvents() {
    return clone(
      this.events
        .filter(event => event.deletedAt)
        .map(event => ({
          ...event,
          deletedAt: event.deletedAt,
        }))
    );
  }

  listDeletedRoles() {
    return clone(
      this.roles
        .filter(role => role.deletedAt)
        .map(role => ({
          ...role,
          deletedAt: role.deletedAt,
        }))
    );
  }

  bulkCreateInvitations(
    churchId: string,
    emails: string[],
    roleId: string | undefined,
    actorUserId: string,
    type: 'team' | 'member' = 'team'
  ): MockInvitation[] {
    const invitations: MockInvitation[] = [];
    const errors: string[] = [];

    for (const email of emails) {
      try {
        const invitation = this.createInvitation(churchId, email, roleId, actorUserId, type);
        invitations.push(invitation);
      } catch (error) {
        errors.push(`${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Some invitations failed to create: ${errors.join(', ')}`);
    }

    return invitations;
  }
}

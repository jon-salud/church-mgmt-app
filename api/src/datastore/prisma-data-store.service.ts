import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { DataStore } from './data-store.types';

const toISO = (value: Date | null | undefined) => (value ? value.toISOString() : null);

const toNumber = (value: any) => (value === null || value === undefined ? value : Number(value));

type StoreReturn<T extends keyof DataStore> = Awaited<ReturnType<DataStore[T]>>;

@Injectable()
export class PrismaDataStore implements DataStore {
  constructor(private readonly prisma: PrismaService) {}

  private get client(): any {
    return this.prisma as any;
  }

  private async getPrimaryChurchId(): Promise<string> {
    const church = await this.client.church.findFirst();
    if (!church) {
      throw new Error('No church found. Run prisma seed before using DATA_MODE=prisma.');
    }
    return church.id;
  }

  async getChurch() {
    const church = await this.client.church.findFirst();
    if (!church) {
      throw new Error('No church found. Run prisma seed before using DATA_MODE=prisma.');
    }
    return church;
  }

  async getDashboardSnapshot(churchId: string) {
    const [memberCount, groupCount, upcomingEvents, announcements, reads, contributionsLast30] = await Promise.all([
      this.client.churchUser.count({ where: { churchId } }),
      this.client.group.count({ where: { churchId } }),
      this.client.event.count({ where: { churchId, startAt: { gte: new Date() } } }),
      this.client.announcement.findMany({ where: { churchId } }),
      this.client.announcementRead.groupBy({ by: ['announcementId'], _count: { _all: true } }),
      this.client.contribution.findMany({
        where: {
          churchId,
          date: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
        },
      }),
    ]);

    const readsLookup = new Map((reads as any[]).map((read: any) => [read.announcementId, read._count._all] as const));
    const unreadAnnouncements = (announcements as any[]).filter((announcement: any) => {
      const readCount = readsLookup.get(announcement.id) ?? 0;
      return readCount < memberCount;
    }).length;

    const totalGivingLast30 = (contributionsLast30 as any[]).reduce(
      (sum: number, entry: any) => sum + toNumber(entry.amount || 0),
      0,
    );

    return {
      memberCount,
      groupCount,
      upcomingEvents,
      unreadAnnouncements,
      totalGivingLast30,
    };
  }

  async listUsers(q?: string) {
    const users = await this.client.user.findMany({
      where: q
        ? {
            OR: [
              { primaryEmail: { contains: q, mode: 'insensitive' } },
              { profile: { firstName: { contains: q, mode: 'insensitive' } } },
              { profile: { lastName: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      include: {
        profile: true,
        churches: true,
        groupMembers: { include: { group: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return (users as any[]).map((user: any) => ({
      id: user.id,
      primaryEmail: user.primaryEmail,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      roles: (user.churches as any[]).map((churchUser: any) => ({
        churchId: churchUser.churchId,
        roleId: churchUser.roleId ?? churchUser.role,
        role: churchUser.role,
        permissions: [],
        isSystem: false,
        isDeletable: true,
      })),
      groups: (user.groupMembers as any[]).map((member: any) => ({
        id: member.groupId,
        name: member.group?.name,
        role: member.role,
      })),
    }));
  }

  async getUserById(id: string) {
    const user = await this.client.user.findUnique({
      where: { id },
      include: { profile: true, churches: true },
    });
    if (!user) return null;
    return {
      ...user,
      roles: (user.churches as any[]).map((churchUser: any) => ({
        churchId: churchUser.churchId,
        roleId: churchUser.roleId ?? churchUser.role,
        role: churchUser.role,
        permissions: [],
        isSystem: false,
        isDeletable: true,
      })),
    };
  }

  async getUserByEmail(email: string) {
    const user = await this.client.user.findUnique({
      where: { primaryEmail: email },
      include: { profile: true, churches: true },
    });
    if (!user) return null;
    return {
      ...user,
      roles: (user.churches as any[]).map((churchUser: any) => ({
        churchId: churchUser.churchId,
        roleId: churchUser.roleId ?? churchUser.role,
        role: churchUser.role,
        permissions: [],
        isSystem: false,
        isDeletable: true,
      })),
    };
  }

  async getUserProfile(id: string) {
    const user = await this.client.user.findUnique({
      where: { id },
      include: {
        profile: true,
        churches: true,
        groupMembers: { include: { group: true } },
        attendances: { include: { event: true } },
        contributions: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      primaryEmail: user.primaryEmail,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      profile: user.profile,
      roles: (user.churches as any[]).map((churchUser: any) => ({ churchId: churchUser.churchId, role: churchUser.role })),
      groups: (user.groupMembers as any[]).map((member: any) => ({
        id: member.groupId,
        name: member.group?.name,
        role: member.role,
        type: member.group?.type,
      })),
      attendance: (user.attendances as any[]).map((record: any) => ({
        eventId: record.eventId,
        title: record.event?.title,
        startAt: toISO(record.event?.startAt) ?? '',
        status: record.status,
      })),
      contributions: (user.contributions as any[]).map((contribution: any) => ({
        contributionId: contribution.id,
        amount: toNumber(contribution.amount),
        date: toISO(contribution.date) ?? '',
        fundId: contribution.fundId,
        method: contribution.method,
      })),
    };
  }

  async createUser(input: Parameters<DataStore['createUser']>[0]) {
    const churchId = await this.getPrimaryChurchId();
    const household = await this.client.household.create({
      data: {
        churchId,
        name: `${input.lastName} Family`,
        address: input.address,
      },
    });
    const user = await this.client.user.create({
      data: {
        primaryEmail: input.primaryEmail,
        status: input.status ?? 'active',
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            notes: input.notes,
            householdId: household.id,
          },
        },
        churches: {
          create: {
            churchId,
            role: 'Member',
          },
        },
      },
    });
    return this.getUserById(user.id);
  }

  async updateUser(id: string, input: Parameters<DataStore['updateUser']>[1]) {
    const user = await this.client.user.findUnique({ where: { id }, include: { profile: true } });
    if (!user) return null;

    if (input.address && user.profile) {
      await this.client.household.update({
        where: { id: user.profile.householdId },
        data: { address: input.address },
      });
    }

    const updatedUser = await this.client.user.update({
      where: { id },
      data: {
        primaryEmail: input.primaryEmail,
        status: input.status,
        profile: {
          update: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone,
            notes: input.notes,
            membershipStatus: input.membershipStatus,
            joinMethod: input.joinMethod,
            joinDate: input.joinDate,
            previousChurch: input.previousChurch,
            baptismDate: input.baptismDate,
            spiritualGifts: input.spiritualGifts,
            coursesAttended: input.coursesAttended,
            maritalStatus: input.maritalStatus,
            occupation: input.occupation,
            school: input.school,
            gradeLevel: input.gradeLevel,
            graduationYear: input.graduationYear,
            skillsAndInterests: input.skillsAndInterests,
            backgroundCheckStatus: input.backgroundCheckStatus,
            backgroundCheckDate: input.backgroundCheckDate,
            onboardingComplete: input.onboardingComplete,
            emergencyContactName: input.emergencyContactName,
            emergencyContactPhone: input.emergencyContactPhone,
            allergiesOrMedicalNotes: input.allergiesOrMedicalNotes,
            parentalConsentOnFile: input.parentalConsentOnFile,
            pastoralNotes: input.pastoralNotes,
          },
        },
      },
    });
    return this.getUserById(updatedUser.id);
  }

  async deleteUser(id: string, input: Parameters<DataStore['deleteUser']>[1]): Promise<StoreReturn<'deleteUser'>> {
    throw new Error('deleteUser is not yet implemented for Prisma data store');
  }

  async listHouseholds(churchId?: string) {
    const church = churchId ?? (await this.getPrimaryChurchId());
    return this.client.household.findMany({
      where: { churchId: church },
      include: { profiles: true },
      orderBy: { name: 'asc' },
    });
  }

  async getHouseholdById(id: string) {
    return this.client.household.findUnique({
      where: { id },
      include: { profiles: { include: { user: true } } },
    });
  }

  async getSettings(churchId: string) {
    const settings = await this.client.settings.findUnique({
      where: { churchId },
    });
    if (!settings || !settings.optionalFields) {
      return {};
    }
    try {
      return JSON.parse(settings.optionalFields);
    } catch (error) {
      return {};
    }
  }

  async updateSettings(churchId: string, settings: any) {
    const optionalFields = JSON.stringify(settings.optionalFields);
    const result = await this.client.settings.upsert({
      where: { churchId },
      update: { optionalFields },
      create: { churchId, optionalFields },
    });
    if (!result || !result.optionalFields) {
      return {};
    }
    try {
      return JSON.parse(result.optionalFields);
    } catch (error) {
      return {};
    }
  }

  async listRoles(): Promise<StoreReturn<'listRoles'>> {
    return [];
  }

  async createRole(input: Parameters<DataStore['createRole']>[0]): Promise<StoreReturn<'createRole'>> {
    throw new Error('Role management is not yet implemented for Prisma data store');
  }

  async updateRole(id: string, input: Parameters<DataStore['updateRole']>[1]): Promise<StoreReturn<'updateRole'>> {
    throw new Error('Role management is not yet implemented for Prisma data store');
  }

  async deleteRole(id: string, input: Parameters<DataStore['deleteRole']>[1]): Promise<StoreReturn<'deleteRole'>> {
    throw new Error('Role management is not yet implemented for Prisma data store');
  }

  async listGroups(churchId?: string) {
    const church = churchId ?? (await this.getPrimaryChurchId());
    return this.client.group.findMany({
      where: { churchId: church },
      include: { members: true },
      orderBy: { name: 'asc' },
    });
  }

  async getGroupById(id: string) {
    return this.client.group.findUnique({
      where: { id },
      include: { members: { include: { user: { include: { profile: true } } } } },
    });
  }

  async getGroupMembers(groupId: string) {
    return this.client.groupMember.findMany({
      where: { groupId },
      include: { user: { include: { profile: true } } },
    });
  }

  async addGroupMember(
    groupId: string,
    input: Parameters<DataStore['addGroupMember']>[1],
  ): Promise<StoreReturn<'addGroupMember'>> {
    throw new Error('addGroupMember is not yet implemented for Prisma data store');
  }

  async updateGroupMember(
    groupId: string,
    userId: string,
    input: Parameters<DataStore['updateGroupMember']>[2],
  ): Promise<StoreReturn<'updateGroupMember'>> {
    throw new Error('updateGroupMember is not yet implemented for Prisma data store');
  }

  async removeGroupMember(
    groupId: string,
    userId: string,
    input: Parameters<DataStore['removeGroupMember']>[2],
  ): Promise<StoreReturn<'removeGroupMember'>> {
    throw new Error('removeGroupMember is not yet implemented for Prisma data store');
  }

  async listEvents() {
    const churchId = await this.getPrimaryChurchId();
    const events = await this.client.event.findMany({
      where: { churchId },
      include: { attendances: true },
      orderBy: { startAt: 'asc' },
    });

    return (events as any[]).map((event: any) => ({
      ...event,
      startAt: toISO(event.startAt)!,
      endAt: toISO(event.endAt)!,
      attendance: (event.attendances as any[]).map((entry: any) => ({
        ...entry,
        recordedAt: toISO(entry.recordedAt)!,
      })),
    }));
  }

  async getEventById(id: string) {
    const event = await this.client.event.findUnique({
      where: { id },
      include: { attendances: true },
    });
    if (!event) return null;
    return {
      ...event,
      startAt: toISO(event.startAt)!,
      endAt: toISO(event.endAt)!,
      attendance: (event.attendances as any[]).map((entry: any) => ({
        ...entry,
        recordedAt: toISO(entry.recordedAt)!,
      })),
    };
  }

  async createEvent(input: Parameters<DataStore['createEvent']>[0]): Promise<StoreReturn<'createEvent'>> {
    throw new Error('createEvent is not yet implemented for Prisma data store');
  }

  async updateEvent(id: string, input: Parameters<DataStore['updateEvent']>[1]): Promise<StoreReturn<'updateEvent'>> {
    throw new Error('updateEvent is not yet implemented for Prisma data store');
  }

  async deleteEvent(id: string, input: Parameters<DataStore['deleteEvent']>[1]): Promise<StoreReturn<'deleteEvent'>> {
    throw new Error('deleteEvent is not yet implemented for Prisma data store');
  }

  async recordAttendance(input: Parameters<DataStore['recordAttendance']>[0]) {
    const record = await this.client.attendance.upsert({
      where: { eventId_userId: { eventId: input.eventId, userId: input.userId } },
      update: {
        status: input.status,
        note: input.note,
        recordedBy: input.recordedBy,
        recordedAt: new Date(),
      },
      create: {
        eventId: input.eventId,
        userId: input.userId,
        status: input.status,
        note: input.note,
        recordedBy: input.recordedBy,
      },
    });
    return {
      ...record,
      recordedAt: toISO(record.recordedAt)!,
    };
  }

  async listAnnouncements(churchId?: string) {
    const church = churchId ?? (await this.getPrimaryChurchId());
    const announcements = await this.client.announcement.findMany({
      where: { churchId: church },
      include: { reads: true },
      orderBy: { publishAt: 'desc' },
    });
    return (announcements as any[]).map((item: any) => ({
      ...item,
      publishAt: toISO(item.publishAt)!,
      expireAt: toISO(item.expireAt),
      reads: (item.reads as any[]).map((read: any) => ({ ...read, readAt: toISO(read.readAt)! })),
    }));
  }

  async markAnnouncementRead(announcementId: string, userId: string) {
    const read = await this.client.announcementRead.upsert({
      where: { announcementId_userId: { announcementId, userId } },
      update: { readAt: new Date() },
      create: { announcementId, userId },
    });
    return { ...read, readAt: toISO(read.readAt)! };
  }

  async createAnnouncement(
    _input: Parameters<DataStore['createAnnouncement']>[0],
  ): Promise<any> {
    throw new Error('Not implemented: createAnnouncement');
  }

  async updateAnnouncement(
    _id: string,
    _input: Parameters<DataStore['updateAnnouncement']>[1],
  ): Promise<any> {
    throw new Error('Not implemented: updateAnnouncement');
  }

  async listFunds() {
    const churchId = await this.getPrimaryChurchId();
    return this.client.fund.findMany({ where: { churchId } });
  }

  async listContributions(filter?: { memberId?: string; fundId?: string; from?: string; to?: string }) {
    const churchId = await this.getPrimaryChurchId();
    const contributions = await this.client.contribution.findMany({
      where: {
        churchId,
        memberId: filter?.memberId,
        fundId: filter?.fundId,
        date: {
          gte: filter?.from ? new Date(filter.from) : undefined,
          lte: filter?.to ? new Date(filter.to) : undefined,
        },
      },
      orderBy: { date: 'desc' },
    });
    return (contributions as any[]).map((contribution: any) => ({
      ...contribution,
      amount: toNumber(contribution.amount),
      date: toISO(contribution.date)!,
    }));
  }

  async recordContribution(input: { memberId: string; amount: number; date: string; fundId?: string; method: string; note?: string; recordedBy?: string }) {
    const churchId = await this.getPrimaryChurchId();
    const contribution = await this.client.contribution.create({
      data: {
        churchId,
        memberId: input.memberId,
        amount: input.amount,
        date: new Date(input.date),
        fundId: input.fundId,
        method: input.method,
        note: input.note,
      },
    });
    return {
      ...contribution,
      amount: toNumber(contribution.amount),
      date: toISO(contribution.date)!,
    };
  }

  async updateContribution(
    _id: string,
    _input: Parameters<DataStore['updateContribution']>[1],
  ): Promise<any> {
    throw new Error('Not implemented: updateContribution');
  }

  async getGivingSummary(_churchId: string): Promise<any> {
    throw new Error('Not implemented: getGivingSummary');
  }

  async exportContributionsCsv(
    _input?: Parameters<DataStore['exportContributionsCsv']>[0],
  ): Promise<any> {
    throw new Error('Not implemented: exportContributionsCsv');
  }

  async createSession(email: string, provider: string, requestedRole?: string) {
    let user = await this.client.user.findUnique({ where: { primaryEmail: email }, include: { churches: true, profile: true } });
    if (!user) {
      throw new Error('User not found for demo login. Use one of the seeded accounts.');
    }

    const churchId = await this.getPrimaryChurchId();
    const existingRole = (user.churches as any[]).find(
      (churchUser: any) => churchUser.churchId === churchId && (!requestedRole || churchUser.role === requestedRole),
    );
    if (!existingRole) {
      await this.client.churchUser.upsert({
        where: { churchId_userId: { churchId, userId: user.id } },
        update: { role: (requestedRole as any) ?? 'Member' },
        create: { churchId, userId: user.id, role: (requestedRole as any) ?? 'Member' },
      });
      user = await this.client.user.findUnique({ where: { id: user.id }, include: { churches: true, profile: true } })!;
    }

    const session = await this.client.demoSession.create({
      data: {
        token: crypto.randomUUID(),
        userId: user.id,
        provider,
      },
    });

    return {
      session,
      user: {
        ...user,
        profile: user.profile,
        roles: ((user.churches ?? []) as any[]).map((churchUser: any) => ({ churchId: churchUser.churchId, role: churchUser.role })),
      },
    };
  }

  async getSessionByToken(token?: string) {
    if (!token) return null;
    const session = await this.client.demoSession.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            profile: true,
            churches: true,
          },
        },
      },
    });
    if (!session) return null;
    return {
      session: { token: session.token, userId: session.userId, provider: session.provider, createdAt: session.createdAt },
      user: {
        ...session.user,
        roles: (session.user.churches as any[]).map((churchUser: any) => ({ churchId: churchUser.churchId, role: churchUser.role })),
      },
    };
  }

  async upsertUserFromOAuth(input: {
    provider: 'google' | 'facebook';
    providerUserId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  }) {
    const { provider, providerUserId, email, firstName, lastName, picture } = input;
    const churchId = await this.getPrimaryChurchId();

    const account = await this.client.oAuthAccount.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
      include: {
        user: { include: { profile: true, churches: true } },
      },
    });

    if (account?.user) {
      await this.client.user.update({
        where: { id: account.user.id },
        data: { lastLoginAt: new Date() },
      });
      const hydrated = await this.getUserById(account.user.id);
      return { user: hydrated!, created: false };
    }

    let user = await this.client.user.findUnique({
      where: { primaryEmail: email },
      include: { profile: true, churches: true },
    });
    let created = false;

    if (!user) {
      user = await this.client.user.create({
        data: {
          primaryEmail: email,
          status: 'active',
          lastLoginAt: new Date(),
          profile: {
            create: {
              firstName: firstName || 'New',
              lastName: lastName || 'Member',
              photoUrl: picture,
            },
          },
          churches: {
            create: {
              churchId,
              role: 'Member',
            },
          },
        },
        include: { profile: true, churches: true },
      });
      created = true;
    } else {
      await this.client.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          profile: {
            upsert: {
              create: {
                firstName: firstName || 'New',
                lastName: lastName || 'Member',
                photoUrl: picture,
              },
              update: {
                firstName: firstName ?? undefined,
                lastName: lastName ?? undefined,
                photoUrl: picture ?? undefined,
              },
            },
          },
        },
      });
      const hasChurch = (user.churches as any[]).some((churchUser: any) => churchUser.churchId === churchId);
      if (!hasChurch) {
        await this.client.churchUser.upsert({
          where: { churchId_userId: { churchId, userId: user.id } },
          update: {},
          create: { churchId, userId: user.id, role: 'Member' },
        });
      }
    }

    await this.client.oAuthAccount.upsert({
      where: { provider_providerUserId: { provider, providerUserId } },
      update: { userId: user.id },
      create: { provider, providerUserId, userId: user.id },
    });

    const hydrated = await this.getUserById(user.id);
    return { user: hydrated!, created };
  }

  async listAuditLogs(filter?: { churchId?: string; actorUserId?: string; entity?: string; entityId?: string; from?: string; to?: string; page?: number; pageSize?: number }) {
    const churchId = filter?.churchId ?? (await this.getPrimaryChurchId());
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const pageSizeRaw = filter?.pageSize && filter.pageSize > 0 ? filter.pageSize : 20;
    const pageSize = Math.min(pageSizeRaw, 100);

    const where = {
      churchId,
      actorUserId: filter?.actorUserId,
      entity: filter?.entity,
      entityId: filter?.entityId,
      createdAt: {
        gte: filter?.from ? new Date(filter.from) : undefined,
        lte: filter?.to ? new Date(filter.to) : undefined,
      },
    };

    const [total, items] = await this.client.$transaction([
      this.client.auditLog.count({ where }),
      this.client.auditLog.findMany({
        where,
        include: { actor: { include: { profile: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      items: (items as any[]).map((item: any) => ({
        ...item,
        createdAt: toISO(item.createdAt)!,
      })),
      meta: { total, page, pageSize },
    };
  }

  async createAuditLog(input: Parameters<DataStore['createAuditLog']>[0]) {
    const log = await this.client.auditLog.create({ data: input });
    return { ...log, createdAt: toISO(log.createdAt)! };
  }
}

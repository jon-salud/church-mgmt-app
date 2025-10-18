import { Injectable } from '@nestjs/common';
import crypto from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { DataStore } from './data-store.types';

const toISO = (value: Date | null | undefined) => (value ? value.toISOString() : null);

const toNumber = (value: any) => (value === null || value === undefined ? value : Number(value));

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
      roles: (user.churches as any[]).map((churchUser: any) => ({ churchId: churchUser.churchId, role: churchUser.role })),
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
      roles: (user.churches as any[]).map((churchUser: any) => ({ churchId: churchUser.churchId, role: churchUser.role })),
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
      roles: (user.churches as any[]).map((churchUser: any) => ({ churchId: churchUser.churchId, role: churchUser.role })),
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

  async listFunds() {
    const churchId = await this.getPrimaryChurchId();
    return this.client.fund.findMany({ where: { churchId } });
  }

  async listContributions(filter?: { memberId?: string; fundId?: string }) {
    const churchId = await this.getPrimaryChurchId();
    const contributions = await this.client.contribution.findMany({
      where: {
        churchId,
        memberId: filter?.memberId,
        fundId: filter?.fundId,
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

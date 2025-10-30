import { Injectable, Logger, Inject, ExecutionContext } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TenantPrismaService, SystemPrismaService } from '../prisma/prisma-multi-tenant.service';
import { TenantContextService } from '../tenant/tenant-context.service';

interface UserDeleteInput {
  actorUserId: string;
}

interface GroupMemberRemoveInput {
  actorUserId: string;
}

interface GroupResourceDeleteInput {
  actorUserId: string;
}

interface EventDeleteInput {
  actorUserId: string;
}

export interface DataStore {
  // User operations
  getUser(id: string): Promise<any>;
  getUsers(): Promise<any[]>;
  createUser(user: any): Promise<any>;
  updateUser(id: string, user: any): Promise<any>;
  deleteUser(id: string, input: UserDeleteInput): Promise<{ success: boolean }>;

  // Group operations
  getGroup(id: string): Promise<any>;
  getGroups(): Promise<any[]>;
  createGroup(group: any): Promise<any>;
  updateGroup(id: string, group: any): Promise<any>;
  deleteGroup(id: string): Promise<void>;

  // Event operations
  getEvent(id: string): Promise<any>;
  getEvents(): Promise<any[]>;
  createEvent(event: any): Promise<any>;
  updateEvent(id: string, event: any): Promise<any>;
  deleteEvent(id: string, input: EventDeleteInput): Promise<{ success: boolean }>;

  // And so on for other entities...
}

@Injectable()
export class PrismaMultiTenantDataStore implements DataStore {
  private readonly logger = new Logger(PrismaMultiTenantDataStore.name);

  constructor(
    private readonly tenantPrisma: TenantPrismaService,
    private readonly systemPrisma: SystemPrismaService,
    private readonly tenantContext: TenantContextService
  ) {}

  /**
   * Get tenant-aware Prisma client for the current tenant
   */
  private async getTenantClient(
    context?: ExecutionContext
  ): Promise<InstanceType<typeof TenantPrismaService>> {
    const tenantContext = context
      ? this.tenantContext.getTenantContext(context)
      : { tenantId: 'default-tenant' }; // Fallback for non-context calls

    const databaseUrl = await this.tenantContext.getTenantDatabaseUrl(tenantContext.tenantId);
    return this.tenantPrisma.getTenantClient(tenantContext.tenantId, databaseUrl);
  }

  // User operations
  async getUser(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        household: true,
        _count: {
          select: {
            groups: true,
            attendance: true,
            contributions: true,
          },
        },
      },
    });
  }

  async getUsers(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        household: true,
      },
    });
  }

  async createUser(user: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.user.create({
      data: user,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        household: true,
      },
    });
  }

  async updateUser(id: string, user: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.user.update({
      where: { id },
      data: user,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        household: true,
      },
    });
  }

  async deleteUser(id: string, input: UserDeleteInput): Promise<{ success: boolean }> {
    const client = await this.getTenantClient();
    const user = await client.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { success: false };
    }

    // Soft delete - set deletedAt timestamp
    await client.user.update({
      where: { id },
      data: { deletedAt: new Date().toISOString() },
    });

    // TODO: Add audit log
    return { success: true };
  }

  // Group operations
  async getGroup(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.group.findUnique({
      where: { id, deletedAt: null },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        resources: true,
      },
    });
  }

  async getGroups(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.group.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        resources: true,
      },
    });
  }

  async createGroup(group: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.group.create({
      data: group,
      include: {
        members: {
          include: {
            user: true,
          },
        },
        resources: true,
      },
    });
  }

  async updateGroup(id: string, group: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.group.update({
      where: { id },
      data: group,
      include: {
        members: {
          include: {
            user: true,
          },
        },
        resources: true,
      },
    });
  }

  async deleteGroup(id: string, context?: ExecutionContext): Promise<void> {
    const client = await this.getTenantClient(context);
    await client.group.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Event operations
  async getEvent(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.event.findUnique({
      where: { id, deletedAt: null },
      include: {
        attendance: {
          include: {
            user: true,
          },
        },
        volunteerRoles: {
          include: {
            signups: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async getEvents(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.event.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        attendance: {
          include: {
            user: true,
          },
        },
        volunteerRoles: {
          include: {
            signups: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async createEvent(event: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.event.create({
      data: event,
      include: {
        attendance: {
          include: {
            user: true,
          },
        },
        volunteerRoles: {
          include: {
            signups: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async updateEvent(id: string, event: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.event.update({
      where: { id },
      data: event,
      include: {
        attendance: {
          include: {
            user: true,
          },
        },
        volunteerRoles: {
          include: {
            signups: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteEvent(id: string, input: EventDeleteInput): Promise<{ success: boolean }> {
    const client = await this.getTenantClient();
    const event = await client.event.findUnique({
      where: { id },
    });

    if (!event) {
      return { success: false };
    }

    // Soft delete - set deletedAt timestamp
    await client.event.update({
      where: { id },
      data: { deletedAt: new Date().toISOString() },
    });

    // TODO: Add audit log
    return { success: true };
  }

  // Additional methods to match MockDatabaseService interface
  async listHouseholds(churchId?: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    const households = await client.household.findMany({
      where: churchId ? { churchId } : {},
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return households.map((household: any) => ({
      ...household,
      memberCount: household.members.length,
      members: household.members,
    }));
  }

  async getHouseholdById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const household = await client.household.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!household) return null;

    return {
      ...household,
      members: household.members,
    };
  }

  async getHouseholdMembers(householdId: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    const members = await client.householdMember.findMany({
      where: { householdId },
      include: {
        user: true,
      },
    });

    return members.map((member: any) => member.user);
  }

  async listUsers(query?: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    const users = await client.user.findMany({
      where: {
        deletedAt: null,
        OR: query
          ? [
              { primaryEmail: { contains: query, mode: 'insensitive' } },
              { profile: { firstName: { contains: query, mode: 'insensitive' } } },
              { profile: { lastName: { contains: query, mode: 'insensitive' } } },
            ]
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        household: true,
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    return users.map((user: any) => ({
      ...user,
      groups: user.groups.map((g: any) => g.group),
    }));
  }

  async getUserById(id: string, context?: ExecutionContext): Promise<any> {
    return this.getUser(id, context);
  }

  async getUserProfile(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const user = await client.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        household: true,
        groups: {
          include: {
            group: true,
          },
        },
        attendance: {
          include: {
            event: true,
          },
        },
        contributions: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      groups: user.groups.map((g: any) => g.group),
    };
  }

  async getUserByEmail(email: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.user.findUnique({
      where: {
        primaryEmail: email,
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async listGroups(churchId?: string, context?: ExecutionContext): Promise<any[]> {
    return this.getGroups(context);
  }

  async getGroupById(id: string, context?: ExecutionContext): Promise<any> {
    return this.getGroup(id, context);
  }

  async getGroupMembers(groupId: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    const members = await client.groupMember.findMany({
      where: { groupId },
      include: {
        user: true,
      },
    });

    return members.map((member: any) => ({
      ...member,
      user: member.user,
    }));
  }

  async addGroupMember(groupId: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const member = await client.groupMember.create({
      data: {
        groupId,
        userId: input.userId,
        role: input.role || 'Member',
        status: input.status || 'Active',
        joinedAt: input.joinedAt || new Date(),
      },
      include: {
        user: true,
      },
    });

    return {
      ...member,
      user: member.user,
    };
  }

  async updateGroupMember(
    groupId: string,
    userId: string,
    input: any,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    const member = await client.groupMember.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: input,
      include: {
        user: true,
      },
    });

    return {
      ...member,
      user: member.user,
    };
  }

  async removeGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberRemoveInput,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    return { success: true };
  }

  async getGroupResources(groupId: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.groupResource.findMany({
      where: { groupId },
    });
  }

  async createGroupResource(groupId: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.groupResource.create({
      data: {
        groupId,
        title: input.title,
        url: input.url,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateGroupResource(
    resourceId: string,
    input: any,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.groupResource.update({
      where: { id: resourceId },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    });
  }

  async deleteGroupResource(
    resourceId: string,
    input: GroupResourceDeleteInput,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.groupResource.delete({
      where: { id: resourceId },
    });

    return { success: true };
  }

  async listEvents(context?: ExecutionContext): Promise<any[]> {
    return this.getEvents(context);
  }

  async listEventsByGroupId(groupId: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.event.findMany({
      where: {
        groupId,
        deletedAt: null,
      },
      include: {
        attendance: {
          include: {
            user: true,
          },
        },
        volunteerRoles: {
          include: {
            signups: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async getEventById(id: string, context?: ExecutionContext): Promise<any> {
    return this.getEvent(id, context);
  }

  async recordAttendance(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);

    const existing = await client.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId: input.eventId,
          userId: input.userId,
        },
      },
    });

    if (existing) {
      return client.eventAttendance.update({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: input.userId,
          },
        },
        data: {
          status: input.status,
          note: input.note,
          recordedBy: input.recordedBy || input.userId,
          recordedAt: new Date(),
        },
      });
    } else {
      return client.eventAttendance.create({
        data: {
          eventId: input.eventId,
          userId: input.userId,
          status: input.status,
          note: input.note,
          recordedBy: input.recordedBy || input.userId,
          recordedAt: new Date(),
        },
      });
    }
  }

  async createEventVolunteerRole(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.eventVolunteerRole.create({
      data: {
        eventId: input.eventId,
        name: input.name,
        needed: input.needed,
      },
    });
  }

  async updateEventVolunteerRole(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.eventVolunteerRole.update({
      where: { id },
      data: input,
    });
  }

  async deleteEventVolunteerRole(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.eventVolunteerRole.delete({
      where: { id },
    });

    return { success: true };
  }

  async createEventVolunteerSignup(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.eventVolunteerSignup.create({
      data: {
        volunteerRoleId: input.volunteerRoleId,
        userId: input.userId,
      },
    });
  }

  async deleteEventVolunteerSignup(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.eventVolunteerSignup.delete({
      where: { id },
    });

    return { success: true };
  }

  async getEventVolunteerSignupById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.eventVolunteerSignup.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  // Placeholder implementations for remaining methods
  // These would need full implementation based on the Prisma schema
  async getChurch(context?: ExecutionContext): Promise<any> {
    // Return default church - in multi-tenant, this might be tenant-specific
    return {
      id: 'default-church',
      name: 'Default Church',
      settings: {},
    };
  }

  async listRoles(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.role.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async getRole(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.role.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async createRole(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.role.create({
      data: input,
    });
  }

  async updateRole(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.role.update({
      where: { id },
      data: input,
    });
  }

  async deleteRole(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { deleted: true, reassigned: 0 };
  }

  async listAnnouncements(churchId?: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.announcement.findMany({
      where: churchId ? { churchId } : {},
      include: {
        reads: true,
      },
    });
  }

  async markAnnouncementRead(
    announcementId: string,
    userId: string,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);

    const existing = await client.announcementRead.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return client.announcementRead.create({
      data: {
        announcementId,
        userId,
        readAt: new Date(),
      },
    });
  }

  async createAnnouncement(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.announcement.create({
      data: input,
    });
  }

  async updateAnnouncement(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.announcement.update({
      where: { id },
      data: input,
    });
  }

  async listFunds(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.fund.findMany();
  }

  async listContributions(filter?: any, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    const where: any = {};

    if (filter?.memberId) {
      where.memberId = filter.memberId;
    }
    if (filter?.fundId) {
      where.fundId = filter.fundId;
    }
    if (filter?.from) {
      where.date = { ...where.date, gte: new Date(filter.from) };
    }
    if (filter?.to) {
      where.date = { ...where.date, lte: new Date(filter.to) };
    }

    const contributions = await client.contribution.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return contributions;
  }

  async recordContribution(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.contribution.create({
      data: input,
    });
  }

  async updateContribution(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.contribution.update({
      where: { id },
      data: input,
    });
  }

  async getGivingSummary(churchId: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const contributions = await client.contribution.findMany({
      where: { churchId },
    });

    const total = contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
    const count = contributions.length;
    const average = count > 0 ? total / count : 0;

    // Group by month and fund
    const monthlyTotals = new Map<string, number>();
    const fundTotals = new Map<string, number>();

    contributions.forEach((c: any) => {
      const monthKey = c.date.toISOString().slice(0, 7); // YYYY-MM
      monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + c.amount);
      const fundKey = c.fundId || 'general';
      fundTotals.set(fundKey, (fundTotals.get(fundKey) || 0) + c.amount);
    });

    const byFund = Array.from(fundTotals.entries()).map(([fundId, amount]: [string, number]) => ({
      fundId: fundId === 'general' ? null : fundId,
      name: fundId === 'general' ? 'General' : `Fund ${fundId}`,
      amount,
    }));

    const monthly = Array.from(monthlyTotals.entries())
      .map(([month, amount]: [string, number]) => ({ month, amount }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);

    return {
      totals: {
        overall: total,
        monthToDate: 0, // Would need current month calculation
        previousMonth: 0, // Would need previous month calculation
        averageGift: average,
      },
      byFund,
      monthly,
    };
  }

  async exportContributionsCsv(filter?: any, context?: ExecutionContext): Promise<any> {
    const contributions = await this.listContributions(filter, context);

    const csvContent = [
      ['Contribution ID', 'Date', 'Member', 'Email', 'Fund', 'Amount', 'Method', 'Note'].join(','),
      ...contributions.map((c: any) =>
        [
          c.id,
          c.date.toISOString().split('T')[0],
          'Member Name', // Would need to join with user data
          'member@email.com', // Would need to join with user data
          c.fundId || 'General',
          c.amount.toFixed(2),
          c.method,
          c.note || '',
        ].join(',')
      ),
    ].join('\n');

    return {
      filename: `contributions-${new Date().toISOString().split('T')[0]}.csv`,
      content: csvContent,
    };
  }

  async listAuditLogs(filter?: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const where: any = {};

    if (filter?.churchId) where.churchId = filter.churchId;
    if (filter?.actorUserId) where.actorUserId = filter.actorUserId;
    if (filter?.entity) where.entity = filter.entity;
    if (filter?.entityId) where.entityId = filter.entityId;
    if (filter?.from) where.createdAt = { ...where.createdAt, gte: new Date(filter.from) };
    if (filter?.to) where.createdAt = { ...where.createdAt, lte: new Date(filter.to) };

    const logs = await client.auditLog.findMany({
      where,
      include: {
        actor: true,
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.pageSize || 20,
      skip: ((filter?.page || 1) - 1) * (filter?.pageSize || 20),
    });

    const total = await client.auditLog.count({ where });

    return {
      items: logs,
      meta: {
        total,
        page: filter?.page || 1,
        pageSize: filter?.pageSize || 20,
      },
    };
  }

  async createAuditLog(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.auditLog.create({
      data: input,
    });
  }

  async getDashboardSnapshot(churchId: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);

    const [memberCount, groupCount, upcomingEvents, unreadAnnouncements, recentContributions] =
      await Promise.all([
        client.user.count({ where: { deletedAt: null } }),
        client.group.count({ where: { deletedAt: null } }),
        client.event.count({
          where: {
            deletedAt: null,
            startAt: { gte: new Date() },
          },
        }),
        client.announcement.count(), // Would need complex query for unread
        client.contribution.findMany({
          where: {
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

    const totalGivingLast30 = recentContributions.reduce(
      (sum: number, c: any) => sum + c.amount,
      0
    );

    return {
      memberCount,
      groupCount,
      upcomingEvents,
      unreadAnnouncements: 0, // Placeholder
      totalGivingLast30,
    };
  }

  async createSession(
    email: string,
    provider: 'google' | 'facebook' | 'demo',
    requestedRole?: string
  ): Promise<any> {
    // Sessions might be handled differently in multi-tenant setup
    // For now, return a mock session
    return {
      session: {
        token: `session-${Date.now()}`,
        userId: 'user-id',
        createdAt: new Date().toISOString(),
        provider,
      },
      user: {}, // Would need to fetch user
    };
  }

  async getSessionByToken(token?: string, context?: ExecutionContext): Promise<any> {
    // Sessions might be handled differently in multi-tenant setup
    if (!token) return null;
    return null; // Placeholder
  }

  async upsertUserFromOAuth(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);

    let user = await client.user.findUnique({
      where: { primaryEmail: input.email },
    });

    if (!user) {
      // Create new user
      user = await client.user.create({
        data: {
          primaryEmail: input.email,
          status: 'active',
          profile: {
            firstName: input.firstName || '',
            lastName: input.lastName || '',
          },
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    }

    return user;
  }

  // Placeholder for remaining methods that would need full implementation
  async listPastoralCareTickets(churchId: string): Promise<any[]> {
    const client = await this.getTenantClient();
    return client.pastoralCareTicket.findMany({
      where: { churchId },
      include: {
        author: true,
        assignee: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async getPastoralCareTicket(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.pastoralCareTicket.findUnique({
      where: { id },
      include: {
        author: true,
        assignee: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async createPastoralCareTicket(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.pastoralCareTicket.create({
      data: input,
      include: {
        author: true,
        assignee: true,
      },
    });
  }

  async updatePastoralCareTicket(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.pastoralCareTicket.update({
      where: { id },
      data: input,
      include: {
        author: true,
        assignee: true,
        comments: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  async createPastoralCareComment(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.pastoralCareComment.create({
      data: input,
      include: {
        author: true,
      },
    });
  }

  async listPrayerRequests(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.prayerRequest.findMany({
      include: {
        author: true,
      },
    });
  }

  async createPrayerRequest(input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.prayerRequest.create({
      data: input,
      include: {
        author: true,
      },
    });
  }

  async listRequests(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.request.findMany({
      include: {
        author: true,
        type: true,
      },
    });
  }

  async createRequest(input: any, actorUserId: string): Promise<any> {
    const client = await this.getTenantClient();
    return client.request.create({
      data: input,
      include: {
        author: true,
        type: true,
      },
    });
  }

  async listRequestTypes(churchId: string): Promise<any[]> {
    const client = await this.getTenantClient();
    return client.requestType.findMany();
  }

  async createRequestType(
    name: string,
    hasConfidentialField: boolean,
    actorUserId: string,
    description?: string
  ): Promise<any> {
    const client = await this.getTenantClient();
    return client.requestType.create({
      data: {
        name,
        description,
        hasConfidentialField,
      },
    });
  }

  async listDocuments(churchId: string, userRoleIds: string[]): Promise<any[]> {
    const client = await this.getTenantClient();
    return client.document.findMany({
      where: { churchId, deletedAt: null },
      include: {
        permissions: true,
      },
    });
  }

  async getDocument(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.document.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });
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
    actorUserId: string
  ): Promise<any> {
    const client = await this.getTenantClient();
    return client.document.create({
      data: {
        churchId,
        uploaderProfileId,
        fileName,
        fileType,
        title,
        description,
        fileData,
        storageKey: `documents/${randomUUID()}/${fileName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        permissions: true,
      },
    });
  }

  async updateDocument(
    id: string,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    actorUserId: string
  ): Promise<any> {
    const client = await this.getTenantClient();
    return client.document.update({
      where: { id },
      data: {
        title,
        description,
        updatedAt: new Date(),
      },
      include: {
        permissions: true,
      },
    });
  }

  async deleteDocument(id: string, actorUserId: string): Promise<boolean> {
    const client = await this.getTenantClient();
    const document = await client.document.findUnique({
      where: { id },
    });

    if (!document) return false;

    await client.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // TODO: Add audit log
    return true;
  }

  async getDocumentDownloadUrl(
    id: string,
    userId: string,
    context?: ExecutionContext
  ): Promise<any> {
    // This would generate a signed URL for document download
    // For now, return a placeholder
    return {
      url: `/api/documents/${id}/download`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    };
  }

  async downloadDocument(id: string, userId: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const document = await client.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // This would return the actual file data
    // For now, return a placeholder
    return {
      fileName: document.fileName,
      data: Buffer.from('placeholder file data'),
    };
  }

  // Missing methods from DataStore interface
  async getSettings(churchId: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.settings.findUnique({
      where: { churchId },
    });
  }

  async initializeSettings(churchId: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.settings.create({
      data: {
        churchId,
        logo: null,
        color: '#3b82f6',
        name: 'My Church',
        onboardingComplete: false,
      },
    });
  }

  async updateSettings(churchId: string, update: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.settings.upsert({
      where: { churchId },
      update,
      create: {
        churchId,
        ...update,
      },
    });
  }

  async createChild(data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.child.create({
      data,
    });
  }

  async updateChild(id: string, data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.child.update({
      where: { id },
      data,
    });
  }

  async deleteChild(id: string, { actorUserId }: { actorUserId: string }): Promise<any> {
    const client = await this.getTenantClient();
    await client.child.delete({
      where: { id },
    });
    return { success: true };
  }

  async createPushSubscription(data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.pushSubscription.create({
      data,
    });
  }

  async getPushSubscriptionsByUserId(userId: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.pushSubscription.findMany({
      where: { userId },
    });
  }

  async deletePushSubscription(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.pushSubscription.delete({
      where: { id },
    });
    return { success: true };
  }

  async createInvitation(
    churchId: string,
    email: string,
    roleId: string | undefined,
    actorUserId: string,
    type?: 'team' | 'member'
  ): Promise<any> {
    const client = await this.getTenantClient();
    return client.invitation.create({
      data: {
        churchId,
        email,
        roleId,
        actorUserId,
        type: type || 'member',
        token: randomUUID(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async getInvitationByToken(token: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.invitation.findUnique({
      where: { token },
    });
  }

  async updateInvitation(id: string, data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.invitation.update({
      where: { id },
      data,
    });
  }

  async listInvitations(churchId: string): Promise<any[]> {
    const client = await this.getTenantClient();
    return client.invitation.findMany({
      where: { churchId },
    });
  }

  async createCheckin(data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.checkin.create({
      data,
    });
  }

  async getCheckinsByEventId(eventId: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.checkin.findMany({
      where: { eventId },
      include: {
        child: true,
      },
    });
  }

  async updateCheckin(id: string, data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.checkin.update({
      where: { id },
      data,
    });
  }

  async deleteCheckin(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.checkin.delete({
      where: { id },
    });
    return { success: true };
  }

  async listChildren(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.child.findMany({
      include: {
        household: true,
      },
    });
  }

  async getChildById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.child.findUnique({
      where: { id },
      include: {
        household: true,
      },
    });
  }

  async updateHousehold(id: string, data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.household.update({
      where: { id },
      data,
    });
  }

  async deleteHousehold(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.household.delete({
      where: { id },
    });
    return { success: true };
  }

  async createHousehold(data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.household.create({
      data,
    });
  }

  async addHouseholdMember(
    householdId: string,
    data: any,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.householdMember.create({
      data: {
        householdId,
        ...data,
      },
    });
  }

  async updateHouseholdMember(
    householdId: string,
    userId: string,
    data: any,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.householdMember.update({
      where: {
        householdId_userId: {
          householdId,
          userId,
        },
      },
      data,
    });
  }

  async removeHouseholdMember(
    householdId: string,
    userId: string,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.householdMember.delete({
      where: {
        householdId_userId: {
          householdId,
          userId,
        },
      },
    });
    return { success: true };
  }

  async getChildren(householdId: string): Promise<any[]> {
    const client = await this.getTenantClient();
    return client.child.findMany({
      where: { householdId },
      include: {
        household: true,
      },
    });
  }

  async getCheckins(status: 'pending' | 'checked-in'): Promise<any[]> {
    const client = await this.getTenantClient();
    return client.checkin.findMany({
      where: { status },
      include: {
        child: true,
        event: true,
      },
    });
  }

  async getCheckinById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.checkin.findUnique({
      where: { id },
      include: {
        child: true,
        event: true,
      },
    });
  }

  async getPrayerRequests(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.prayerRequest.findMany({
      include: {
        author: true,
      },
    });
  }

  async getPrayerRequestById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.prayerRequest.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });
  }

  async updatePrayerRequest(id: string, data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.prayerRequest.update({
      where: { id },
      data,
      include: {
        author: true,
      },
    });
  }

  async deletePrayerRequest(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.prayerRequest.delete({
      where: { id },
    });
    return { success: true };
  }

  async getRequests(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.request.findMany({
      include: {
        author: true,
        type: true,
      },
    });
  }

  async getRequestById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.request.findUnique({
      where: { id },
      include: {
        author: true,
        type: true,
      },
    });
  }

  async updateRequest(id: string, data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.request.update({
      where: { id },
      data,
      include: {
        author: true,
        type: true,
      },
    });
  }

  async deleteRequest(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.request.delete({
      where: { id },
    });
    return { success: true };
  }

  async updateRequestType(id: string, name: string, actorUserId: string): Promise<any> {
    const client = await this.getTenantClient();
    return client.requestType.update({
      where: { id },
      data: { name },
    });
  }

  async deleteRequestType(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.requestType.delete({
      where: { id },
    });
    return { success: true };
  }

  async updateDocumentPermission(
    documentId: string,
    userId: string,
    data: any,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.documentPermission.update({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
      data,
    });
  }

  async removeDocumentPermission(
    documentId: string,
    userId: string,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.documentPermission.delete({
      where: {
        documentId_userId: {
          documentId,
          userId,
        },
      },
    });
    return { success: true };
  }

  async getDocumentPermissions(documentId: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.documentPermission.findMany({
      where: { documentId },
      include: {
        user: true,
      },
    });
  }

  async getAnnouncementById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.announcement.findUnique({
      where: { id },
      include: {
        audiences: true,
      },
    });
  }

  async deleteAnnouncement(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.announcement.delete({
      where: { id },
    });
    return { success: true };
  }

  async getFundById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.fund.findUnique({
      where: { id },
    });
  }

  async createFund(data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.fund.create({
      data,
    });
  }

  async updateFund(id: string, data: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.fund.update({
      where: { id },
      data,
    });
  }

  async deleteFund(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.fund.delete({
      where: { id },
    });
    return { success: true };
  }

  async getContributionById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.contribution.findUnique({
      where: { id },
      include: {
        fund: true,
        member: true,
      },
    });
  }

  async deleteContribution(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.contribution.delete({
      where: { id },
    });
    return { success: true };
  }

  async getAuditLogById(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    return client.auditLog.findUnique({
      where: { id },
    });
  }

  async deleteAuditLog(id: string, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    await client.auditLog.delete({
      where: { id },
    });
    return { success: true };
  }

  async archiveRequestType(
    id: string,
    actorUserId: string,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    const requestType = await client.requestType.findUnique({
      where: { id },
    });

    if (!requestType) {
      throw new Error('Request type not found');
    }

    if (requestType.isBuiltIn) {
      throw new Error('Cannot archive a built-in request type');
    }

    // Check for open requests
    const openRequests = await client.request.count({
      where: {
        requestTypeId: id,
        status: { not: 'Closed' },
      },
    });

    if (openRequests > 0) {
      throw new Error('Cannot archive a request type with open requests');
    }

    const updated = await client.requestType.update({
      where: { id },
      data: { status: 'archived' },
    });

    // TODO: Add audit log
    return updated;
  }

  async updateRequestTypeStatus(
    id: string,
    status: 'active' | 'archived',
    actorUserId: string,
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    const updated = await client.requestType.update({
      where: { id },
      data: { status },
    });

    // TODO: Add audit log
    return updated;
  }

  async reorderRequestTypes(
    ids: string[],
    actorUserId: string,
    context?: ExecutionContext
  ): Promise<any[]> {
    const client = await this.getTenantClient(context);

    // Update display order for each request type
    const updates = ids.map((id, index) =>
      client.requestType.update({
        where: { id },
        data: { displayOrder: index + 1 },
      })
    );

    await Promise.all(updates);

    // Return reordered list
    const reordered = await client.requestType.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    // TODO: Add audit log
    return reordered;
  }

  async getDocumentWithPermissions(
    id: string,
    userRoleIds: string[],
    context?: ExecutionContext
  ): Promise<any> {
    const client = await this.getTenantClient(context);
    const document = await client.document.findUnique({
      where: { id, deletedAt: null },
      include: {
        permissions: {
          where: { deletedAt: null },
        },
      },
    });

    if (!document) return undefined;

    const permissions = document.permissions.map((p: any) => p.roleId);

    // Check if user has permission
    const hasPermission = permissions.some((roleId: string) => userRoleIds.includes(roleId));
    if (!hasPermission) return undefined;

    return { ...document, permissions };
  }

  async hardDeleteDocument(
    id: string,
    actorUserId: string,
    context?: ExecutionContext
  ): Promise<boolean> {
    const client = await this.getTenantClient(context);
    const document = await client.document.findUnique({
      where: { id },
    });

    if (!document) return false;

    // Delete document and permissions
    await client.document.delete({
      where: { id },
    });

    await client.documentPermission.deleteMany({
      where: { documentId: id },
    });

    // TODO: Add audit log
    return true;
  }

  async undeleteDocument(
    id: string,
    actorUserId: string,
    context?: ExecutionContext
  ): Promise<boolean> {
    const client = await this.getTenantClient(context);
    const document = await client.document.findUnique({
      where: { id },
    });

    if (!document || !document.deletedAt) return false;

    await client.document.update({
      where: { id },
      data: { deletedAt: null },
    });

    // TODO: Add audit log
    return true;
  }

  async listDeletedDocuments(churchId: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.document.findMany({
      where: {
        churchId,
        deletedAt: { not: null },
      },
    });
  }

  async acceptInvitation(
    token: string,
    userId: string,
    context?: ExecutionContext
  ): Promise<boolean> {
    const client = await this.getTenantClient(context);
    const invitation = await client.invitation.findUnique({
      where: { invitationToken: token },
    });

    if (!invitation || invitation.status !== 'pending') {
      return false;
    }

    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      await client.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      return false;
    }

    // Update invitation status
    await client.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    });

    // Add role to user
    const user = await client.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      const roleIdToAssign = invitation.roleId || 'member-role-id'; // TODO: Get default role
      const existingRole = user.roles.find((r: any) => r.roleId === roleIdToAssign);
      if (!existingRole) {
        await client.userRole.create({
          data: {
            userId,
            roleId: roleIdToAssign,
          },
        });
      }

      // TODO: Add audit log
    }

    return true;
  }

  async hardDeleteUser(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const user = await client.user.findUnique({
      where: { id },
    });

    if (!user) return { success: false };

    // Delete user and all related data
    await client.user.delete({
      where: { id },
    });

    // TODO: Clean up related data (groups, events, contributions, etc.)
    // TODO: Add audit log

    return { success: true };
  }

  async hardDeleteEvent(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const event = await client.event.findUnique({
      where: { id },
    });

    if (!event) return { success: false };

    await client.event.delete({
      where: { id },
    });

    // TODO: Add audit log
    return { success: true };
  }

  async hardDeleteRole(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const role = await client.role.findUnique({
      where: { id },
    });

    if (!role) return { deleted: false, reassigned: 0 };

    if (!role.isDeletable || role.slug === 'admin') {
      throw new Error('This role cannot be deleted.');
    }

    // TODO: Handle role reassignment
    await client.role.delete({
      where: { id },
    });

    // TODO: Add audit log
    return { deleted: true, reassigned: 0 };
  }

  async undeleteUser(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const user = await client.user.findUnique({
      where: { id },
    });

    if (!user || !user.deletedAt) {
      return { success: false, reason: 'User not found or not deleted' };
    }

    await client.user.update({
      where: { id },
      data: { deletedAt: null },
    });

    // TODO: Add audit log
    return { success: true };
  }

  async undeleteEvent(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const event = await client.event.findUnique({
      where: { id },
    });

    if (!event || !event.deletedAt) {
      return { success: false, reason: 'Event not found or not deleted' };
    }

    await client.event.update({
      where: { id },
      data: { deletedAt: null },
    });

    // TODO: Add audit log
    return { success: true };
  }

  async undeleteRole(id: string, input: any, context?: ExecutionContext): Promise<any> {
    const client = await this.getTenantClient(context);
    const role = await client.role.findUnique({
      where: { id },
    });

    if (!role || !role.deletedAt) {
      return { success: false, reason: 'Role not found or not deleted' };
    }

    await client.role.update({
      where: { id },
      data: { deletedAt: null },
    });

    // TODO: Add audit log
    return { success: true };
  }

  async listDeletedUsers(query?: string, context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    const lower = query?.toLowerCase();
    const users = await client.user.findMany({
      where: {
        deletedAt: { not: null },
        OR: lower
          ? [
              { primaryEmail: { contains: lower, mode: 'insensitive' } },
              { profile: { firstName: { contains: lower, mode: 'insensitive' } } },
              { profile: { lastName: { contains: lower, mode: 'insensitive' } } },
            ]
          : undefined,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map((user: any) => ({
      ...user,
      deletedAt: user.deletedAt,
    }));
  }

  async listDeletedEvents(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.event.findMany({
      where: {
        deletedAt: { not: null },
      },
    });
  }

  async listDeletedRoles(context?: ExecutionContext): Promise<any[]> {
    const client = await this.getTenantClient(context);
    return client.role.findMany({
      where: {
        deletedAt: { not: null },
      },
    });
  }

  async bulkCreateInvitations(
    churchId: string,
    emails: string[],
    roleId: string | undefined,
    actorUserId: string,
    type: 'team' | 'member' = 'team',
    context?: ExecutionContext
  ): Promise<any[]> {
    const client = await this.getTenantClient(context);
    const invitations: any[] = [];
    const errors: string[] = [];

    for (const email of emails) {
      try {
        const invitation = await this.createInvitation(churchId, email, roleId, actorUserId, type);
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

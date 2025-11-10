import { Injectable, Inject } from '@nestjs/common';
import { DataStore, DATA_STORE } from '../../datastore/data-store.types';
import { MemberListQueryDto } from './dto/member-list-query.dto';
import { MemberSummary, MemberListResponse } from './types/member-summary.type';

@Injectable()
export class MembersService {
  constructor(@Inject(DATA_STORE) private readonly dataStore: DataStore) {}

  async listMembers(churchId: string, query: MemberListQueryDto): Promise<MemberListResponse> {
    const startTime = Date.now();

    // Get all users via DataStore
    const allUsers = await this.dataStore.listUsers();

    // Apply filters
    let filtered = allUsers;

    // Search filter (name, email, phone)
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter((user: any) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.primaryEmail?.toLowerCase() || '';
        const phone = user.phone?.toLowerCase() || '';
        return (
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower)
        );
      });
    }

    // Status filter (CSV)
    if (query.status) {
      const statusValues = query.status.split(',').map(s => s.trim().toLowerCase());
      filtered = filtered.filter((user: any) => {
        const userStatus = user.status?.toLowerCase() || 'active';
        return statusValues.includes(userStatus);
      });
    }

    // Role filter (CSV)
    if (query.role) {
      const roleNames = query.role.split(',').map(r => r.trim().toLowerCase());
      filtered = filtered.filter((user: any) => {
        const userRoles = user.roles?.map((r: any) => r.name.toLowerCase()) || [];
        return roleNames.some(roleName => userRoles.includes(roleName));
      });
    }

    // Email/Phone filters
    if (query.hasEmail !== undefined) {
      filtered = filtered.filter((user: any) =>
        query.hasEmail ? !!user.primaryEmail : !user.primaryEmail
      );
    }

    if (query.hasPhone !== undefined) {
      filtered = filtered.filter((user: any) => (query.hasPhone ? !!user.phone : !user.phone));
    }

    // Groups count filter
    if (query.groupsCountMin !== undefined) {
      filtered = filtered.filter((user: any) => {
        const groupsCount = user.groups?.length || 0;
        return groupsCount >= (query.groupsCountMin ?? 0);
      });
    }

    // Last attendance filter (bucket-based)
    if (query.lastAttendance) {
      const now = new Date();
      const buckets: Record<string, number> = {
        '7d': 7,
        '30d': 30,
        '60d': 60,
        '90d': 90,
        never: Infinity,
      };
      const daysAgo = buckets[query.lastAttendance];

      filtered = filtered.filter((user: any) => {
        // Get user's last attendance date from their attendance records
        // For now, we'll use a placeholder - this will be enhanced when we have attendance data
        const lastAttendanceDate = user.lastAttendance || null;

        if (query.lastAttendance === 'never') {
          return !lastAttendanceDate;
        }

        if (!lastAttendanceDate) return false;

        const daysSince = Math.floor(
          (now.getTime() - new Date(lastAttendanceDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSince <= daysAgo;
      });
    }

    // Sorting
    let sorted = [...filtered];
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      const dir = direction === 'desc' ? -1 : 1;

      sorted.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (field) {
          case 'name':
            aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
            bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case 'email':
            aVal = a.primaryEmail?.toLowerCase() || '';
            bVal = b.primaryEmail?.toLowerCase() || '';
            break;
          case 'status':
            aVal = a.status?.toLowerCase() || 'active';
            bVal = b.status?.toLowerCase() || 'active';
            break;
          case 'lastAttendance':
            aVal = a.lastAttendance ? new Date(a.lastAttendance).getTime() : 0;
            bVal = b.lastAttendance ? new Date(b.lastAttendance).getTime() : 0;
            break;
          case 'groupsCount':
            aVal = a.groups?.length || 0;
            bVal = b.groups?.length || 0;
            break;
          case 'createdAt':
            aVal = new Date(a.createdAt || 0).getTime();
            bVal = new Date(b.createdAt || 0).getTime();
            break;
          default:
            aVal = '';
            bVal = '';
        }

        if (aVal < bVal) return -1 * dir;
        if (aVal > bVal) return 1 * dir;
        return 0;
      });
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 25;
    const total = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = sorted.slice(offset, offset + limit);

    // Map to MemberSummary format
    const data: MemberSummary[] = paginated.map((user: any) => {
      const groupsCount = user.groups?.length || 0;
      const badges: string[] = [];

      // Add badges based on user properties
      if (user.roles?.some((r: any) => r.slug === 'admin')) {
        badges.push('Admin');
      }
      if (user.roles?.some((r: any) => r.slug === 'leader')) {
        badges.push('Leader');
      }
      if (groupsCount > 5) {
        badges.push('Active Member');
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmail || null,
        phone: user.phone || null,
        status: user.status || 'active',
        roles: user.roles?.map((r: any) => r.name) || [],
        lastAttendance: user.lastAttendance || null,
        groupsCount,
        groups: user.groups?.map((g: any) => ({ id: g.id, name: g.name })) || [],
        badges,
        createdAt: user.createdAt || new Date().toISOString(),
      };
    });

    const queryTime = Date.now() - startTime;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
      meta: {
        queryTime,
        filters: this.buildActiveFilters(query),
      },
    };
  }

  private buildActiveFilters(query: MemberListQueryDto): Record<string, any> {
    const filters: Record<string, any> = {};

    if (query.search) filters.search = query.search;
    if (query.status) filters.status = query.status.split(',');
    if (query.role) filters.role = query.role.split(',');
    if (query.lastAttendance) filters.lastAttendance = query.lastAttendance;
    if (query.groupsCountMin !== undefined) filters.groupsCountMin = query.groupsCountMin;
    if (query.hasEmail !== undefined) filters.hasEmail = query.hasEmail;
    if (query.hasPhone !== undefined) filters.hasPhone = query.hasPhone;

    return filters;
  }
}

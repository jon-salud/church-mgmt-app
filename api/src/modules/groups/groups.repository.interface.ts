import { Group } from '../../domain/entities/Group';
import { GroupId } from '../../domain/value-objects/GroupId';
import { UserId } from '../../domain/value-objects/UserId';
import { ChurchId } from '../../domain/value-objects/ChurchId';

export interface GroupMember {
  userId: string;
  role: 'Member' | 'Leader' | 'Admin' | 'Coordinator' | 'Volunteer';
  status: 'Active' | 'Inactive';
  joinedAt: string;
}

export interface UserSummary {
  id: string;
  primaryEmail: string;
  status: 'active' | 'invited';
  createdAt: string;
  lastLoginAt?: string;
  roles: Array<{ churchId: string; roleId: string }>;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    householdId?: string;
    householdRole?: string;
    notes?: string;
    membershipStatus?: string;
    joinMethod?: string;
    joinDate?: string;
    baptismDate?: string;
    maritalStatus?: string;
    occupation?: string;
    skillsAndInterests?: string[];
    backgroundCheckStatus?: string;
    backgroundCheckDate?: string;
    onboardingComplete?: boolean;
  };
  deletedAt?: string;
}

export interface GroupResource {
  id: string;
  groupId: string;
  churchId: string;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const GROUPS_REPOSITORY = Symbol('GROUPS_REPOSITORY');

export interface IGroupsRepository {
  listGroups(): Promise<Group[]>;
  getGroupById(id: GroupId): Promise<Group | null>;
  getGroupMembers(groupId: GroupId): Promise<Array<GroupMember & { user: UserSummary }>>;
  addGroupMember(
    groupId: GroupId,
    input: GroupMemberCreateInput
  ): Promise<GroupMember & { user: UserSummary }>;
  updateGroupMember(
    groupId: GroupId,
    userId: UserId,
    input: GroupMemberUpdateInput
  ): Promise<(GroupMember & { user: UserSummary | null }) | null>;
  removeGroupMember(
    groupId: GroupId,
    userId: UserId,
    input: GroupMemberRemoveInput
  ): Promise<{ success: boolean }>;
  getGroupResources(groupId: GroupId): Promise<GroupResource[]>;
  createGroupResource(groupId: GroupId, input: GroupResourceCreateInput): Promise<GroupResource>;
  updateGroupResource(resourceId: string, input: GroupResourceUpdateInput): Promise<GroupResource>;
  deleteGroupResource(
    resourceId: string,
    input: GroupResourceDeleteInput
  ): Promise<{ success: boolean }>;
}

export interface GroupMemberCreateInput {
  userId: string;
  role?: 'Member' | 'Leader' | 'Admin' | 'Coordinator' | 'Volunteer';
  status?: 'Active' | 'Inactive';
  joinedAt?: string;
  actorUserId: string;
}

export interface GroupMemberUpdateInput {
  role?: 'Member' | 'Leader' | 'Admin' | 'Coordinator' | 'Volunteer';
  status?: 'Active' | 'Inactive';
  actorUserId: string;
}

export interface GroupMemberRemoveInput {
  actorUserId: string;
}

export interface GroupResourceCreateInput {
  title: string;
  url: string;
  actorUserId: string;
}

export interface GroupResourceUpdateInput {
  title?: string;
  url?: string;
  actorUserId: string;
}

export interface GroupResourceDeleteInput {
  actorUserId: string;
}

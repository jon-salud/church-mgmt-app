// Abstract entity interfaces (decoupled from mock data)
export interface Group {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  type: string;
  meetingDay?: string;
  meetingTime?: string;
  tags: string[];
  leaderUserId?: string;
  members: GroupMember[];
  deletedAt?: string;
}

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
  getGroupById(id: string): Promise<Group | null>;
  getGroupMembers(groupId: string): Promise<Array<GroupMember & { user: UserSummary }>>;
  addGroupMember(
    groupId: string,
    input: GroupMemberCreateInput
  ): Promise<GroupMember & { user: UserSummary }>;
  updateGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberUpdateInput
  ): Promise<(GroupMember & { user: UserSummary | null }) | null>;
  removeGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberRemoveInput
  ): Promise<{ success: boolean }>;
  getGroupResources(groupId: string): Promise<GroupResource[]>;
  createGroupResource(groupId: string, input: GroupResourceCreateInput): Promise<GroupResource>;
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

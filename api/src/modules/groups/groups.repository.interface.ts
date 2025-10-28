import { MockGroup, MockGroupMember, MockGroupResource, MockUser } from '../../mock/mock-data';

export const GROUPS_REPOSITORY = Symbol('GROUPS_REPOSITORY');

export interface IGroupsRepository {
  listGroups(): Promise<MockGroup[]>;
  getGroupById(id: string): Promise<MockGroup | null>;
  getGroupMembers(groupId: string): Promise<Array<MockGroupMember & { user: MockUser }>>;
  addGroupMember(
    groupId: string,
    input: GroupMemberCreateInput
  ): Promise<MockGroupMember & { user: MockUser }>;
  updateGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberUpdateInput
  ): Promise<(MockGroupMember & { user: MockUser | null }) | null>;
  removeGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberRemoveInput
  ): Promise<{ success: boolean }>;
  getGroupResources(groupId: string): Promise<MockGroupResource[]>;
  createGroupResource(groupId: string, input: GroupResourceCreateInput): Promise<MockGroupResource>;
  updateGroupResource(
    resourceId: string,
    input: GroupResourceUpdateInput
  ): Promise<MockGroupResource>;
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

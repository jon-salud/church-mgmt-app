import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import {
  IGroupsRepository,
  GroupMember,
  UserSummary,
  GroupResource,
  GroupMemberCreateInput,
  GroupMemberUpdateInput,
  GroupMemberRemoveInput,
  GroupResourceCreateInput,
  GroupResourceUpdateInput,
  GroupResourceDeleteInput,
} from './groups.repository.interface';
import { Group } from '../../domain/entities/Group';
import { GroupId } from '../../domain/value-objects/GroupId';
import { UserId } from '../../domain/value-objects/UserId';
import { ChurchId } from '../../domain/value-objects/ChurchId';

@Injectable()
export class GroupsDataStoreRepository implements IGroupsRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listGroups(): Promise<Group[]> {
    const groups = await this.db.listGroups();
    return groups.map(group => this.mapToGroup(group));
  }

  async getGroupById(id: GroupId): Promise<Group | null> {
    const group = await this.db.getGroupById(id.value);
    return group ? this.mapToGroup(group) : null;
  }

  async getGroupMembers(groupId: GroupId): Promise<Array<GroupMember & { user: UserSummary }>> {
    return this.db.getGroupMembers(groupId.value);
  }

  async addGroupMember(
    groupId: GroupId,
    input: GroupMemberCreateInput
  ): Promise<GroupMember & { user: UserSummary }> {
    return this.db.addGroupMember(groupId.value, input);
  }

  async updateGroupMember(
    groupId: GroupId,
    userId: UserId,
    input: GroupMemberUpdateInput
  ): Promise<(GroupMember & { user: UserSummary | null }) | null> {
    return this.db.updateGroupMember(groupId.value, userId.value, input);
  }

  async removeGroupMember(
    groupId: GroupId,
    userId: UserId,
    input: GroupMemberRemoveInput
  ): Promise<{ success: boolean }> {
    return this.db.removeGroupMember(groupId.value, userId.value, input);
  }

  async getGroupResources(groupId: GroupId): Promise<GroupResource[]> {
    return this.db.getGroupResources(groupId.value);
  }

  async createGroupResource(
    groupId: GroupId,
    input: GroupResourceCreateInput
  ): Promise<GroupResource> {
    return this.db.createGroupResource(groupId.value, input);
  }

  async updateGroupResource(
    resourceId: string,
    input: GroupResourceUpdateInput
  ): Promise<GroupResource> {
    return this.db.updateGroupResource(resourceId, input);
  }

  async deleteGroupResource(
    resourceId: string,
    input: GroupResourceDeleteInput
  ): Promise<{ success: boolean }> {
    return this.db.deleteGroupResource(resourceId, input);
  }

  private mapToGroup(group: any): Group {
    return Group.reconstruct({
      id: GroupId.create(group.id),
      churchId: ChurchId.create(group.churchId),
      name: group.name,
      description: group.description,
      type: group.type,
      meetingDay: group.meetingDay,
      meetingTime: group.meetingTime,
      tags: group.tags || [],
      leaderId: group.leaderUserId ? UserId.create(group.leaderUserId) : undefined,
      createdAt: group.createdAt ? new Date(group.createdAt) : new Date('2024-01-01T00:00:00Z'), // Use mock data's createdAt, or consistent fallback date
      deletedAt: group.deletedAt ? new Date(group.deletedAt) : undefined,
    });
  }
}

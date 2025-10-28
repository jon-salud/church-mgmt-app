import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import {
  IGroupsRepository,
  Group,
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

@Injectable()
export class GroupsDataStoreRepository implements IGroupsRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listGroups(): Promise<Group[]> {
    return this.db.listGroups();
  }

  async getGroupById(id: string): Promise<Group | null> {
    return this.db.getGroupById(id);
  }

  async getGroupMembers(groupId: string): Promise<Array<GroupMember & { user: UserSummary }>> {
    return this.db.getGroupMembers(groupId);
  }

  async addGroupMember(
    groupId: string,
    input: GroupMemberCreateInput
  ): Promise<GroupMember & { user: UserSummary }> {
    return this.db.addGroupMember(groupId, input);
  }

  async updateGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberUpdateInput
  ): Promise<(GroupMember & { user: UserSummary | null }) | null> {
    return this.db.updateGroupMember(groupId, userId, input);
  }

  async removeGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberRemoveInput
  ): Promise<{ success: boolean }> {
    return this.db.removeGroupMember(groupId, userId, input);
  }

  async getGroupResources(groupId: string): Promise<GroupResource[]> {
    return this.db.getGroupResources(groupId);
  }

  async createGroupResource(
    groupId: string,
    input: GroupResourceCreateInput
  ): Promise<GroupResource> {
    return this.db.createGroupResource(groupId, input);
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
}

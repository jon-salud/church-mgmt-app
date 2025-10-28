import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import {
  IGroupsRepository,
  GroupMemberCreateInput,
  GroupMemberUpdateInput,
  GroupMemberRemoveInput,
  GroupResourceCreateInput,
  GroupResourceUpdateInput,
  GroupResourceDeleteInput,
} from './groups.repository.interface';
import { MockGroup, MockGroupMember, MockGroupResource, MockUser } from '../../mock/mock-data';

@Injectable()
export class GroupsDataStoreRepository implements IGroupsRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listGroups(): Promise<MockGroup[]> {
    return this.db.listGroups();
  }

  async getGroupById(id: string): Promise<MockGroup | null> {
    return this.db.getGroupById(id);
  }

  async getGroupMembers(groupId: string): Promise<Array<MockGroupMember & { user: MockUser }>> {
    return this.db.getGroupMembers(groupId);
  }

  async addGroupMember(
    groupId: string,
    input: GroupMemberCreateInput
  ): Promise<MockGroupMember & { user: MockUser }> {
    return this.db.addGroupMember(groupId, input);
  }

  async updateGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberUpdateInput
  ): Promise<(MockGroupMember & { user: MockUser | null }) | null> {
    return this.db.updateGroupMember(groupId, userId, input);
  }

  async removeGroupMember(
    groupId: string,
    userId: string,
    input: GroupMemberRemoveInput
  ): Promise<{ success: boolean }> {
    return this.db.removeGroupMember(groupId, userId, input);
  }

  async getGroupResources(groupId: string): Promise<MockGroupResource[]> {
    return this.db.getGroupResources(groupId);
  }

  async createGroupResource(
    groupId: string,
    input: GroupResourceCreateInput
  ): Promise<MockGroupResource> {
    return this.db.createGroupResource(groupId, input);
  }

  async updateGroupResource(
    resourceId: string,
    input: GroupResourceUpdateInput
  ): Promise<MockGroupResource> {
    return this.db.updateGroupResource(resourceId, input);
  }

  async deleteGroupResource(
    resourceId: string,
    input: GroupResourceDeleteInput
  ): Promise<{ success: boolean }> {
    return this.db.deleteGroupResource(resourceId, input);
  }
}

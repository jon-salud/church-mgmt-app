import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { GROUPS_REPOSITORY, IGroupsRepository } from './groups.repository.interface';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { CreateGroupResourceDto } from './dto/create-group-resource.dto';
import { UpdateGroupResourceDto } from './dto/update-group-resource.dto';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(GROUPS_REPOSITORY) private readonly groupsRepository: IGroupsRepository,
    @Inject(DATA_STORE) private readonly db: DataStore
  ) {}

  async list() {
    return this.groupsRepository.listGroups();
  }

  async detail(id: string) {
    const group = await this.groupsRepository.getGroupById(id);
    if (!group) return null;
    const [members, events, resources] = await Promise.all([
      this.groupsRepository.getGroupMembers(id),
      this.db.listEventsByGroupId(id),
      this.groupsRepository.getGroupResources(id),
    ]);
    return {
      ...group,
      members,
      events: events.sort((a, b) => String(a.startAt).localeCompare(String(b.startAt))),
      resources,
    };
  }

  async members(id: string) {
    return this.groupsRepository.getGroupMembers(id);
  }

  async addMember(groupId: string, input: AddGroupMemberDto, actorUserId: string) {
    return this.groupsRepository.addGroupMember(groupId, { ...input, actorUserId });
  }

  async updateMember(
    groupId: string,
    userId: string,
    input: UpdateGroupMemberDto,
    actorUserId: string
  ) {
    return this.groupsRepository.updateGroupMember(groupId, userId, { ...input, actorUserId });
  }

  async removeMember(groupId: string, userId: string, actorUserId: string) {
    return this.groupsRepository.removeGroupMember(groupId, userId, { actorUserId });
  }

  async resources(groupId: string) {
    return this.groupsRepository.getGroupResources(groupId);
  }

  async createResource(groupId: string, input: CreateGroupResourceDto, actorUserId: string) {
    return this.groupsRepository.createGroupResource(groupId, { ...input, actorUserId });
  }

  async updateResource(resourceId: string, input: UpdateGroupResourceDto, actorUserId: string) {
    return this.groupsRepository.updateGroupResource(resourceId, { ...input, actorUserId });
  }

  async deleteResource(resourceId: string, actorUserId: string) {
    return this.groupsRepository.deleteGroupResource(resourceId, { actorUserId });
  }
}

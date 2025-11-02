import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { GROUPS_REPOSITORY, IGroupsRepository } from './groups.repository.interface';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { CreateGroupResourceDto } from './dto/create-group-resource.dto';
import { UpdateGroupResourceDto } from './dto/update-group-resource.dto';
import { Group } from '../../domain/entities/Group';
import { GroupId } from '../../domain/value-objects/GroupId';
import { UserId } from '../../domain/value-objects/UserId';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(GROUPS_REPOSITORY) private readonly groupsRepository: IGroupsRepository,
    @Inject(DATA_STORE) private readonly db: DataStore
  ) {}

  async list() {
    const groups = await this.groupsRepository.listGroups();
    return groups.map(group => this.toGroupResponse(group));
  }

  async detail(id: string) {
    const groupId = GroupId.create(id);
    const group = await this.groupsRepository.getGroupById(groupId);
    if (!group) return null;
    const [members, events, resources] = await Promise.all([
      this.groupsRepository.getGroupMembers(groupId),
      this.db.listEventsByGroupId(id),
      this.groupsRepository.getGroupResources(groupId),
    ]);
    return {
      ...this.toGroupResponse(group),
      members,
      events: events.sort((a, b) => String(a.startAt).localeCompare(String(b.startAt))),
      resources,
    };
  }

  async members(id: string) {
    const groupId = GroupId.create(id);
    return this.groupsRepository.getGroupMembers(groupId);
  }

  async addMember(groupId: string, input: AddGroupMemberDto, actorUserId: string) {
    const groupIdObj = GroupId.create(groupId);
    return this.groupsRepository.addGroupMember(groupIdObj, { ...input, actorUserId });
  }

  async updateMember(
    groupId: string,
    userId: string,
    input: UpdateGroupMemberDto,
    actorUserId: string
  ) {
    const groupIdObj = GroupId.create(groupId);
    const userIdObj = UserId.create(userId);
    return this.groupsRepository.updateGroupMember(groupIdObj, userIdObj, {
      ...input,
      actorUserId,
    });
  }

  async removeMember(groupId: string, userId: string, actorUserId: string) {
    const groupIdObj = GroupId.create(groupId);
    const userIdObj = UserId.create(userId);
    return this.groupsRepository.removeGroupMember(groupIdObj, userIdObj, { actorUserId });
  }

  async resources(groupId: string) {
    const groupIdObj = GroupId.create(groupId);
    return this.groupsRepository.getGroupResources(groupIdObj);
  }

  async createResource(groupId: string, input: CreateGroupResourceDto, actorUserId: string) {
    const groupIdObj = GroupId.create(groupId);
    return this.groupsRepository.createGroupResource(groupIdObj, { ...input, actorUserId });
  }

  async updateResource(resourceId: string, input: UpdateGroupResourceDto, actorUserId: string) {
    return this.groupsRepository.updateGroupResource(resourceId, { ...input, actorUserId });
  }

  async deleteResource(resourceId: string, actorUserId: string) {
    return this.groupsRepository.deleteGroupResource(resourceId, { actorUserId });
  }

  async remove(id: string, actorUserId: string) {
    return this.db.deleteGroup(id, { actorUserId });
  }

  async undelete(id: string, actorUserId: string) {
    return this.db.undeleteGroup(id, { actorUserId });
  }

  async listDeleted() {
    return this.db.listDeletedGroups();
  }

  async bulkDelete(ids: string[], actorUserId: string) {
    return this.db.bulkDeleteGroups(ids, { actorUserId });
  }

  async bulkUndelete(ids: string[], actorUserId: string) {
    return this.db.bulkUndeleteGroups(ids, { actorUserId });
  }

  private toGroupResponse(group: Group) {
    return {
      id: group.id.value,
      churchId: group.churchId.value,
      name: group.name,
      description: group.description,
      type: group.type,
      meetingDay: group.meetingDay,
      meetingTime: group.meetingTime,
      tags: group.tags || [],
      leaderUserId: group.leaderId?.value,
      deletedAt: group.deletedAt?.toISOString(),
    };
  }
}

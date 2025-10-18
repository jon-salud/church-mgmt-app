import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';

@Injectable()
export class GroupsService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  list() {
    return this.db.listGroups();
  }

  async detail(id: string) {
    const group = await this.db.getGroupById(id);
    if (!group) return null;
    const [members, events] = await Promise.all([
      this.db.getGroupMembers(id),
      this.db.listEvents(),
    ]);
    const matchingEvents = events
      .filter(event => event.groupId === id)
      .sort((a, b) => String(a.startAt).localeCompare(String(b.startAt)));
    return {
      ...group,
      members,
      events: matchingEvents,
    };
  }

  members(id: string) {
    return this.db.getGroupMembers(id);
  }

  addMember(groupId: string, input: AddGroupMemberDto, actorUserId: string) {
    return this.db.addGroupMember(groupId, { ...input, actorUserId });
  }

  updateMember(groupId: string, userId: string, input: UpdateGroupMemberDto, actorUserId: string) {
    return this.db.updateGroupMember(groupId, userId, { ...input, actorUserId });
  }

  removeMember(groupId: string, userId: string, actorUserId: string) {
    return this.db.removeGroupMember(groupId, userId, { actorUserId });
  }
}

import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class GroupsService {
  constructor(private readonly db: MockDatabaseService) {}

  list() {
    return this.db.listGroups();
  }

  detail(id: string) {
    const group = this.db.getGroupById(id);
    if (!group) return null;
    const members = this.db.getGroupMembers(id);
    const events = this.db
      .listEvents()
      .filter(event => event.groupId === id)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
    return {
      ...group,
      members,
      events,
    };
  }

  members(id: string) {
    return this.db.getGroupMembers(id);
  }
}

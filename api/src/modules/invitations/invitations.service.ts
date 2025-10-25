import { Injectable, Inject } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class InvitationsService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async createInvitation(
    churchId: string,
    email: string,
    roleId: string | undefined,
    actorUserId: string,
    type?: 'team' | 'member'
  ) {
    return this.db.createInvitation(churchId, email, roleId, actorUserId, type);
  }

  async getInvitationByToken(token: string) {
    return this.db.getInvitationByToken(token);
  }

  async acceptInvitation(token: string, userId: string) {
    return this.db.acceptInvitation(token, userId);
  }

  async listInvitations(churchId: string) {
    return this.db.listInvitations(churchId);
  }

  async bulkCreateInvitations(
    churchId: string,
    emails: string[],
    roleId: string | undefined,
    actorUserId: string,
    type?: 'team' | 'member'
  ) {
    return this.db.bulkCreateInvitations(churchId, emails, roleId, actorUserId, type);
  }
}

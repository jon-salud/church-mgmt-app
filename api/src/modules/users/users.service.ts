import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  list(q?: string) {
    return this.db.listUsers(q);
  }

  get(id: string) {
    return this.db.getUserProfile(id);
  }

  create(input: CreateUserDto, actorUserId: string) {
    return this.db.createUser({ ...input, actorUserId });
  }

  update(id: string, input: UpdateUserDto, actorUserId: string) {
    return this.db.updateUser(id, { ...input, actorUserId });
  }

  delete(id: string, actorUserId: string) {
    return this.db.deleteUser(id, { actorUserId });
  }

  async bulkImport(emails: string[], actorUserId: string) {
    // Get the user's church ID
    const user = await this.db.getUserProfile(actorUserId);
    if (!user.churchId) {
      throw new Error('User must be associated with a church');
    }

    // Use the invitations service to send bulk invitations
    return this.db.bulkCreateInvitations(user.churchId, emails, undefined, actorUserId, 'member');
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IUsersRepository } from './users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersDataStoreRepository implements IUsersRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  listUsers(query?: string) {
    return this.db.listUsers(query);
  }

  getUserProfile(id: string) {
    return this.db.getUserProfile(id);
  }

  createUser(input: CreateUserDto & { actorUserId: string }) {
    return this.db.createUser(input);
  }

  updateUser(id: string, input: UpdateUserDto & { actorUserId: string }) {
    return this.db.updateUser(id, input);
  }

  deleteUser(id: string, input: { actorUserId: string }) {
    return this.db.deleteUser(id, input);
  }

  hardDeleteUser(id: string, input: { actorUserId: string }) {
    return this.db.hardDeleteUser(id, input);
  }

  undeleteUser(id: string, input: { actorUserId: string }) {
    return this.db.undeleteUser(id, input);
  }

  listDeletedUsers(query?: string) {
    return this.db.listDeletedUsers(query);
  }

  bulkCreateInvitations(
    churchId: string,
    emails: string[],
    roleId: string | undefined,
    actorUserId: string,
    type?: 'team' | 'member'
  ) {
    return this.db.bulkCreateInvitations(churchId, emails, roleId, actorUserId, type);
  }
}

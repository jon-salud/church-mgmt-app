import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IUsersRepository } from './users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { ChurchId } from '../../domain/value-objects/ChurchId';

@Injectable()
export class UsersDataStoreRepository implements IUsersRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listUsers(query?: string): Promise<User[]> {
    const users = await this.db.listUsers(query);
    return users.map(this.mapToUser);
  }

  async getUserProfile(id: UserId): Promise<User | null> {
    const profile = await this.db.getUserProfile(id.value);
    return profile ? this.mapToUser(profile) : null;
  }

  async createUser(user: User, actorUserId: UserId): Promise<User> {
    const dto = this.mapToCreateUserDto(user, actorUserId);
    const result = await this.db.createUser(dto);
    return this.mapToUser(result);
  }

  async updateUser(
    id: UserId,
    input: UpdateUserDto & { actorUserId: UserId }
  ): Promise<User | null> {
    const result = await this.db.updateUser(id.value, {
      ...input,
      actorUserId: input.actorUserId.value,
    });
    return result ? this.mapToUser(result) : null;
  }

  deleteUser(id: UserId, input: { actorUserId: UserId }): Promise<{ success: boolean }> {
    return this.db.deleteUser(id.value, { actorUserId: input.actorUserId.value });
  }

  hardDeleteUser(id: UserId, input: { actorUserId: UserId }): Promise<unknown> {
    return this.db.hardDeleteUser(id.value, { actorUserId: input.actorUserId.value });
  }

  undeleteUser(id: UserId, input: { actorUserId: UserId }): Promise<unknown> {
    return this.db.undeleteUser(id.value, { actorUserId: input.actorUserId.value });
  }

  async listDeletedUsers(query?: string): Promise<User[]> {
    const users = await this.db.listDeletedUsers(query);
    return users.map(this.mapToUser);
  }

  bulkCreateInvitations(
    churchId: ChurchId,
    emails: string[],
    roleId: string | undefined,
    actorUserId: UserId,
    type?: 'team' | 'member'
  ): Promise<unknown[]> {
    return this.db.bulkCreateInvitations(churchId.value, emails, roleId, actorUserId.value, type);
  }

  private mapToUser(profile: any): User {
    return User.from({
      id: UserId.create(profile.id),
      primaryEmail: Email.create(profile.primaryEmail),
      churchId: ChurchId.create(profile.roles?.[0]?.churchId || 'church-acc'),
      status: profile.status || 'active',
      createdAt: new Date(profile.createdAt),
      lastLoginAt: profile.lastLoginAt ? new Date(profile.lastLoginAt) : undefined,
      roles: profile.roles || [],
      profile: profile.profile || {
        firstName: '',
        lastName: '',
        householdId: '',
        householdRole: 'Head',
      },
      deletedAt: profile.deletedAt ? new Date(profile.deletedAt) : undefined,
    });
  }

  private mapToCreateUserDto(
    user: User,
    actorUserId: UserId
  ): CreateUserDto & { churchId: string; actorUserId: string } {
    return {
      primaryEmail: user.primaryEmail.value,
      churchId: user.churchId.value,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      actorUserId: actorUserId.value,
    };
  }
}

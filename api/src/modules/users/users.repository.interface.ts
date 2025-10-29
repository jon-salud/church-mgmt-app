import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { ChurchId } from '../../domain/value-objects/ChurchId';

export interface IUsersRepository {
  listUsers(query?: string): Promise<User[]>;
  getUserProfile(id: UserId): Promise<User | null>;
  createUser(user: User, actorUserId: UserId): Promise<User>;
  updateUser(id: UserId, input: UpdateUserDto & { actorUserId: UserId }): Promise<User | null>;
  deleteUser(id: UserId, input: { actorUserId: UserId }): Promise<{ success: boolean }>;
  hardDeleteUser(id: UserId, input: { actorUserId: UserId }): Promise<unknown>;
  undeleteUser(id: UserId, input: { actorUserId: UserId }): Promise<unknown>;
  listDeletedUsers(query?: string): Promise<User[]>;
  bulkCreateInvitations(
    churchId: ChurchId,
    emails: string[],
    roleId: string | undefined,
    actorUserId: UserId,
    type?: 'team' | 'member'
  ): Promise<unknown[]>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

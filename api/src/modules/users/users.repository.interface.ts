import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserProfile {
  id: string;
  churchId: string;
  primaryEmail: string;
  status: string;
  createdAt: string;
  roles: Record<string, unknown>[];
  profile: Record<string, unknown>;
  groups?: Record<string, unknown>[];
  attendance?: Record<string, unknown>[];
  contributions?: Record<string, unknown>[];
  household?: Record<string, unknown>;
}

export interface UserListItem {
  id: string;
  primaryEmail: string;
  status: string;
  createdAt: string;
  roles: Record<string, unknown>[];
  profile: Record<string, unknown>;
  groups: Record<string, unknown>[];
}

export interface IUsersRepository {
  listUsers(query?: string): Promise<UserListItem[]>;
  getUserProfile(id: string): Promise<UserProfile | null>;
  createUser(input: CreateUserDto & { actorUserId: string }): Promise<UserProfile>;
  updateUser(
    id: string,
    input: UpdateUserDto & { actorUserId: string }
  ): Promise<UserProfile | null>;
  deleteUser(id: string, input: { actorUserId: string }): Promise<{ success: boolean }>;
  hardDeleteUser(id: string, input: { actorUserId: string }): Promise<unknown>;
  undeleteUser(id: string, input: { actorUserId: string }): Promise<unknown>;
  listDeletedUsers(query?: string): Promise<UserListItem[]>;
  bulkCreateInvitations(
    churchId: string,
    emails: string[],
    actorUserId: string,
    roleId?: string,
    type?: 'team' | 'member'
  ): Promise<unknown[]>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

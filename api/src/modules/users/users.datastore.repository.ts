import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IUsersRepository } from './users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { ChurchId } from '../../domain/value-objects/ChurchId';

type DataStoreRole = { churchId: string; role?: string; roleId?: string };
type DataStoreUserProfile = {
  id: string;
  primaryEmail: string;
  roles: DataStoreRole[];
  profile: any;
  status?: string;
  createdAt: string;
  lastLoginAt?: string;
  deletedAt?: string;
  themePreference?: string;
  themeDarkMode?: boolean;
  fontSizePreference?: string;
  groups?: unknown[];
};

@Injectable()
export class UsersDataStoreRepository implements IUsersRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listUsers(query?: string): Promise<User[]> {
    const users = await this.db.listUsers(query);
    return users.map((profile: DataStoreUserProfile) => {
      const u = this.mapToUser(profile);
      if (profile && profile.groups) {
        // Attach groups in a typed-safe way via intersection
        return Object.assign(u as User & { groups?: unknown[] }, { groups: profile.groups });
      }
      return u;
    });
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

  private mapToUser = (profile: DataStoreUserProfile): User => {
    if (
      !profile.roles ||
      !Array.isArray(profile.roles) ||
      profile.roles.length === 0 ||
      !profile.roles[0].churchId
    ) {
      throw new Error(
        `Cannot determine churchId for user profile with id=${profile.id}. profile.roles: ${JSON.stringify(profile.roles)}`
      );
    }
    const churchId = ChurchId.create(profile.roles[0].churchId);
    const rolesWithNames = (profile.roles || [])
      .filter(r => !!r.roleId)
      .map(r => ({ churchId: r.churchId, roleId: r.roleId!, role: r.role }));
    const safeRolesWithNames =
      rolesWithNames.length > 0
        ? rolesWithNames
        : (User.createDefaultRoles(churchId).map(r => ({ ...r, role: 'Member' })) as {
            churchId: string;
            roleId: string;
            role: string;
          }[]);
    const status: 'active' | 'invited' = profile.status === 'invited' ? 'invited' : 'active';

    return User.from({
      id: UserId.create(profile.id),
      primaryEmail: Email.create(profile.primaryEmail),
      churchId,
      status,
      createdAt: new Date(profile.createdAt),
      lastLoginAt: profile.lastLoginAt ? new Date(profile.lastLoginAt) : undefined,
      // Preserve role name in API shape while satisfying domain typing
      roles: safeRolesWithNames as unknown as { churchId: string; roleId: string }[],
      profile: profile.profile,
      deletedAt: profile.deletedAt ? new Date(profile.deletedAt) : undefined,
      themePreference: profile.themePreference,
      themeDarkMode: profile.themeDarkMode,
      fontSizePreference: profile.fontSizePreference,
    });
  };

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

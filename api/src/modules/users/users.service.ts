import { Inject, Injectable } from '@nestjs/common';
import { IUsersRepository, USER_REPOSITORY } from './users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { randomUUID } from 'node:crypto';

@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUsersRepository) {}

  async list(q?: string) {
    const users = await this.repo.listUsers(q);
    return users.map(user => this.toUserResponse(user));
  }

  async get(id: string) {
    const userId = UserId.create(id);
    const user = await this.repo.getUserProfile(userId);
    return user ? this.toUserResponse(user) : null;
  }

  async create(input: CreateUserDto, actorUserId: string) {
    const actorId = UserId.create(actorUserId);
    const user = await this.repo.getUserProfile(actorId);
    if (!user) {
      throw new Error('Actor user not found');
    }

    const userId = UserId.create(randomUUID());
    const email = Email.create(input.primaryEmail);
    const churchId = user.churchId; // Get from actor's church

    const newUser = User.create({
      id: userId,
      primaryEmail: email,
      churchId,
      status: 'invited',
      createdAt: new Date(),
      roles: [{ churchId: churchId.value, roleId: 'role-member' }], // Default role
      profile: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        householdId: '', // Will be set later
        householdRole: 'Head',
      },
    });

    const createdUser = await this.repo.createUser(newUser, actorId);
    return this.toUserResponse(createdUser);
  }

  async update(id: string, input: UpdateUserDto, actorUserId: string) {
    const userId = UserId.create(id);
    const actorId = UserId.create(actorUserId);
    const updatedUser = await this.repo.updateUser(userId, { ...input, actorUserId: actorId });
    return updatedUser ? this.toUserResponse(updatedUser) : null;
  }

  delete(id: string, actorUserId: string) {
    const userId = UserId.create(id);
    const actorId = UserId.create(actorUserId);
    return this.repo.deleteUser(userId, { actorUserId: actorId });
  }

  // Admin operations for permanent deletion and recovery
  hardDelete(id: string, actorUserId: string) {
    const userId = UserId.create(id);
    const actorId = UserId.create(actorUserId);
    return this.repo.hardDeleteUser(userId, { actorUserId: actorId });
  }

  undelete(id: string, actorUserId: string) {
    const userId = UserId.create(id);
    const actorId = UserId.create(actorUserId);
    return this.repo.undeleteUser(userId, { actorUserId: actorId });
  }

  listDeleted(q?: string) {
    return this.repo.listDeletedUsers(q);
  }

  async bulkImport(emails: string[], actorUserId: string) {
    // Get the user's church ID
    const actorId = UserId.create(actorUserId);
    const user = await this.repo.getUserProfile(actorId);
    if (!user) {
      throw new Error('User not found');
    }

    // Use the invitations service to send bulk invitations
    return this.repo.bulkCreateInvitations(user.churchId, emails, undefined, actorId, 'member');
  }

  private toUserResponse(user: User) {
    return {
      id: user.id.value,
      primaryEmail: user.primaryEmail.value,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      profile: user.profile,
      roles: user.roles,
      deletedAt: user.deletedAt?.toISOString(),
    };
  }
}

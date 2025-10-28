import { Inject, Injectable } from '@nestjs/common';
import { IUsersRepository, USER_REPOSITORY } from './users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUsersRepository) {}

  list(q?: string) {
    return this.repo.listUsers(q);
  }

  get(id: string) {
    return this.repo.getUserProfile(id);
  }

  create(input: CreateUserDto, actorUserId: string) {
    return this.repo.createUser({ ...input, actorUserId });
  }

  update(id: string, input: UpdateUserDto, actorUserId: string) {
    return this.repo.updateUser(id, { ...input, actorUserId });
  }

  delete(id: string, actorUserId: string) {
    return this.repo.deleteUser(id, { actorUserId });
  }

  // Admin operations for permanent deletion and recovery
  hardDelete(id: string, actorUserId: string) {
    return this.repo.hardDeleteUser(id, { actorUserId });
  }

  undelete(id: string, actorUserId: string) {
    return this.repo.undeleteUser(id, { actorUserId });
  }

  listDeleted(q?: string) {
    return this.repo.listDeletedUsers(q);
  }

  async bulkImport(emails: string[], actorUserId: string) {
    // Get the user's church ID
    const user = await this.repo.getUserProfile(actorUserId);
    if (!user?.churchId) {
      throw new Error('User must be associated with a church');
    }

    // Use the invitations service to send bulk invitations
    return this.repo.bulkCreateInvitations(user.churchId, emails, undefined, actorUserId, 'member');
  }
}

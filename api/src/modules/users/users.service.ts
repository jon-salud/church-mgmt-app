import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IUsersRepository, USER_REPOSITORY } from './users.repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateThemeDto } from './dto/theme.dto';
import { BulkActionDto, BulkActionType, BulkActionResult } from './dto/bulk-action.dto';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { randomUUID } from 'node:crypto';
import {
  ThemePreset,
  FontSizePreset,
  isValidThemePreset,
  isValidFontSizePreset,
} from './types/theme.types';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly repo: IUsersRepository,
    @Inject(GroupsService) private readonly groupsService: GroupsService
  ) {}

  async list(q?: string) {
    const users = await this.repo.listUsers(q);
    return (users as any[]).map(user => {
      const base = this.toUserResponse(user as any);
      // Preserve repository-enriched fields (e.g., groups) if present
      if ((user as any).groups) {
        return { ...base, groups: (user as any).groups };
      }
      return base;
    });
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
      roles: User.createDefaultRoles(churchId),
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

  async bulkAction(dto: BulkActionDto, actorUserId: string): Promise<BulkActionResult> {
    const result: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const memberId of dto.memberIds) {
      try {
        switch (dto.action) {
          case BulkActionType.ADD_TO_GROUP: {
            if (!dto.params || !('groupId' in dto.params)) {
              throw new Error('groupId is required for addToGroup action');
            }
            await this.groupsService.addMember(
              dto.params.groupId,
              { userId: memberId, role: 'Member' },
              actorUserId
            );
            break;
          }
          case BulkActionType.SET_STATUS: {
            if (!dto.params || !('status' in dto.params)) {
              throw new Error('status is required for setStatus action');
            }
            const userId = UserId.create(memberId);
            const actorId = UserId.create(actorUserId);
            const status = dto.params.status as 'active' | 'invited';
            await this.repo.updateUser(userId, {
              status,
              actorUserId: actorId,
            });
            break;
          }
          case BulkActionType.DELETE: {
            const deleteUserId = UserId.create(memberId);
            const deleteActorId = UserId.create(actorUserId);
            await this.repo.deleteUser(deleteUserId, { actorUserId: deleteActorId });
            break;
          }
          default:
            throw new Error(`Unknown action: ${dto.action}`);
        }

        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          memberId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Get user's theme preferences
   * @param userId User ID
   * @returns Theme preferences or defaults
   */
  async getUserTheme(userId: string) {
    const id = UserId.create(userId);
    const user = await this.repo.getUserProfile(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      themePreference: (user.themePreference as ThemePreset) || ThemePreset.ORIGINAL,
      themeDarkMode: user.themeDarkMode ?? false,
      fontSizePreference: (user.fontSizePreference as FontSizePreset) || FontSizePreset.DEFAULT,
    };
  }

  /**
   * Update user's theme preferences
   * @param userId User ID
   * @param updateThemeDto Theme updates
   * @returns Updated theme preferences
   */
  async updateUserTheme(userId: string, updateThemeDto: UpdateThemeDto) {
    // Validate theme preset if provided
    if (updateThemeDto.themePreference && !isValidThemePreset(updateThemeDto.themePreference)) {
      throw new BadRequestException('Invalid theme preset');
    }

    // Validate font size preset if provided
    if (
      updateThemeDto.fontSizePreference &&
      !isValidFontSizePreset(updateThemeDto.fontSizePreference)
    ) {
      throw new BadRequestException('Invalid font size preset');
    }

    const id = UserId.create(userId);
    const actorId = id; // User updating their own theme

    const updateData: any = { actorUserId: actorId };
    if (updateThemeDto.themePreference !== undefined) {
      updateData.themePreference = updateThemeDto.themePreference;
    }
    if (updateThemeDto.themeDarkMode !== undefined) {
      updateData.themeDarkMode = updateThemeDto.themeDarkMode;
    }
    if (updateThemeDto.fontSizePreference !== undefined) {
      updateData.fontSizePreference = updateThemeDto.fontSizePreference;
    }

    const updatedUser = await this.repo.updateUser(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      themePreference: (updatedUser.themePreference as ThemePreset) || ThemePreset.ORIGINAL,
      themeDarkMode: updatedUser.themeDarkMode ?? false,
      fontSizePreference:
        (updatedUser.fontSizePreference as FontSizePreset) || FontSizePreset.DEFAULT,
    };
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

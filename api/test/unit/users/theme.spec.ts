import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from '../../../src/modules/users/users.service';
import { ThemePreset, isValidThemePreset } from '../../../src/modules/users/types/theme.types';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { IUsersRepository } from '../../../src/modules/users/users.repository.interface';
import { User } from '../../../src/domain/entities/User';
import { UserId } from '../../../src/domain/value-objects/UserId';
import { Email } from '../../../src/domain/value-objects/Email';
import { ChurchId } from '../../../src/domain/value-objects/ChurchId';

describe('User Theme Preferences Service', () => {
  let service: UsersService;
  let mockRepository: Partial<IUsersRepository>;

  beforeEach(() => {
    mockRepository = {
      getUserProfile: vi.fn(),
      updateUser: vi.fn(),
    };

    service = new UsersService(mockRepository as IUsersRepository);
  });

  describe('getUserTheme()', () => {
    it('should return user theme preferences when they exist', async () => {
      const mockUser = User.from({
        id: UserId.create('user-123'),
        primaryEmail: Email.create('test@example.com'),
        churchId: ChurchId.create('church-1'),
        status: 'active',
        createdAt: new Date(),
        roles: [],
        profile: {
          firstName: 'Test',
          lastName: 'User',
          householdId: 'household-1',
          householdRole: 'Head',
        },
        themePreference: ThemePreset.VIBRANT_BLUE,
        themeDarkMode: true,
      });

      vi.mocked(mockRepository.getUserProfile!).mockResolvedValue(mockUser);

      const result = await service.getUserTheme('user-123');

      expect(result.themePreference).toBe(ThemePreset.VIBRANT_BLUE);
      expect(result.themeDarkMode).toBe(true);
    });

    it('should return defaults when user has no preferences', async () => {
      const mockUser = User.from({
        id: UserId.create('user-456'),
        primaryEmail: Email.create('test2@example.com'),
        churchId: ChurchId.create('church-1'),
        status: 'active',
        createdAt: new Date(),
        roles: [],
        profile: {
          firstName: 'Test',
          lastName: 'User2',
          householdId: 'household-1',
          householdRole: 'Head',
        },
        // No theme fields
      });

      vi.mocked(mockRepository.getUserProfile!).mockResolvedValue(mockUser);

      const result = await service.getUserTheme('user-456');

      expect(result.themePreference).toBe(ThemePreset.ORIGINAL);
      expect(result.themeDarkMode).toBe(false);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      vi.mocked(mockRepository.getUserProfile!).mockResolvedValue(null);

      await expect(service.getUserTheme('nonexistent-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserTheme()', () => {
    it('should update theme preference only', async () => {
      const mockUpdatedUser = User.from({
        id: UserId.create('user-123'),
        primaryEmail: Email.create('test@example.com'),
        churchId: ChurchId.create('church-1'),
        status: 'active',
        createdAt: new Date(),
        roles: [],
        profile: {
          firstName: 'Test',
          lastName: 'User',
          householdId: 'household-1',
          householdRole: 'Head',
        },
        themePreference: ThemePreset.TEAL_ACCENT,
        themeDarkMode: false,
      });

      vi.mocked(mockRepository.updateUser!).mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserTheme('user-123', {
        themePreference: ThemePreset.TEAL_ACCENT,
      });

      expect(result.themePreference).toBe(ThemePreset.TEAL_ACCENT);
      expect(result.themeDarkMode).toBe(false);
    });

    it('should update dark mode only', async () => {
      const mockUpdatedUser = User.from({
        id: UserId.create('user-123'),
        primaryEmail: Email.create('test@example.com'),
        churchId: ChurchId.create('church-1'),
        status: 'active',
        createdAt: new Date(),
        roles: [],
        profile: {
          firstName: 'Test',
          lastName: 'User',
          householdId: 'household-1',
          householdRole: 'Head',
        },
        themePreference: ThemePreset.ORIGINAL,
        themeDarkMode: true,
      });

      vi.mocked(mockRepository.updateUser!).mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserTheme('user-123', {
        themeDarkMode: true,
      });

      expect(result.themePreference).toBe(ThemePreset.ORIGINAL);
      expect(result.themeDarkMode).toBe(true);
    });

    it('should update both fields simultaneously', async () => {
      const mockUpdatedUser = User.from({
        id: UserId.create('user-123'),
        primaryEmail: Email.create('test@example.com'),
        churchId: ChurchId.create('church-1'),
        status: 'active',
        createdAt: new Date(),
        roles: [],
        profile: {
          firstName: 'Test',
          lastName: 'User',
          householdId: 'household-1',
          householdRole: 'Head',
        },
        themePreference: ThemePreset.WARM_ACCENT,
        themeDarkMode: true,
      });

      vi.mocked(mockRepository.updateUser!).mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserTheme('user-123', {
        themePreference: ThemePreset.WARM_ACCENT,
        themeDarkMode: true,
      });

      expect(result.themePreference).toBe(ThemePreset.WARM_ACCENT);
      expect(result.themeDarkMode).toBe(true);
    });

    it('should reject invalid theme preset', async () => {
      await expect(
        service.updateUserTheme('user-123', {
          themePreference: 'invalid-theme' as any,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid user', async () => {
      vi.mocked(mockRepository.updateUser!).mockResolvedValue(null);

      await expect(
        service.updateUserTheme('nonexistent-user', {
          themePreference: ThemePreset.VIBRANT_BLUE,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle empty update gracefully', async () => {
      const mockUpdatedUser = User.from({
        id: UserId.create('user-123'),
        primaryEmail: Email.create('test@example.com'),
        churchId: ChurchId.create('church-1'),
        status: 'active',
        createdAt: new Date(),
        roles: [],
        profile: {
          firstName: 'Test',
          lastName: 'User',
          householdId: 'household-1',
          householdRole: 'Head',
        },
        themePreference: ThemePreset.ORIGINAL,
        themeDarkMode: false,
      });

      vi.mocked(mockRepository.updateUser!).mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserTheme('user-123', {});

      expect(result.themePreference).toBe(ThemePreset.ORIGINAL);
      expect(result.themeDarkMode).toBe(false);
    });
  });
});

describe('ThemePreset Type Guard', () => {
  it('should validate correct theme preset strings', () => {
    expect(isValidThemePreset('original')).toBe(true);
    expect(isValidThemePreset('vibrant-blue')).toBe(true);
    expect(isValidThemePreset('teal-accent')).toBe(true);
    expect(isValidThemePreset('warm-accent')).toBe(true);
  });

  it('should reject invalid theme preset strings', () => {
    expect(isValidThemePreset('invalid-theme')).toBe(false);
    expect(isValidThemePreset('')).toBe(false);
    expect(isValidThemePreset('ORIGINAL')).toBe(false); // Case-sensitive
    expect(isValidThemePreset('vibrant_blue')).toBe(false); // Wrong separator
  });
});

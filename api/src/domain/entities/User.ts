import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { ChurchId } from '../value-objects/ChurchId';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  birthday?: string;
  notes?: string;
  photoUrl?: string;
  householdId: string;
  householdRole: string;
  membershipStatus?: string;
  joinMethod?: string;
  joinDate?: string;
  previousChurch?: string;
  baptismDate?: string;
  spiritualGifts?: readonly string[];
  coursesAttended?: readonly string[];
  maritalStatus?: string;
  occupation?: string;
  school?: string;
  gradeLevel?: string;
  graduationYear?: number;
  skillsAndInterests?: readonly string[];
  backgroundCheckStatus?: string;
  backgroundCheckDate?: string;
  onboardingComplete?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergiesOrMedicalNotes?: string;
  parentalConsentOnFile?: boolean;
  pastoralNotes?: string;
}

export interface UserRole {
  churchId: string;
  roleId: string;
}

export interface UserProps {
  id: UserId;
  primaryEmail: Email;
  churchId: ChurchId;
  status: 'active' | 'invited';
  createdAt: Date;
  lastLoginAt?: Date;
  roles: readonly UserRole[];
  profile: Readonly<UserProfile>;
  deletedAt?: Date;
  // Theme Preferences (Phase 1 - User Theme Preferences Sprint)
  themePreference?: string;
  themeDarkMode?: boolean;
}

export class User {
  readonly id: UserId;
  readonly primaryEmail: Email;
  readonly churchId: ChurchId;
  readonly status: 'active' | 'invited';
  readonly createdAt: Date;
  readonly lastLoginAt?: Date;
  readonly roles: readonly UserRole[];
  readonly profile: Readonly<UserProfile>;
  readonly deletedAt?: Date;
  // Theme Preferences (Phase 1 - User Theme Preferences Sprint)
  readonly themePreference?: string;
  readonly themeDarkMode?: boolean;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.primaryEmail = props.primaryEmail;
    this.churchId = props.churchId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.lastLoginAt = props.lastLoginAt;
    this.roles = Object.freeze([...props.roles]); // Deep freeze the array
    this.profile = User.deepFreezeProfile(props.profile);
    this.deletedAt = props.deletedAt;
    // Theme Preferences (Phase 1 - User Theme Preferences Sprint)
    this.themePreference = props.themePreference;
    this.themeDarkMode = props.themeDarkMode;
  }

  private static deepFreezeProfile(profile: UserProfile): Readonly<UserProfile> {
    // Recursively deep freeze the profile object
    return User.deepFreeze({ ...profile });
  }

  /**
   * Recursively deep-freezes an object and all nested arrays/objects.
   */
  private static deepFreeze<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    // Freeze properties before freezing self
    Object.getOwnPropertyNames(obj).forEach(prop => {
      // @ts-expect-error - Dynamic property access on unknown object type
      const value = obj[prop];
      if (value && typeof value === 'object') {
        User.deepFreeze(value);
      }
    });
    return Object.freeze(obj);
  }

  static create(props: Omit<UserProps, 'deletedAt'>): User {
    if (!props.profile.firstName.trim()) {
      throw new Error('First name is required');
    }
    if (!props.profile.lastName.trim()) {
      throw new Error('Last name is required');
    }
    return new User(props);
  }

  /**
   * Creates default roles for a new user in the specified church.
   */
  static createDefaultRoles(churchId: ChurchId): readonly UserRole[] {
    return Object.freeze([{ churchId: churchId.value, roleId: 'role-member' }]);
  }

  /**
   * Reconstructs a User entity from already-validated persistence data (e.g., database records).
   * This bypasses validation. Use only when loading from storage.
   * For new entities requiring validation, use User.create().
   */
  static from(props: UserProps): User {
    return new User(props);
  }

  isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  markAsDeleted(): User {
    return new User({
      ...this,
      deletedAt: new Date(),
    });
  }
}

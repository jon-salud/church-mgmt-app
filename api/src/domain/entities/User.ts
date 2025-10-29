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
  spiritualGifts?: string[];
  coursesAttended?: string[];
  maritalStatus?: string;
  occupation?: string;
  school?: string;
  gradeLevel?: string;
  graduationYear?: number;
  skillsAndInterests?: string[];
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
  roles: UserRole[];
  profile: UserProfile;
  deletedAt?: Date;
}

export class User {
  readonly id: UserId;
  readonly primaryEmail: Email;
  readonly churchId: ChurchId;
  readonly status: 'active' | 'invited';
  readonly createdAt: Date;
  readonly lastLoginAt?: Date;
  readonly roles: UserRole[];
  readonly profile: UserProfile;
  readonly deletedAt?: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.primaryEmail = props.primaryEmail;
    this.churchId = props.churchId;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.lastLoginAt = props.lastLoginAt;
    this.roles = props.roles;
    this.profile = props.profile;
    this.deletedAt = props.deletedAt;
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

// Shared input types for data store operations
export interface PastoralCareTicketCreateInput {
  churchId: string;
  title: string;
  description: string;
  priority?: string;
  authorId: string;
  actorUserId: string;
}

export interface PastoralCareTicketUpdateInput {
  status?: string;
  assigneeId?: string;
  actorUserId: string;
}

export interface PastoralCareCommentCreateInput {
  ticketId: string;
  body: string;
  authorId: string;
  actorUserId: string;
}

export interface AttendanceInput {
  eventId: string;
  userId: string;
  status: 'checkedIn' | 'absent' | 'excused';
  note?: string;
  recordedBy?: string;
}

export interface ContributionInput {
  memberId: string;
  amount: number;
  date: string;
  fundId?: string;
  method: 'cash' | 'bank-transfer' | 'eftpos' | 'other';
  note?: string;
  recordedBy?: string;
}

export interface ContributionUpdateInput {
  memberId?: string;
  amount?: number;
  date?: string;
  fundId?: string | null;
  method?: 'cash' | 'bank-transfer' | 'eftpos' | 'other';
  note?: string | null;
  actorUserId: string;
}

export interface UserCreateInput {
  primaryEmail: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: 'active' | 'invited';
  roleIds?: string[];
  actorUserId: string;
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

export interface UserUpdateInput {
  primaryEmail?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: 'active' | 'invited';
  roleIds?: string[];
  actorUserId: string;
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

export interface UserDeleteInput {
  actorUserId: string;
}

export interface GroupMemberCreateInput {
  userId: string;
  role?: 'Member' | 'Leader' | 'Admin' | 'Coordinator' | 'Volunteer';
  status?: 'Active' | 'Inactive';
  joinedAt?: string;
  actorUserId: string;
}

export interface GroupMemberUpdateInput {
  role?: 'Member' | 'Leader' | 'Admin' | 'Coordinator' | 'Volunteer';
  status?: 'Active' | 'Inactive';
  actorUserId: string;
}

export interface GroupMemberRemoveInput {
  actorUserId: string;
}

export interface GroupResourceCreateInput {
  title: string;
  url: string;
  actorUserId: string;
}

export interface GroupResourceUpdateInput {
  title?: string;
  url?: string;
  actorUserId: string;
}

export interface GroupResourceDeleteInput {
  actorUserId: string;
}

export interface EventCreateInput {
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  location?: string;
  visibility?: 'public' | 'private';
  groupId?: string;
  tags?: string[];
  actorUserId: string;
}

export interface EventUpdateInput {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  visibility?: 'public' | 'private';
  groupId?: string | null;
  tags?: string[];
  actorUserId: string;
}

export interface EventDeleteInput {
  actorUserId: string;
}

export interface EventVolunteerRoleCreateInput {
  eventId: string;
  name: string;
  needed: number;
}

export interface EventVolunteerRoleUpdateInput {
  name?: string;
  needed?: number;
}

export interface EventVolunteerSignupCreateInput {
  volunteerRoleId: string;
  userId: string;
}

export interface RoleCreateInput {
  name: string;
  description?: string;
  permissions?: string[];
  actorUserId: string;
  slug?: string;
}

export interface RoleUpdateInput {
  name?: string;
  description?: string | null;
  permissions?: string[];
  actorUserId: string;
}

export interface RoleDeleteInput {
  actorUserId: string;
  reassignRoleId?: string;
}

export interface AuditLogFilter {
  churchId?: string;
  actorUserId?: string;
  entity?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogCreateInput {
  churchId?: string;
  actorUserId: string;
  action: string;
  entity: string;
  entityId?: string;
  summary: string;
  diff?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface AnnouncementCreateInput {
  title: string;
  body: string;
  audience: 'all' | 'custom';
  groupIds?: string[];
  publishAt?: string;
  expireAt?: string | null;
  actorUserId: string;
}

export interface AnnouncementUpdateInput {
  title?: string;
  body?: string;
  audience?: 'all' | 'custom';
  groupIds?: string[];
  publishAt?: string;
  expireAt?: string | null;
  actorUserId: string;
}

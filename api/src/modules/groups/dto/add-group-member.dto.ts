import { IsIn, IsOptional, IsString } from 'class-validator';

export const MEMBER_ROLES = ['Member', 'Leader', 'Coordinator', 'Volunteer'] as const;
export const MEMBER_STATUSES = ['Active', 'Inactive'] as const;

export class AddGroupMemberDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsIn(MEMBER_ROLES)
  role?: (typeof MEMBER_ROLES)[number];

  @IsOptional()
  @IsIn(MEMBER_STATUSES)
  status?: (typeof MEMBER_STATUSES)[number];

  @IsOptional()
  @IsString()
  joinedAt?: string;
}

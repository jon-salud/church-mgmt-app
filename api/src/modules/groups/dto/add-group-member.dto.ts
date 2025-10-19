import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const MEMBER_ROLES = ['Member', 'Leader', 'Coordinator', 'Volunteer'] as const;
export const MEMBER_STATUSES = ['Active', 'Inactive'] as const;

export class AddGroupMemberDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiPropertyOptional({ enum: MEMBER_ROLES })
  @IsOptional()
  @IsIn(MEMBER_ROLES)
  role?: (typeof MEMBER_ROLES)[number];

  @ApiPropertyOptional({ enum: MEMBER_STATUSES })
  @IsOptional()
  @IsIn(MEMBER_STATUSES)
  status?: (typeof MEMBER_STATUSES)[number];

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsString()
  joinedAt?: string;
}

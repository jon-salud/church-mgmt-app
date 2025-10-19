import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MEMBER_ROLES, MEMBER_STATUSES } from './add-group-member.dto';

export class UpdateGroupMemberDto {
  @ApiPropertyOptional({ enum: MEMBER_ROLES })
  @IsOptional()
  @IsIn(MEMBER_ROLES)
  role?: (typeof MEMBER_ROLES)[number];

  @ApiPropertyOptional({ enum: MEMBER_STATUSES })
  @IsOptional()
  @IsIn(MEMBER_STATUSES)
  status?: (typeof MEMBER_STATUSES)[number];
}

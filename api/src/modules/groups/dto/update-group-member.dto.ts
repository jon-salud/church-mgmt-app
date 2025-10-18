import { IsIn, IsOptional } from 'class-validator';
import { MEMBER_ROLES, MEMBER_STATUSES } from './add-group-member.dto';

export class UpdateGroupMemberDto {
  @IsOptional()
  @IsIn(MEMBER_ROLES)
  role?: (typeof MEMBER_ROLES)[number];

  @IsOptional()
  @IsIn(MEMBER_STATUSES)
  status?: (typeof MEMBER_STATUSES)[number];
}

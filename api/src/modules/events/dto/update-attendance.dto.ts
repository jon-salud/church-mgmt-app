import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsString()
  userId!: string;

  @IsIn(['checkedIn', 'absent', 'excused'])
  status!: 'checkedIn' | 'absent' | 'excused';

  @IsOptional()
  @IsString()
  note?: string;
}

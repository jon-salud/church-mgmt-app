import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAttendanceDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty({ enum: ['checkedIn', 'absent', 'excused'] })
  @IsIn(['checkedIn', 'absent', 'excused'])
  status!: 'checkedIn' | 'absent' | 'excused';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

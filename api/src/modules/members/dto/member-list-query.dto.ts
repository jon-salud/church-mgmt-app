import { IsOptional, IsInt, Min, Max, IsString, IsBoolean, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MemberListQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional({
    description: 'Sort field and direction (e.g., "name:asc", "lastAttendance:desc")',
    example: 'name:asc',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'Search query for name, email, or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (comma-separated: member,visitor,inactive)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by role (comma-separated)' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by last attendance bucket',
    enum: ['7d', '30d', '60d', '90d', 'never'],
  })
  @IsOptional()
  @IsIn(['7d', '30d', '60d', '90d', 'never'])
  lastAttendance?: string;

  @ApiPropertyOptional({ description: 'Minimum number of groups' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  groupsCountMin?: number;

  @ApiPropertyOptional({ description: 'Filter members with email', type: Boolean })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hasEmail?: boolean;

  @ApiPropertyOptional({ description: 'Filter members with phone', type: Boolean })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hasPhone?: boolean;
}

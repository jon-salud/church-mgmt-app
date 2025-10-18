import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAuditQueryDto {
  @IsOptional()
  @IsString()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}


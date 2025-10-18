import { IsArray, IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const VISIBILITY_VALUES = ['public', 'private'] as const;

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsDateString()
  startAt!: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsIn(VISIBILITY_VALUES)
  visibility?: (typeof VISIBILITY_VALUES)[number];

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

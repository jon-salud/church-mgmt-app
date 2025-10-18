import { IsArray, IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { VISIBILITY_VALUES } from './create-event.dto';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

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
  groupId?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

import { IsArray, IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const ANNOUNCEMENT_AUDIENCES = ['all', 'custom'] as const;

export class CreateAnnouncementDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
  body!: string;

  @IsIn(ANNOUNCEMENT_AUDIENCES)
  audience!: (typeof ANNOUNCEMENT_AUDIENCES)[number];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];

  @IsOptional()
  @IsDateString()
  publishAt?: string;

  @IsOptional()
  @IsDateString()
  expireAt?: string;
}

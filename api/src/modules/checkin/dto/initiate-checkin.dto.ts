import { IsArray, IsString } from 'class-validator';

export class InitiateCheckinDto {
  @IsArray()
  @IsString({ each: true })
  childIds!: string[];

  @IsString()
  eventId!: string;
}

import { IsString } from 'class-validator';

export class ConfirmCheckinDto {
  @IsString()
  checkinId!: string;
}

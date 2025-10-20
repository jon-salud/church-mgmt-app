import { IsString } from 'class-validator';

export class InitiateCheckoutDto {
  @IsString()
  checkinId!: string;
}

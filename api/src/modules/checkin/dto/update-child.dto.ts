import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateChildDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  medicalNotes?: string;

  @IsString()
  actorUserId!: string;
}

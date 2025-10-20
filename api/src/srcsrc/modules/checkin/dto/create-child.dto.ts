import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateChildDto {
  @IsString()
  householdId!: string;

  @IsString()
  fullName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsString()
  @IsOptional()
  allergies?: string;

  @IsString()
  @IsOptional()
  medicalNotes?: string;
}

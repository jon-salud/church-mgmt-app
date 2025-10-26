import { IsInt, IsNotEmpty, IsString, Min, IsOptional } from 'class-validator';

export class CreateEventVolunteerRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  needed!: number;
}

export class UpdateEventVolunteerRoleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  needed?: number;
}

export class CreateEventVolunteerSignupDto {
  @IsString()
  @IsNotEmpty()
  volunteerRoleId!: string;
}

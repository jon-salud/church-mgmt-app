import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateEventVolunteerRoleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  needed!: number;
}

export class UpdateEventVolunteerRoleDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsInt()
  @Min(1)
  needed?: number;
}

export class CreateEventVolunteerSignupDto {
  @IsString()
  @IsNotEmpty()
  volunteerRoleId!: string;
}

import { ArrayNotEmpty, IsArray, IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const ROLE_VALUES = ['Member', 'Leader', 'Admin'] as const;
export const STATUS_VALUES = ['active', 'invited'] as const;

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  primaryEmail!: string;

  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: (typeof STATUS_VALUES)[number];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(ROLE_VALUES, { each: true })
  roles?: Array<(typeof ROLE_VALUES)[number]>;
}

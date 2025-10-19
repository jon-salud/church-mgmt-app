import { ArrayNotEmpty, IsArray, IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const ROLE_VALUES = ['Member', 'Leader', 'Admin'] as const;
export const STATUS_VALUES = ['active', 'invited'] as const;

export class CreateUserDto {
  @ApiProperty({ format: 'email', maxLength: 255 })
  @IsEmail()
  @MaxLength(255)
  primaryEmail!: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ enum: STATUS_VALUES })
  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: (typeof STATUS_VALUES)[number];

  @ApiPropertyOptional({ type: [String], enum: ROLE_VALUES })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(ROLE_VALUES, { each: true })
  roles?: Array<(typeof ROLE_VALUES)[number]>;
}

import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS_VALUES } from './create-user.dto';

export class UpdateUserDto {
  @ApiPropertyOptional({ format: 'email', maxLength: 255 })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  primaryEmail?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

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

  @ApiPropertyOptional({ type: [String], description: 'Role IDs to replace current assignments' })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleIds?: string[];

  // Optional Fields
  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  membershipStatus?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  joinMethod?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsString()
  joinDate?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  previousChurch?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsString()
  baptismDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  spiritualGifts?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coursesAttended?: string[];

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  maritalStatus?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  school?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gradeLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  graduationYear?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsAndInterests?: string[];

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  backgroundCheckStatus?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsString()
  backgroundCheckDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  onboardingComplete?: boolean;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  allergiesOrMedicalNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  parentalConsentOnFile?: boolean;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  pastoralNotes?: string;

  // Theme Preferences (Phase 1 - User Theme Preferences Sprint)
  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  themePreference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  themeDarkMode?: boolean;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fontSizePreference?: string;
}

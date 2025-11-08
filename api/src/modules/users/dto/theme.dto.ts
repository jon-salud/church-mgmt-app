import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThemePreset, FontSizePreset } from '../types/theme.types';

/**
 * DTO for updating user theme preferences
 */
export class UpdateThemeDto {
  @ApiProperty({
    enum: ThemePreset,
    description: 'Theme preset to apply',
    example: ThemePreset.VIBRANT_BLUE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ThemePreset, { message: 'Invalid theme preset' })
  themePreference?: ThemePreset;

  @ApiProperty({
    description: 'Enable dark mode',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'themeDarkMode must be a boolean' })
  themeDarkMode?: boolean;

  @ApiProperty({
    enum: FontSizePreset,
    description: 'Font size preset',
    example: '16px',
    required: false,
  })
  @IsOptional()
  @IsEnum(FontSizePreset, { message: 'Invalid font size preset' })
  fontSizePreference?: FontSizePreset;
}

/**
 * DTO for theme response
 */
export class ThemeResponseDto {
  @ApiProperty({
    enum: ThemePreset,
    description: 'Current theme preset',
    example: ThemePreset.ORIGINAL,
  })
  themePreference!: ThemePreset;

  @ApiProperty({
    description: 'Dark mode enabled',
    example: false,
  })
  themeDarkMode!: boolean;

  @ApiProperty({
    enum: FontSizePreset,
    description: 'Font size preset',
    example: '16px',
  })
  fontSizePreference!: FontSizePreset;
}

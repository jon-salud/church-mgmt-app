import { IsEmail, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ['google', 'facebook'] })
  @IsIn(['google', 'facebook'])
  provider!: 'google' | 'facebook';

  @ApiPropertyOptional({ description: 'Optional role identifier or name to assume for the session', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;
}

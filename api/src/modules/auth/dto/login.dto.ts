import { IsEmail, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../mock/mock-data';

export class LoginDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ['google', 'facebook'] })
  @IsIn(['google', 'facebook'])
  provider!: 'google' | 'facebook';

  @ApiPropertyOptional({ enum: ['Member', 'Leader', 'Admin'] })
  @IsOptional()
  @IsIn(['Member', 'Leader', 'Admin'])
  role?: Role;
}

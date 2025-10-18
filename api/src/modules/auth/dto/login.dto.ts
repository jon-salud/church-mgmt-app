import { IsEmail, IsIn, IsOptional } from 'class-validator';
import { Role } from '../../../mock/mock-data';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsIn(['google', 'facebook'])
  provider!: 'google' | 'facebook';

  @IsOptional()
  @IsIn(['Member', 'Leader', 'Admin'])
  role?: Role;
}

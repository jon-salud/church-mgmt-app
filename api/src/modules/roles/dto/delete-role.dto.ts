import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DeleteRoleDto {
  @ApiPropertyOptional({
    description: 'Role ID to transfer existing assignments to before deletion',
  })
  @IsOptional()
  @IsString()
  reassignRoleId?: string;
}

import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ type: [String], description: 'Role IDs that can view this document' })
  @IsArray()
  @IsString({ each: true })
  roleIds!: string[];
}

import { IsString, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupResourceDto {
  @ApiProperty({ example: 'Updated Bible Study Guide', description: 'Title of the resource' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'https://example.com/updated-guide.pdf',
    description: 'URL of the resource',
  })
  @IsUrl()
  @IsOptional()
  url?: string;
}

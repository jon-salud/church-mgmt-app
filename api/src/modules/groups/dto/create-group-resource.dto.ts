import { IsString, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupResourceDto {
  @ApiProperty({ example: 'Bible Study Guide', description: 'Title of the resource' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'https://example.com/study-guide.pdf',
    description: 'URL of the resource',
  })
  @IsUrl()
  @IsNotEmpty()
  url!: string;
}

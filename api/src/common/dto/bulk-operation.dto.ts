import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkOperationDto {
  @ApiProperty({
    description: 'Array of entity IDs to operate on',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

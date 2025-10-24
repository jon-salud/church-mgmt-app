import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestTypeId: string = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string = '';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string = '';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;
}

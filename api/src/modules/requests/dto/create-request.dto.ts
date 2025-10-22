
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { RequestType } from '../../../mock/mock-data/request';

export class CreateRequestDto {
  @ApiProperty({ enum: RequestType })
  @IsEnum(RequestType)
  @IsNotEmpty()
  type: RequestType = RequestType.Suggestion;

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

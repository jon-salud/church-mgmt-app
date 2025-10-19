import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContributionDto {
  @ApiProperty()
  @IsString()
  memberId!: string;

  @ApiProperty({ minimum: 0.01, type: Number })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fundId?: string;

  @ApiProperty({ enum: ['cash', 'bank-transfer', 'eftpos', 'other'] })
  @IsIn(['cash', 'bank-transfer', 'eftpos', 'other'])
  method!: 'cash' | 'bank-transfer' | 'eftpos' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

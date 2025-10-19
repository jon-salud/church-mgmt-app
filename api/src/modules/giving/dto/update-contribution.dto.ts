import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContributionMethod } from '../../../mock/mock-data';

const CONTRIBUTION_METHODS: ContributionMethod[] = ['cash', 'bank-transfer', 'eftpos', 'other'];

export class UpdateContributionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ minimum: 0, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fundId?: string;

  @ApiPropertyOptional({ enum: CONTRIBUTION_METHODS })
  @IsOptional()
  @IsIn(CONTRIBUTION_METHODS)
  method?: ContributionMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

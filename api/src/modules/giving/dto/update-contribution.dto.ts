import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ContributionMethod } from '../../../mock/mock-data';

const CONTRIBUTION_METHODS: ContributionMethod[] = ['cash', 'bank-transfer', 'eftpos', 'other'];

export class UpdateContributionDto {
  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  fundId?: string;

  @IsOptional()
  @IsIn(CONTRIBUTION_METHODS)
  method?: ContributionMethod;

  @IsOptional()
  @IsString()
  note?: string;
}

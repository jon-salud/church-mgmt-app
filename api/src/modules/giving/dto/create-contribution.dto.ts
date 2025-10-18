import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateContributionDto {
  @IsString()
  memberId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  fundId?: string;

  @IsIn(['cash', 'bank-transfer', 'eftpos', 'other'])
  method!: 'cash' | 'bank-transfer' | 'eftpos' | 'other';

  @IsOptional()
  @IsString()
  note?: string;
}

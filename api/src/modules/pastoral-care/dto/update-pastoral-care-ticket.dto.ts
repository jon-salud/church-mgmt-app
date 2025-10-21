import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdatePastoralCareTicketDto {
  @IsString()
  @IsOptional()
  @IsIn(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'])
  status?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}

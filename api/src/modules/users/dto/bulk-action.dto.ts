import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum BulkActionType {
  ADD_TO_GROUP = 'addToGroup',
  SET_STATUS = 'setStatus',
  DELETE = 'delete',
}

export enum MemberStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
}

class AddToGroupParams {
  @IsUUID()
  @IsNotEmpty()
  groupId!: string;
}

class SetStatusParams {
  @IsEnum(MemberStatus)
  @IsNotEmpty()
  status!: MemberStatus;
}

export class BulkActionDto {
  @IsEnum(BulkActionType)
  @IsNotEmpty()
  action!: BulkActionType;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  memberIds!: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  params?: AddToGroupParams | SetStatusParams | Record<string, never>;
}

export interface BulkActionResult {
  success: number;
  failed: number;
  errors: Array<{ memberId: string; error: string }>;
}

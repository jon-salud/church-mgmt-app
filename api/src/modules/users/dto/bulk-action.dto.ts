import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @IsString()
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
  @IsString({ each: true })
  @IsNotEmpty()
  memberIds!: string[];

  // Keep params as a plain object so ValidationPipe (whitelist) doesn't strip nested fields.
  // We validate required keys dynamically based on `action` in the service.
  @IsOptional()
  params?: AddToGroupParams | SetStatusParams | Record<string, any>;
}

export interface BulkActionResult {
  success: number;
  failed: number;
  errors: Array<{ memberId: string; error: string }>;
}

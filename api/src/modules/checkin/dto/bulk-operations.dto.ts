import { IsArray, IsString } from 'class-validator';

/**
 * DTO for bulk archive operations on children
 */
export class BulkArchiveChildrenDto {
  @IsArray()
  @IsString({ each: true })
  childIds!: string[];
}

/**
 * DTO for bulk restore operations on children
 */
export class BulkRestoreChildrenDto {
  @IsArray()
  @IsString({ each: true })
  childIds!: string[];
}

/**
 * Result type for bulk operations
 */
export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failedIds: string[];
  errors?: Array<{ id: string; error: string }>;
}

import { IsArray, IsString } from 'class-validator';

/**
 * DTO for bulk archive operations on households
 */
export class BulkArchiveHouseholdsDto {
  @IsArray()
  @IsString({ each: true })
  householdIds!: string[];
}

/**
 * DTO for bulk restore operations on households
 */
export class BulkRestoreHouseholdsDto {
  @IsArray()
  @IsString({ each: true })
  householdIds!: string[];
}

/**
 * Result type for bulk operations
 */
export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  failedIds: string[];
  errors?: Array<{ id: string; error: string }>;
}

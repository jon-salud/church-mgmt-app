import { BulkOperationResult } from './dto/bulk-operations.dto';

export const HOUSEHOLDS_REPOSITORY = 'HOUSEHOLDS_REPOSITORY';

export interface IHouseholdsRepository {
  // Basic read operations
  listHouseholds(): Promise<any[]>;
  getHouseholdById(id: string): Promise<any | null>;

  // Soft delete operations
  deleteHousehold(id: string, actorUserId: string): Promise<{ success: boolean }>;
  undeleteHousehold(id: string, actorUserId: string): Promise<{ success: boolean }>;
  listDeletedHouseholds(): Promise<any[]>;
  bulkDeleteHouseholds(ids: string[], actorUserId: string): Promise<BulkOperationResult>;
  bulkUndeleteHouseholds(ids: string[], actorUserId: string): Promise<BulkOperationResult>;

  // Hard delete (admin only)
  hardDeleteHousehold(id: string, actorUserId: string): Promise<{ success: boolean }>;
}

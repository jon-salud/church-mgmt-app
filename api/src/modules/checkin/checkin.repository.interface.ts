import { BulkOperationResult } from './dto/bulk-operations.dto';

export const CHECKIN_REPOSITORY = 'CHECKIN_REPOSITORY';

export interface ICheckinRepository {
  // Basic read operations
  listChildren(householdId: string): Promise<any[]>;
  getChildById(id: string): Promise<any | null>;

  // Soft delete operations
  deleteChild(id: string, actorUserId: string): Promise<{ success: boolean }>;
  undeleteChild(id: string, actorUserId: string): Promise<{ success: boolean }>;
  listDeletedChildren(): Promise<any[]>;
  bulkDeleteChildren(ids: string[], actorUserId: string): Promise<BulkOperationResult>;
  bulkUndeleteChildren(ids: string[], actorUserId: string): Promise<BulkOperationResult>;

  // Hard delete (admin only)
  hardDeleteChild(id: string, actorUserId: string): Promise<{ success: boolean }>;
}

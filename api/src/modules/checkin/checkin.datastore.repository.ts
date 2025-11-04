import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { ICheckinRepository } from './checkin.repository.interface';
import { BulkOperationResult } from './dto/bulk-operations.dto';

@Injectable()
export class CheckinDataStoreRepository implements ICheckinRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listChildren(householdId: string): Promise<any[]> {
    const children = await this.db.getChildren(householdId);
    return Promise.resolve(children);
  }

  async getChildById(id: string): Promise<any | null> {
    const child = await this.db.getChildById(id);
    return Promise.resolve(child);
  }

  async deleteChild(id: string, actorUserId: string): Promise<{ success: boolean }> {
    const result = await this.db.deleteChild(id, { actorUserId });
    return Promise.resolve(result);
  }

  async undeleteChild(id: string, actorUserId: string): Promise<{ success: boolean }> {
    const result = await this.db.undeleteChild(id, actorUserId);
    return Promise.resolve(result);
  }

  async listDeletedChildren(): Promise<any[]> {
    const children = await this.db.listDeletedChildren();
    return Promise.resolve(children);
  }

  async bulkDeleteChildren(ids: string[], actorUserId: string): Promise<BulkOperationResult> {
    const result = await this.db.bulkDeleteChildren(ids, actorUserId);
    const failedIds: string[] = [];
    const errors: { id: string; error: string }[] = [];

    for (const f of result.failed) {
      failedIds.push(f.id);
      errors.push({ id: f.id, error: f.reason });
    }

    return Promise.resolve({
      success: true,
      successCount: result.success,
      failedCount: result.failed.length,
      failedIds,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  async bulkUndeleteChildren(ids: string[], actorUserId: string): Promise<BulkOperationResult> {
    const result = await this.db.bulkUndeleteChildren(ids, actorUserId);
    const failedIds: string[] = [];
    const errors: { id: string; error: string }[] = [];

    for (const f of result.failed) {
      failedIds.push(f.id);
      errors.push({ id: f.id, error: f.reason });
    }

    return Promise.resolve({
      success: true,
      successCount: result.success,
      failedCount: result.failed.length,
      failedIds,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  async hardDeleteChild(id: string, actorUserId: string): Promise<{ success: boolean }> {
    const result = await this.db.hardDeleteChild(id, actorUserId);
    return Promise.resolve(result);
  }
}

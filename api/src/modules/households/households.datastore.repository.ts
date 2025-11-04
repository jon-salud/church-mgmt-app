import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IHouseholdsRepository } from './households.repository.interface';
import { BulkOperationResult } from './dto/bulk-operations.dto';

@Injectable()
export class HouseholdsDataStoreRepository implements IHouseholdsRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async listHouseholds(): Promise<any[]> {
    const households = await this.db.listHouseholds();
    return Promise.resolve(households);
  }

  async getHouseholdById(id: string): Promise<any | null> {
    const household = await this.db.getHouseholdById(id);
    return Promise.resolve(household);
  }

  async deleteHousehold(id: string, actorUserId: string): Promise<{ success: boolean }> {
    const result = await this.db.deleteHousehold(id, actorUserId);
    return Promise.resolve(result);
  }

  async undeleteHousehold(id: string, actorUserId: string): Promise<{ success: boolean }> {
    const result = await this.db.undeleteHousehold(id, actorUserId);
    return Promise.resolve(result);
  }

  async listDeletedHouseholds(): Promise<any[]> {
    const households = await this.db.listDeletedHouseholds();
    return Promise.resolve(households);
  }

  async bulkDeleteHouseholds(ids: string[], actorUserId: string): Promise<BulkOperationResult> {
    const result = await this.db.bulkDeleteHouseholds(ids, actorUserId);
    return Promise.resolve({
      success: true,
      successCount: result.success,
      failedIds: result.failed.map(f => f.id),
      errors:
        result.failed.length > 0
          ? result.failed.map(f => ({ id: f.id, error: f.reason }))
          : undefined,
    });
  }

  async bulkUndeleteHouseholds(ids: string[], actorUserId: string): Promise<BulkOperationResult> {
    const result = await this.db.bulkUndeleteHouseholds(ids, actorUserId);
    return Promise.resolve({
      success: true,
      successCount: result.success,
      failedIds: result.failed.map(f => f.id),
      errors:
        result.failed.length > 0
          ? result.failed.map(f => ({ id: f.id, error: f.reason }))
          : undefined,
    });
  }

  async hardDeleteHousehold(id: string, actorUserId: string): Promise<{ success: boolean }> {
    const result = await this.db.hardDeleteHousehold(id, actorUserId);
    return Promise.resolve(result);
  }
}

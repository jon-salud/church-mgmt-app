import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { IGivingRepository } from './giving.repository.interface';
import { UpdateContributionDto } from './dto/update-contribution.dto';

@Injectable()
export class GivingDataStoreRepository implements IGivingRepository {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  // ==================== FUND OPERATIONS ====================

  listFunds(): Promise<any[]> {
    return Promise.resolve(this.db.listFunds());
  }

  listDeletedFunds(): Promise<any[]> {
    return Promise.resolve(this.db.listDeletedFunds());
  }

  async getFundById(id: string): Promise<any | null> {
    const funds = await this.listFunds();
    return funds.find(f => f.id === id) || null;
  }

  createFund(input: { name: string; description?: string }): Promise<any> {
    return Promise.resolve(this.db.createFund(input));
  }

  updateFund(
    id: string,
    input: Partial<{ name: string; description?: string }>
  ): Promise<any | null> {
    return Promise.resolve(this.db.updateFund(id, input));
  }

  deleteFund(id: string, actorUserId: string): Promise<{ success: boolean }> {
    return Promise.resolve(this.db.deleteFund(id, { actorUserId }));
  }

  hardDeleteFund(id: string, actorUserId: string): Promise<{ success: boolean }> {
    return Promise.resolve(this.db.hardDeleteFund(id, { actorUserId }));
  }

  undeleteFund(id: string, actorUserId: string): Promise<{ success: boolean }> {
    return Promise.resolve(this.db.undeleteFund(id, { actorUserId }));
  }

  // ==================== CONTRIBUTION OPERATIONS ====================

  listContributions(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }): Promise<any[]> {
    return Promise.resolve(this.db.listContributions(filter));
  }

  listDeletedContributions(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }): Promise<any[]> {
    return Promise.resolve(this.db.listDeletedContributions(filter));
  }

  async getContributionById(id: string): Promise<any | null> {
    const contributions = await this.listContributions();
    return contributions.find(c => c.id === id) || null;
  }

  recordContribution(input: {
    memberId: string;
    amount: number;
    date: string;
    fundId?: string;
    method: 'cash' | 'bank-transfer' | 'eftpos' | 'other';
    note?: string;
    recordedBy?: string;
  }): Promise<any> {
    return Promise.resolve(this.db.recordContribution(input));
  }

  updateContribution(
    id: string,
    input: UpdateContributionDto & { actorUserId?: string }
  ): Promise<any | null> {
    return Promise.resolve(this.db.updateContribution(id, input));
  }

  deleteContribution(id: string, actorUserId: string): Promise<{ success: boolean }> {
    return Promise.resolve(this.db.deleteContribution(id, { actorUserId }));
  }

  hardDeleteContribution(id: string, actorUserId: string): Promise<{ success: boolean }> {
    return Promise.resolve(this.db.hardDeleteContribution(id, { actorUserId }));
  }

  undeleteContribution(id: string, actorUserId: string): Promise<{ success: boolean }> {
    return Promise.resolve(this.db.undeleteContribution(id, { actorUserId }));
  }

  // ==================== BULK OPERATIONS ====================

  bulkDeleteFunds(
    ids: string[],
    actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    return Promise.resolve(this.db.bulkDeleteFunds(ids, { actorUserId }));
  }

  bulkUndeleteFunds(
    ids: string[],
    actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    return Promise.resolve(this.db.bulkUndeleteFunds(ids, { actorUserId }));
  }

  bulkDeleteContributions(
    ids: string[],
    actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    return Promise.resolve(this.db.bulkDeleteContributions(ids, { actorUserId }));
  }

  bulkUndeleteContributions(
    ids: string[],
    actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }> {
    return Promise.resolve(this.db.bulkUndeleteContributions(ids, { actorUserId }));
  }

  // ==================== SUMMARY & EXPORT OPERATIONS ====================

  async getGivingSummary(): Promise<any> {
    const church = await this.db.getChurch();
    return this.db.getGivingSummary(church.id);
  }

  async exportContributionsCsv(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }): Promise<{ filename: string; content: string }> {
    return this.db.exportContributionsCsv(filter);
  }
}

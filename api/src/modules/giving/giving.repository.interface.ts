import { UpdateContributionDto } from './dto/update-contribution.dto';

export interface IGivingRepository {
  // Fund operations
  listFunds(): Promise<any[]>;
  listDeletedFunds(): Promise<any[]>;
  getFundById(id: string): Promise<any | null>;
  createFund(input: { name: string; description?: string }): Promise<any>;
  updateFund(
    id: string,
    input: Partial<{ name: string; description?: string }>
  ): Promise<any | null>;
  deleteFund(id: string, actorUserId: string): Promise<{ success: boolean }>;
  hardDeleteFund(id: string, actorUserId: string): Promise<{ success: boolean }>;
  undeleteFund(id: string, actorUserId: string): Promise<{ success: boolean }>;

  // Contribution operations
  listContributions(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }): Promise<any[]>;
  listDeletedContributions(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }): Promise<any[]>;
  getContributionById(id: string): Promise<any | null>;
  recordContribution(input: {
    memberId: string;
    amount: number;
    date: string;
    fundId?: string;
    method: 'cash' | 'bank-transfer' | 'eftpos' | 'other';
    note?: string;
    recordedBy?: string;
  }): Promise<any>;
  updateContribution(id: string, input: UpdateContributionDto): Promise<any | null>;
  deleteContribution(id: string, actorUserId: string): Promise<{ success: boolean }>;
  hardDeleteContribution(id: string, actorUserId: string): Promise<{ success: boolean }>;
  undeleteContribution(id: string, actorUserId: string): Promise<{ success: boolean }>;

  // Bulk operations
  bulkDeleteFunds(
    ids: string[],
    actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }>;
  bulkUndeleteFunds(
    ids: string[],
    actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }>;
  bulkDeleteContributions(
    ids: string[],
    actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }>;
  bulkUndeleteContributions(
    ids: string[],
    actorUserId: string
  ): Promise<{ success: number; failed: Array<{ id: string; reason: string }> }>;

  // Summary & export operations
  getGivingSummary(): Promise<any>;
  exportContributionsCsv(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }): Promise<{ filename: string; content: string }>;
}

export const GIVING_REPOSITORY = Symbol('GIVING_REPOSITORY');

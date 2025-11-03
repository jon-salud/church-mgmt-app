import { Inject, Injectable } from '@nestjs/common';
import { ContributionMethod } from '../../mock/mock-data';
import { IGivingRepository, GIVING_REPOSITORY } from './giving.repository.interface';
import { UpdateContributionDto } from './dto/update-contribution.dto';

@Injectable()
export class GivingService {
  constructor(@Inject(GIVING_REPOSITORY) private readonly repo: IGivingRepository) {}

  // ==================== FUND OPERATIONS ====================

  listFunds() {
    return this.repo.listFunds();
  }

  listDeletedFunds(_query?: string) {
    return this.repo.listDeletedFunds();
  }

  getFund(id: string) {
    return this.repo.getFundById(id);
  }

  createFund(input: { name: string; description?: string }, _actorUserId: string) {
    return this.repo.createFund(input);
  }

  updateFund(
    id: string,
    input: Partial<{ name: string; description?: string }>,
    _actorUserId: string
  ) {
    return this.repo.updateFund(id, input);
  }

  deleteFund(id: string, actorUserId: string) {
    return this.repo.deleteFund(id, actorUserId);
  }

  hardDeleteFund(id: string, actorUserId: string) {
    return this.repo.hardDeleteFund(id, actorUserId);
  }

  undeleteFund(id: string, actorUserId: string) {
    return this.repo.undeleteFund(id, actorUserId);
  }

  bulkDeleteFunds(ids: string[], actorUserId: string) {
    return this.repo.bulkDeleteFunds(ids, actorUserId);
  }

  bulkUndeleteFunds(ids: string[], actorUserId: string) {
    return this.repo.bulkUndeleteFunds(ids, actorUserId);
  }

  // ==================== CONTRIBUTION OPERATIONS ====================

  listContributions(filter?: { memberId?: string; fundId?: string; from?: string; to?: string }) {
    return this.repo.listContributions(filter);
  }

  listDeletedContributions(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }) {
    return this.repo.listDeletedContributions(filter);
  }

  getContribution(id: string) {
    return this.repo.getContributionById(id);
  }

  recordContribution(
    input: {
      memberId: string;
      amount: number;
      date: string;
      fundId?: string;
      method: ContributionMethod;
      note?: string;
    },
    actorUserId?: string
  ) {
    return this.repo.recordContribution({ ...input, recordedBy: actorUserId });
  }

  updateContribution(id: string, input: UpdateContributionDto, actorUserId: string) {
    const payload: Record<string, unknown> = { ...input, actorUserId };
    if (input.fundId !== undefined && input.fundId === '') {
      payload.fundId = null;
    }
    if (input.note !== undefined && input.note === '') {
      payload.note = null;
    }
    return this.repo.updateContribution(id, payload as UpdateContributionDto);
  }

  deleteContribution(id: string, actorUserId: string) {
    return this.repo.deleteContribution(id, actorUserId);
  }

  hardDeleteContribution(id: string, actorUserId: string) {
    return this.repo.hardDeleteContribution(id, actorUserId);
  }

  undeleteContribution(id: string, actorUserId: string) {
    return this.repo.undeleteContribution(id, actorUserId);
  }

  bulkDeleteContributions(ids: string[], actorUserId: string) {
    return this.repo.bulkDeleteContributions(ids, actorUserId);
  }

  bulkUndeleteContributions(ids: string[], actorUserId: string) {
    return this.repo.bulkUndeleteContributions(ids, actorUserId);
  }

  async summary() {
    return this.repo.getGivingSummary();
  }

  exportContributionsCsv(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }) {
    return this.repo.exportContributionsCsv(filter);
  }
}

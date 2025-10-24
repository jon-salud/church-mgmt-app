import { Inject, Injectable } from '@nestjs/common';
import { ContributionMethod } from '../../mock/mock-data';
import { DATA_STORE, DataStore } from '../../datastore';
import { UpdateContributionDto } from './dto/update-contribution.dto';

@Injectable()
export class GivingService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  listFunds() {
    return this.db.listFunds();
  }

  listContributions(filter?: { memberId?: string; fundId?: string; from?: string; to?: string }) {
    return this.db.listContributions(filter);
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
    return this.db.recordContribution({ ...input, recordedBy: actorUserId });
  }

  async summary() {
    const church = await this.db.getChurch();
    return this.db.getGivingSummary(church.id);
  }

  updateContribution(id: string, input: UpdateContributionDto, actorUserId: string) {
    const payload: Record<string, unknown> = { ...input, actorUserId };
    if (input.fundId !== undefined && input.fundId === '') {
      payload.fundId = null;
    }
    if (input.note !== undefined && input.note === '') {
      payload.note = null;
    }
    return this.db.updateContribution(id, payload as any);
  }

  exportContributionsCsv(filter?: {
    memberId?: string;
    fundId?: string;
    from?: string;
    to?: string;
  }) {
    return this.db.exportContributionsCsv(filter);
  }
}

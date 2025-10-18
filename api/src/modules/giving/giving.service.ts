import { Inject, Injectable } from '@nestjs/common';
import { ContributionMethod } from '../../mock/mock-data';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class GivingService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  listFunds() {
    return this.db.listFunds();
  }

  listContributions(filter?: { memberId?: string; fundId?: string }) {
    return this.db.listContributions(filter);
  }

  recordContribution(
    input: { memberId: string; amount: number; date: string; fundId?: string; method: ContributionMethod; note?: string },
    actorUserId?: string,
  ) {
    return this.db.recordContribution({ ...input, recordedBy: actorUserId });
  }
}

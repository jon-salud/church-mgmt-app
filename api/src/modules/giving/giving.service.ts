import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';
import { ContributionMethod } from '../../mock/mock-data';

@Injectable()
export class GivingService {
  constructor(private readonly db: MockDatabaseService) {}

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

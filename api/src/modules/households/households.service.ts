import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class HouseholdsService {
  constructor(private readonly db: MockDatabaseService) {}

  findAll() {
    return this.db.listHouseholds();
  }

  findOne(id: string) {
    return this.db.getHouseholdById(id);
  }
}

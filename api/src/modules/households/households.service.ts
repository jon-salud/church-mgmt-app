import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class HouseholdsService {
  constructor(private readonly db: MockDatabaseService) {}

  findAll() {
    const db = this.db ?? (globalThis as any).__MOCK_DB;
    if (!db) return [];
    return db.listHouseholds();
  }

  findOne(id: string) {
    const db = this.db ?? (globalThis as any).__MOCK_DB;
    if (!db) return null;
    return db.getHouseholdById(id);
  }
}

import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: MockDatabaseService) {}

  async list(q?: string) {
    return this.db.listUsers(q);
  }

  async get(id: string) {
    return this.db.getUserProfile(id);
  }
}

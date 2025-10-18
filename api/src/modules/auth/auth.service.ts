import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';
import { Role } from '../../mock/mock-data';

@Injectable()
export class AuthService {
  constructor(private readonly db: MockDatabaseService) {}

  login(email: string, provider: 'google' | 'facebook', role?: Role) {
    return this.db.createSession(email, provider, role);
  }

  me(token?: string) {
    return this.db.getSessionByToken(token);
  }
}

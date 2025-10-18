import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../mock/mock-data';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class AuthService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  login(email: string, provider: 'google' | 'facebook', role?: Role) {
    return this.db.createSession(email, provider, role);
  }

  me(token?: string) {
    return this.db.getSessionByToken(token);
  }
}

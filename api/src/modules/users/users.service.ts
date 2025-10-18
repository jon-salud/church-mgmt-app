import { Inject, Injectable } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class UsersService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  list(q?: string) {
    return this.db.listUsers(q);
  }

  get(id: string) {
    return this.db.getUserProfile(id);
  }
}

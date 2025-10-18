import { Inject, Injectable } from '@nestjs/common';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class AuditService {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  list(query: ListAuditQueryDto) {
    return this.db.listAuditLogs(query);
  }
}

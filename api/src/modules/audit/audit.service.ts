import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';

@Injectable()
export class AuditService {
  constructor(private readonly db: MockDatabaseService) {}

  list(query: ListAuditQueryDto) {
    return this.db.listAuditLogs(query);
  }
}


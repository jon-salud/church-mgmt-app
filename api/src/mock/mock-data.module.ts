import { Global, Module } from '@nestjs/common';
import { MockDatabaseService } from './mock-database.service';
import { AuditLogPersistence } from './audit-log.persistence';

@Global()
@Module({
  providers: [MockDatabaseService, AuditLogPersistence],
  exports: [MockDatabaseService],
})
export class MockDataModule {}

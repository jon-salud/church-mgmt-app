import { MockDatabaseService } from '../../src/mock/mock-database.service';
import { AuditLogPersistence } from '../../src/mock/audit-log.persistence';

describe('MockDatabaseService audit persistence', () => {
  const mockPersistence = () =>
    ({
      load: jest.fn(),
      save: jest.fn(),
    }) as unknown as jest.Mocked<AuditLogPersistence>;

  it('loads persisted audit logs when available', () => {
    const persistedLog = {
      id: 'audit-123',
      churchId: 'church-acc',
      actorUserId: 'user-1',
      action: 'test',
      entity: 'user',
      summary: 'persisted',
      createdAt: new Date().toISOString(),
    };
    const persistence = mockPersistence();
    persistence.load.mockReturnValue([persistedLog] as any);

    const service = new MockDatabaseService(persistence);

    const result = service.listAuditLogs();

    expect(result.items.find(item => item.id === persistedLog.id)).toBeDefined();
    expect(persistence.save).not.toHaveBeenCalled();
    // ensure constructor does not mutate returned snapshot
    persistedLog.summary = 'changed';
    const afterMutation = service.listAuditLogs();
    expect(afterMutation.items.find(item => item.id === 'audit-123')?.summary).toEqual('persisted');
  });

  it('writes audit logs to persistence store after mutation', () => {
    const persistence = mockPersistence();
    persistence.load.mockReturnValue(null);
    const service = new MockDatabaseService(persistence);
    persistence.save.mockClear();

    service.createAuditLog({
      actorUserId: 'user-123',
      action: 'custom.action',
      entity: 'entity',
      summary: 'something happened',
    });

    expect(persistence.save).toHaveBeenCalled();
  });
});

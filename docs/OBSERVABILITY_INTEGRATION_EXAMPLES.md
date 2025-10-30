# Observability Integration Examples

## Quick Start

### Step 1: Import ObservabilityModule

```typescript
import { ObservabilityModule } from '../../observability/observability.module';

@Module({
  imports: [ObservabilityModule],
  // ... rest of module config
})
export class MyModule {}
```

### Step 2: Inject ObservabilityService

```typescript
import { ObservabilityService } from '../../observability/observability.service';

@Injectable()
export class MyService {
  constructor(
    private readonly observability: ObservabilityService,
    private readonly repository: MyRepository,
  ) {}
}
```

### Step 3: Wrap Operations with Spans

```typescript
async getItem(id: string): Promise<Item> {
  const spanId = this.observability.startSpan('mymodule.getItem', { id });
  
  try {
    const item = await this.repository.findById(id);
    const { durationMs } = this.observability.endSpan(spanId, 'success');
    this.observability.recordCQRSQuery('getItem', durationMs, 1);
    return item;
  } catch (error) {
    const { durationMs } = this.observability.endSpan(spanId, 'error', error.message);
    this.observability.recordCQRSQuery('getItem', durationMs, 0);
    throw error;
  }
}
```

## Reference Implementation: Audit Module

The audit module provides a complete reference implementation. See:

- `api/src/modules/audit/audit-query.service.ts` - Query service with observability
- `api/src/modules/audit/audit-command.service.ts` - Command service with observability
- `api/test/unit/audit-query.service.spec.ts` - Testing patterns
- `api/test/unit/audit-command.service.spec.ts` - Testing patterns

### Audit Query Service Example

```typescript
@Injectable()
export class AuditLogQueryService implements IAuditLogQueries {
  constructor(
    @Inject(DATA_STORE) private readonly dataStore: DataStore,
    @Inject(CACHE_STORE) private readonly cacheStore: ICacheStore,
    @Inject(CIRCUIT_BREAKER) private readonly circuitBreaker: ICircuitBreaker,
    private readonly observability: ObservabilityService
  ) {}

  async listAuditLogs(query: ListAuditQueryDto): Promise<AuditLogQueryResult> {
    // Start observability span
    const spanId = this.observability.startSpan('audit.listAuditLogs', {
      page: query.page,
      pageSize: query.pageSize,
      entity: query.entity,
    });

    try {
      const cacheKey = this.buildCacheKey(query);
      const cached = await this.cacheStore.get<AuditLogQueryResult>(cacheKey, {
        namespace: 'audit-logs',
      });

      if (cached) {
        const { durationMs } = this.observability.endSpan(spanId, 'success');
        this.observability.recordCQRSQuery('listAuditLogs', durationMs, cached.items.length);
        return cached;
      }

      // Query with circuit breaker protection
      const auditLogs = await this.circuitBreaker.execute(
        () => this.dataStore.listAuditLogs(query),
        () => ({
          items: [],
          meta: { total: 0, page: query.page || 1, pageSize: query.pageSize || 50 },
        })
      );

      // Transform and cache
      const items = await Promise.all(
        auditLogs.items.map(async (log: any) => ({
          ...log,
          actor: log.actorUserId
            ? await this.dataStore.getUserById(log.actorUserId)
            : undefined,
        }))
      );

      const result = { items, meta: auditLogs.meta };
      await this.cacheStore.set(cacheKey, result, {
        namespace: 'audit-logs',
        ttl: 300,
      });

      // Record metrics
      const { durationMs } = this.observability.endSpan(spanId, 'success');
      this.observability.recordCQRSQuery('listAuditLogs', durationMs, items.length);

      return result;
    } catch (error) {
      const { durationMs } = this.observability.endSpan(spanId, 'error', (error as Error).message);
      this.observability.recordCQRSQuery('listAuditLogs', durationMs, 0);
      throw error;
    }
  }
}
```

### Audit Command Service Example

```typescript
@Injectable()
export class AuditLogCommandService implements IAuditLogCommands {
  constructor(
    @Inject(DATA_STORE) private readonly dataStore: DataStore,
    @Inject(EVENT_STORE) private readonly eventStore: IEventStore,
    private readonly auditQueryService: AuditLogQueryService,
    private readonly observability: ObservabilityService
  ) {}

  async createAuditLog(input: AuditLogCreateInput): Promise<AuditLogReadModel> {
    // Start observability span with context
    const spanId = this.observability.startSpan('audit.createAuditLog', {
      entity: input.entity,
      entityId: input.entityId,
      action: input.action,
    });

    try {
      // Create audit log
      const auditLog = await this.dataStore.createAuditLog(input);

      // Append to event store
      if (input.churchId) {
        await this.eventStore.append({
          aggregateId: input.churchId,
          aggregateType: 'AuditLog',
          eventType: 'AuditLogCreated',
          version: 1,
          data: {
            actorUserId: input.actorUserId,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId,
            summary: input.summary,
            diff: input.diff,
            metadata: input.metadata,
          },
        });
      }

      // Invalidate cache
      await this.auditQueryService.invalidateCache();

      // Transform to read model
      const result = {
        id: auditLog.id,
        churchId: auditLog.churchId,
        actorUserId: auditLog.actorUserId,
        action: auditLog.action,
        entity: auditLog.entity,
        entityId: auditLog.entityId,
        summary: auditLog.summary,
        diff: auditLog.diff,
        metadata: auditLog.metadata,
        createdAt: auditLog.createdAt,
      };

      // Record success metrics
      const { durationMs } = this.observability.endSpan(spanId, 'success');
      this.observability.recordCQRSCommand('createAuditLog', durationMs, true);

      return result;
    } catch (error) {
      // Record failure metrics
      const { durationMs } = this.observability.endSpan(spanId, 'error', (error as Error).message);
      this.observability.recordCQRSCommand('createAuditLog', durationMs, false);
      throw error;
    }
  }
}
```

## Example: Adding Observability to New Service

### Before: Without Observability

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly repository: IUsersRepository,
  ) {}

  async getUser(id: string): Promise<User> {
    return this.repository.findById(id);
  }

  async createUser(input: CreateUserInput): Promise<User> {
    return this.repository.create(input);
  }
}
```

### After: With Observability

```typescript
import { ObservabilityService } from '../../observability/observability.service';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: IUsersRepository,
    private readonly observability: ObservabilityService,
  ) {}

  async getUser(id: string): Promise<User> {
    const spanId = this.observability.startSpan('users.getUser', { id });

    try {
      const user = await this.repository.findById(id);
      const { durationMs } = this.observability.endSpan(spanId, 'success');
      this.observability.recordCQRSQuery('getUser', durationMs, user ? 1 : 0);
      return user;
    } catch (error) {
      const { durationMs } = this.observability.endSpan(spanId, 'error', (error as Error).message);
      this.observability.recordCQRSQuery('getUser', durationMs, 0);
      throw error;
    }
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const spanId = this.observability.startSpan('users.createUser', {
      churchId: input.churchId,
      role: input.role,
    });

    try {
      const user = await this.repository.create(input);
      const { durationMs } = this.observability.endSpan(spanId, 'success');
      this.observability.recordCQRSCommand('createUser', durationMs, true);
      return user;
    } catch (error) {
      const { durationMs } = this.observability.endSpan(spanId, 'error', (error as Error).message);
      this.observability.recordCQRSCommand('createUser', durationMs, false);
      throw error;
    }
  }
}
```

## Integration Checklist

When adding observability to a service:

- [ ] Import `ObservabilityModule` in service module
- [ ] Inject `ObservabilityService` in service class
- [ ] Add span at start of async operations
- [ ] Use try/catch or try/finally pattern
- [ ] Call `endSpan` with success/error status
- [ ] Record CQRS command metrics for write operations
- [ ] Record CQRS query metrics for read operations
- [ ] Use meaningful span names (`module.operation`)
- [ ] Include context in span attributes
- [ ] Mock observability in unit tests
- [ ] Verify observability calls in test assertions

## Module Configuration Pattern

```typescript
import { Module } from '@nestjs/common';
import { MyService } from './my.service';
import { MyController } from './my.controller';
import { ObservabilityModule } from '../../observability/observability.module';

@Module({
  imports: [ObservabilityModule],  // Import to access ObservabilityService
  controllers: [MyController],
  providers: [MyService],
  exports: [MyService],  // Export if other modules depend on this service
})
export class MyModule {}
```

## Testing Pattern

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';
import { ObservabilityService } from '../../observability/observability.service';

describe('MyService', () => {
  let service: MyService;
  let mockObservability: any;

  beforeEach(async () => {
    mockObservability = {
      startSpan: jest.fn().mockReturnValue('span-123'),
      endSpan: jest.fn().mockReturnValue({
        durationMs: 25,
        operationName: 'my.operation',
      }),
      recordCQRSQuery: jest.fn(),
      recordCQRSCommand: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        { provide: ObservabilityService, useValue: mockObservability },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  it('should create item and record metrics', async () => {
    const result = await service.createItem(input);

    expect(mockObservability.startSpan).toHaveBeenCalledWith('my.createItem', {
      churchId: input.churchId,
    });
    expect(mockObservability.endSpan).toHaveBeenCalledWith('span-123', 'success');
    expect(mockObservability.recordCQRSCommand).toHaveBeenCalledWith(
      'createItem',
      25,
      true
    );
  });

  it('should record error metrics on failure', async () => {
    const error = new Error('Save failed');
    mockRepository.create.mockRejectedValue(error);

    await expect(service.createItem(input)).rejects.toThrow('Save failed');

    expect(mockObservability.endSpan).toHaveBeenCalledWith(
      'span-123',
      'error',
      'Save failed'
    );
    expect(mockObservability.recordCQRSCommand).toHaveBeenCalledWith(
      'createItem',
      25,
      false
    );
  });
});
```

## Metrics Export Pattern

For exposing metrics to monitoring systems:

```typescript
@Injectable()
export class MetricsController {
  constructor(private readonly observability: ObservabilityService) {}

  @Get('/metrics')
  getMetrics() {
    const metrics = this.observability.getMetrics();

    // Transform for Prometheus format
    return {
      'event_store_append_avg_ms': metrics.eventStore.appendAvgDurationMs,
      'event_store_query_avg_ms': metrics.eventStore.queryAvgDurationMs,
      'circuit_breaker_state_transitions': metrics.circuitBreaker.stateTransitions,
      'cqrs_command_avg_ms': metrics.cqrs.commandAvgDurationMs,
      'cqrs_query_avg_ms': metrics.cqrs.queryAvgDurationMs,
    };
  }

  @Post('/metrics/reset')
  resetMetrics() {
    this.observability.reset();
    return { success: true };
  }
}
```

## Common Integration Points

### 1. Repository Pattern with Observability

```typescript
@Injectable()
export class UsersDataStoreRepository implements IUsersRepository {
  constructor(
    private readonly dataStore: DataStore,
    private readonly observability: ObservabilityService,
  ) {}

  async create(user: User): Promise<User> {
    const spanId = this.observability.startSpan('repo.users.create');
    try {
      const result = await this.dataStore.createUser(user);
      observability.endSpan(spanId, 'success');
      return result;
    } catch (error) {
      this.observability.endSpan(spanId, 'error', error.message);
      throw error;
    }
  }
}
```

### 2. Controller with Observability

```typescript
@Controller('users')
export class UsersController {
  constructor(
    private readonly service: UserService,
    private readonly observability: ObservabilityService,
  ) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const spanId = this.observability.startSpan('http.getUser', { id });

    try {
      const user = await this.service.getUser(id);
      this.observability.endSpan(spanId, 'success');
      return user;
    } catch (error) {
      this.observability.endSpan(spanId, 'error', error.message);
      throw error;
    }
  }
}
```

### 3. Event Handler with Observability

```typescript
@EventListener()
export class AuditEventHandler {
  constructor(private observability: ObservabilityService) {}

  handle(event: UserCreatedEvent) {
    const spanId = this.observability.startSpan('event.userCreated', {
      userId: event.userId,
    });

    try {
      // Handle event
      this.observability.endSpan(spanId, 'success');
    } catch (error) {
      this.observability.endSpan(spanId, 'error', error.message);
      throw error;
    }
  }
}
```

These patterns ensure consistent observability throughout the application.

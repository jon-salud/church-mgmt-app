# Span Tracing Usage Guide

## Overview

Span tracing allows you to correlate and track operations across service boundaries. Each operation gets a unique span ID that can be used to trace the full path of an operation through your system.

## Basic Usage

### Starting a Span

```typescript
const spanId = observability.startSpan('operationName', attributes?);
```

**Parameters:**
- `operationName`: Descriptive name for the operation (e.g., 'audit.listAuditLogs')
- `attributes`: Optional object with contextual data for debugging

**Returns:** Unique span ID string

**Example:**
```typescript
const spanId = observability.startSpan('user.create', {
  churchId: 'church-123',
  role: 'admin',
  emailDomain: 'example.com'
});
```

### Ending a Span

```typescript
const { durationMs, operationName } = observability.endSpan(spanId, status?, errorMessage?);
```

**Parameters:**
- `spanId`: The span ID returned from startSpan
- `status`: 'success' or 'error' (optional, defaults to 'success')
- `errorMessage`: Error details if status is 'error' (optional)

**Returns:** Object with:
- `durationMs`: Time from span start to end in milliseconds
- `operationName`: The operation name passed to startSpan

**Example:**
```typescript
const { durationMs, operationName } = observability.endSpan(spanId, 'success');
console.log(`${operationName} completed in ${durationMs}ms`);
```

## Complete Span Lifecycle

### Happy Path (Success)

```typescript
@Injectable()
export class UserService {
  constructor(private observability: ObservabilityService) {}
  
  async createUser(input: CreateUserInput): Promise<User> {
    // Start span with context
    const spanId = this.observability.startSpan('user.create', {
      church: input.churchId,
      role: input.role,
    });
    
    try {
      // Do the work
      const user = await this.saveUser(input);
      
      // End span successfully
      const { durationMs } = this.observability.endSpan(spanId, 'success');
      console.log(`User created in ${durationMs}ms`);
      
      return user;
    } catch (error) {
      // Handle error
      throw error;
    }
  }
}
```

### Error Path (Failure)

```typescript
@Injectable()
export class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    const spanId = this.observability.startSpan('user.create', {
      church: input.churchId,
    });
    
    try {
      const user = await this.saveUser(input);
      this.observability.endSpan(spanId, 'success');
      return user;
    } catch (error) {
      // Record error and re-throw
      const { durationMs } = this.observability.endSpan(
        spanId, 
        'error', 
        error.message
      );
      console.error(`User creation failed after ${durationMs}ms: ${error.message}`);
      throw error;
    }
  }
}
```

## Advanced Patterns

### Pattern 1: Nested Spans

Correlate multiple related operations:

```typescript
async function processRequest(data: any) {
  const requestSpan = observability.startSpan('request.process', { id: data.id });
  
  try {
    // Validate
    const validateSpan = observability.startSpan('request.validate', { id: data.id });
    await validate(data);
    observability.endSpan(validateSpan, 'success');
    
    // Transform
    const transformSpan = observability.startSpan('request.transform', { id: data.id });
    const transformed = transform(data);
    observability.endSpan(transformSpan, 'success');
    
    // Save
    const saveSpan = observability.startSpan('request.save', { id: data.id });
    await save(transformed);
    observability.endSpan(saveSpan, 'success');
    
    observability.endSpan(requestSpan, 'success');
  } catch (error) {
    observability.endSpan(requestSpan, 'error', error.message);
    throw error;
  }
}
```

All spans share the same operation context through their attributes.

### Pattern 2: Conditional Metrics Recording

Record metrics after span ends:

```typescript
async listItems(filter: any): Promise<Item[]> {
  const spanId = observability.startSpan('items.list', { filter });
  
  try {
    const items = await this.repository.find(filter);
    const { durationMs } = observability.endSpan(spanId, 'success');
    
    // Record CQRS query metrics
    this.observability.recordCQRSQuery('listItems', durationMs, items.length);
    
    return items;
  } catch (error) {
    const { durationMs } = observability.endSpan(spanId, 'error', error.message);
    this.observability.recordCQRSQuery('listItems', durationMs, 0);
    throw error;
  }
}
```

### Pattern 3: Span with Cache Context

Track cache operations within spans:

```typescript
async getUsersWithCache(cacheKey: string) {
  const spanId = observability.startSpan('users.list', {
    cached: true,
    cacheKey,
  });
  
  try {
    // Check cache
    let users = await this.cache.get(cacheKey);
    if (users) {
      this.observability.endSpan(spanId, 'success');
      return users;
    }
    
    // Cache miss - fetch from DB
    users = await this.db.query('SELECT * FROM users');
    await this.cache.set(cacheKey, users, { ttl: 300 });
    
    this.observability.endSpan(spanId, 'success');
    return users;
  } catch (error) {
    this.observability.endSpan(spanId, 'error', error.message);
    throw error;
  }
}
```

### Pattern 4: Span Attributes for Debugging

Use attributes to add rich context:

```typescript
async createAuditLog(input: AuditLogCreateInput) {
  const spanId = observability.startSpan('audit.create', {
    action: input.action,
    entity: input.entity,
    entityId: input.entityId,
    actorId: input.actorUserId,
    churchId: input.churchId,
    timestamp: new Date().toISOString(),
  });
  
  try {
    const auditLog = await this.repository.create(input);
    const { durationMs } = observability.endSpan(spanId, 'success');
    
    this.logger.log(
      `Audit log created in ${durationMs}ms for ${input.action} on ${input.entity} by ${input.actorUserId}`
    );
    
    return auditLog;
  } catch (error) {
    this.observability.endSpan(spanId, 'error', error.message);
    throw error;
  }
}
```

## Span Naming Conventions

Use consistent naming for easy identification and correlation:

### Naming Pattern: `module.operation`

**Examples:**
- `audit.listAuditLogs` - List audit logs operation in audit module
- `user.create` - Create user operation in users module
- `group.update` - Update group operation in groups module
- `cache.get` - Cache retrieval
- `cache.set` - Cache storage
- `eventstore.append` - Event append operation
- `eventstore.query` - Event query operation

### Benefits

1. **Searchable** - Find all spans for a module or operation
2. **Hierarchical** - Understand operation relationships
3. **Debuggable** - Easy to correlate related spans
4. **Monitorable** - Aggregate metrics by module or operation

## Error Handling in Spans

### Pattern: Always End the Span

```typescript
async operation(): Promise<Result> {
  const spanId = observability.startSpan('op.name');
  
  try {
    // Do work
    const result = await doWork();
    
    // Always end span on success
    observability.endSpan(spanId, 'success');
    return result;
  } catch (error) {
    // Always end span on error
    observability.endSpan(spanId, 'error', error.message);
    
    // THEN handle/rethrow
    throw error;
  }
}
```

### Anti-Pattern: Forgetting to End Span

```typescript
// ❌ DON'T DO THIS - Span never ends if error occurs
async operation(): Promise<Result> {
  const spanId = observability.startSpan('op.name');
  const result = await doWork();  // If fails, span never ends
  observability.endSpan(spanId, 'success');
  return result;
}
```

## Integration with Logging

### Combining Spans with Structured Logging

```typescript
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  
  constructor(private observability: ObservabilityService) {}
  
  async createAuditLog(input: AuditLogCreateInput): Promise<AuditLog> {
    const spanId = observability.startSpan('audit.create', {
      entity: input.entity,
      entityId: input.entityId,
    });
    
    this.logger.log(`Creating audit log`, {
      spanId,
      entity: input.entity,
      action: input.action,
    });
    
    try {
      const auditLog = await this.repository.create(input);
      const { durationMs } = observability.endSpan(spanId, 'success');
      
      this.logger.log(`Audit log created`, {
        spanId,
        auditLogId: auditLog.id,
        durationMs,
      });
      
      return auditLog;
    } catch (error) {
      const { durationMs } = observability.endSpan(spanId, 'error', error.message);
      
      this.logger.error(`Failed to create audit log`, {
        spanId,
        error: error.message,
        durationMs,
      });
      
      throw error;
    }
  }
}
```

## Testing Spans

### Mocking Spans in Tests

```typescript
describe('AuditService', () => {
  let service: AuditService;
  let mockObservability: any;
  
  beforeEach(() => {
    mockObservability = {
      startSpan: jest.fn().mockReturnValue('span-123'),
      endSpan: jest.fn().mockReturnValue({
        durationMs: 15,
        operationName: 'audit.create',
      }),
      recordCQRSCommand: jest.fn(),
    };
    
    // Create module with mock
    const module = Test.createTestingModule({
      providers: [
        AuditService,
        { provide: ObservabilityService, useValue: mockObservability },
      ],
    }).compile();
    
    service = module.get(AuditService);
  });
  
  it('should create audit log and record metrics', async () => {
    const result = await service.createAuditLog(input);
    
    // Verify span lifecycle
    expect(mockObservability.startSpan).toHaveBeenCalledWith('audit.create', {
      entity: 'User',
      entityId: 'user-1',
    });
    expect(mockObservability.endSpan).toHaveBeenCalledWith('span-123', 'success');
    expect(mockObservability.recordCQRSCommand).toHaveBeenCalledWith(
      'createAuditLog',
      15,
      true
    );
  });
  
  it('should record error spans on failure', async () => {
    mockRepository.create.mockRejectedValue(new Error('DB error'));
    
    await expect(service.createAuditLog(input)).rejects.toThrow('DB error');
    
    expect(mockObservability.endSpan).toHaveBeenCalledWith(
      'span-123',
      'error',
      'DB error'
    );
  });
});
```

## Best Practices

1. **Use consistent naming** - Follow `module.operation` pattern
2. **Add meaningful attributes** - Include context for debugging
3. **Always handle both success and error** - Ensure spans always end
4. **Record metrics after span ends** - Use duration in metric calculation
5. **Correlate with logs** - Include span ID in structured logs
6. **Test span lifecycle** - Mock and verify in unit tests
7. **Monitor span duration** - Alert on unusually long operations
8. **Use for performance analysis** - Identify bottlenecks using span durations

## Common Issues & Solutions

### Issue: Span Never Ends

**Problem:** Missing endSpan call or exception prevents execution

**Solution:** Use try/finally pattern:
```typescript
const spanId = observability.startSpan('op');
try {
  await doWork();
} finally {
  observability.endSpan(spanId, 'success');
}
```

### Issue: Duration Always Zero

**Problem:** Span ends immediately without waiting for async operations

**Solution:** Ensure async operations complete before ending:
```typescript
const spanId = observability.startSpan('op');
const result = await asyncOperation();  // Wait for completion
observability.endSpan(spanId, 'success');
```

### Issue: Wrong Attributes Recorded

**Problem:** Attributes contain sensitive or wrong data

**Solution:** Review attributes before recording:
```typescript
const spanId = observability.startSpan('op', {
  userId: user.id,  // ✓ ID is safe
  // password: user.password,  // ✗ Never include sensitive data
});
```

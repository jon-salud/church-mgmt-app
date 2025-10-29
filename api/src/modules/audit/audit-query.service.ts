import { Inject, Injectable, Logger } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';
import { CACHE_STORE, ICacheStore } from '../../common/cache-store.interface';
import { ICircuitBreaker, CIRCUIT_BREAKER } from '../../common/circuit-breaker.interface';
import { IAuditLogQueries, AuditLogQueryResult, AuditLogReadModel } from './audit.interfaces';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';

@Injectable()
export class AuditLogQueryService implements IAuditLogQueries {
  private readonly logger = new Logger(AuditLogQueryService.name);
  private readonly cacheTTL = 300; // 5 minutes cache TTL

  constructor(
    @Inject(DATA_STORE)
    private readonly dataStore: DataStore,
    @Inject(CACHE_STORE)
    private readonly cacheStore: ICacheStore,
    @Inject(CIRCUIT_BREAKER)
    private readonly circuitBreaker: ICircuitBreaker
  ) {}

  async listAuditLogs(query: ListAuditQueryDto): Promise<AuditLogQueryResult> {
    // Generate cache key from query parameters
    const cacheKey = this.buildCacheKey(query);
    const namespace = 'audit-logs'; // Global namespace since churchId is not in query

    // Try to get from cache first
    const cached = await this.cacheStore.get<AuditLogQueryResult>(cacheKey, { namespace });
    if (cached) {
      this.logger.debug(`Cache hit for audit logs: ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`Cache miss for audit logs: ${cacheKey}, querying datastore`);

    // Query datastore with circuit breaker protection
    // Fallback: return empty audit logs if circuit is open
    const auditLogs = await this.circuitBreaker.execute(
      () => this.dataStore.listAuditLogs(query),
      () => ({
        items: [],
        meta: { total: 0, page: query.page || 1, pageSize: query.pageSize || 50 },
      })
    );

    // Transform to read models with actor resolution
    const items: AuditLogReadModel[] = await Promise.all(
      auditLogs.items.map(async (log: any) => ({
        id: log.id,
        churchId: log.churchId,
        actorUserId: log.actorUserId,
        actor: log.actorUserId ? await this.dataStore.getUserById(log.actorUserId) : undefined,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        summary: log.summary,
        diff: log.diff as Record<string, { previous: unknown; newValue: unknown }>,
        metadata: log.metadata,
        createdAt: log.createdAt,
      }))
    );

    const result: AuditLogQueryResult = {
      items,
      meta: auditLogs.meta,
    };

    // Cache the result
    await this.cacheStore.set(cacheKey, result, { namespace, ttl: this.cacheTTL });

    return result;
  }

  /**
   * Invalidate cache for audit logs.
   * Called after audit log creation/update.
   */
  async invalidateCache(): Promise<void> {
    this.logger.debug('Invalidating audit log cache');
    // For now, we'll clear specific cache keys
    // In production, could use a more sophisticated pattern-based invalidation
    const namespace = 'audit-logs';
    for (const key of ['list', 'list:0:50', 'list:0:100']) {
      await this.cacheStore.delete(key, { namespace });
    }
  }

  /**
   * Build cache key from query parameters
   */
  private buildCacheKey(query: ListAuditQueryDto): string {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const actorUserId = query.actorUserId ? `:actor=${query.actorUserId}` : '';
    const entity = query.entity ? `:entity=${query.entity}` : '';
    const entityId = query.entityId ? `:entityId=${query.entityId}` : '';
    const from = query.from ? `:from=${query.from}` : '';
    const to = query.to ? `:to=${query.to}` : '';

    return `list:${page}:${pageSize}${actorUserId}${entity}${entityId}${from}${to}`;
  }
}

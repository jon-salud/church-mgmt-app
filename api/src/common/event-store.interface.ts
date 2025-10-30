/**
 * Event Store Interface (CQRS Event Sourcing)
 *
 * Defines the contract for appending and reading events from an event store.
 * Used by audit logs and other audit-heavy operations to maintain immutable
 * event history and enable event-driven projections.
 */

export interface DomainEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface EventStoreQueryOptions {
  aggregateId?: string;
  aggregateType?: string;
  eventType?: string;
  fromVersion?: number;
  toVersion?: number;
  limit?: number;
  offset?: number;
}

export interface EventStoreQueryResult {
  events: DomainEvent[];
  totalCount: number;
  offset: number;
  limit: number;
}

/**
 * IEventStore interface for abstracting event sourcing implementations.
 *
 * - append: Write a new event to the store.
 * - query: Read events matching optional filters.
 * - getByAggregateId: Read all events for a specific aggregate (e.g., an audit log).
 */
export interface IEventStore {
  /**
   * Append a domain event to the event store.
   * @param event The domain event to append.
   * @throws If write fails (disk I/O, validation, etc.).
   */
  append(event: Omit<DomainEvent, 'id' | 'timestamp'>): Promise<DomainEvent>;

  /**
   * Query events from the store with optional filtering.
   * @param options Query filters (aggregateId, eventType, version ranges, pagination).
   * @returns Array of events matching the query.
   */
  query(options?: EventStoreQueryOptions): Promise<EventStoreQueryResult>;

  /**
   * Retrieve all events for a specific aggregate (convenience method).
   * @param aggregateId The aggregate ID (e.g., churchId for audit events).
   * @param aggregateType The aggregate type (e.g., "AuditLog").
   * @returns All events for that aggregate, ordered by version.
   */
  getByAggregateId(aggregateId: string, aggregateType: string): Promise<DomainEvent[]>;

  /**
   * Clear all events (for testing only).
   */
  clear?(): Promise<void>;
}

export const EVENT_STORE = Symbol('EVENT_STORE');

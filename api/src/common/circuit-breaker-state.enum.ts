/**
 * Circuit Breaker State Machine
 *
 * CLOSED: Normal operation, all requests go through
 * OPEN: Circuit is open, fast fail without calling underlying service
 * HALF_OPEN: Testing if service has recovered, limited requests allowed
 */
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

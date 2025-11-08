````markdown
# Soft Delete Phase 1: Core Architecture & Data Model - Implementation Plan

**Sprint:** Soft Delete Implementation  
**Phase:** 1 of 7  
**Status:** Approved - Ready for Implementation  
**Branch:** `feature/soft-delete-phase1-architecture`  
**Base Branch:** `feature/soft-delete-main-sprint`  
**Date Created:** 3 November 2025  

---

## Overview

Establish the core architecture and data model changes required to support soft delete across the system. This phase lays the foundation: database schema conventions, repository patterns, shared types, and service-level helpers so subsequent phases can implement per-entity logic consistently and safely.

## Objectives

1. Define a consistent soft-delete convention (`deletedAt TIMESTAMP | null`) across entities
2. Implement repository/service helpers to handle soft-delete semantics (filtering, restore)
3. Introduce shared types and utilities for bulk operations and partial results
4. Add migration templates and developer runbooks for applying schema changes
5. Ensure audit logging and tracing hooks are in place for soft-delete flows

---

## Scope

- Database schema guidance and example migration templates
- Shared repository helpers and TypeScript types
- Backfill mock DB support for `deletedAt` in development/test harnesses
- Service-level utilities: `softDeleteById()`, `restoreById()`, `listIncludingDeleted()` variants
- OpenAPI guidance for soft-delete endpoints
- Developer runbook for applying migrations safely

---

## Technical Approach

### Schema Convention
- Standard field: `deletedAt TIMESTAMP NULL` added to entities that support soft delete
- Index: `CREATE INDEX idx_<entity>_deleted_at ON <entity>(deletedAt)`
- Migration templates provided in `api/prisma/migrations/soft-delete-templates/`

### Repository & Service Helpers
- Create `api/src/common/soft-delete.ts`:
  - `applySoftDeleteFilter(query, includeDeleted = false)`
  - `markDeleted(entity, id, userId, reason?)`
  - `markRestored(entity, id, userId)`
- Update base repository to accept `includeDeleted` flag for list/get operations

### Shared Types
- `web/lib/types.ts` / `api/src/types/soft-delete.ts`:
  - `DeletedAt = string | null`
  - `BulkOperationResult = { success: string[]; failed: {id:string; error:string}[] }`

### Mocks & Tests
- Update mock DB to include `deletedAt` fields and helpers for seeded archived items
- Add unit tests for repository helpers and service soft-delete helpers

### Observability
- Add trace spans for `softDelete` and `restore` operations
- Emit metrics: `soft_delete.operations.total` and `soft_delete.operations.failures`

---

## Implementation Steps

1. **Design & Agreement (1h)**
   - Finalize schema convention and helper API with the team
   - Document decisions in `docs/sprints/soft-delete/soft-delete-ARCHITECTURE.md`

2. **Shared Types & Utilities (2h)**
   - Implement `api/src/common/soft-delete.ts` helpers
   - Add `api/src/types/soft-delete.ts` and `web/lib/types.ts` entries

3. **Repository Changes (2h)**
   - Extend base repository to support `includeDeleted` param
   - Add tests for filtering and get-by-id behaviour with deleted flags

4. **Mock DB & Seed Data (1h)**
   - Update mock database and seed to include some archived records for tests
   - Add helper to mark sample data as deleted/archived

5. **Migration Templates & Runbook (1.5h)**
   - Create migration templates under `api/prisma/migrations/soft-delete-templates/`
   - Write operator runbook: `docs/migrations/soft-delete-guidance.md`

6. **Trace & Metric Hooks (1h)**
   - Add minimal metrics/tracing hooks to soft-delete helpers

7. **Validation & Tests (2h)**
   - Unit tests for repository and service helpers
   - Integration smoke test for soft-delete flow on mock environment

---

## Acceptance Criteria
- Shared helper functions exist and are used across services
- Base repository supports `includeDeleted` filtering consistently
- Mock DB and seeds include archived examples for development and tests
- Migration templates and runbook provide safe path for schema changes
- Unit tests for helpers pass and cover error cases
- Traces/metrics emitted for soft-delete operations

---

## Risks & Mitigations
- Risk: Inconsistent filtering leading to data leakage
  - Mitigation: Centralize filtering in repository helpers and add tests
- Risk: Migration downtime or locking
  - Mitigation: Use online-safe migrations and test dry-runs on staging
- Risk: Missing audit trail
  - Mitigation: Ensure `markDeleted()` and `markRestored()` accept `userId` and write audit entries

---

## Timeline Estimate
- Total estimated time: 10-11 hours (two engineers can parallelize parts)

---

## Deliverables
- `api/src/common/soft-delete.ts` helpers
- Updated base repository with `includeDeleted` support
- `api/prisma/migrations/soft-delete-templates/` migration templates
- `docs/migrations/soft-delete-guidance.md` runbook
- Unit and integration tests for repository/service helpers
- `docs/sprints/soft-delete/soft-delete-phase1-PLAN.md` (this file)

---

## Accomplishments
- Phase 1 plan established and approved for implementation.

````
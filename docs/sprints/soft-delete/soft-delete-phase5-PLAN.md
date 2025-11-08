````markdown
# Soft Delete Phase 5: Backend - Data Migration & Cleanup Plan

**Sprint:** Soft Delete Implementation  
**Phase:** 5 of 7  
**Status:** Approved - Ready for Implementation  
**Branch:** `feature/soft-delete-phase5-backend-migration`  
**Base Branch:** `feature/soft-delete-main-sprint`  
**Date Created:** 3 November 2025  

---

## Overview

Implement data migration utilities and background cleanup jobs for soft-deleted entities. Ensure safe, reversible migration steps with monitoring and rollback capabilities.

## Objectives

1. Create safe migration scripts to mark historical records as deleted where business rules apply.
2. Implement background cleanup/archival workers with rate limiting.
3. Add monitoring/alerts for cleanup jobs and migration runs.
4. Provide rollback tooling and pre-migration dry-run reports.

---

## Migration Strategy

- Use iterative approach: dry-run → small batch → validate → scale
- Keep migrations idempotent and reversible
- Persist migration metadata to `migration_runs` table for auditing
- Provide `--preview` and `--apply` modes for every script

---

## Components

- `api/scripts/migrations/mark-old-records-soft-delete.ts` (node script)
- `api/src/modules/migrations/service.ts` - expose migration orchestration APIs
- `api/src/modules/cleanup/worker.ts` - background worker for archival
- `api/src/modules/cleanup/queue.ts` - rate-limited queue for cleanup jobs
- `api/src/modules/monitoring/cleanup-alerts.ts` - hook for alerts
- `docs/migrations/soft-delete-guidance.md` - runbook for operators

---

## Migration Steps

1. **Analysis & Rules** (2h)
   - Identify candidate records for archival (older than X years, orphaned, marked inactive)
   - Define exclusion rules
   - Create dry-run queries and sample exports

2. **Dry-Run Scripts** (2h)
   - Implement `--preview` mode to output counts + sample record IDs
   - Run sample on staging and validate counts with product

3. **Small Batch Apply (Staging)** (3h)
   - Apply to limited dataset (1k records) with monitoring enabled
   - Validate application behaviour in DB and app

4. **Scale Apply (Production)** (4h)
   - Run in waves with a rate limiter via queue
   - Monitor errors; stop on thresholds

5. **Background Cleanup Worker** (3h)
   - Implement worker for long-term archival or physical deletion (if required)
   - Configurable retention window (e.g., 90 days)

6. **Monitoring & Alerts** (2h)
   - Add metrics for job success/failure counts, rate, and duration
   - Alert when failure rate exceeds threshold (e.g., 5% over 1h)

7. **Rollback & Auditing** (2h)
   - Track migration run IDs for rollback
   - Provide `undo` script that reverses applied flags for a given run

---

## Acceptance Criteria
- Migration scripts are idempotent and reversible
- Dry-run reports available and validated by product owners
- Cleanup worker runs reliably with monitoring/alerting
- Rollback script restores data for a given migration run
- All changes covered by integration tests where applicable

---

## Risks & Mitigations
- Risk: accidental mass-deletion
  - Mitigation: run dry-run, small-batch apply, manual approvals
- Risk: performance impact
  - Mitigation: rate limiting and sampling, off-peak windows
- Risk: incomplete rollback
  - Mitigation: detailed run metadata and verification checks

---

## Timeline Estimate
- Total estimated time: 18-20 hours (spread across 2-3 engineer days)

---

## Deliverables
- Migration scripts with `--preview`/`--apply` modes
- Background cleanup worker and queue implementation
- Monitoring dashboards and alerts
- Rollback tooling and runbook
- Documentation: `docs/migrations/soft-delete-guidance.md`

---

## Accomplishments
- Phase plan created and approved for implementation.

````
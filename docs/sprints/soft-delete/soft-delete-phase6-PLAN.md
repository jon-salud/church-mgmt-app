````markdown
# Soft Delete Phase 6: Observability & Operationalization - Implementation Plan

**Sprint:** Soft Delete Implementation  
**Phase:** 6 of 7  
**Status:** Approved - Ready for Implementation  
**Branch:** `feature/soft-delete-phase6-observability`  
**Base Branch:** `feature/soft-delete-main-sprint`  
**Date Created:** 3 November 2025  

---

## Overview

Implement observability, metrics, and dashboards for soft delete operations and cleanup jobs. Ensure operators can monitor the system, detect regressions, and respond to incidents.

## Objectives

1. Add metrics for soft delete and cleanup job performance.
2. Instrument migration scripts and background workers with tracing and metrics.
3. Create dashboards and alerting rules for anomalous behaviour.
4. Document runbooks for incident response.

---

## Metrics & Tracing

- Metrics to add:
  - `soft_delete.operations.total` (by entity, status)
  - `soft_delete.operations.duration_seconds` (histogram)
  - `cleanup.worker.jobs_processed` (by job type)
  - `cleanup.worker.job_failures` (by job type)
  - `migration.run.success` / `migration.run.failure`

- Traces:
  - Add traces for migration orchestration
  - Add traces for bulk operations and archivals

- Logs:
  - Structured logs with `run_id`, `entity`, `count`, `duration`, `status`

---

## Dashboards & Alerts

- Grafana dashboard: "Soft Delete Operations"
  - Panels: Operation throughput, error rate, histogram of durations, pending queue length
- Alerts:
  - Alert if `job_failures > 5%` over 1h
  - Alert if `queue_length > 100` for > 10m
  - Alert if `migration.run.failure == true`

---

## Instrumentation Implementation

1. Add metrics client wrapper: `api/src/observability/metrics.ts` (1h)
2. Instrument migration service and cleanup worker (2h)
3. Add tracing spans for orchestration (1.5h)
4. Export metrics to Prometheus (if available) or StatsD (0.5h)
5. Create dashboards and alert rules in Grafana (2h)

---

## Runbook & Playbook
- Document runbook for:
  - Handling partial failures during migration
  - Stopping and resuming a migration run
  - Investigating job failures and queues
- File: `docs/operational/soft-delete-runbook.md`

---

## Acceptance Criteria
- Metrics are emitted for all soft delete operations
- Grafana dashboard created and accessible to operations
- Alerts configured and tested on a staging environment
- Runbook reviewed and approved by SRE

---

## Timeline Estimate
- Total estimated time: 8-10 hours (1 engineer)

---

## Accomplishments
- Phase plan created and approved for implementation.

````
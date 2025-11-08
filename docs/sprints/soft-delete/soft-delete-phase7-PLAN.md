````markdown
# Soft Delete Phase 7: Completion & PRs - Implementation Plan

**Sprint:** Soft Delete Implementation  
**Phase:** 7 of 7  
**Status:** Approved - Ready for Implementation  
**Branch:** `feature/soft-delete-phase7-complete`  
**Base Branch:** `feature/soft-delete-main-sprint`  
**Date Created:** 3 November 2025  

---

## Overview

Finalize the sprint by preparing PRs, documentation, and ensuring all phases are merged to the sprint branch. Move completed items to `TASKS_COMPLETED.md` and prepare the sprint PR to `main` with linked phase PRs.

## Objectives

1. Ensure all phase branches are merged into `feature/soft-delete-main-sprint`.
2. Create the final Sprint PR against `main` with comprehensive change log and links to phase PRs.
3. Move all sprint items from `TASKS.md` to `TASKS_COMPLETED.md` with commit hashes and short summaries.
4. Create release notes and post-deploy checklist.

---

## Steps

1. **Merge Phase Branches**
   - Review each phase PR and merge into `feature/soft-delete-main-sprint`
   - Ensure CI passes for each merge

2. **Final Sprint PR**
   - Create PR `feature/soft-delete-main-sprint` → `main`
   - PR description: link to all phase PRs, list of commits, acceptance criteria, testing notes
   - Do NOT merge - wait for review

3. **TASKS Update**
   - Move phase entries from `TASKS.md` to `TASKS_COMPLETED.md` with:
     - Phase name
     - Short summary of accomplishment
     - Commit hash references
   - Ensure `TASKS.md` has no remaining items for the sprint

4. **Release Notes & Post-Deploy**
   - Draft release notes: `docs/releases/soft-delete-v1.md`
   - Post-deploy checklist: database migrations, monitor dashboards, rollback plan

5. **Closing Tasks**
   - Tag release branch as `release/soft-delete-v1`
   - Notify stakeholders with PR and release notes

---

## Acceptance Criteria
- All phase branches merged into sprint branch
- Sprint PR created with full documentation and review requests
- `TASKS.md` cleaned up and `TASKS_COMPLETED.md` updated
- Release notes and post-deploy checklists created
- Stakeholders notified

---

## Timeline Estimate
- Total estimated time: 2-3 hours

---

## Accomplishments
- Phase plan created and ready for execution.

````
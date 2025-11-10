# Tasks - Active Work Tracker

## Overview

This file tracks **current sprints in active development**. This is the single source of truth for work currently in progress.

### Related Files
- **[TASKS_COMPLETED.md](./TASKS_COMPLETED.md)** - ✅ All completed features and sprints (historical record)
- **[TASKS_BACKLOG.md](./TASKS_BACKLOG.md)** - 📌 Planned features and technical debt (next 1-3 months)
- **[TASKS_FUTURE.md](./TASKS_FUTURE.md)** - 🔮 Post-MVP roadmap and persona-driven epics (3+ months)
- **[sprints/README.md](./sprints/README.md)** - 📋 Complete sprint archive index

### Sprint Methodology
This project uses a structured sprint-based workflow with phases. Each sprint:
1. **Moved from TASKS_BACKLOG.md to TASKS.md** when work begins
2. **Broken into phases** with separate branches and plans
3. **Tracked in this file** during development
4. **Moved to TASKS_COMPLETED.md** when all phases are shipped

See `/.github/copilot-instructions.md` for complete Sprint & Phase Protocol.

---

## 🔄 Current Status: Members Hub MVP Sprint Active

**Status:** Building Members Hub on `DATA_MODE=mock` with PostgreSQL-compatible code

**Strategy:** Mock-first development with deferred PostgreSQL migration
- Development on mock mode (no database blocker)
- Code written PostgreSQL-compatible from day 1
- PostgreSQL installation post-MVP (~10-15 hours)
- Tests require zero changes (DataStore abstraction)

The following sprints were recently completed:
- ✅ **User Preferences Enhancement Sprint** (November 2025) - 3 phases completed
- ✅ **User Theme Preferences Sprint** (November 2025) - 5 phases completed
- ✅ **UI/UX Design System Enhancement Sprint** (November 2025) - 7 phases completed

See [TASKS_COMPLETED.md](./TASKS_COMPLETED.md) for full details on these sprints.

---

## 📝 Quick Actions

- **Starting new sprint?** Move item from [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) to "🔄 In Progress" section below
- **Phase completed?** Update status with commit hash in this file, then move to TASKS_COMPLETED.md
- **Planning ahead?** Add to [TASKS_BACKLOG.md](./TASKS_BACKLOG.md) or [TASKS_FUTURE.md](./TASKS_FUTURE.md)
- **Checking sprint archive?** See [sprints/README.md](./sprints/README.md) or [TASKS_COMPLETED.md](./TASKS_COMPLETED.md)

---

## 🔄 In Progress

### Members Hub MVP Sprint
**Branch:** `feature/members-hub-mvp-main-sprint`  
**Duration:** 10-14 days  
**Sprint Plan:** `docs/sprints/members-hub-mvp/members-hub-mvp-PLAN.md`  
**Strategy:** Mock-first development with PostgreSQL compatibility

**Goal:** Create modern, performant member management interface with professional UX patterns

**Phases:**
1. ✅ **Phase 0: UX Primitives & Foundation**
   - Status: Completed — PR #209, commit `aaff825`
   - Delivered: Drawer, Toast system, hooks (`useUrlState`, `useDrawer`, `useMediaQuery`, `useConfirm`, `useToast`), Jest-DOM setup, ESLint env updates
   - Plan: `docs/sprints/members-hub-mvp/members-hub-mvp-phase0-PLAN.md`

2. ✅ **Phase 1: Discoverability & Speed**
   - Status: Completed — PR #210 merged to `feature/members-hub-mvp-main-sprint`, commit `860c2a9`
   - Delivered: Search (debounced), filters (status, role, lastAttendance, hasEmail, hasPhone, groupsCountMin), sorting (name, email, status, groupsCount, lastAttendance), pagination (page/limit), URL-driven state, backend service/controller/module, unit + component + hook + E2E tests.
   - Plan: `docs/sprints/members-hub-mvp/members-hub-mvp-phase1-PLAN.md`
   - Commits: `860c2a9` (code hygiene, typing, sort indicators, Playwright storageState fix)
   - Notes: Drawer detail deferred to Phase 2; performance optimization deferred.

3. ✅ **Phase 2: Actionability & Responsive Design** - Completed
   - Status: Completed — PR #213, commits `a153b88`, `a06f17b`
   - Delivered: Bulk actions (add to group, set status, delete), Select All functionality, Status column, responsive design improvements
   - Fixed: ValidationPipe param stripping, React state race conditions, missing groups/status in API responses
   - Tests: 408/408 passing, builds successful, ESLint clean (282 warnings pre-existing)
   - Plan: `docs/sprints/members-hub-mvp/members-hub-mvp-phase2-PLAN.md`

4. ⏳ **Phase 3: Personalization** - Queued
   - Column picker
   - Saved views
   - Plan: `docs/sprints/members-hub-mvp/members-hub-mvp-phase3-PLAN.md`

5. ⏳ **Phase 4: Data Portability** - Queued
   - CSV import/export
   - Plan: `docs/sprints/members-hub-mvp/members-hub-mvp-phase4-PLAN.md`

**PostgreSQL Compatibility Checklist:**
- ✅ Use DataStore interface (not direct Prisma calls)
- ✅ Avoid SQLite-specific syntax in any raw queries
- ✅ Design for concurrent writes (avoid race conditions)
- ✅ Use proper indexing strategies (GIN for full-text search)
- ✅ Test with reasonable data volumes (100-1000 records)

**Reference Material:**
- PostgreSQL migration plan: `docs/sprints/postgresql-migration-REFERENCE/`
- Migration deferred to post-MVP (10-15 hours when ready)

---

*(When a sprint is active, it will be listed here with current phase status)*

**Currently:** Members Hub MVP Sprint - Phase 1 starting

---

## 📋 How to Use This File

### For Project Managers
- Check this file daily for sprint status
- Move items from BACKLOG to IN PROGRESS when sprint starts
- Update phase status as work completes
- Move entire sprint to COMPLETED when done

### For Engineers
- Refer to phase plan in `docs/sprints/{sprint-name}/` for technical details
- Create branches following naming convention: `feature/{sprint-name}-phase{N}-{description}`
- Update TASKS.md with commit hashes as phases complete
- Push PR to sprint branch, then sprint branch to main when complete

### For Architects
- Create sprint plans before implementation begins
- Review phase plans with engineering lead
- Track schedule vs. actual in accomplishments section

---

**Last Updated:** 8 November 2025  
**Maintenance:** Weekly during active sprints, after each phase completion

---

## 📞 Questions?

- **Sprint methodology:** See `/.github/copilot-instructions.md` (Strict Mode Protocol)
- **How to start a sprint:** See this file's "Quick Actions"
- **Sprint history:** See [TASKS_COMPLETED.md](./TASKS_COMPLETED.md)
- **Next planned work:** See [TASKS_BACKLOG.md](./TASKS_BACKLOG.md)
- **Sprint details:** See [sprints/README.md](./sprints/README.md)

---

**Navigation:**
[← Back to Docs](./README.md) | [View Completed Work →](./TASKS_COMPLETED.md) | [View Backlog →](./TASKS_BACKLOG.md)

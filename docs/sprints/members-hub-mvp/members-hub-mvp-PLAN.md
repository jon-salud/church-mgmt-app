# Members Hub MVP - Sprint Plan

**Sprint Name:** members-hub-mvp  
**Sprint Branch:** `feature/members-hub-mvp-main-sprint`  
**Date Created:** 9 November 2025  
**Created by:** Principal Architect  
**Engineering Review:** Principal Engineer (9 November 2025)  
**Status:** ✅ APPROVED - Ready for Implementation

---

## 🎯 Sprint Goals

Transform the basic member table into a modern, performant hub for church administrators and pastors to:
1. **Find members quickly** - Search, filter, sort with <6 second time-to-profile
2. **Understand engagement** - At-a-glance view of groups, attendance, giving
3. **Take immediate action** - Bulk operations, email, follow-ups, export
4. **Maintain accurate records** - Edit profiles, track notes, customize fields

**Success Metrics:**
- Time-to-member profile: ≤6 seconds (median)
- Search effectiveness: ≥80% searches → profile view within 30s
- Bulk action adoption: ≥30% admins use weekly
- P75 interaction latency: ≤200ms

---

## 📋 Sprint Documents

- **Product Spec:** `MEMBERS_HUB_MVP_SPEC.md` - UX specification and user stories
- **Implementation Plan:** `members-hub-mvp-IMPLEMENTATION-PLAN.md` - Technical architecture and phase breakdown
- **Phase Plans:** `members-hub-mvp-phase{N}-PLAN.md` - Per-phase technical details

---

## 🏗️ Architecture Overview

### Core Technical Approach

**Frontend:**
- Next.js 14 with App Router
- Flowbite React components
- Client-side filtering + server pagination
- URL as source of truth for filters/views
- Progressive drawer loading (summary first, lazy-load details)

**Backend:**
- NestJS API with Prisma ORM
- SQLite database (mock mode during development)
- PostgreSQL-compatible code patterns
- DataStore abstraction layer (zero test changes on migration)

**Database Strategy:**
- Development: `DATA_MODE=mock` (in-memory)
- Code: PostgreSQL-compatible patterns from day 1
- Migration: Post-MVP (~10-15 hours schema setup)
- Tests: Zero changes required (DataStore abstraction)

### Key Architectural Decisions

| Decision | Rationale | PostgreSQL Compatibility |
|----------|-----------|-------------------------|
| **Client-side filtering + server pagination** | Reduces API calls; server handles search/sort | ✅ Compatible |
| **URL as source of truth** | Deep-linkable, shareable views | ✅ Compatible |
| **Progressive drawer loading** | Fast initial render, lazy-load details | ✅ Compatible |
| **localStorage for saved views** | Zero backend changes in MVP | ✅ Compatible |
| **DataStore abstraction** | Test isolation, database flexibility | ✅ Enables PostgreSQL migration |

---

## 📦 Phase Breakdown

### Phase 0: UX Primitives & Foundation (3-4 days)
**Branch:** `feature/members-hub-mvp-phase0-ux-primitives`  
**Goal:** Build reusable UI components and state management patterns

**Deliverables:**
- Drawer component with Flowbite integration
- Responsive hooks (useMediaQuery, useBreakpoint)
- URL state management utilities
- Loading skeleton patterns
- Base API service layer with DataStore

**Acceptance Criteria:**
- ✅ Drawer component opens/closes with animation
- ✅ Responsive hooks work across breakpoints
- ✅ URL state syncs with component state
- ✅ DataStore interface integrated (mock mode)

**PostgreSQL Compatibility:**
- ✅ All API calls via DataStore interface
- ✅ No direct database dependencies in UI
- ✅ Mock mode active for rapid development

---

### Phase 1: Discoverability & Speed (3-4 days)
**Branch:** `feature/members-hub-mvp-phase1-discoverability`  
**Goal:** Enable fast member search, filtering, sorting, pagination

**Deliverables:**
- Full-text search with debouncing
- Filter bar (status, role, groups, attendance)
- Sort controls (name, join date, last activity)
- Pagination with configurable page size
- Keyboard navigation (Cmd+K search, arrow keys)

**Acceptance Criteria:**
- ✅ Search returns results in <500ms
- ✅ Filters combine logically (AND/OR)
- ✅ Sort persists in URL
- ✅ Keyboard shortcuts work

**PostgreSQL Compatibility:**
- ✅ Search uses DataStore.searchMembers()
- ✅ No SQLite-specific full-text search
- ✅ Filter logic abstracted from database

---

### Phase 2: Actionability & Responsive Filters (4-5 days)
**Branch:** `feature/members-hub-mvp-phase2-actionability-responsive`  
**Goal:** Fix responsive filter UX + enable member detail/edit/bulk actions

**Deliverables:**
- **PRIORITY 1:** Responsive filter redesign
  - Replace fixed left sidebar with filter chips + dropdown pattern
  - Active filters show as removable chips above table
  - Filters collapse into popover/dropdown on all screen sizes
  - Mobile-first approach (works ≥375px)
- Member detail drawer with lazy-loaded tabs
- Edit member modal with validation
- Bulk selection (checkbox + keyboard)
- Bulk actions: email, export, tag, archive
- Action confirmation modals

**Acceptance Criteria:**
- ✅ **Responsive Filters:**
  - Filters render as chips + dropdown (no fixed sidebar)
  - Active filters removable via chip X button
  - Layout works on mobile (375px+), tablet (768px+), desktop (1024px+)
  - Filter state persists in URL
- ✅ Drawer loads summary in <200ms
- ✅ Related data loads progressively
- ✅ Bulk actions work on 100+ selected
- ✅ Validation prevents invalid edits

**PostgreSQL Compatibility:**
- ✅ CRUD operations via DataStore
- ✅ Bulk updates use transaction pattern
- ✅ Optimistic UI updates

---

### Phase 3: Personalization & Views (2-3 days)
**Branch:** `feature/members-hub-mvp-phase3-personalization`  
**Goal:** Column picker, saved views (localStorage MVP)

**Deliverables:**
- Column picker with drag-to-reorder
- Save/load/delete views
- Default view selection
- View sharing via URL

**Acceptance Criteria:**
- ✅ Column visibility persists
- ✅ Saved views restore filters/sort
- ✅ Views stored in localStorage
- ✅ URL contains view state

**PostgreSQL Compatibility:**
- ✅ No backend changes (frontend-only)
- ✅ Ready for future backend views API

---

### Phase 4: Data Portability (2-3 days)
**Branch:** `feature/members-hub-mvp-phase4-data-portability`  
**Goal:** CSV import/export with field mapping

**Deliverables:**
- CSV export with filtered/selected members
- CSV import with drag-drop
- Field mapping interface
- Validation and error handling
- Import preview before commit

**Acceptance Criteria:**
- ✅ Export completes in <3s for 1000 members
- ✅ Import validates before saving
- ✅ Field mapping handles missing columns
- ✅ Duplicate detection works

**PostgreSQL Compatibility:**
- ✅ Import uses DataStore.batchCreate()
- ✅ Export uses DataStore.exportMembers()
- ✅ Transaction handling for batch operations

---

## 🔒 Compliance Gates

Following Strict Mode protocol from `/.github/copilot-instructions.md`:

### Gate A — Readiness & Understanding
- ✅ Sprint moved from TASKS_BACKLOG.md to TASKS.md
- ✅ Sprint plan created and approved
- ✅ PostgreSQL compatibility strategy documented
- ✅ Mock-first development approach agreed
- ✅ DataStore abstraction validates zero test changes

### Gate B — Sprint/Phase Setup (Per Phase)
- Sprint branch: `feature/members-hub-mvp-main-sprint` ✅
- Phase branch: Created from sprint branch (per phase)
- Phase plan: Created before implementation (per phase)
- Plan sections: Technical approach, files, tests, risks

### Gate C — Test-First (TDD)
- Add/adjust tests per phase plan
- Confirm failing tests initially (red)
- Tests use DataStore abstraction (mock mode)

### Gate D — Implementation & Verification
- Implement minimal code to pass tests (green)
- Refactor safely while tests remain green
- Run full test suite: `pnpm -C api test`
- Verify no regressions (usage search complete)
- Format check: `pnpm format:check`

### Gate E — Documentation & PRs
- Append `## Accomplishments` to phase plan
- **Principal Engineer MUST:** Move completed phase from TASKS.md to TASKS_COMPLETED.md
- Create phase PR → sprint branch (NOT main)
- On sprint completion: Create sprint PR → main
- **Final Action:** Move all remaining sprint items to TASKS_COMPLETED.md

---

## ⚠️ Risks & Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Mock→PostgreSQL incompatibility** | Low | High | PostgreSQL compatibility checklist, DataStore abstraction |
| **Performance degradation with 1000+ members** | Medium | High | Pagination, virtualization, index strategy documented |
| **Drawer state management complexity** | Medium | Medium | URL as source of truth, existing patterns |
| **Bulk operations timeout** | Low | Medium | Background jobs for >100 items, progress indicators |

### Process Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Phase dependencies unclear** | Low | Medium | Phase 0 must complete first; others can overlap |
| **Scope creep** | Medium | High | Defer custom fields backend to post-MVP |
| **PostgreSQL migration surprises** | Low | High | Mock mode + compatibility checklist prevents issues |

---

## 📊 Timeline & Dependencies

**Total Duration:** 14-18 days (with buffer: 18-22 days)

```
Week 1:
  Mon-Thu: Phase 0 (UX Primitives) - MUST COMPLETE FIRST
  Fri: Phase 1 Start (Discoverability)

Week 2:
  Mon-Wed: Phase 1 Complete
  Thu-Fri: Phase 2 Start (Actionability)

Week 3:
  Mon-Tue: Phase 2 Complete
  Wed-Thu: Phase 3 (Personalization)
  Fri: Phase 4 Start (Data Portability)

Week 4:
  Mon-Tue: Phase 4 Complete
  Wed: Integration testing, bug fixes
  Thu: Documentation, sprint PR
  Fri: Review, deploy to staging
```

**Critical Path:** Phase 0 → Phase 1 → Phase 2 (Phase 3 & 4 can overlap with Phase 2)

---

## ✅ Acceptance Criteria (Sprint-Level)

### Functional Requirements
- ✅ Search members by name/email/phone in <500ms
- ✅ Filter by status, role, groups, attendance patterns
- ✅ Sort by name, join date, last activity
- ✅ View member detail drawer with lazy-loaded tabs
- ✅ Edit member information with validation
- ✅ Bulk select and perform actions (email, export, tag)
- ✅ Save and load custom views
- ✅ Export filtered members to CSV
- ✅ Import members from CSV with field mapping

### Non-Functional Requirements
- ✅ P95 API latency ≤500ms
- ✅ UI interactions ≤200ms
- ✅ Works on desktop (1440px+), tablet (768px+), mobile (390px+)
- ✅ All tests pass (unit, integration, E2E)
- ✅ Format check passes: `pnpm format:check`
- ✅ No console errors or warnings
- ✅ Accessibility: keyboard navigation, screen reader support

### PostgreSQL Compatibility
- ✅ All database operations via DataStore interface
- ✅ No SQLite-specific syntax in any queries
- ✅ Designed for concurrent writes (no race conditions)
- ✅ Proper indexing strategies documented
- ✅ Tested with reasonable data volumes (100-1000 records)

---

## 🧪 Testing Strategy

### Unit Tests
- Component tests with React Testing Library
- Hook tests (useMediaQuery, useDrawer, useUrlState)
- Utility function tests (formatters, validators)

### Integration Tests
- API endpoint tests via Vitest
- DataStore mock implementation
- Tests run in `DATA_MODE=mock`

### E2E Tests
- Playwright tests for critical user flows
- Search → Filter → View Detail → Edit → Save
- Bulk Select → Export → Download CSV
- Import CSV → Map Fields → Preview → Commit

### Test Isolation
- All tests use `DATA_MODE=mock` (per setup-vitest.ts)
- No database migrations needed for testing
- Tests unaffected by PostgreSQL migration

---

## 📚 Reference Material

### Existing Patterns to Follow
- **DataStore Abstraction:** `api/src/datastore/` - Database operations interface
- **RBAC Guards:** `api/src/common/guards/` - Role-based access control
- **Flowbite Components:** `web/components/ui/` - Design system components
- **URL State Management:** See Groups module for patterns
- **Pagination:** See Events module for server-side pagination

### PostgreSQL Migration Reference
- **Location:** `docs/sprints/postgresql-migration-REFERENCE/`
- **Timeline:** 10-15 hours post-MVP
- **Status:** Deferred, reference material ready

---

## 🚀 Sprint Workflow

### 1. Phase Start
```bash
# From sprint branch
git checkout feature/members-hub-mvp-main-sprint
git checkout -b feature/members-hub-mvp-phase0-ux-primitives

# Create phase plan
# docs/sprints/members-hub-mvp/members-hub-mvp-phase0-PLAN.md
```

### 2. Implementation
- Follow TDD: Write tests first (red)
- Implement minimal code to pass (green)
- Refactor safely (keep green)
- Use DataStore abstraction for all database operations

### 3. Phase Complete
- Append `## Accomplishments` to phase plan
- Run full test suite: `pnpm -C api test && pnpm test:e2e:mock`
- Format check: `pnpm format:check`
- Create PR: phase branch → sprint branch (NOT main)
- **Principal Engineer:** Move phase to TASKS_COMPLETED.md

### 4. Sprint Complete
- All phases merged to sprint branch
- Integration testing complete
- Create PR: sprint branch → main
- **Final Action:** Move all remaining sprint items to TASKS_COMPLETED.md

---

## 📝 PostgreSQL Compatibility Checklist

Use this during development to ensure code is PostgreSQL-ready:

- [ ] **DataStore Interface:** All database operations via DataStore (not direct Prisma)
- [ ] **No SQLite Syntax:** Avoid SQLite-specific SQL in raw queries
- [ ] **Concurrent Writes:** Design for MVCC (no race conditions)
- [ ] **Indexing Strategy:** Document indexes for full-text search, filters
- [ ] **Transaction Patterns:** Use transactions for bulk operations
- [ ] **Test Data Volume:** Test with 100-1000 records
- [ ] **No Schema Assumptions:** Don't rely on SQLite auto-increment behavior
- [ ] **Error Handling:** Handle constraint violations, deadlocks
- [ ] **Connection Pooling:** Design for connection limits (defer to migration)
- [ ] **Query Optimization:** Avoid N+1 queries, use joins/batch loading

---

## 🎉 Success Definition

**Sprint succeeds when:**
1. ✅ All 5 phases complete and merged to sprint branch
2. ✅ All tests pass (unit, integration, E2E)
3. ✅ Format check passes
4. ✅ Sprint PR created (sprint branch → main)
5. ✅ PostgreSQL compatibility checklist complete
6. ✅ Documentation updated (TASKS.md → TASKS_COMPLETED.md)
7. ✅ No regressions in existing features
8. ✅ User can complete all persona tasks from spec

**Post-Sprint:**
- Sprint PR reviewed and merged to main
- Staging deployment successful
- PostgreSQL migration ready to execute (10-15 hours)
- User feedback collected for iteration

---

## 📞 Questions or Issues?

- **Process:** See `/.github/copilot-instructions.md` for Strict Mode protocol
- **Architecture:** Review `docs/source-of-truth/ARCHITECTURE.md`
- **Database:** Check `docs/source-of-truth/DATABASE_SCHEMA.md`
- **PostgreSQL:** See `docs/sprints/postgresql-migration-REFERENCE/`

---

**Created:** 9 November 2025  
**Last Updated:** 9 November 2025  
**Next Review:** After Phase 0 completion

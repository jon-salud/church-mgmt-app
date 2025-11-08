# Members Hub MVP Sprint – Phase 1 PLAN

**Phase:** 1  
**Title:** Discoverability & Speed  
**Sprint:** members-hub-mvp  
**Sprint Branch:** `feature/members-hub-mvp-main-sprint`  
**Phase Branch (to create):** `feature/members-hub-mvp-phase1-discoverability-speed`  
**Status:** Draft (Awaiting Gate A Approval)  
**Last Updated:** 9 Nov 2025

---
## 1. Objectives
Deliver a performant, filterable, searchable members list with URL-driven state so administrators can locate any member record within 10 seconds and navigate directly into profile context via Drawer.

**Success Criteria:**
1. P95 response for member list API ≤ 500ms (mock mode approximation).  
2. P75 UI interaction latency (filter, search apply) ≤ 200ms on 1k dataset.  
3. URL fully encodes filters/sort/pagination and drawer open state (`?memberId=<id>`).  
4. No N+1 queries in list implementation (batch lastAttendance resolution).  
5. Deep-linkable state reproduces identical table view after reload/back navigation.  
6. Accessibility: search bar and filters keyboard reachable; table headers focusable for sorting.

---
## 2. Scope
### In Scope
- `GET /api/members` endpoint (mock-backed for now) with: pagination, search, sort, filters (status, role, lastAttendance bucket, groupsCount min, hasEmail, hasPhone).
- Batch resolution for last attendance timestamps (no per-row queries).  
- Frontend Members page skeleton: header + search + filter panel + table + pagination + empty/error states.  
- Drawer integration (Phase 0 primitive) via `useDrawerRoute` with `memberId` param.  
- URL serialization/deserialization of filter state and pagination.  
- Basic badge calculation for “new” (created ≤7 days) & “follow-up” placeholder (stub logic).  
- Unit tests: query builder, filter parsing, hook behaviour.  
- Integration tests (API): pagination boundary, search, combined filters, sort ordering.  
- E2E tests: search→filter→sort→paginate→drawer open→back navigation.

### Out of Scope (Deferred to Later Phases)
- Full member detail progressive loading (Phase 2).  
- Custom field filters (Phase 3).  
- Export/import (Phase 4).  
- Server-side saved views (post-MVP) — localStorage only added Phase 3.  
- Performance instrumentation to production observability stack (mock metrics only).

---
## 3. Technical Approach
### Backend
Implement temporary service layer using existing mock datastore abstraction rather than direct Prisma to preserve PostgreSQL-ready discipline. Create `MembersService.list()` with structured input DTO `MemberListQueryDto` (validation via class-validator). Compose single transaction: fetch page of users with necessary relations + `_count` for groups; parallel query for last attendance using groupBy (or equivalent mock aggregator) across all userIds on page; transform to `MemberSummary` array.

Sorting: whitelist keys: `name`, `lastAttendance`, `createdAt`, `groupsCount`. Implement parse → Prisma `orderBy` (or mock adapter equivalent). Reject invalid sort strings.

Filters: build dynamic where clause / predicate set; use AND semantics. Search uses case-insensitive contains over firstName, lastName, email, phone (normalized numeric only). For mock mode: replicate logic using JS filter functions with early exits for performance.

Pagination: page/limit with bounds (page ≥1; limit ≤100). Provide total count + pages.

### Frontend
Members page route: `app/members/page.tsx` server component wrapper + client component `MembersClient`. Utilize hook `useMembersQueryState` to read/write URL search params. Debounce search (300ms) using `useDebounce`. Maintain derived state (loading, error). Table rows clickable → drawer open (sets `memberId`). Sorting triggered by header button toggling asc/desc/none sequence.

Filter panel collapsible on mobile; persistent on desktop. Use accessible semantics (`aria-controls`, `aria-expanded`).

### URL State Contract
```
?search=jo&status=member,visitor&sort=lastAttendance:desc&page=2&limit=50&memberId=abc123
```
Validation: ignore unknown params; sanitize values (strip whitespace, enforce numeric bounds).

### Performance Guards
- Single data fetch per list load (no per-row last attendance query).  
- Debounced search to avoid rapid re-renders.  
- `React.memo` + stable row key to avoid row churn.  
- Avoid deriving large arrays each render; precompute filtered/sorted subset once per param change.  

### Accessibility
- Search input auto-focus plus clear button with `aria-label`.  
- Sort headers are buttons with `aria-sort` reflecting state.  
- Drawer retains focus trap (Phase 0).  
- Focus outline always visible per design token system.

---
## 4. Files To Add / Modify
Backend (api/):
- `api/src/modules/members/dto/member-list-query.dto.ts` (validation DTO)  
- `api/src/modules/members/members.service.ts` (list logic)  
- `api/src/modules/members/members.controller.ts` (GET /api/members)  
- `api/src/modules/members/members.module.ts` (Nest module)  
- `api/src/modules/members/types/member-summary.type.ts`  
- Test: `api/src/modules/members/__tests__/members.controller.spec.ts` (integration)  

Frontend (web/):
- `web/app/members/members-client.tsx` (client component implementation)  
- `web/app/members/page.tsx` (server wrapper)  
- `web/lib/hooks/use-members-query-state.ts`  
- `web/lib/hooks/use-debounce.ts` (generic)  
- `web/components/members/members-table.tsx`  
- `web/components/members/members-filters.tsx`  
- `web/components/members/members-search-bar.tsx`  
- Tests: `web/lib/hooks/__tests__/use-members-query-state.test.ts`, `web/components/members/__tests__/members-table.test.tsx`  
- E2E: `web/e2e/members-discoverability.spec.ts`

Docs:
- Update `docs/TASKS.md` phase line from queued → in progress post Gate A approval.  
- Append accomplishments on completion to this plan.  

---
## 5. Test Plan
### Unit
- Query DTO validation (invalid page, limit >100, malformed sort).  
- URL parsing hook: adding/removing params, drawer param persistence.  
- Debounce hook timing behaviour (using fake timers).  

### Integration (API)
- Pagination boundaries (page 1, last page).  
- Search partial match firstName/lastName/email.  
- Combined filters (status+hasEmail).  
- Sort ordering correctness (asc/desc).  
- N+1 absence: assert only 2 underlying datastore calls (mock spy).  

### E2E
Scenario: Load page → search “ann” → filter status=member → sort by lastAttendance desc → paginate → open drawer → back navigation restores previous filter & pagination.

### Performance (Mock Validation)
- Simulate dataset of 1000 members; measure render time < 1s initial.  
- Ensure no excessive re-render (React Profiler: table row count stable).  

---
## 6. Risks & Mitigations
- N+1 regression: enforce batch method & unit test spies.  
- URL param explosion: keep whitelist; ignore unknown → reduces complexity.  
- Mock vs production divergence: isolate all logic behind service interface so replacement with Prisma queries is trivial in migration sprint.  
- Drawer state race on rapid navigation: debounce open calls from row clicks (only if observed).  
- Performance on large dataset: if >1000 degrade, introduce virtualization (react-window) flagged for Phase 1.5, backlog if needed.  

---
## 7. Rollback Plan
Phase introduces new module; rollback = remove `members` module files + revert route additions. No schema changes performed. Safe to cherry-pick revert commit. Frontend: remove new components and restore placeholder page (if existed). Since isolated, low blast radius.

---
## 8. Acceptance Criteria Checklist (To Validate During Gate D/E)
- [ ] API returns structured response with pagination meta.  
- [ ] Search + multiple filters combine correctly (manual test + integration).  
- [ ] Sorting toggles cycles and reflects via `aria-sort`.  
- [ ] Drawer opens with memberId param and closes removing param.  
- [ ] Back navigation replays state.  
- [ ] No N+1 queries (verified by call count).  
- [ ] Accessibility checks (axe) show no violations on members page.  
- [ ] E2E scenario fully passes.  

---
## 9. Post-Completion Accomplishments (to append)
(Placeholder – populate after implementation.)

---
## 10. Required Before Coding (Gate A)
This document + sprint plan must exist; Phase 1 entry in `docs/TASKS.md` moved to “In Progress”. Produce readiness receipt JSON and obtain approval.

---

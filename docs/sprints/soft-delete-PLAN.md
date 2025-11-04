# Sprint 5: Complete Soft Delete Implementation - Households & Children

**Sprint Name:** soft-delete-completion  
**Sprint Branch:** `feature/soft-delete-main-sprint`  
**Status:** Ready for Implementation  
**Created:** 4 November 2025  
**Estimated Duration:** 3-4 weeks (20-30 hours)

---

## Executive Summary

Sprint 5 completes the soft delete implementation across the Church Management System by adding soft delete functionality to the remaining core entities: **Households** and **Children**. This sprint follows the proven patterns established in Phases 1-4 (Users, Events, Groups, Announcements, Giving) and delivers a unified, consistent soft delete experience across all major data entities.

### Sprint Objectives

1. **Complete Backend Coverage**: Implement soft delete for Households and Children entities with full CRUD operations
2. **Consistent Frontend Experience**: Deliver UI matching Phase 2 and Phase 4 patterns (toggle, bulk operations, badges)
3. **Data Integrity**: Ensure cascade behavior, maintain referential integrity, exclude archived from analytics
4. **Comprehensive Testing**: Unit tests for services, E2E tests for UI workflows, zero regressions
5. **Documentation Excellence**: Update all source-of-truth docs, create detailed phase plans, record accomplishments

### Success Criteria

- ✅ All Household and Child operations support soft delete (archive/restore/bulk)
- ✅ Frontend UI provides role-based controls (Admin/Leader only)
- ✅ All existing functionality preserved (zero regressions)
- ✅ Test coverage: 100% unit tests passing, 95%+ E2E tests passing
- ✅ Documentation updated: DATABASE_SCHEMA.md, API_DOCUMENTATION.md, FUNCTIONAL_REQUIREMENTS.md
- ✅ Ready for production deployment

---

## Phase Breakdown

### Phase 5: Households & Children Backend (8-10 hours)

**Branch:** `feature/soft-delete-phase5-households-backend`  
**Focus:** Complete backend soft delete implementation for Households and Children modules

#### Scope

**Database Schema Updates:**
- Add `deletedAt TIMESTAMP` to `households` table
- Add `deletedAt TIMESTAMP` to `children` table
- Create migration scripts with proper indexes

**Backend Implementation (20 methods per entity):**

**Households:**
1. `deleteHousehold(id)` - Soft delete household
2. `undeleteHousehold(id)` - Restore household
3. `listDeletedHouseholds(filters)` - Fetch archived households
4. `bulkDeleteHouseholds(ids)` - Archive multiple households
5. `bulkUndeleteHouseholds(ids)` - Restore multiple households
6. Update `listHouseholds()` to exclude deleted by default
7. Update `getHouseholdById()` to check deletedAt status
8. Service methods with audit logging
9. Controller endpoints with OpenAPI docs
10. Authorization: Admin/Leader only

**Children:**
1. `deleteChild(id)` - Soft delete child
2. `undeleteChild(id)` - Restore child
3. `listDeletedChildren(filters)` - Fetch archived children
4. `bulkDeleteChildren(ids)` - Archive multiple children
5. `bulkUndeleteChildren(ids)` - Restore multiple children
6. Update `listChildren()` to exclude deleted by default
7. Update `getChildById()` to check deletedAt status
8. Update check-in flows to exclude archived children
9. Service methods with audit logging
10. Controller endpoints with OpenAPI docs
11. Authorization: Admin/Leader only

**Cascade Behavior:**
- Archiving a household does NOT automatically archive children (explicit action required)
- Archiving a household does NOT automatically archive profiles (household members remain active)
- Warning UI when archiving household with active children/members

**Testing:**
- 15+ unit tests for household soft delete operations
- 15+ unit tests for child soft delete operations
- Integration tests for cascade scenarios
- Authorization tests for role-based access

#### Deliverables

1. Database migrations with `deletedAt` columns
2. 40+ backend methods across data store, service, controller layers
3. OpenAPI documentation for all endpoints
4. 30+ passing unit/integration tests
5. Updated DATABASE_SCHEMA.md and API_DOCUMENTATION.md
6. Phase 5 plan document with accomplishments section

---

### Phase 6: Households & Children Frontend (10-12 hours)

**Branch:** `feature/soft-delete-phase6-households-frontend`  
**Focus:** Complete frontend soft delete UI for Households and Children modules

#### Scope

**API Client Methods (20 methods):**
- 10 household methods (delete/undelete/list/bulk operations)
- 10 child methods (delete/undelete/list/bulk operations)
- 2 SSR methods for server-side rendering

**Households Page (`/households`):**
- "Show Archived" toggle (Admin/Leader only)
- Bulk selection with "Archive" and "Restore" buttons
- Individual archive/restore actions per household
- "Archived" badges on deleted households
- Warning dialog when archiving household with active children/members
- Optimistic updates with rollback on error
- Exclude archived from household count

**Children Management (within household detail):**
- "Show Archived" toggle for children list
- Bulk selection for child operations
- Individual archive/restore actions per child
- "Archived" badges on deleted children
- Exclude archived children from check-in flows
- Optimistic updates with rollback on error

**Type Safety:**
- Extract Household and Child types to `web/lib/types.ts`
- Consistent interfaces across components
- Eliminate type drift

**E2E Testing:**
- Page objects: HouseholdsPage, HouseholdDetailPage
- 7+ test cases per module (14 total):
  - Archive/restore single household
  - Bulk archive/restore households
  - Toggle visibility
  - Warning for active dependents
  - Role-based access control
  - Archive/restore single child
  - Bulk archive/restore children

#### Deliverables

1. 20 API client methods with TypeScript signatures
2. Updated Households and Children pages with soft delete UI
3. ConfirmDialog integration for warnings
4. Type definitions in shared location
5. 14+ E2E tests covering soft delete workflows
6. Updated FUNCTIONAL_REQUIREMENTS.md
7. Phase 6 plan document with accomplishments section

---

### Phase 7: Final Validation & Documentation (2-3 hours)

**Branch:** `feature/soft-delete-main-sprint`  
**Focus:** Complete validation, documentation, and sprint closure

#### Scope

**End-to-End Validation:**
- Full regression testing across all modules (Users, Events, Groups, Announcements, Giving, Households, Children)
- Cross-module soft delete scenarios (e.g., archived user with archived contributions)
- Performance testing with bulk operations (100+ items)
- Authorization matrix verification (Admin/Leader/Member access)

**Documentation Updates:**
- Update `docs/source-of-truth/DATABASE_SCHEMA.md` with all soft delete columns
- Update `docs/source-of-truth/API_DOCUMENTATION.md` with all endpoints
- Update `docs/source-of-truth/FUNCTIONAL_REQUIREMENTS.md` with soft delete behaviors
- Update `docs/PRD.md` with soft delete feature description
- Update `docs/USER_MANUAL.md` with user-facing soft delete instructions
- Create `docs/sprints/soft-delete-SPRINT-SUMMARY.md` with complete sprint retrospective

**Final Testing:**
- All API tests passing (350+ tests)
- All E2E tests passing (65+ tests)
- Zero linting errors
- Build succeeds for all workspaces

**Sprint PR Creation:**
- Create PR: `feature/soft-delete-main-sprint` → `main`
- Title: "Sprint 5: Complete Soft Delete Implementation - Households & Children"
- Link all phase PRs (Phase 5, Phase 6, Phase 7)
- Include sprint plan and accomplishments
- Request review from stakeholders

#### Deliverables

1. Complete regression test report
2. Updated source-of-truth documentation (5 files)
3. Sprint summary document
4. Sprint PR with comprehensive description
5. Zero open issues or regressions

---

## Technical Architecture

### Database Schema Changes

```sql
-- Phase 5A: Add deletedAt to households
ALTER TABLE "Household" ADD COLUMN "deletedAt" TIMESTAMP;
CREATE INDEX "idx_household_deleted_at" ON "Household" ("deletedAt");

-- Phase 5B: Add deletedAt to children
ALTER TABLE "Child" ADD COLUMN "deletedAt" TIMESTAMP;
CREATE INDEX "idx_child_deleted_at" ON "Child" ("deletedAt");
```

### API Endpoint Summary

**Households (10 endpoints):**
- `DELETE /api/v1/households/:id` - Soft delete household
- `POST /api/v1/households/:id/restore` - Restore household
- `GET /api/v1/households/deleted/all` - List archived households
- `POST /api/v1/households/bulk-delete` - Bulk archive
- `POST /api/v1/households/bulk-restore` - Bulk restore
- `GET /api/v1/households` - List active (existing, updated to filter)
- `GET /api/v1/households/:id` - Get by ID (existing, updated to check deletedAt)
- `POST /api/v1/households` - Create (existing)
- `PATCH /api/v1/households/:id` - Update (existing)
- `GET /api/v1/households/:id/members` - List members (existing)

**Children (10 endpoints):**
- `DELETE /api/v1/checkin/children/:id` - Soft delete child
- `POST /api/v1/checkin/children/:id/restore` - Restore child
- `GET /api/v1/checkin/children/deleted/all` - List archived children
- `POST /api/v1/checkin/children/bulk-delete` - Bulk archive
- `POST /api/v1/checkin/children/bulk-restore` - Bulk restore
- `GET /api/v1/checkin/households/:householdId/children` - List active (existing, updated)
- `GET /api/v1/checkin/children/:id` - Get by ID (existing, updated)
- `POST /api/v1/checkin/children` - Create (existing)
- `PATCH /api/v1/checkin/children/:id` - Update (existing)

### Frontend Component Architecture

```
web/
├── app/households/
│   ├── page.tsx                           [UPDATE] Fetch deleted data
│   ├── households-client.tsx              [REFACTOR] Add soft delete UI
│   └── [id]/
│       ├── page.tsx                       [UPDATE] Fetch deleted children
│       └── household-detail-client.tsx    [REFACTOR] Add child soft delete UI
├── app/checkin/
│   └── dashboard/
│       └── checkin-dashboard-client.tsx   [UPDATE] Filter archived children
├── lib/
│   ├── api.client.ts                      [ADD] 20 soft delete methods
│   ├── api.server.ts                      [ADD] 2 SSR methods
│   └── types.ts                           [UPDATE] Add Household/Child types
└── e2e/
    ├── households.spec.ts                 [ADD] 7 soft delete test cases
    ├── children.spec.ts                   [ADD] 7 soft delete test cases
    └── page-objects/
        ├── HouseholdsPage.ts              [ADD] Page object methods
        └── HouseholdDetailPage.ts         [ADD] Page object methods
```

---

## Acceptance Criteria

### Phase 5: Backend

- ✅ Database migrations add `deletedAt` columns with indexes
- ✅ 20 household methods implemented (data store, service, controller)
- ✅ 20 child methods implemented (data store, service, controller)
- ✅ All existing list methods filter out deleted by default
- ✅ Authorization enforced (Admin/Leader only for soft delete)
- ✅ Audit logging for all soft delete operations
- ✅ 30+ unit/integration tests passing
- ✅ OpenAPI documentation complete
- ✅ TypeScript compiles with zero errors
- ✅ Lint passes with zero new warnings

### Phase 6: Frontend

- ✅ 20 API client methods with proper TypeScript signatures
- ✅ Households page has soft delete UI (toggle, bulk, badges)
- ✅ Household detail page has child soft delete UI
- ✅ Warning dialog for archiving household with dependents
- ✅ Optimistic updates with rollback on error
- ✅ Role-based UI rendering (Admin/Leader only)
- ✅ Types extracted to shared location
- ✅ 14+ E2E tests passing
- ✅ Build succeeds with zero errors
- ✅ Zero regression in existing functionality

### Phase 7: Final Validation

- ✅ All API tests passing (350+ tests)
- ✅ All E2E tests passing (65+ tests, 95%+ success rate)
- ✅ Full regression testing complete
- ✅ All documentation updated (5 files)
- ✅ Sprint PR created with comprehensive description
- ✅ Ready for production deployment

---

## Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cascade delete complexity | High | Medium | Explicit UI warnings, no automatic cascade, clear user confirmation |
| Data integrity violations | High | Low | Comprehensive unit tests, integration tests for relationships |
| Performance with large datasets | Medium | Low | Indexed deletedAt columns, efficient queries, bulk operations |
| UI consistency across modules | Medium | Low | Reuse Phase 2/4 patterns, shared components, design review |
| E2E test flakiness | Low | Medium | Stable selectors, explicit waits, isolated test data |
| Authorization bypass | High | Low | Backend enforcement, frontend checks, authorization tests |

---

## Timeline & Effort Estimation

| Phase | Duration | Complexity | Status |
|-------|----------|------------|--------|
| Phase 5A: Database Schema | 1h | Low | Not Started |
| Phase 5B: Household Backend | 3-4h | Medium | Not Started |
| Phase 5C: Child Backend | 3-4h | Medium | Not Started |
| Phase 5D: Backend Testing | 2h | Medium | Not Started |
| Phase 6A: API Client Layer | 2h | Low | Not Started |
| Phase 6B: Households Frontend | 4-5h | Medium | Not Started |
| Phase 6C: Children Frontend | 4-5h | Medium | Not Started |
| Phase 6D: Frontend Testing | 2h | Medium | Not Started |
| Phase 7: Final Validation | 2-3h | Low | Not Started |
| **Total** | **23-30h** | - | **0% Complete** |

---

## Dependencies

- ✅ Phase 1: Users & Events backend (Complete)
- ✅ Phase 2: Groups & Announcements frontend (Complete - established patterns)
- ✅ Phase 3: Giving backend (Complete)
- ✅ Phase 4: Giving frontend (Complete)
- ✅ Sprint branch `feature/soft-delete-main-sprint` (Available)

---

## Branch Strategy

```bash
# Phase 5: Backend
git checkout feature/soft-delete-main-sprint
git pull
git checkout -b feature/soft-delete-phase5-households-backend

# After Phase 5 complete, merge to sprint branch
git checkout feature/soft-delete-main-sprint
git merge feature/soft-delete-phase5-households-backend

# Phase 6: Frontend
git checkout feature/soft-delete-main-sprint
git pull
git checkout -b feature/soft-delete-phase6-households-frontend

# After Phase 6 complete, merge to sprint branch
git checkout feature/soft-delete-main-sprint
git merge feature/soft-delete-phase6-households-frontend

# Phase 7: Final validation on sprint branch
# After all phases complete, create sprint PR
git checkout feature/soft-delete-main-sprint
# Create PR: feature/soft-delete-main-sprint → main
```

---

## Testing Strategy

### Unit Tests (Backend)

```bash
# Run household service tests
pnpm -C api test households.service

# Run child/checkin service tests
pnpm -C api test checkin.service

# Run all soft delete tests
pnpm -C api test -- --grep "soft delete"
```

**Expected Coverage:**
- Household CRUD: 10 tests
- Household soft delete: 8 tests
- Child CRUD: 10 tests
- Child soft delete: 8 tests
- Authorization: 6 tests
- Cascade scenarios: 4 tests
- **Total: 46 new tests**

### E2E Tests (Frontend)

```bash
# Run households E2E tests
pnpm test:e2e:mock households

# Run children E2E tests
pnpm test:e2e:mock children

# Run full suite
pnpm test:e2e:mock
```

**Expected Coverage:**
- Households soft delete: 7 tests
- Children soft delete: 7 tests
- Cross-module scenarios: 2 tests
- **Total: 16 new tests**

### Integration Testing

- Test archiving household with active children (warning flow)
- Test archiving household with active members (warning flow)
- Test restoring household with archived children
- Test check-in flows exclude archived children
- Test household member counts exclude archived profiles

---

## Code Quality Standards

### TypeScript

- Zero `any` types in new code
- Explicit return types for all functions
- Proper error handling with typed exceptions
- Value objects for IDs (HouseholdId, ChildId)

### Testing

- 100% coverage for new service methods
- E2E tests for all user-facing workflows
- Accessibility testing (labels, ARIA attributes)
- Performance testing for bulk operations

### Documentation

- Inline comments for complex logic
- OpenAPI schemas for all endpoints
- README updates for new features
- Phase plan accomplishments sections

---

## Success Metrics

**Code Quality:**
- All tests passing (350+ API, 65+ E2E)
- Zero TypeScript errors
- Zero linting errors
- Build succeeds in <60 seconds

**Functionality:**
- Soft delete works for all entities (7 modules)
- Role-based access enforced
- Cascade warnings functional
- Optimistic updates with rollback

**Documentation:**
- All source-of-truth docs updated
- API documentation complete
- User manual includes soft delete instructions
- Sprint retrospective documented

**Production Readiness:**
- Performance validated with 1000+ records
- Security audit passed
- Accessibility checklist complete
- Zero open blockers

---

## Communication Plan

**Daily Standups:**
- Progress updates on current phase
- Blockers and dependencies
- Code review requests

**Phase Completion:**
- Demo to stakeholders
- Request code review
- Update TASKS.md
- Merge to sprint branch

**Sprint Completion:**
- Comprehensive demo
- Sprint retrospective
- Create sprint PR
- Schedule production deployment

---

## Related Documentation

- [Sprint 4 Phase Plan (Giving Frontend)](./soft-delete-phase4-PLAN.md)
- [TASKS.md](../TASKS.md) - Work tracker
- [DATABASE_SCHEMA.md](../source-of-truth/DATABASE_SCHEMA.md) - Schema reference
- [API_DOCUMENTATION.md](../source-of-truth/API_DOCUMENTATION.md) - API reference
- [FUNCTIONAL_REQUIREMENTS.md](../source-of-truth/FUNCTIONAL_REQUIREMENTS.md) - Requirements
- [CODING_STANDARDS.md](../CODING_STANDARDS.md) - Code standards

---

## Notes

**Key Architectural Decisions:**

1. **No Automatic Cascade**: Archiving a household does NOT automatically archive children or members - requires explicit user action with warning dialogs

2. **Cascade Warning UI**: When attempting to archive a household with active children/members, show warning dialog with counts and "View Details" option

3. **Check-in Impact**: Archived children are automatically excluded from check-in flows and event attendance lists

4. **Household Member Counts**: All household member counts exclude archived profiles from calculations

5. **Referential Integrity**: Maintain soft delete timestamps separately - restoring household does NOT automatically restore children

6. **Role Authorization**: Only Admin and Leader roles can perform soft delete operations (matches backend `ensureLeader()` logic)

7. **Audit Trail**: All soft delete operations logged to audit system with actor, timestamp, and entity details

8. **Performance**: Use indexed `deletedAt` columns for efficient filtering in large datasets

---

## Accomplishments

*This section will be populated after sprint completion.*

---

**Document Version:** 1.0  
**Last Updated:** 4 November 2025  
**Status:** Approved - Ready for Implementation

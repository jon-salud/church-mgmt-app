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
```}
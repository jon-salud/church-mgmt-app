# Soft Delete Phase 4: Giving Module Frontend - Implementation Plan

**Sprint:** Soft Delete Implementation  
**Phase:** 4 of 7  
**Status:** Approved - Ready for Implementation  
**Branch:** `feature/soft-delete-phase4-giving-frontend`  
**Base Branch:** `feature/soft-delete-main-sprint`  
**Date Created:** 3 November 2025  

---

## Overview

Implement frontend soft delete functionality for the Giving module (Funds and Contributions), following established Phase 2 patterns while incorporating architectural improvements for type safety, error handling, and user experience.

## Prerequisites (Completed)

- ✅ Phase 1: Backend soft delete for Users and Events
- ✅ Phase 2: Frontend soft delete for Groups and Announcements (established patterns)
- ✅ Phase 3: Backend soft delete for Giving module (Funds and Contributions)

## Objectives

1. **Type Safety**: Extract types to shared location, eliminate type drift
2. **Financial Integrity**: Validate operations, handle partial failures correctly
3. **Authorization Consistency**: Match frontend role checks to backend exactly
4. **User Experience**: Replace native dialogs, add optimistic updates
5. **Test Coverage**: Add unit tests for calculations, comprehensive E2E tests
6. **Zero Regression**: Validate all existing giving functionality remains intact

---

## Technical Approach

### Architecture Components

```
web/
├── app/giving/
│   ├── page.tsx                           [UPDATE] Fetch deleted data + user
│   ├── giving-client.tsx                  [REFACTOR] Add soft delete UI
│   ├── giving-calculations.ts             [NEW] Testable financial logic
│   └── __tests__/
│       └── giving-calculations.test.ts    [NEW] Unit tests
├── lib/
│   ├── api.client.ts                      [ADD] 10 soft delete methods
│   ├── api.server.ts                      [ADD] 2 SSR methods
│   ├── types.ts                           [UPDATE] Add Fund/Contribution types
│   └── toast.ts                           [NEW] Simple notification utility
├── components/ui-flowbite/
│   └── modal.tsx                          [UPDATE] Add ConfirmDialog variant
└── e2e/
    ├── giving.spec.ts                     [ADD] 7 soft delete test cases
    └── test/pages/giving-page.ts          [ADD] Page object methods
```

### Key Design Decisions

1. **Type Extraction**: Move Fund/Contribution types to `web/lib/types.ts` for reusability
2. **Partial Failure Handling**: Backend uses partial success model (not all-or-nothing transactions)
3. **Optimistic Updates**: Immediate UI feedback with rollback on failure
4. **Role Authorization**: Frontend checks match backend `ensureLeader()` logic (Admin OR Leader)
5. **Confirmation UX**: Custom ConfirmDialog component replacing `window.confirm()`
6. **Financial Calculations**: Extract to testable function with unit test coverage

---

## Implementation Phases

### Phase 4A: Foundation & Type Safety (1.5h)

**Step 1: Type Definitions**
- Add `Fund`, `Contribution`, `GivingSummary`, `BulkOperationResult` interfaces to `web/lib/types.ts`
- Ensure all fields match backend API contracts
- Include `deletedAt?: string | null` for soft delete support

**Step 2: ConfirmDialog Component**
- Add `ConfirmDialog` variant to `web/components/ui-flowbite/modal.tsx`
- Support `variant` prop: 'default' | 'danger' | 'warning'
- Maintain accessibility (ARIA, keyboard navigation)

**Step 3: Toast Utility**
- Create `web/lib/toast.ts` with minimal implementation
- Methods: `success()`, `error()`, `warning()`, `info()`
- Document as temporary solution (tech debt for proper toast system)

**Validation:**
- TypeScript compiles without errors
- All components import types correctly

---

### Phase 4B: API Layer Implementation (1h)

**Step 4: Client API Methods**
Add to `web/lib/api.client.ts`:
- `deleteFund(fundId)` - Soft delete fund
- `undeleteFund(fundId)` - Restore fund
- `listDeletedFunds()` - Fetch archived funds
- `bulkDeleteFunds(ids)` - Archive multiple funds
- `bulkUndeleteFunds(ids)` - Restore multiple funds
- `deleteContribution(id)` - Soft delete contribution
- `undeleteContribution(id)` - Restore contribution
- `listDeletedContributions(filters)` - Fetch archived contributions with filters
- `bulkDeleteContributions(ids)` - Archive multiple contributions
- `bulkUndeleteContributions(ids)` - Restore multiple contributions

Return type: `BulkOperationResult` includes partial failure details

**Step 5: Server API Methods**
Add to `web/lib/api.server.ts`:
- `listDeletedFunds(query?)` - SSR fetch with error handling
- `listDeletedContributions(filters?)` - SSR fetch with query params

**Validation:**
- All methods have proper TypeScript signatures
- Error handling returns empty arrays on failure

---

### Phase 4C: Financial Calculations & Unit Tests (1.5h)

**Step 6: Extract Calculation Logic**
Create `web/app/giving/giving-calculations.ts`:
- `calculateGivingSummary(contributions, funds)` function
- Filter out archived contributions (safety measure)
- Calculate: overall, monthToDate, previousMonth, averageGift
- Group by fund and by month

**Step 7: Unit Tests**
Create `web/app/giving/__tests__/giving-calculations.test.ts`:
- Test: Exclude archived contributions from calculations
- Test: Month-to-date totals correct
- Test: Group by fund correctly
- Test: Handle empty array
- Test: Recalculate after restore

**Validation:**
- All 5+ unit tests pass
- Coverage for critical financial logic

---

### Phase 4D: Update Page Component (30min)

**Step 8: Modify giving/page.tsx**
- Parallel fetch: funds, contributions, members, deletedFunds, deletedContributions, user
- Use `calculateGivingSummary()` as fallback if API fails
- Pass all data to client component

**Validation:**
- Page loads without errors
- User role data available for authorization

---

### Phase 4E: Refactor Client Component (3h)

**Step 9: Update giving-client.tsx**

**State Management:**
- Add state for deleted data, selections, processing flag
- Derive `canManageContributions` from `isAdmin || isLeader`
- Sync state with props on changes

**Event Handlers:**
- `handleArchiveContribution()` - Optimistic update with rollback
- `handleRestoreContribution()` - Optimistic update with rollback
- `handleBulkArchiveContributions()` - Handle partial failures
- `handleBulkRestoreContributions()` - Handle partial failures
- Selection handlers for bulk operations

**UI Components:**
- Archive toggle (leader/admin only)
- Bulk operations bar (shows count, Archive/Restore buttons)
- Checkboxes with proper accessibility labels
- Archive/Restore buttons per contribution
- "Archived" badges for deleted items

**Data Refresh:**
- Tab visibility listener to refresh stale data
- Silent failure if refresh fails

**Validation:**
- Role-based UI rendering works
- Optimistic updates rollback on errors
- Partial failures show proper feedback

---

### Phase 4F: E2E Testing (1.5h)

**Step 10: Page Object Methods**
Add to `web/e2e/test/pages/giving-page.ts`:
- `toggleShowArchivedContributions()`
- `selectContribution(id)`
- `selectAllContributions()`
- `archiveContribution(id)`
- `restoreContribution(id)`
- `bulkArchiveContributions()`
- `bulkRestoreContributions()`

**Step 11: E2E Test Cases**
Add to `web/e2e/giving.spec.ts`:
1. Archive and restore single contribution
2. Bulk archive and restore operations
3. Show archived items only when toggle enabled
4. Hide controls for non-leader users
5. Handle partial bulk operation failures
6. Exclude archived from CSV export
7. Recalculate summary on archive/restore

**Validation:**
- All 7 new tests pass
- Total E2E: 61/62 passing (96%+)

---

## Acceptance Criteria

### Functional Requirements
- ✅ Leader/Admin can archive/restore contributions individually
- ✅ Leader/Admin can bulk archive/restore contributions
- ✅ Admin can manage funds (archive/restore)
- ✅ Members cannot see soft delete controls
- ✅ Archived items shown only when toggle enabled
- ✅ "Archived" badge visible on deleted items
- ✅ Financial summaries exclude archived contributions
- ✅ CSV export excludes archived contributions

### Technical Requirements
- ✅ Types extracted to shared location (zero type drift)
- ✅ Authorization: Frontend matches backend (`ensureLeader` = Admin OR Leader)
- ✅ Error handling: Optimistic updates with rollback
- ✅ Partial failures: Proper feedback with success/failure counts
- ✅ ConfirmDialog replaces `window.confirm()`
- ✅ Unit tests for financial calculations (5+ tests)
- ✅ E2E tests for soft delete workflows (7 tests)
- ✅ TypeScript compiles with zero errors
- ✅ Lint passes with zero new warnings
- ✅ Build succeeds (`pnpm -r build`)

### Quality Requirements
- ✅ Accessibility: Proper labels, ARIA attributes, keyboard navigation
- ✅ Performance: Optimistic updates, parallel data fetching
- ✅ Resilience: Tab visibility refresh, graceful error handling
- ✅ Zero regression: All existing giving functionality works

---

## Testing Strategy

### Unit Tests
```bash
pnpm -C web test:unit giving-calculations.test.ts
```
Expected: 5+ tests passing

### E2E Tests
```bash
pnpm test:e2e:mock
```
Expected: 61/62 tests passing (1 skipped - onboarding serial conflict)

### Build Validation
```bash
pnpm -r build
pnpm lint
```
Expected: Zero errors, zero new warnings

### Manual Testing Checklist
- [ ] Archive contribution → appears in archived list
- [ ] Restore contribution → returns to active list
- [ ] Bulk operations work with multiple selections
- [ ] Partial failure shows proper error message
- [ ] Summary recalculates correctly
- [ ] CSV export excludes archived items
- [ ] Member role sees no soft delete controls
- [ ] Leader role sees all controls
- [ ] Admin role sees all controls

---

## Risk Mitigation

| Risk | Mitigation | Status |
|------|------------|--------|
| Type drift between components | Extract to shared types file | ✅ Planned |
| State inconsistency on errors | Optimistic updates with rollback | ✅ Planned |
| Authorization bypass | Match frontend to backend exactly | ✅ Planned |
| Financial calculation bugs | Unit test coverage | ✅ Planned |
| Partial bulk failures | Handle BulkOperationResult properly | ✅ Planned |
| Stale data on tab switch | Visibility change listener | ✅ Planned |

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| 4A: Foundation & Type Safety | 1.5h | Not Started |
| 4B: API Layer | 1h | Not Started |
| 4C: Calculations & Tests | 1.5h | Not Started |
| 4D: Page Component | 30min | Not Started |
| 4E: Client Component | 3h | Not Started |
| 4F: E2E Testing | 1.5h | Not Started |
| Final Validation | 1h | Not Started |
| **Total** | **7-8h** | **0% Complete** |

---

## Dependencies

- Backend Phase 3 endpoints (✅ Complete)
- Phase 2 UI patterns (✅ Established)
- Sprint branch `feature/soft-delete-main-sprint` (✅ Available)

---

## Branch Strategy

```bash
# Create phase branch from sprint branch
git checkout feature/soft-delete-main-sprint
git pull
git checkout -b feature/soft-delete-phase4-giving-frontend

# After completion, merge to sprint branch
git checkout feature/soft-delete-main-sprint
git merge feature/soft-delete-phase4-giving-frontend

# Sprint branch will be merged to main after all phases complete
```

---

## Deliverables

1. ✅ Working soft delete UI for Giving module
2. ✅ Type definitions in shared location
3. ✅ Unit tests for financial calculations
4. ✅ E2E tests for soft delete workflows
5. ✅ Updated documentation (TASKS.md)
6. ✅ This phase plan with accomplishments section

---

## Notes

- Backend uses **partial success model** for bulk operations (not all-or-nothing)
- Must handle `BulkOperationResult` with separate success/failed counts
- Toast utility is minimal implementation - document as tech debt
- Financial calculations MUST exclude archived contributions for compliance
- Role check: `canManage = isAdmin || isLeader` (matches backend `ensureLeader()`)

---

## Accomplishments

_To be filled in after implementation completes_

- Files modified:
- Tests added:
- Commits:
- Issues resolved:
- Deviations from plan:

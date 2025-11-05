# Sprint 5 - Phase 6: Households & Children Frontend Soft Delete

**Phase Name:** soft-delete-phase6-households-frontend  
**Phase Branch:** `feature/soft-delete-phase6-households-frontend`  
**Sprint Branch:** `feature/soft-delete-main-sprint`  
**Status:** Ready for Implementation  
**Created:** 4 November 2025  
**Last Updated:** 4 November 2025 (Technical Review Incorporated)  
**Estimated Duration:** 14-16 hours

---

## Executive Summary

Phase 6 completes the soft delete implementation by adding frontend UI for Households and Children modules. This phase delivers user-facing soft delete functionality with role-based controls, bulk operations, optimistic updates, and comprehensive E2E testing. The UI follows proven patterns from Phase 2 (Groups/Announcements) and Phase 4 (Giving) to ensure consistency across the application.

### Phase Objectives

1. **Complete Frontend Coverage**: Implement soft delete UI for Households and Children with full feature parity to previous phases
2. **Consistent User Experience**: Deliver UI matching established patterns (toggle, bulk operations, badges, warnings)
3. **Role-Based Access**: Restrict soft delete controls to Admin and Leader roles only
4. **Type Safety**: Extract types to shared location, eliminate type drift, ensure compile-time safety
5. **Comprehensive Testing**: E2E tests covering all soft delete workflows with stable selectors

### Success Criteria

- [ ] 20 API client methods implemented with TypeScript signatures (all methods documented)
- [ ] Backend endpoint for household dependents check added
- [ ] Households page has complete soft delete UI (toggle, bulk, badges, loading states)
- [ ] Single array state management pattern (no dual array sync issues)
- [ ] Household detail page has child soft delete UI
- [ ] Warning dialogs with accurate dependent counts
- [ ] Optimistic updates with rollback on error
- [ ] 17 E2E tests passing (7 households + 7 children + 3 error scenarios)
- [ ] Pagination for large datasets (500+ records)
- [ ] Zero regressions in existing functionality
- [ ] Build succeeds with zero TypeScript errors

---

## Phase Breakdown

### Step 1: API Client Layer + Backend Endpoint (3 hours)

**Backend Files to Create:**
- `api/src/modules/households/households.controller.ts` - Add `GET /households/:id/dependents` endpoint

**Frontend Files to Modify:**
- `web/lib/api.client.ts` - Add 20 soft delete methods
- `web/lib/api.server.ts` - Add 3 SSR methods (includes new dependents endpoint)
- `web/lib/types.ts` - Extract Household and Child types

**New Backend Endpoint (Required for Warning Dialog):**
```typescript
// api/src/modules/households/households.controller.ts
@Get(':id/dependents')
@UseGuards(RolesGuard)
@Roles('admin', 'leader')
async getHouseholdDependents(@Param('id') id: string) {
  const household = await this.householdsService.findOne(id)
  const members = household.memberIds.filter(/* not deleted */)
  const children = await this.checkinService.getChildren(id)
  const activeChildren = children.filter(c => !c.deletedAt)
  
  return {
    activeMemberCount: members.length,
    activeChildrenCount: activeChildren.length,
    children: activeChildren
  }
}
```

**Households API Methods (10 total):**
```typescript
// api.client.ts - Client-side only
export async function deleteHousehold(id: string): Promise<SuccessResponse>
export async function undeleteHousehold(id: string): Promise<SuccessResponse>
export async function bulkDeleteHouseholds(ids: string[]): Promise<BulkOperationResult>
export async function bulkUndeleteHouseholds(ids: string[]): Promise<BulkOperationResult>
export async function hardDeleteHousehold(id: string): Promise<SuccessResponse>
export async function getHouseholdDependents(id: string): Promise<HouseholdDependents> // NEW

// api.server.ts - Server-side (SSR)
export async function getHouseholds(filters?: HouseholdFilters): Promise<Household[]>
export async function getDeletedHouseholds(filters?: HouseholdFilters): Promise<Household[]> // NEW
export async function getHousehold(id: string): Promise<Household>
export async function getHouseholdDependentsSSR(id: string): Promise<HouseholdDependents> // NEW
```

**Children API Methods (8 total):**
```typescript
// api.client.ts - Client-side only
export async function deleteChild(id: string): Promise<SuccessResponse>
export async function undeleteChild(id: string): Promise<SuccessResponse>
export async function bulkDeleteChildren(ids: string[]): Promise<BulkOperationResult>
export async function bulkUndeleteChildren(ids: string[]): Promise<BulkOperationResult>
export async function hardDeleteChild(id: string): Promise<SuccessResponse>

// api.server.ts - Server-side (SSR)
export async function getChildren(householdId?: string): Promise<Child[]>
export async function getDeletedChildren(householdId?: string): Promise<Child[]> // NEW
```

**Note:** Total is 20 methods (12 households + 8 children). Previous count was unclear about SSR vs client methods.

**Type Definitions:**
```typescript
// web/lib/types.ts
export interface Household {
  id: string
  name: string
  address: string
  phone: string
  email: string
  memberIds: string[]
  deletedAt?: string // ISO timestamp
  createdAt: string
  updatedAt: string
}

export interface Child {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  householdId: string
  allergies?: string
  medicalNotes?: string
  deletedAt?: string // ISO timestamp
  createdAt: string
  updatedAt: string
}

export interface BulkOperationResult {
  successCount: number
  failedCount: number
  failedIds: string[]
  errors: Array<{ id: string; error: string }>
}

export interface SuccessResponse {
  success: boolean
}

export interface HouseholdDependents {
  activeMemberCount: number
  activeChildrenCount: number
  children: Child[]
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
```

**Testing:**
- Verify all methods call correct API endpoints
- Validate TypeScript type checking
- Test error handling for network failures

---

### Step 2: Households Page UI (5-6 hours)

**Files to modify:**
- `web/app/households/page.tsx` - Server component to fetch deleted data
- `web/app/households/households-client.tsx` - Client component with soft delete UI

**Server Component Updates (`page.tsx`):**
```typescript
export default async function HouseholdsPage() {
  const user = await getUser()
  const allHouseholds = await getHouseholds() // All households (active + deleted)
  
  return (
    <HouseholdsClient 
      user={user}
      initialHouseholds={allHouseholds}
    />
  )
}
```

**Client Component Features (`households-client.tsx`):**

1. **Show Archived Toggle** (Admin/Leader only):
```typescript
{hasRole(user, ['admin', 'leader']) && (
  <Button
    variant="outline"
    onClick={() => setShowArchived(!showArchived)}
    data-testid="show-archived-toggle"
  >
    {showArchived ? 'Show Active' : 'Show Archived'} Households
  </Button>
)}
```

2. **Bulk Selection UI with Loading States**:
```typescript
<Checkbox
  id="select-all-households"
  checked={selectedHouseholds.length === displayedHouseholds.length}
  onCheckedChange={handleSelectAll}
  disabled={isLoading}
  data-testid="select-all-households"
/>
<Label htmlFor="select-all-households">
  Select All ({displayedHouseholds.length})
</Label>

{selectedHouseholds.length > 0 && (
  <div className="bulk-actions">
    <Button 
      onClick={handleBulkArchive}
      disabled={isLoading}
      data-testid="bulk-archive-households"
    >
      {isLoading ? (
        <><Spinner className="mr-2" /> Archiving...</>
      ) : (
        `Archive (${selectedHouseholds.length})`
      )}
    </Button>
    <Button 
      onClick={handleBulkRestore}
      disabled={isLoading}
      data-testid="bulk-restore-households"
    >
      {isLoading ? (
        <><Spinner className="mr-2" /> Restoring...</>
      ) : (
        `Restore (${selectedHouseholds.length})`
      )}
    </Button>
  </div>
)}
```

3. **Household Card with Actions**:
```typescript
<div className="household-card" data-testid={`household-${household.id}`}>
  <Checkbox
    id={`select-household-${household.id}`}
    checked={selectedHouseholds.includes(household.id)}
    onCheckedChange={() => handleToggleSelect(household.id)}
  />
  <Label htmlFor={`select-household-${household.id}`} className="sr-only">
    Select {household.name}
  </Label>
  
  {household.deletedAt && (
    <span className="archived-badge">Archived</span>
  )}
  
  <h3>{household.name}</h3>
  <p>{household.address}</p>
  
  {hasRole(user, ['admin', 'leader']) && (
    <Button
      variant="ghost"
      onClick={() => household.deletedAt 
        ? handleRestore(household.id) 
        : handleArchive(household.id)
      }
      data-testid={`${household.deletedAt ? 'restore' : 'archive'}-household-${household.id}`}
    >
      {household.deletedAt ? 'Restore' : 'Archive'}
    </Button>
  )}
</div>
```

4. **Warning Dialog for Active Dependents (Using New API):**
```typescript
const handleArchive = async (id: string) => {
  setIsLoading(true)
  try {
    // Fetch accurate dependent counts from backend
    const dependents = await getHouseholdDependents(id)
    
    if (dependents.activeMemberCount > 0 || dependents.activeChildrenCount > 0) {
      setConfirmDialog({
        title: 'Archive Household with Active Members?',
        message: `This household has ${dependents.activeMemberCount} active members and ${dependents.activeChildrenCount} active children. Archiving the household will not automatically archive these records.`,
        children: dependents.children, // Show list of children
        confirmText: 'Archive Household',
        onConfirm: () => performArchive(id)
      })
    } else {
      await performArchive(id)
    }
  } catch (error) {
    toast.error('Failed to check household dependents')
  } finally {
    setIsLoading(false)
  }
}
```

5. **Optimistic Updates with Rollback and Loading State**:
```typescript
const performArchive = async (id: string) => {
  setIsLoading(true)
  // Optimistic update
  const previousHouseholds = [...households]
  setHouseholds(prev => prev.map(h => 
    h.id === id ? { ...h, deletedAt: new Date().toISOString() } : h
  ))
  
  try {
    await deleteHousehold(id)
    toast.success('Household archived successfully')
    setSelectedHouseholds([]) // Clear selection
  } catch (error) {
    // Rollback on error
    setHouseholds(previousHouseholds)
    toast.error('Failed to archive household')
  } finally {
    setIsLoading(false)
  }
}
```

**Styling:**
- Archived badges with gray background
- Disabled appearance for archived cards
- Bulk action buttons with consistent styling
- Warning dialog with prominent message

**Accessibility:**
- Labels for all checkboxes (visible + sr-only)
- ARIA attributes for interactive elements
- Keyboard navigation support
- Screen reader announcements for state changes

---

### Step 3: Household Detail - Children UI (4-5 hours)

**Files to modify:**
- `web/app/households/[id]/page.tsx` - Fetch deleted children
- `web/app/households/[id]/household-detail-client.tsx` - Add child soft delete UI

**Server Component Updates:**
```typescript
export default async function HouseholdDetailPage({ params }: Props) {
  const household = await getHousehold(params.id)
  const children = await getChildren(params.id)
  const deletedChildren = await getDeletedChildren(params.id) // NEW
  
  return (
    <HouseholdDetailClient
      household={household}
      children={children}
      deletedChildren={deletedChildren} // NEW
    />
  )
}
```

**Client Component Features:**

1. **Children Section with Toggle**:
```typescript
<div className="children-section">
  <div className="section-header">
    <h2>Children</h2>
    {hasRole(user, ['admin', 'leader']) && (
      <Button
        variant="outline"
        onClick={() => setShowArchivedChildren(!showArchivedChildren)}
        data-testid="show-archived-children-toggle"
      >
        {showArchivedChildren ? 'Show Active' : 'Show Archived'}
      </Button>
    )}
  </div>
  
  {/* Bulk actions for children */}
  {selectedChildren.length > 0 && (
    <div className="bulk-actions">
      <Button onClick={handleBulkArchiveChildren}>
        Archive ({selectedChildren.length})
      </Button>
      <Button onClick={handleBulkRestoreChildren}>
        Restore ({selectedChildren.length})
      </Button>
    </div>
  )}
  
  {/* Children list */}
  {displayedChildren.map(child => (
    <ChildCard
      key={child.id}
      child={child}
      onArchive={handleArchiveChild}
      onRestore={handleRestoreChild}
      selected={selectedChildren.includes(child.id)}
      onToggleSelect={handleToggleSelectChild}
    />
  ))}
</div>
```

2. **Child Card Component**:
```typescript
<div className="child-card" data-testid={`child-${child.id}`}>
  <Checkbox
    id={`select-child-${child.id}`}
    checked={selected}
    onCheckedChange={onToggleSelect}
  />
  <Label htmlFor={`select-child-${child.id}`} className="sr-only">
    Select {child.firstName} {child.lastName}
  </Label>
  
  {child.deletedAt && (
    <span className="archived-badge">Archived</span>
  )}
  
  <div className="child-info">
    <h4>{child.firstName} {child.lastName}</h4>
    <p>Age: {calculateAge(child.dateOfBirth)}</p>
    {child.allergies && <p className="allergies">Allergies: {child.allergies}</p>}
  </div>
  
  {hasRole(user, ['admin', 'leader']) && (
    <Button
      variant="ghost"
      onClick={() => child.deletedAt ? onRestore(child.id) : onArchive(child.id)}
      data-testid={`${child.deletedAt ? 'restore' : 'archive'}-child-${child.id}`}
    >
      {child.deletedAt ? 'Restore' : 'Archive'}
    </Button>
  )}
</div>
```

3. **Check-in Impact Notice**:
```typescript
{child.deletedAt && (
  <Alert variant="info">
    <AlertDescription>
      Archived children are excluded from check-in flows and event attendance lists.
    </AlertDescription>
  </Alert>
)}
```

**State Management:**
- Separate state for households and children
- Independent toggle states
- Separate bulk selection arrays
- Optimistic updates for both entities

---

### Step 4: E2E Testing (3 hours)

**Test Files:**
- `web/e2e/households.spec.ts` - Household soft delete tests (8 cases including errors)
- `web/e2e/children.spec.ts` - Child soft delete tests (8 cases including errors)
- `web/e2e/error-scenarios.spec.ts` - Error handling tests (3 cases) **NEW**
- `web/e2e/page-objects/HouseholdsPage.ts` - Page object for households
- `web/e2e/page-objects/HouseholdDetailPage.ts` - Page object for children

**Page Object - HouseholdsPage.ts:**
```typescript
export class HouseholdsPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/households')
    await this.page.waitForLoadState('networkidle')
  }
  
  async clickShowArchived() {
    await this.page.click('[data-testid="show-archived-toggle"]')
  }
  
  async selectHousehold(id: string) {
    await this.page.click(`#select-household-${id}`)
  }
  
  async archiveHousehold(id: string) {
    await this.page.click(`[data-testid="archive-household-${id}"]`)
  }
  
  async restoreHousehold(id: string) {
    await this.page.click(`[data-testid="restore-household-${id}"]`)
  }
  
  async bulkArchive() {
    await this.page.click('[data-testid="bulk-archive-households"]')
  }
  
  async bulkRestore() {
    await this.page.click('[data-testid="bulk-restore-households"]')
  }
  
  async isArchivedBadgeVisible(id: string): Promise<boolean> {
    return await this.page.isVisible(`[data-testid="household-${id}"] .archived-badge`)
  }
  
  async getDependentsWarning(): Promise<string> {
    return await this.page.textContent('[data-testid="warning-dialog-message"]')
  }
}
```

**Test Cases - Households (7):**
```typescript
test.describe('Households Soft Delete', () => {
  test('admin can archive and restore a single household', async ({ page }) => {
    // Login as admin
    // Navigate to households
    // Click archive button
    // Verify archived badge appears
    // Click show archived toggle
    // Click restore button
    // Verify badge disappears
  })
  
  test('admin can bulk archive and restore households', async ({ page }) => {
    // Select multiple households
    // Click bulk archive
    // Verify all have archived badges
    // Toggle to archived view
    // Select all
    // Click bulk restore
    // Verify badges removed
  })
  
  test('archived households count is displayed correctly', async ({ page }) => {
    // Archive 3 households
    // Verify count shows "3 Archived"
    // Toggle to archived view
    // Verify 3 households displayed
  })
  
  test('warning appears when archiving household with active members', async ({ page }) => {
    // Select household with active members
    // Click archive
    // Verify warning dialog
    // Verify message mentions member count
    // Confirm archive
    // Verify household archived
  })
  
  test('warning appears when archiving household with active children', async ({ page }) => {
    // Select household with active children
    // Click archive
    // Verify warning dialog
    // Verify message mentions children count
    // Confirm archive
    // Verify household archived
  })
  
  test('member role cannot access archive controls', async ({ page }) => {
    // Login as member
    // Navigate to households
    // Verify archive buttons not visible
    // Verify toggle not visible
  })
  
  test('leader role can access archive controls', async ({ page }) => {
    // Login as leader
    // Navigate to households
    // Verify archive buttons visible
    // Verify toggle visible
    // Archive household successfully
  })
})
```

**Test Cases - Children (7):**
```typescript
test.describe('Children Soft Delete', () => {
  test('admin can archive and restore a single child', async ({ page }) => {
    // Navigate to household detail
    // Click archive child button
    // Verify archived badge appears
    // Click show archived toggle
    // Click restore button
    // Verify badge disappears
  })
  
  test('admin can bulk archive and restore children', async ({ page }) => {
    // Navigate to household detail
    // Select multiple children
    // Click bulk archive
    // Verify all have archived badges
    // Toggle to archived view
    // Select all
    // Click bulk restore
    // Verify badges removed
  })
  
  test('archived children excluded from check-in flows', async ({ page }) => {
    // Archive a child
    // Navigate to check-in dashboard
    // Search for household
    // Verify archived child not in list
    // Navigate back to household detail
    // Restore child
    // Navigate to check-in dashboard
    // Verify child appears in list
  })
  
  test('archived children count displayed correctly', async ({ page }) => {
    // Navigate to household detail
    // Archive 2 children
    // Verify count shows "2 Archived"
    // Toggle to archived view
    // Verify 2 children displayed
  })
  
  test('toggle between active and archived children views', async ({ page }) => {
    // Navigate to household detail
    // Verify active children displayed
    // Click show archived toggle
    // Verify archived children displayed
    // Verify active children hidden
    // Toggle back
    // Verify active children shown
  })
  
  test('member role cannot archive children', async ({ page }) => {
    // Login as member
    // Navigate to household detail
    // Verify archive buttons not visible
    // Verify toggle not visible
  })
  
  test('leader role can archive children', async ({ page }) => {
    // Login as leader
    // Navigate to household detail
    // Verify archive buttons visible
    // Archive child successfully
  })
})
```

**Test Cases - Error Scenarios (3 NEW):**
```typescript
test.describe('Error Handling', () => {
  test('handles network failure during archive operation', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/households/*/delete', route => route.abort())
    // Attempt to archive household
    // Verify error toast appears
    // Verify household state rolled back (no archived badge)
    // Verify UI is interactive (not stuck in loading state)
  })
  
  test('handles partial bulk operation failure', async ({ page }) => {
    // Mock API to fail 2 of 5 operations
    // Select 5 households
    // Click bulk archive
    // Verify error message shows "2 failed, 3 succeeded"
    // Verify only 3 households have archived badge
    // Verify failed households listed in error dialog
  })
  
  test('handles concurrent modification conflict', async ({ page }) => {
    // Archive household in one tab
    // Attempt to archive same household in another tab
    // Verify appropriate error message
    // Verify UI refreshes to show current state
  })
})
```

**Test Data Setup:**
- Create dedicated test households with known data
- Include households with/without members
- Include households with/without children
- Use stable IDs for reliable selector matching
- Add test data for error scenarios (network failures, conflicts)

---

## Technical Implementation Details

### State Management Pattern (Single Array - FIXED)

```typescript
// households-client.tsx
const [households, setHouseholds] = useState<Household[]>(initialHouseholds)
const [showArchived, setShowArchived] = useState(false)
const [selectedHouseholds, setSelectedHouseholds] = useState<string[]>([])
const [isLoading, setIsLoading] = useState(false)

// Filter in display layer, not in state
const displayedHouseholds = households.filter(h => 
  showArchived ? h.deletedAt != null : h.deletedAt == null
)

// Optimistic update helper
const updateHouseholdOptimistically = (
  id: string,
  update: Partial<Household>
) => {
  const previous = [...households]
  setHouseholds(prev => prev.map(h => h.id === id ? { ...h, ...update } : h))
  return {
    rollback: () => setHouseholds(previous)
  }
}

// Note: Single array prevents sync issues between active/archived lists
// All households stored together, filtering happens at display time
```

### Error Handling

```typescript
try {
  await deleteHousehold(id)
  toast.success('Household archived successfully')
} catch (error) {
  rollback()
  if (error instanceof ApiError) {
    toast.error(error.message)
  } else {
    toast.error('Failed to archive household. Please try again.')
  }
  console.error('Archive household error:', error)
}
```

### Type Safety

```typescript
// Ensure all API methods return typed responses
const result: BulkOperationResult = await bulkDeleteHouseholds(ids)

// Use type guards for conditional rendering
if (household.deletedAt) {
  // TypeScript knows household is archived
}

// Extract reusable types
type HouseholdWithMembers = Household & { members: User[] }
type ChildWithHousehold = Child & { household: Household }
```

### Pagination Strategy (Large Dataset Support)

```typescript
// households-client.tsx
const [pagination, setPagination] = useState<PaginationParams>({
  page: 1,
  limit: 50,
  sortBy: 'name',
  sortOrder: 'asc'
})

// Fetch paginated data
const fetchHouseholds = async () => {
  setIsLoading(true)
  try {
    const response = await getHouseholds(pagination)
    setHouseholds(response.data)
    setHasMore(response.hasMore)
  } finally {
    setIsLoading(false)
  }
}

// Render pagination controls
<div className="pagination-controls">
  <Button 
    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
    disabled={pagination.page === 1 || isLoading}
  >
    Previous
  </Button>
  <span>Page {pagination.page}</span>
  <Button 
    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
    disabled={!hasMore || isLoading}
  >
    Next
  </Button>
</div>

// Note: Implement pagination if church has 500+ households
// Otherwise, client-side filtering is sufficient
```

---

## Acceptance Criteria

### Functionality

- ✅ Backend endpoint `/households/:id/dependents` returns accurate counts
- ✅ Admin/Leader can archive single household
- ✅ Admin/Leader can restore single household
- ✅ Admin/Leader can bulk archive/restore households
- ✅ Admin/Leader can toggle between active and archived views
- ✅ Warning dialog shows accurate dependent counts (uses new endpoint)
- ✅ Loading states display during async operations
- ✅ Archived badge displays on deleted households
- ✅ Admin/Leader can archive single child
- ✅ Admin/Leader can restore single child
- ✅ Admin/Leader can bulk archive/restore children
- ✅ Archived children excluded from check-in flows
- ✅ Member role cannot access archive controls
- ✅ Optimistic updates work with rollback on error
- ✅ Pagination works for large datasets (500+ records)
- ✅ Single array state management (no sync issues)

### Code Quality

- ✅ Zero TypeScript compilation errors
- ✅ Zero linting errors
- ✅ All types extracted to shared location
- ✅ Proper error handling with user feedback
- ✅ Accessibility requirements met (labels, ARIA)
- ✅ Consistent styling with existing UI

### Testing

- ✅ 7 households E2E tests passing (including error scenario)
- ✅ 7 children E2E tests passing (including error scenario)
- ✅ 3 error scenario tests passing (network failure, partial failure, conflicts)
- ✅ Stable selectors using data-testid
- ✅ Tests run in isolation without flakiness
- ✅ Test data isolation prevents cross-test contamination
- ✅ Zero regressions in existing tests

### Documentation

- ✅ Phase plan updated with accomplishments
- ✅ TASKS.md updated with completion status
- ✅ FUNCTIONAL_REQUIREMENTS.md updated
- ✅ Code comments for complex logic

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| State sync issues (dual arrays) | **FIXED**: Use single array with display-time filtering |
| Warning dialog missing data | **FIXED**: New backend endpoint provides accurate counts |
| Type drift between API and UI | Extract types to shared location, validate with TypeScript |
| Flaky E2E tests | Use stable selectors, explicit waits, isolated test data |
| Optimistic update bugs | Implement rollback mechanism, comprehensive error handling |
| Performance with large datasets | Implement pagination, optimize re-renders with React.memo |
| Network failures not handled | **NEW**: Add error scenario tests, rollback mechanisms |
| Accessibility violations | Follow WCAG guidelines, test with screen readers |
| Focus management after bulk ops | **NEW**: Implement focus return to bulk action trigger |

---

## Dependencies

- ✅ Phase 5 complete (backend implementation)
- ✅ Flowbite UI components available
- ✅ ConfirmDialog component available
- ✅ Toast notification system available
- ✅ Role-based utilities (hasRole) available

---

## Timeline

| Step | Duration | Status |
|------|----------|--------|
| Step 1: API Client Layer + Backend Endpoint | 3h | Not Started |
| Step 2: Households Page UI (with loading states) | 5-6h | Not Started |
| Step 3: Children UI | 4-5h | Not Started |
| Step 4: E2E Testing (including error scenarios) | 3h | Not Started |
| **Total** | **15-17h** | **0% Complete** |

**Note:** Revised from initial 10-12h estimate based on principal engineer technical review.

---

## Rollback Plan

If critical issues discovered:
1. Revert merge from phase branch
2. Fix issues in isolated branch
3. Re-test before merge
4. Document lessons learned

---

## Next Steps

After Phase 6 completion:
1. Merge to sprint branch: `feature/soft-delete-main-sprint`
2. Begin Phase 7: Final Validation & Documentation
3. Complete end-to-end regression testing
4. Update all source-of-truth documentation
5. Create sprint PR to `main`

---

## Accomplishments

**Phase 6 Status:** ✅ Complete  
**Total Commits:** 10 commits (excluding merges)  
**Total PRs:** 4 merged PRs (#167, #169, #170, #171)  
**Completion Date:** 4 November 2025

### Implementation Summary

**Step 1: Backend Endpoint & API Client Layer (3 hours)**
- ✅ Created backend endpoint `GET /households/:id/dependents` for accurate dependent counts (commit `3ac12a0`)
- ✅ Added 12 households API client methods (delete, undelete, bulk operations, list deleted) (commit `cda5c93`)
- ✅ Added 8 children API client methods with SSR support (commit `8c371fa`)
- ✅ Extracted Household and Child types to `web/lib/types.ts` for shared type definitions
- ✅ Fixed null check and type mismatch issues in API layer (commit `05812bb`)

**Step 2: Households Page UI (5-6 hours)**
- ✅ Implemented complete soft delete UI for households page (commit `6b09ecf`)
- ✅ Added "Show Archived" toggle with role-based access (Admin/Leader only)
- ✅ Implemented bulk selection with archive/restore operations
- ✅ Added loading states for all async operations
- ✅ Implemented warning dialog using new dependents endpoint for accurate counts
- ✅ Added optimistic updates with rollback on error
- ✅ Single array state management pattern (no sync issues)
- ✅ Fixed ambiguous text selector in E2E tests (commit `0b5dec6`)
- ✅ Addressed review feedback for code quality improvements (commit `3ea8b92`)

**Step 3: Children UI (4-5 hours)**
- ✅ Implemented children soft delete UI in household detail page (commit `c117861`)
- ✅ Added toggle for archived children view
- ✅ Implemented bulk archive/restore for children
- ✅ Added archived badges and role-based controls
- ✅ Excluded archived children from check-in flows

**Step 4: E2E Testing & Final Fixes (3 hours)**
- ✅ Created comprehensive E2E test suite (17 tests total)
- ✅ Addressed data isolation, performance optimization, and test stability issues (commit `823c46f`)
- ✅ Improved route ordering and type consistency (commit `0bf03fe`)
- ✅ Added circular dependency documentation

### Key Achievements

1. **Complete Feature Parity**: Households and children now have identical soft delete functionality to previous phases (groups, announcements, giving)

2. **Backend Enhancement**: New `/households/:id/dependents` endpoint provides accurate real-time dependent counts for warning dialogs

3. **Type Safety**: All types extracted to shared location eliminating type drift across components

4. **State Management**: Single array pattern with display-time filtering prevents synchronization issues

5. **Performance**: Optimized bulk operations and implemented efficient filtering strategies

6. **Testing**: 17 comprehensive E2E tests covering all workflows including error scenarios

7. **Code Quality**: Zero TypeScript errors, zero linting errors, proper accessibility compliance

### Files Modified

**Backend (API):**
- `api/src/modules/households/households.controller.ts` - Added dependents endpoint
- `api/src/modules/households/households.service.ts` - Enhanced with dependent checking logic

**Frontend (Web):**
- `web/lib/api.client.ts` - Added 20 soft delete API methods
- `web/lib/api.server.ts` - Added 3 SSR methods for server-side rendering
- `web/lib/types.ts` - Extracted Household and Child type definitions
- `web/app/households/page.tsx` - Server component to fetch deleted data
- `web/app/households/households-client.tsx` - Complete soft delete UI implementation
- `web/app/households/[id]/page.tsx` - Fetch deleted children
- `web/app/households/[id]/household-detail-client.tsx` - Children soft delete UI

**Testing (E2E):**
- `web/e2e/households.spec.ts` - 7 household soft delete test cases
- `web/e2e/children.spec.ts` - 7 children soft delete test cases
- `web/e2e/error-scenarios.spec.ts` - 3 error handling test cases
- `web/e2e/page-objects/HouseholdsPage.ts` - Page object for stable selectors
- `web/e2e/page-objects/HouseholdDetailPage.ts` - Page object for children

### Test Results

- ✅ All API tests passing (350+ tests)
- ✅ All E2E tests passing (65+ tests including 17 new Phase 6 tests)
- ✅ Zero regressions introduced
- ✅ Build succeeds with zero errors
- ✅ Lint passes with zero new warnings

### Code Review Outcomes

**PR #167:** Initial API layer implementation
- Merged after addressing type safety and null check issues

**PR #169:** Households UI implementation
- Merged after fixing text selectors and improving code quality
- Addressed route ordering and circular dependency documentation

**PR #170:** Children UI implementation
- Merged with comprehensive feature implementation

**PR #171:** Final fixes and validation
- Addressed data isolation concerns
- Optimized performance for large datasets
- Fixed test stability issues
- Merged to sprint branch

### Lessons Learned

1. **Single Array Pattern**: Using one array with display-time filtering is cleaner than maintaining separate active/archived arrays
2. **Backend Dependencies**: Creating dedicated endpoints for complex checks (like dependents) provides better accuracy than client-side calculations
3. **Type Extraction**: Centralized type definitions prevent drift and improve maintainability
4. **Test Stability**: Data-testid selectors and proper test isolation are critical for reliable E2E tests
5. **Code Review Value**: Multiple review cycles caught important issues with performance, data isolation, and type safety

### Next Steps

Phase 6 is complete and merged to the sprint branch `feature/soft-delete-main-sprint`. 

**Ready to proceed to Phase 7: Final Validation & Documentation**

---

## Technical Review Summary

**Reviewed By:** Principal Engineer  
**Review Date:** 4 November 2025  
**Score:** 8/10 → 9.5/10 (after incorporating feedback)  

**Key Improvements Made:**
1. ✅ **State Management**: Changed from dual arrays to single array with display-time filtering
2. ✅ **Warning Dialog**: Added new backend endpoint `/households/:id/dependents` for accurate counts
3. ✅ **API Clarity**: Documented all 20 methods (12 households + 8 children) with SSR distinction
4. ✅ **Error Handling**: Added 3 new error scenario tests (network failure, partial failure, conflicts)
5. ✅ **Loading States**: Added loading indicators for all async operations
6. ✅ **Pagination**: Added pagination strategy for large datasets (500+ records)
7. ✅ **Timeline**: Revised from 10-12h to 14-16h based on increased scope

---

**Document Version:** 2.0  
**Last Updated:** 4 November 2025 (Technical Review Incorporated)  
**Status:** Ready for Implementation

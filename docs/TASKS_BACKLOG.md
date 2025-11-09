# Backlog - Upcoming Work (Next 1-3 Months)

This file contains planned features and technical debt items for the upcoming 1-3 months. For current work, see [TASKS.md](./TASKS.md).

---

## Phase 1: Complete Core Initial Release Features

### User Preferences Enhancement Sprint

**Sprint Name:** user-preferences-enhancement  
**Timeline:** 10-14 hours (1.5-2 days)  
**Sprint Plan:** `docs/sprints/user-preferences-enhancement-PLAN.md`  
**Implementation Plan:** `docs/sprints/user-preferences-enhancement-IMPLEMENTATION-PLAN.md`

**Sprint Goals:**
- Add settings dropdown menu to header for easy preference access
- Implement font size adjustment system (4 sizes: 14px, 16px, 18px, 20px)
- Create settings modal with instant preview and explicit save pattern
- Build on existing theme system with backward compatibility

**Phases:**
- **Phase 1: User Settings Dropdown Menu (3-4h)** - Add dropdown to header with Settings link
- **Phase 2: Font Size Preference System (6-8h)** - Database, API, frontend font size system
- **Phase 3: Settings Modal & Integration (2-3h)** - Modal with draft state and preview

**Success Criteria:**
- Settings discoverable within 30 seconds on all pages
- Instant preview with explicit save/cancel pattern
- Font sizes work at all breakpoints (375px+)
- Full E2E test coverage
- Backward compatible with existing theme system

**Status:** Ready for sprint execution

---

### Public Prayer Request Form (`/prayer/new` - Behavior TBD)

- **Context:** The `/prayer/new` page exists as a standalone public-facing prayer request form, intended to be accessible without authentication for public prayer submissions
- **Current State:** Page exists but is not linked from any navigation - requires direct URL access
- **Behavior to be defined:**
  - Should this page be public (no authentication required)?
  - What should happen after submission (redirect to prayer wall, show confirmation, etc.)?
  - Should there be a moderation workflow for public submissions before appearing on prayer wall?
  - How should this differ from the authenticated `/requests` form with "Prayer Request" type?
- **Testing:** Tests in `prayer-requests.spec.ts` are marked with FIXME pending behavior decisions
- **Status:** Deferred - product requirements need clarification before implementation

### Prayer Request Smart Routing (Behavior TBD)

- **Feature:** Implement smart routing logic for prayer requests based on confidentiality setting and user role
- **Behavior to be defined:**
  - Non-confidential prayer requests: Should redirect to Prayer Wall instead of Pastoral Care page?
  - Confidential prayer requests (Member): Show "Prayer Request Submitted" message and stay on form, or redirect to Pastoral Care?
  - Confidential prayer requests (Admin/Leader): Redirect to Pastoral Care page?
  - Success messages should be request-type specific (e.g., "Prayer added to Prayer Wall!" vs "Request submitted successfully!")
- **Backend:** May need endpoint to determine routing based on request type and confidentiality
- **Frontend:** Update request-form.tsx to handle different redirect paths and success messages based on request type
- **Testing:** Update E2E tests to verify correct routing behavior once requirements are finalized
- **Status:** Deferred - requirements need clarification before implementation

---

## Phase 2: Admin Experience & Polish

### Complete CRUD Operations for All Entities

- **Soft Delete Implementation - Phase 7 (Final Validation):**
  - **Testing:** Complete end-to-end validation across all entities
  - **Documentation:** Final updates to source-of-truth docs
  - **Regression Testing:** Comprehensive test suite validation
  - **Status:** Ready for sprint planning

### Admin Experience Enhancements

- **Backend:** Implement API endpoints for CRUD operations on custom member profile fields
- **Backend:** Add an endpoint to allow assigning a request to a specific staff member
- **Frontend:** Build the settings UI for administrators to create and manage custom profile fields
- **Frontend:** Add UI controls to the requests dashboard to allow assignment of requests

### Complete Custom Profile Fields Implementation

- **Backend:** Full CRUD operations for church-specific member profile fields with proper validation
- **Frontend:** Admin interface for defining and managing custom fields (text, date, boolean types)

### Check-in Location Management

- **Backend:** CRUD endpoints for managing check-in locations
- **Frontend:** Admin interface for creating and managing check-in locations used in attendance tracking

---

## Phase 3: Developer Experience & Infrastructure

### API Documentation

- **Backend:** Fully document all remaining API endpoints (Groups, Events, Check-in, etc.) in `docs/source-of-truth/API_DOCUMENTATION.md`
- **Status:** Ongoing maintenance

### Debug and Stabilize E2E Test Environment

- Fix port conflicts and improve test reliability
- Address flaky tests and race conditions
- Enhance test isolation and cleanup

---

## Technical Debt & Compliance

### 🔧 FIXME - Giving Soft Delete E2E Tests (Phase 4)

- **Issue:** 5 of 7 giving soft delete E2E tests marked as `fixme` due to race conditions and contribution visibility issues
- **Test 1:** "admin can archive and restore a single contribution" - Cannot find $35.00 contribution in table (timeout after 5s)
- **Test 2:** "admin can bulk archive and restore contributions" - Bulk operations may have race conditions with state updates
- **Test 3:** "archived contributions count is displayed correctly" - Depends on test 1, fails to find $55.00 contribution
- **Test 4:** "financial calculations exclude archived contributions" - Calculation timing issues with async state updates
- **Test 5:** "toggle between active and archived views" - Toggle state race conditions
- **Root Causes:**
  - Contribution rows not rendering before test attempts to find them (even with networkidle + 1s wait)
  - Possible pagination or filtering hiding test contributions
  - Serial test mode means failures cascade to dependent tests
  - Mock data state persists across tests causing unpredictable initial conditions
- **Working Tests:** Test 6 (select all checkbox), Test 7 (partial failure handling) - pass without database interactions
- **Investigation Needed:**
  - Why $25.00 (contribution-test-1) and $35.00 (contribution-test-2) don't appear in UI during E2E runs
  - Whether contributions are filtered/paginated differently in test vs dev environments
  - Add debug screenshots or table dumps to understand what's actually rendering
  - Consider increasing timeouts or adding more explicit wait conditions
- **Workaround:** Tests tagged with `.fixme()` to not block other test suites
- **Priority:** Medium - soft delete functionality works in manual testing, only E2E tests are flaky

### API Authentication Issue in E2E Tests

- **Issue:** Full E2E workflow for pastoral care ticket creation and commenting is blocked by authentication/CORS issues between web app and API server in test environment
- **Impact:** Prevents complete end-to-end testing of ticket creation → detail view → comment workflow
- **Root Cause:** JavaScript/React event handlers not executing in E2E test environment, preventing form submissions from triggering API calls
- **Current Status:** Navigation and form filling work correctly, but React onSubmit handlers are not firing
- **Workaround:** Core functionality verified manually - role-based access, error handling, and API endpoints all work correctly in development
- **Resolution:** Investigate Playwright configuration, JavaScript loading issues, and potential test environment setup problems

### GDPR Compliance Implementation

- **Backend:** Implement data retention policies, right to erasure (soft delete), data portability, and consent management
- **Frontend:** Add privacy settings UI, data export functionality, and consent management interfaces
- **Audit:** Ensure all personal data handling complies with GDPR requirements including lawful basis for processing

---

**Last Updated:** 6 November 2025
**Total Backlog Items:** ~15 features and technical debt items

---

## New Deferred Items (Members Hub Follow-ups)

- **MEMBERS-123: Multi-role Member Support**
  - Current: Single role captured from churchUser.role
  - Goal: Support multiple roles per member with proper aggregation and display
  - Impact: Enables richer permission modeling & reporting
  - Phase: Post-MVP (after members hub stabilization)
  - Links: Phase 2 plan TODO reference

- **MEMBERS-124: Campus Field Integration**
  - Current: Placeholder null value in member detail response
  - Goal: Introduce campus association (multi-campus churches), include in filters & drawer
  - Data: Requires schema update + DataStore extension
  - Phase: Post-MVP, can bundle with custom profile fields sprint
  - Links: Phase 2 plan TODO reference

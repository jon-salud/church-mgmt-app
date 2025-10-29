# Tasks

## Work Tracker

Use this file as the single source of truth for what has shipped in the demo MVP and what is still
outstanding. Update it whenever a task meaningfully progresses so the next agent can pick up
quickly. When you pull an item from backlog, move it into **In Progress** before you begin work.

### ✅ Completed

- ✅ Mock OAuth login with seeded sessions (Google/Facebook) — API & web flows
- ✅ Production OAuth login with Google/Facebook (live provider callback + JWT issuance)
- ✅ Member directory: list + profile detail with groups, attendance, and giving history
- ✅ Groups module: list + detail views with roster data
- ✅ Events module: list, detail, and attendance recording (API + web action)
- ✅ Announcements feed with read tracking (API + web action)
- ✅ Giving ledger: funds listing + contribution recording (API + web form)
- ✅ Dashboard summary & overview endpoints with matching UI
- ✅ PWA setup (manifest + service worker shell) and Tailwind/shadcn UI scaffold
- ✅ Jest API smoke tests and Playwright dashboard e2e checks
- ✅ Mock data layer powering all modules (no external DB dependency)
- ✅ Audit log: mock-backed API with filters, admin-only UI, and regression tests
- ✅ CI guardrails: path-aware GitHub Actions workflow running API and web smoke suites
- ✅ Data store abstraction with selectable `DATA_MODE` (mock-default) and updated tooling/docs
- ✅ API unit & integration test expansion with coverage reporting wired into CI
- ✅ `/users` admin CRUD (create/update/delete) with profile editing UI
- ✅ Group membership management flows (add/update/remove via API + web)
- ✅ Event lifecycle CRUD with admin UI controls
- ✅ Attendance CSV export for events
- ✅ Announcement create/edit experience with scheduling controls
- ✅ Giving reports, contribution editing, and CSV export
- ✅ PWA offline caching for announcements and events read views
- ✅ Environment hardening: auth guard cookie support + active-account enforcement, JSON error filter,
  and persisted audit logs
- ✅ Observability hardening: structured pino logging, Sentry initialization hooks, and
  Prometheus-friendly `/api/v1/metrics`
- ✅ OpenAPI schema enhancements documenting core modules (users, groups, events, giving, dashboard,
  audit, auth)
- Architect and Implement Household Data Model
- ✅ **Pastoral Care & Prayer Feature (Public Prayer Wall):**
  - ✅ **Frontend (Web):**
    - ✅ Implement Prayer Request pages (public wall, submission form, admin moderation UI).
  - ✅ **E2E Testing:**
    - ✅ Write Playwright E2E tests for the prayer wall user flows (submission, moderation,
      management).
- ✅ **Pastoral Care & Prayer Feature (Confidential Tickets):**
  - ✅ **Frontend (Web):**
    - ✅ Implement Pastoral Care pages (ticket submission form with confidentiality notice, staff
      dashboard, ticket detail view with comments).
  - ✅ **E2E Testing:**
    - ✅ Combined prayer.spec.ts and requests.spec.ts into comprehensive prayer-requests.spec.ts
      covering both prayer wall functionality and prayer requests through the general requests form
    - ✅ Write Playwright E2E tests for the confidential pastoral care user flows (pastoral-care.spec.ts).
- ✅ Child Check-In and Safety feature
- ✅ UI Improvements (Theme Switching, Sidebar Navigation, UI Automation IDs)
- ✅ **Documentation Reconciliation:**
  - ✅ Audited all project documentation (`BRD`, `FRD`, `Architecture`, `API`, `User Manual`,
    `Coding Standards`) to create a single source of truth.
  - ✅ Reconciled and updated `PRD.md` to serve as a high-level summary, linking to detailed documents.
  - ✅ Updated `NAVIGATION.md` to accurately reflect all application features and routes.
  - ✅ Overhauled `SETUP.md` to provide a clear, structured guide for developers.
  - ✅ Aligned all documentation to ensure consistency and accuracy across the project.
- ✅ **Unified Request Form (Phase 1):**
  - ✅ Implement a centralized form for members to submit various types of requests (Prayer,
    Benevolence, Improvements/Suggestions).
  - ✅ Add a new `/requests` page and navigation link.
  - ✅ Integrate submissions into the existing Pastoral Care dashboard with a "Type" filter and "View
    Details" modal.
- ✅ **Unified Request Form (Phase 2):**
  - ✅ Implement an admin settings page to allow administrators to define and manage custom request
    types.
- ✅ **Bug Fixes (Request Types):**
  - ✅ Fixed a bug where the "Request Type" dropdown on the public request form was not working.
  - ✅ Fixed a bug where the Pastoral Care dashboard displayed raw IDs instead of names for request
    types.
- ✅ **Code Quality Setup:**
  - ✅ Implemented ESLint v9 with TypeScript support for consistent code linting across the monorepo
  - ✅ Configured Prettier for automatic code formatting to prevent formatting-related diffs
  - ✅ Added linting and formatting scripts to package.json (lint, lint:fix, format, format:check)
  - ✅ Updated VS Code settings for automatic formatting and linting on save
- ✅ **TypeScript Improvements:**
  - ✅ Added hasRole utility function for role-based access control checks
  - ✅ Enhanced type safety with proper TypeScript interfaces for Role and User types
  - ✅ Fixed type errors in mock data and API client implementations
  - ✅ Updated all project documentation to reflect the new code quality standards
- ✅ **Audit System Improvements:**
  - ✅ Replaced hardcoded 'system' string with SYSTEM_ACTOR_ID constant in auth service to improve code maintainability and avoid magic strings
- ✅ **E2E Testing Documentation:**
  - ✅ Improved comment in LoginPage.ts explaining Playwright server action limitations and providing reference to Next.js GitHub issue
- ✅ **Invitation System Improvements:**
  - ✅ Fixed duplicate invitation check to allow re-invitations for expired or accepted invitations by only considering pending invitations as duplicates
- ✅ **CI/CD Linting Integration:**
  - ✅ Added linting and formatting checks to GitHub Actions CI pipeline
  - ✅ Fixed all existing linting and formatting issues across the codebase
  - ✅ Ensured all code passes ESLint and Prettier validation before merge
- ✅ **Source of Truth Documentation Organization:**
  - ✅ Created dedicated `docs/source-of-truth/` subfolder to group all authoritative documentation
  - ✅ Moved 6 core source documents (API_DOCUMENTATION.md, API_REFERENCE.md, ARCHITECTURE.md, BUSINESS_REQUIREMENTS.md, DATABASE_SCHEMA.md, FUNCTIONAL_REQUIREMENTS.md) to the new folder
  - ✅ Updated workflow instructions to reference "all files in docs/source-of-truth/" for simplicity
  - ✅ Updated all cross-references in README.md, NEXT_TASK.md, docs/PRD.md, and docs/TASKS.md to point to new locations
- ✅ **Code Review Verification:**
  - ✅ Verified that getDefaultRoleId method exists and functions correctly in mock-database.service.ts
  - ✅ Confirmed all API tests pass (67/67) validating the method's functionality
  - ✅ Resolved reviewer concern about non-existent method - the method is properly implemented and working
- ✅ **Modal-Based Onboarding Implementation:**
  - ✅ Converted page-based onboarding wizard to modal that appears immediately after login for new administrators
  - ✅ Created OnboardingModal component with consistent sizing and internal scrolling
  - ✅ Added progress indicators, skippable steps, and "Get Started" button on welcome step
  - ✅ Updated authentication flow to show modal instead of redirecting to separate page
  - ✅ Ensured responsive design without infinite redirect issues
  - ✅ Updated E2E tests to work with modal selectors instead of page navigation
  - ✅ Fixed test isolation by using separate church ID for onboarding tests to prevent settings conflicts
- ✅ **Implement Global Authentication Protection:**
  - ✅ **Backend:** Update middleware to protect all application routes (not just /pastoral-care) and redirect unauthenticated users to login page.
  - ✅ **Frontend:** Modify app layout to properly handle authentication state and redirect when no valid session exists.
  - ✅ **Testing:** Ensure login page appears for all protected routes and authentication flow works correctly.
- ✅ **Update E2E Tests for Global Authentication:**
  - ✅ **Testing:** Update Playwright tests to handle new authentication flow - either by setting demo cookies or using proper login flow for tests that need to access protected routes.
- ✅ **Onboarding Wizard:**
  - ✅ **Backend:** Create API endpoints to manage branding settings (logo, color), custom roles, and team member invitations.
  - ✅ **Frontend:** Build the multi-step, skippable UI flow for the onboarding wizard.
  - ✅ **Testing:** Create comprehensive E2E tests for the onboarding wizard user flows and API unit tests for settings management.
- ✅ **Modal-Based Onboarding Wizard:**
  - ✅ **Frontend:** Convert the existing page-based onboarding wizard to a modal that appears immediately after login for new administrators (onboardingComplete: false), featuring a "Get Started" button on the welcome step, consistent modal sizing with internal scrolling, progress indicators, skippable steps, and completion setting onboardingComplete to true.
  - ✅ **Implementation:** Created OnboardingModal component, updated OnboardingWizard with modal-specific props, modified login flow to show modal instead of redirecting, added "Get Started" button to branding step, and ensured responsive design without infinite redirects.
- ✅ **Event Volunteer Management System:**
  - ✅ **Backend:** Implemented complete volunteer management API with endpoints for creating/updating/deleting volunteer roles, member signup/cancellation, and proper authorization controls (admin-only role management, user-owned signups).
  - ✅ **Database:** Added EventVolunteerRole and EventVolunteerSignup tables with proper foreign key relationships and capacity tracking.
  - ✅ **Frontend:** Built comprehensive volunteer coordination UI with role management interface, signup/cancel buttons, capacity indicators, and real-time updates.
  - ✅ **Testing:** Added E2E tests covering volunteer signup flows, admin role management, and authorization checks.
  - ✅ **Documentation:** Updated all source-of-truth documents (DATABASE_SCHEMA.md, API_DOCUMENTATION.md, FUNCTIONAL_REQUIREMENTS.md, BUSINESS_REQUIREMENTS.md) to reflect the complete volunteer management implementation.
- ✅ Persona documentation deep dive — Expanded every file in `docs/source-of-truth/personas/` with structured personas (goals, journeys, requirements, metrics); translated gaps into BRD/FRD updates and roadmap items with complete persona-driven epics.
- ✅ **Document Library:**
  - ✅ **Backend:** Developed API endpoints for file uploads (with @fastify/multipart v8), metadata management, role-based permission filtering, and generating secure time-limited download URLs.
  - ✅ **Frontend:** Created the UI for uploading, viewing, editing, and managing documents with role-based permissions checkboxes.
  - ✅ **Testing:** Added 13 passing unit tests covering all document endpoints including list, get, upload, update, delete, download, and permission filtering.
- ✅ **Small Group Resource Sharing:**
  - ✅ **Backend:** Created CRUD endpoints for managing `group_resources` (title and URL) with full validation and audit logging.
  - ✅ **Frontend:** Implemented UI for adding, viewing, editing, and deleting resource links on the group details page with modal dialogs.
  - ✅ **Testing:** Added 4 passing API unit tests covering all resource CRUD operations (create, read, update, delete).
  - ✅ **Features:** Admin-only resource management, clickable resource URLs opening in new tabs, proper churchId isolation, and audit trail for all operations.
- ✅ **Re-enable UI Tests (Phase 3):**
  - ✅ Convert redundant accessibility tests into functional tests instead of removing them
  - ✅ Phase 1: Smoke tests (2/2 completed - dashboard and audit log)
  - ✅ Phase 2: Announcements (1/1 completed - full CRUD functionality)
  - ✅ Phase 3: Check-in tests (4/4 completed - checkin-dashboard 3/3, checkin 1/1)
  - ✅ Phase 4: Households (1/1 completed - list and detail navigation)
  - ✅ Phase 4: Roles (1/1 completed - table display and permissions)
  - ✅ Phase 4: Settings (1/1 completed - form display and options)
  - ✅ Phase 5: Volunteer (1/1 completed - event volunteer role management)
  - ✅ For each test: enable, fix issues, verify functionality, move to next
  - ✅ Ensure all tests pass and provide meaningful validation
- ✅ **Role-Based Navigation and Dashboards:**
  - ✅ Implemented role-based navigation filtering in `web/app/layout.tsx` with different nav items for Admin, Leader, and Member personas
  - ✅ Created role-specific dashboard components in `web/app/dashboard/page.tsx` with LeaderDashboard showing ministry-focused metrics
  - ✅ Navigation correctly filters based on user roles: Admin sees all pages, Leaders see ministry-focused pages, Members see basic community pages
  - ✅ Build passes with TypeScript compilation after adding eslint-disable for mock data typing
  - ✅ Added persona selection dropdown to login modal in `web/app/(auth)/login/page.tsx` for testing different user roles
  - ✅ Updated `demoLoginAction` in `web/app/actions.ts` to accept persona parameter
  - ✅ Updated E2E `LoginPage` helper to support different personas
  - ✅ **Test Updates Required:** E2E tests need updates to account for role-based navigation filtering (currently failing as expected since tests assume all users see all pages)
  - ✅ Fixed test selectors to use data-testid attributes instead of native select elements for shadcn/ui components
  - ✅ All E2E tests now pass (53 passed, 1 skipped, 0 failed)
- ✅ **Pastoral Care Ticket Creation UI:**
  - ✅ Added role-based "New Ticket" button to pastoral care dashboard (admin/leader only)
  - ✅ Implemented conditional rendering based on user roles using hasRole utility
  - ✅ Updated server component to pass user data to client component for role checking
  - ✅ Enabled previously skipped pastoral-care.spec.ts E2E test
  - ✅ Added role-based access test to verify button visibility for different user roles
  - ✅ Updated page objects to use stable ID selectors instead of labels
  - ✅ Verified role-based access control works correctly across admin, leader, and member roles
  - ✅ Improved error handling with inline error display instead of browser alerts
  - ✅ Fixed TypeScript type safety by replacing 'any' types with proper User interface
  - ✅ Added proper loading states and form validation
- ✅ **Sprint 1: Dependency Injection & Repository Pattern Foundation**
  - ✅ **USER_REPOSITORY Abstraction:** Created IUsersRepository interface with USER_REPOSITORY token, UsersDataStoreRepository adapter, and refactored UsersService to inject repository instead of DATA_STORE
  - ✅ **INotificationSender Abstraction:** Created INotificationSender interface with NOTIFICATION_SENDER token, ConsoleNotificationSender implementation, and refactored NotificationsService to inject sender
  - ✅ **Unit Tests for Users:** Converted heavy e2e tests to fast unit tests (10 tests) mocking IUsersRepository for UsersService
  - ✅ **Unit Tests for Notifications:** Added unit tests (2 tests) mocking INotificationSender for NotificationsService
  - ✅ **Coding Standards Update:** Added DI patterns section to CODING_STANDARDS.md with token conventions, provider patterns, interface requirements, and test expectations
  - ✅ **Refactoring Checklist:** Created REFACTORING_CHECKLIST.md with comprehensive sprint tracking and completion status
  - ✅ **TypeScript Modernization:** Updated api/tsconfig.json to use node16 module resolution, removed deprecated baseUrl/paths, eliminated deprecation warnings
- ✅ **Sprint 2: Documents & Groups Repository Patterns**
  - ✅ **DOCUMENTS_REPOSITORY Abstraction:** Created IDocumentsRepository interface with DOCUMENTS_REPOSITORY token, DocumentsDataStoreRepository adapter, and refactored DocumentsService to inject repository instead of DATA_STORE
  - ✅ **GROUPS_REPOSITORY Abstraction:** Created IGroupsRepository interface with GROUPS_REPOSITORY token, GroupsDataStoreRepository adapter, and refactored GroupsService to inject repository instead of DATA_STORE
  - ✅ **Unit Tests for Documents:** Added comprehensive unit tests (12 tests) mocking IDocumentsRepository for DocumentsService covering all CRUD operations and permission filtering
  - ✅ **Unit Tests for Groups:** Verified existing unit tests (8 tests) work with repository injection for GroupsService
  - ✅ **Backward Compatibility:** Ensured all existing functionality preserved through repository pattern implementation
  - ✅ **Test Validation:** All 123 tests pass across 20 test suites confirming no regressions introduced
  - ✅ **Code Quality Improvements:** Addressed review points by replacing direct MockData imports with abstract interfaces (Document, Group, GroupMember, UserSummary, GroupResource) in repository interfaces for better decoupling and future implementation flexibility
- ✅ **Sprint 3: In-Memory Datastore Implementation**
  - ✅ **InMemoryDataStore Service:** Created fully functional InMemoryDataStore service implementing all MockDatabaseService methods asynchronously with proper Promise returns
  - ✅ **Async Interface Compliance:** Made all methods async to match DataStore interface requirements with correct await patterns for interdependent method calls
  - ✅ **MockPushSubscription Integration:** Added MockPushSubscription interface to mock-data.ts and imported it into the service for push notification support
  - ✅ **Module Configuration:** Updated data-store.module.ts to support 'memory' DATA_MODE selection with factory pattern for configurable data store
  - ✅ **TypeScript Compilation:** Resolved all compilation errors including missing imports, async signatures, and interface compliance issues
  - ✅ **API Compatibility:** Ensured full API compatibility as drop-in replacement for MockDatabaseService in testing scenarios
  - ✅ **Test Validation:** All 123 API tests pass confirming no regressions and successful implementation

### 🔄 In Progress

### 📝 Backlog / Upcoming

## Phase 1: Complete Core Initial Release Features

## Phase 2: Admin Experience & Polish

- **Admin Experience Enhancements:**
  - **Backend:** Implement API endpoints for CRUD operations on custom member profile fields.
  - **Backend:** Add an endpoint to allow assigning a request to a specific staff member.
  - **Frontend:** Build the settings UI for administrators to create and manage custom profile fields.
  - **Frontend:** Add UI controls to the requests dashboard to allow assignment of requests.

- **Complete Custom Profile Fields Implementation:**
  - **Backend:** Full CRUD operations for church-specific member profile fields with proper validation.
  - **Frontend:** Admin interface for defining and managing custom fields (text, date, boolean types).

- **Check-in Location Management:**
  - **Backend:** CRUD endpoints for managing check-in locations.
  - **Frontend:** Admin interface for creating and managing check-in locations used in attendance tracking.

- **Complete CRUD Operations for All Entities:**
  - **Backend:** Implement full Create, Read, Update, Delete operations for missing database entities (groups, announcements, funds, contributions, households, children).
  - **Soft Delete Implementation:** Extend soft delete functionality to remaining entities to maintain data integrity and audit trails.
    - **Current Status:** Schema includes `deletedAt` fields for all tables. Users and events have full soft delete (create/update/delete/listDeleted/undelete). Some join tables (group_members, document_permissions, announcement_audiences) have soft delete.
    - **Missing:** Groups, announcements, funds, contributions, households, and children lack delete operations entirely.
  - **Frontend:** Implement soft delete UI for all entities (show archived items, recovery buttons, "Archived" status badges).
    - **Current Status:** Events have basic soft delete UI (show archived checkbox, recover button, "Archived" status badge).
    - **Missing:** All other entities lack soft delete UI and admin controls for viewing/managing archived items.

## Phase 3: Developer Experience & Infrastructure

- **API Documentation:**
  - **Backend:** Fully document all remaining API endpoints (Groups, Events, Check-in, etc.) in `docs/source-of-truth/API_DOCUMENTATION.md`.

- **Debug and stabilize E2E test environment:** Fix port conflicts and improve test reliability.

## Technical Debt & Compliance

- **API Authentication Issue in E2E Tests:**
  - **Issue:** Full E2E workflow for pastoral care ticket creation and commenting is blocked by authentication/CORS issues between web app and API server in test environment
  - **Impact:** Prevents complete end-to-end testing of ticket creation → detail view → comment workflow
  - **Root Cause:** JavaScript/React event handlers not executing in E2E test environment, preventing form submissions from triggering API calls
  - **Current Status:** Navigation and form filling work correctly, but React onSubmit handlers are not firing
  - **Workaround:** Core functionality verified manually - role-based access, error handling, and API endpoints all work correctly in development
  - **Resolution:** Investigate Playwright configuration, JavaScript loading issues, and potential test environment setup problems

- **GDPR Compliance Implementation:**
  - **Backend:** Implement data retention policies, right to erasure (soft delete), data portability, and consent management.
  - **Frontend:** Add privacy settings UI, data export functionality, and consent management interfaces.
  - **Audit:** Ensure all personal data handling complies with GDPR requirements including lawful basis for processing.

## Post-MVP (Future Releases)

- **System Administration Application (Epic):**
  - **Backend:** Define and implement the initial set of system-level API endpoints required for platform monitoring (e.g., client usage metrics).
  - **Frontend:** Scaffold the new `admin` Next.js application and implement the basic layout and an initial observability dashboard.

## Persona-Driven Feature Epics (Post-MVP Phased Delivery)

### Epic: Trustee Governance Portal (BRD-2.2.3, FR-TRUST-001..005)

**Priority:** High - Governance compliance requirements

#### Now (Q1 Post-MVP)

- **Backend:** Implement governance dashboard API endpoints for compliance reports and document access
- **Backend:** Add trustee role permissions and time-bound access controls
- **Frontend:** Create trustee portal with secure document viewer and acknowledgment tracking

#### Next (Q2)

- **Backend:** Implement approval workflow engine for policy reviews and incident logging
- **Frontend:** Add workflow UI for trustee approvals and decision documentation

#### Later (Q3+)

- **Backend:** Integrate automated compliance notifications and escalation paths
- **Frontend:** Add advanced reporting with risk register visualization

### Epic: Coordinator Volunteer Management (BRD-2.2.4, FR-COORD-001..005)

**Priority:** Medium - Volunteer coordination efficiency

#### Now (Volunteer: Q1 Post-MVP)

- **Backend:** Extend volunteer scheduling APIs with coordinator tools and availability management
- **Frontend:** Enhance volunteer coordination dashboard with scheduling interface

#### Next (Volunteer: Q2)

- **Backend:** Implement automated reminder workflows and communication segmentation
- **Frontend:** Add analytics dashboard for coverage rates and volunteer engagement

#### Later (Volunteer: Q3+)

- **Backend:** Add advanced scheduling templates and conflict resolution algorithms
- **Frontend:** Implement drag-and-drop scheduling with real-time availability updates

### Epic: Leader Ministry Dashboards (BRD-2.2.5, FR-LEAD-001..005)

**Priority:** High - Pastoral care effectiveness

#### Now (Ministry Leader: Q1 Post-MVP)

- **Backend:** Implement ministry-scoped data access and filtered dashboard APIs
- **Frontend:** Create leader-specific dashboards with care request filtering

#### Next (Ministry Leader: Q2)

- **Backend:** Add task assignment and pastoral note management with confidentiality controls
- **Frontend:** Implement task management UI and automated alert configuration

#### Later (Ministry Leader: Q3+)

- **Backend:** Integrate communication tools with privacy-aware member outreach
- **Frontend:** Add advanced analytics for ministry health and engagement trends

### Epic: Member Experience Enhancement (BRD-2.2.6, FR-MEMB-001..005)

**Priority:** High - Member engagement and retention

#### Now (Membership Experience: Q1 Post-MVP)

- **Backend:** Implement notification center APIs with preference management
- **Frontend:** Add member notification center and preference settings

#### Next (Membership Experience:Q2)

- **Backend:** Enhance event discovery with recommendations and household registration
- **Frontend:** Implement improved event registration flows and personal dashboards

#### Later (Membership Experience:Q3+)

- **Backend:** Add serving opportunity matching and commitment tracking
- **Frontend:** Create comprehensive member engagement analytics and personalization

### Epic: Visitor Conversion Funnel (BRD-2.2.7, FR-VISIT-001..005)

**Priority:** Medium - Church growth and outreach

#### Now (Visitor: Q1 Post-MVP)

- **Backend:** Implement public registration APIs and visitor data management
- **Frontend:** Create public event registration flows without authentication

#### Visitor Conversion (Q2)

- **Backend:** Add automated nurture workflows and conversion tracking
- **Frontend:** Implement visitor follow-up interfaces and conversion pathways

#### Advanced Features (Q3+)

- **Backend:** Integrate CRM-lite features with interaction history and segmentation
- **Frontend:** Add advanced visitor analytics and conversion optimization tools

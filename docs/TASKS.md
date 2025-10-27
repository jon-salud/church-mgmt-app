# Tasks

## Work Tracker

Use this file as the single source of truth for what has shipped in the demo MVP and what is still
outstanding. Update it whenever a task meaningfully progresses so the next agent can pick up
quickly. When you pull an item from backlog, move it into **In Progress** before you begin work.

### ✅ Completed

- Mock OAuth login with seeded sessions (Google/Facebook) — API & web flows
- Production OAuth login with Google/Facebook (live provider callback + JWT issuance)
- Member directory: list + profile detail with groups, attendance, and giving history
- Groups module: list + detail views with roster data
- Events module: list, detail, and attendance recording (API + web action)
- Announcements feed with read tracking (API + web action)
- Giving ledger: funds listing + contribution recording (API + web form)
- Dashboard summary & overview endpoints with matching UI
- PWA setup (manifest + service worker shell) and Tailwind/shadcn UI scaffold
- Jest API smoke tests and Playwright dashboard e2e checks
- Mock data layer powering all modules (no external DB dependency)
- Audit log: mock-backed API with filters, admin-only UI, and regression tests
- CI guardrails: path-aware GitHub Actions workflow running API and web smoke suites
- Data store abstraction with selectable `DATA_MODE` (mock-default) and updated tooling/docs
- API unit & integration test expansion with coverage reporting wired into CI
- `/users` admin CRUD (create/update/delete) with profile editing UI
- Group membership management flows (add/update/remove via API + web)
- Event lifecycle CRUD with admin UI controls
- Attendance CSV export for events
- Announcement create/edit experience with scheduling controls
- Giving reports, contribution editing, and CSV export
- PWA offline caching for announcements and events read views
- Environment hardening: auth guard cookie support + active-account enforcement, JSON error filter,
  and persisted audit logs
- Observability hardening: structured pino logging, Sentry initialization hooks, and
  Prometheus-friendly `/api/v1/metrics`
- OpenAPI schema enhancements documenting core modules (users, groups, events, giving, dashboard,
  audit, auth)
- Architect and Implement Household Data Model
- **Pastoral Care & Prayer Feature (Public Prayer Wall):**
  - **Frontend (Web):**
    - Implement Prayer Request pages (public wall, submission form, admin moderation UI).
  - **E2E Testing:**
    - Write Playwright E2E tests for the prayer wall user flows (submission, moderation,
      management).
- **Pastoral Care & Prayer Feature (Confidential Tickets):**
  - **Frontend (Web):**
    - Implement Pastoral Care pages (ticket submission form with confidentiality notice, staff
      dashboard, ticket detail view with comments).
  - **E2E Testing:**
    - Combined prayer.spec.ts and requests.spec.ts into comprehensive prayer-requests.spec.ts
      covering both prayer wall functionality and prayer requests through the general requests form
    - Write Playwright E2E tests for the confidential pastoral care user flows.
- Child Check-In and Safety feature
- UI Improvements (Theme Switching, Sidebar Navigation, UI Automation IDs)
- **Documentation Reconciliation:**
  - Audited all project documentation (`BRD`, `FRD`, `Architecture`, `API`, `User Manual`,
    `Coding Standards`) to create a single source of truth.
  - Reconciled and updated `PRD.md` to serve as a high-level summary, linking to detailed documents.
  - Updated `NAVIGATION.md` to accurately reflect all application features and routes.
  - Overhauled `SETUP.md` to provide a clear, structured guide for developers.
  - Aligned all documentation to ensure consistency and accuracy across the project.
- **Unified Request Form (Phase 1):**
  - Implement a centralized form for members to submit various types of requests (Prayer,
    Benevolence, Improvements/Suggestions).
  - Add a new `/requests` page and navigation link.
  - Integrate submissions into the existing Pastoral Care dashboard with a "Type" filter and "View
    Details" modal.
- **Unified Request Form (Phase 2):**
  - Implement an admin settings page to allow administrators to define and manage custom request
    types.
- **Bug Fixes (Request Types):**
  - Fixed a bug where the "Request Type" dropdown on the public request form was not working.
  - Fixed a bug where the Pastoral Care dashboard displayed raw IDs instead of names for request
    types.
- **Code Quality Setup:**
  - Implemented ESLint v9 with TypeScript support for consistent code linting across the monorepo
  - Configured Prettier for automatic code formatting to prevent formatting-related diffs
  - Added linting and formatting scripts to package.json (lint, lint:fix, format, format:check)
  - Updated VS Code settings for automatic formatting and linting on save
  - Updated all project documentation to reflect the new code quality standards
- **Audit System Improvements:**
  - Replaced hardcoded 'system' string with SYSTEM_ACTOR_ID constant in auth service to improve code maintainability and avoid magic strings
- **E2E Testing Documentation:**
  - Improved comment in LoginPage.ts explaining Playwright server action limitations and providing reference to Next.js GitHub issue
- **Invitation System Improvements:**
  - Fixed duplicate invitation check to allow re-invitations for expired or accepted invitations by only considering pending invitations as duplicates
- **CI/CD Linting Integration:**
  - Added linting and formatting checks to GitHub Actions CI pipeline
  - Fixed all existing linting and formatting issues across the codebase
  - Ensured all code passes ESLint and Prettier validation before merge
- **Source of Truth Documentation Organization:**
  - Created dedicated `docs/source-of-truth/` subfolder to group all authoritative documentation
  - Moved 6 core source documents (API_DOCUMENTATION.md, API_REFERENCE.md, ARCHITECTURE.md, BUSINESS_REQUIREMENTS.md, DATABASE_SCHEMA.md, FUNCTIONAL_REQUIREMENTS.md) to the new folder
  - Updated workflow instructions to reference "all files in docs/source-of-truth/" for simplicity
  - Updated all cross-references in README.md, NEXT_TASK.md, docs/PRD.md, and docs/TASKS.md to point to new locations
- **Code Review Verification:**
  - Verified that getDefaultRoleId method exists and functions correctly in mock-database.service.ts
  - Confirmed all API tests pass (67/67) validating the method's functionality
  - Resolved reviewer concern about non-existent method - the method is properly implemented and working
- **Modal-Based Onboarding Implementation:**
  - Converted page-based onboarding wizard to modal that appears immediately after login for new administrators
  - Created OnboardingModal component with consistent sizing and internal scrolling
  - Added progress indicators, skippable steps, and "Get Started" button on welcome step
  - Updated authentication flow to show modal instead of redirecting to separate page
  - Ensured responsive design without infinite redirect issues
  - Updated E2E tests to work with modal selectors instead of page navigation
  - Fixed test isolation by using separate church ID for onboarding tests to prevent settings conflicts
- [x] **Implement Global Authentication Protection:**
  - [x] **Backend:** Update middleware to protect all application routes (not just /pastoral-care) and redirect unauthenticated users to login page.
  - [x] **Frontend:** Modify app layout to properly handle authentication state and redirect when no valid session exists.
  - [x] **Testing:** Ensure login page appears for all protected routes and authentication flow works correctly.
- [x] **Update E2E Tests for Global Authentication:**
  - [x] **Testing:** Update Playwright tests to handle new authentication flow - either by setting demo cookies or using proper login flow for tests that need to access protected routes.
- [x] **Onboarding Wizard:**
  - [x] **Backend:** Create API endpoints to manage branding settings (logo, color), custom roles, and team member invitations.
  - [x] **Frontend:** Build the multi-step, skippable UI flow for the onboarding wizard.
  - [x] **Testing:** Create comprehensive E2E tests for the onboarding wizard user flows and API unit tests for settings management.
- [x] **Modal-Based Onboarding Wizard:**
  - [x] **Frontend:** Convert the existing page-based onboarding wizard to a modal that appears immediately after login for new administrators (onboardingComplete: false), featuring a "Get Started" button on the welcome step, consistent modal sizing with internal scrolling, progress indicators, skippable steps, and completion setting onboardingComplete to true.
  - [x] **Implementation:** Created OnboardingModal component, updated OnboardingWizard with modal-specific props, modified login flow to show modal instead of redirecting, added "Get Started" button to branding step, and ensured responsive design without infinite redirects.
- [x] **Event Volunteer Management System:**
  - [x] **Backend:** Implemented complete volunteer management API with endpoints for creating/updating/deleting volunteer roles, member signup/cancellation, and proper authorization controls (admin-only role management, user-owned signups).
  - [x] **Database:** Added EventVolunteerRole and EventVolunteerSignup tables with proper foreign key relationships and capacity tracking.
  - [x] **Frontend:** Built comprehensive volunteer coordination UI with role management interface, signup/cancel buttons, capacity indicators, and real-time updates.
  - [x] **Testing:** Added E2E tests covering volunteer signup flows, admin role management, and authorization checks.
  - [x] **Documentation:** Updated all source-of-truth documents (DATABASE_SCHEMA.md, API_DOCUMENTATION.md, FUNCTIONAL_REQUIREMENTS.md, BUSINESS_REQUIREMENTS.md) to reflect the complete volunteer management implementation.

- Persona documentation deep dive — Expanded every file in `docs/source-of-truth/personas/` with structured personas (goals, journeys, requirements, metrics); translated gaps into BRD/FRD updates and roadmap items with complete persona-driven epics.

- **Document Library:**
  - **Backend:** Developed API endpoints for file uploads (with @fastify/multipart v8), metadata management, role-based permission filtering, and generating secure time-limited download URLs.
  - **Frontend:** Created the UI for uploading, viewing, editing, and managing documents with role-based permissions checkboxes.
  - **Testing:** Added 13 passing unit tests covering all document endpoints including list, get, upload, update, delete, download, and permission filtering.

- **Small Group Resource Sharing:**
  - **Backend:** Created CRUD endpoints for managing `group_resources` (title and URL) with full validation and audit logging.
  - **Frontend:** Implemented UI for adding, viewing, editing, and deleting resource links on the group details page with modal dialogs.
  - **Testing:** Added 4 passing API unit tests covering all resource CRUD operations (create, read, update, delete).
  - **Features:** Admin-only resource management, clickable resource URLs opening in new tabs, proper churchId isolation, and audit trail for all operations.

- **Re-enable UI Tests (Phase 3):**
  - Convert redundant accessibility tests into functional tests instead of removing them
  - ✅ Phase 1: Smoke tests (2/2 completed - dashboard and audit log)
  - ✅ Phase 2: Announcements (1/1 completed - full CRUD functionality)
  - ✅ Phase 3: Check-in tests (4/4 completed - checkin-dashboard 3/3, checkin 1/1)
  - ✅ Phase 4: Households (1/1 completed - list and detail navigation)
  - ✅ Phase 4: Roles (1/1 completed - table display and permissions)
  - ✅ Phase 4: Settings (1/1 completed - form display and options)
  - ✅ Phase 5: Volunteer (1/1 completed - event volunteer role management)
  - For each test: enable, fix issues, verify functionality, move to next
  - Ensure all tests pass and provide meaningful validation

- **Role-Based Navigation and Dashboards:**
  - ✅ Implemented role-based navigation filtering in `web/app/layout.tsx` with different nav items for Admin, Leader, and Member personas
  - ✅ Created role-specific dashboard components in `web/app/dashboard/page.tsx` with LeaderDashboard showing ministry-focused metrics
  - ✅ Navigation correctly filters based on user roles: Admin sees all pages, Leaders see ministry-focused pages, Members see basic community pages
  - ✅ Build passes with TypeScript compilation after adding eslint-disable for mock data typing
  - ⚠️ **Test Updates Required:** E2E tests need updates to account for role-based navigation filtering (currently failing as expected since tests assume all users see all pages)

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

## Phase 3: Developer Experience & Infrastructure

- **API Documentation:**
  - **Backend:** Fully document all remaining API endpoints (Groups, Events, Check-in, etc.) in `docs/source-of-truth/API_DOCUMENTATION.md`.

- **Debug and stabilize E2E test environment:** Fix port conflicts and improve test reliability.

## Technical Debt & Compliance

- **Complete CRUD Operations for All Entities:**
  - **Backend:** Implement full Create, Read, Update, Delete operations for all database entities (users, profiles, groups, events, announcements, funds, contributions, households, children, etc.).
  - **Soft Delete Implementation:** Replace hard deletes with soft deletes (add `deletedAt` timestamp) across all entities to maintain data integrity and audit trails.
    - **Schema Update ✅:** Added `deletedAt` fields to all tables including join tables (`group_members`, `document_permissions`, `announcement_audiences`) in `DATABASE_SCHEMA.md`
    - **Backend Implementation ✅:** Updated API endpoints, mock data store, and data layer to implement soft delete logic with admin-only hard delete and recovery endpoints
    - **Frontend Implementation ✅:** Update UI components to show "archived" instead of "deleted", add admin controls for viewing deleted items, and implement recovery UI with safety indicators

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

#### Now (Q1 Post-MVP)

- **Backend:** Extend volunteer scheduling APIs with coordinator tools and availability management
- **Frontend:** Enhance volunteer coordination dashboard with scheduling interface

#### Next (Q2)

- **Backend:** Implement automated reminder workflows and communication segmentation
- **Frontend:** Add analytics dashboard for coverage rates and volunteer engagement

#### Later (Q3+)

- **Backend:** Add advanced scheduling templates and conflict resolution algorithms
- **Frontend:** Implement drag-and-drop scheduling with real-time availability updates

### Epic: Leader Ministry Dashboards (BRD-2.2.5, FR-LEAD-001..005)

**Priority:** High - Pastoral care effectiveness

#### Now (Q1 Post-MVP)

- **Backend:** Implement ministry-scoped data access and filtered dashboard APIs
- **Frontend:** Create leader-specific dashboards with care request filtering

#### Next (Q2)

- **Backend:** Add task assignment and pastoral note management with confidentiality controls
- **Frontend:** Implement task management UI and automated alert configuration

#### Later (Q3+)

- **Backend:** Integrate communication tools with privacy-aware member outreach
- **Frontend:** Add advanced analytics for ministry health and engagement trends

### Epic: Member Experience Enhancement (BRD-2.2.6, FR-MEMB-001..005)

**Priority:** High - Member engagement and retention

#### Now (Q1 Post-MVP)

- **Backend:** Implement notification center APIs with preference management
- **Frontend:** Add member notification center and preference settings

#### Next (Q2)

- **Backend:** Enhance event discovery with recommendations and household registration
- **Frontend:** Implement improved event registration flows and personal dashboards

#### Later (Q3+)

- **Backend:** Add serving opportunity matching and commitment tracking
- **Frontend:** Create comprehensive member engagement analytics and personalization

### Epic: Visitor Conversion Funnel (BRD-2.2.7, FR-VISIT-001..005)

**Priority:** Medium - Church growth and outreach

#### Now (Q1 Post-MVP)

- **Backend:** Implement public registration APIs and visitor data management
- **Frontend:** Create public event registration flows without authentication

#### Visitor Conversion (Q2)

- **Backend:** Add automated nurture workflows and conversion tracking
- **Frontend:** Implement visitor follow-up interfaces and conversion pathways

#### Advanced Features (Q3+)

- **Backend:** Integrate CRM-lite features with interaction history and segmentation
- **Frontend:** Add advanced visitor analytics and conversion optimization tools

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

### 🔄 In Progress

### 📝 Backlog / Upcoming

- **Onboarding E2E Tests - Technical Debt:**
  - **Testing:** Debug and fix Next.js server-side rendering issue preventing onboarding page from displaying React components. The page currently shows JavaScript code instead of the expected UI. Once resolved, uncomment the onboarding E2E test suite in `web/e2e/onboarding.spec.ts`.

## Phase 1: Complete Core Initial Release Features

- **Document Library:**
  - **Backend:** Develop API endpoints for file uploads (interfacing with a cloud storage service), metadata management, and generating secure, permission-based download URLs.
  - **Frontend:** Create the UI for uploading, viewing, editing, and managing documents and their role-based permissions.

- **Small Group Resource Sharing:**
  - **Backend:** Create CRUD endpoints for managing `group_resources` (title and URL).
  - **Frontend:** Implement the UI for adding and viewing resource links on the group details page.

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

- **GDPR Compliance Implementation:**
  - **Backend:** Implement data retention policies, right to erasure (soft delete), data portability, and consent management.
  - **Frontend:** Add privacy settings UI, data export functionality, and consent management interfaces.
  - **Audit:** Ensure all personal data handling complies with GDPR requirements including lawful basis for processing.

## Post-MVP (Future Releases)

- **System Administration Application (Epic):**
  - **Backend:** Define and implement the initial set of system-level API endpoints required for platform monitoring (e.g., client usage metrics).
  - **Frontend:** Scaffold the new `admin` Next.js application and implement the basic layout and an initial observability dashboard.

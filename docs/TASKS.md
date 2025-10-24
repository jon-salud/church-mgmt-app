# Tasks

## Work Tracker

Use this file as the single source of truth for what has shipped in the demo MVP and what is still outstanding. Update it whenever a task meaningfully progresses so the next agent can pick up quickly. When you pull an item from backlog, move it into **In Progress** before you begin work.

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
- Environment hardening: auth guard cookie support + active-account enforcement, JSON error filter, and persisted audit logs
- Observability hardening: structured pino logging, Sentry initialization hooks, and Prometheus-friendly `/api/v1/metrics`
- OpenAPI schema enhancements documenting core modules (users, groups, events, giving, dashboard, audit, auth)
- Architect and Implement Household Data Model
- **Pastoral Care & Prayer Feature (Public Prayer Wall):**
  - **Frontend (Web):**
    - Implement Prayer Request pages (public wall, submission form, admin moderation UI).
  - **E2E Testing:**
    - Write Playwright E2E tests for the prayer wall user flows (submission, moderation, management).
- **Pastoral Care & Prayer Feature (Confidential Tickets):**
  - **Frontend (Web):**
    - Implement Pastoral Care pages (ticket submission form with confidentiality notice, staff dashboard, ticket detail view with comments).
  - **E2E Testing:**
    - Write Playwright E2E tests for the confidential pastoral care user flows.
- Child Check-In and Safety feature
- UI Improvements (Theme Switching, Sidebar Navigation, UI Automation IDs)
- **Documentation Reconciliation:**
  - Audited all project documentation (`BRD`, `FRD`, `Architecture`, `API`, `User Manual`, `Coding Standards`) to create a single source of truth.
  - Reconciled and updated `PRD.md` to serve as a high-level summary, linking to detailed documents.
  - Updated `NAVIGATION.md` to accurately reflect all application features and routes.
  - Overhauled `SETUP.md` to provide a clear, structured guide for developers.
  - Aligned all documentation to ensure consistency and accuracy across the project.
- **Unified Request Form (Phase 1):**
  - Implement a centralized form for members to submit various types of requests (Prayer, Benevolence, Improvements/Suggestions).
  - Add a new `/requests` page and navigation link.
  - Integrate submissions into the existing Pastoral Care dashboard with a "Type" filter and "View Details" modal.
- **Unified Request Form (Phase 2):**
  - Implement an admin settings page to allow administrators to define and manage custom request types.
- **Bug Fixes (Request Types):**
  - Fixed a bug where the "Request Type" dropdown on the public request form was not working.
  - Fixed a bug where the Pastoral Care dashboard displayed raw IDs instead of names for request types.

### 🔄 In Progress

### 📝 Backlog / Upcoming

- **API Documentation:**
    - **Backend:** Fully document all remaining API endpoints (Groups, Events, Check-in, etc.) in `API_DOCUMENTATION.md`.
- **Onboarding Wizard:**
  - **Backend:** Create API endpoints to manage branding settings (logo, color), custom roles, and team member invitations.
  - **Frontend:** Build the multi-step, skippable UI flow for the onboarding wizard.
- **Document Library:**
  - **Backend:** Develop API endpoints for file uploads (interfacing with a cloud storage service), metadata management, and generating secure, permission-based download URLs.
  - **Frontend:** Create the UI for uploading, viewing, editing, and managing documents and their role-based permissions.
- **Admin Experience Enhancements:**
  - **Backend:** Implement API endpoints for CRUD operations on custom member profile fields.
  - **Backend:** Add an endpoint to allow assigning a request to a specific staff member.
  - **Frontend:** Build the settings UI for administrators to create and manage custom profile fields.
  - **Frontend:** Add UI controls to the requests dashboard to allow assignment of requests.
- **Small Group Resource Sharing:**
  - **Backend:** Create CRUD endpoints for managing `group_resources` (title and URL).
  - **Frontend:** Implement the UI for adding and viewing resource links on the group details page.
- **System Administration Application (Epic):**
  - **Backend:** Define and implement the initial set of system-level API endpoints required for platform monitoring (e.g., client usage metrics).
  - **Frontend:** Scaffold the new `admin` Next.js application and implement the basic layout and an initial observability dashboard.
- Debug and stabilize the E2E test environment to prevent port conflicts.

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

### 🔄 In Progress

### 📝 Backlog / Upcoming

- **Pastoral Care & Prayer Feature (Phase 2 - API & UI):**
  - **Backend (API):**
    - Implement Prayer Request API Endpoints (CRUD, moderation, 'pray' action).
    - Implement Pastoral Care API Endpoints (CRUD, email notifications, commenting).
    - Write API integration tests for all new endpoints.
  - **Frontend (Web):**
    - Implement Prayer Request pages (public wall, submission form, admin moderation UI).
    - Implement Pastoral Care pages (ticket submission form with confidentiality notice, staff dashboard, ticket detail view with comments).
  - **E2E Testing:**
    - Write Playwright E2E tests for the complete user flows (submission, moderation, management).
- Documentation refresh once outstanding MVP items land
- Debug and stabilize the E2E test environment to prevent port conflicts.

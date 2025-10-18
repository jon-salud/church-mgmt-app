# Tasks

## Work Tracker

Use this file as the single source of truth for what has shipped in the demo MVP and what is still outstanding. Update it whenever a task meaningfully progresses so the next agent can pick up quickly.

### ✅ Completed

- Mock OAuth login with seeded sessions (Google/Facebook) — API & web flows
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

### 🔄 In Progress

- _None — pick the next item from the backlog_

### 📝 Backlog / Upcoming

- Flesh out `/users` admin CRUD (create/update) and profile editing
- Group membership management (bulk add/remove endpoints + UI actions)
- Event CRUD (create/update) and attendee filtering
- Announcement create/edit experience with scheduling controls
- Giving reports and contribution editing
- OpenAPI schema enhancements to cover all endpoints
- Environment hardening: auth guard improvements, error handling, audit trails persistence
- Documentation refresh once outstanding MVP items land

# PRD — Church Management Application (API-first, PWA MVP)

> Purpose: a clear, build-ready Product Requirements Document you can paste into Codex/VS Code or any AI code generator. It defines the MVP so you can ship something functional, with an API-first architecture, PWA web app, social login (Google/Facebook), and testing (unit/integration/UI) to prevent regressions.

---

## 1) Vision & Goals

**Vision:** Equip churches with a lightweight, secure, and modern system to manage people, groups/ministries, events, attendance, simple communications, and (optional) manual giving records—accessible on desktop and mobile (PWA) with an extensible API.

### **Primary Goals (MVP):**

- Central **Member Directory** with admin-configurable roles/permissions.
- **Groups / Ministries** management and member assignments.
- **Events & Attendance** (create events, check-in/out, record attendance).
- **Announcements** (simple one-to-many comms via email placeholder + in-app feed; SMS/Push in roadmap).
- **Manual Giving Records** (voluntary; no payments in MVP—just pledges/records).
- **OAuth Login** (Google, Facebook).
- **PWA** with installable app and basic offline for read-only key screens.
- **API-first** with versioned REST + OpenAPI 3.1 spec.
- **Automated tests**: unit, integration, and UI e2e.

### **Non-Goals (post-MVP/roadmap):**

- Online payments/recurring donations.
- Complex workflows (rota/scheduling, facilities bookings).
- Advanced email/SMS automation & templates.
- Deep accounting/general ledger.
- Multi-tenant billing and subscription management.

---

## 2) Users & Roles

- **Admin-managed role catalog**: Church Admins can add, edit, and delete roles to match their workflows; the built-in **Admin** role is system-protected and always retains full access.
- **Member** (default template): view own profile, view announcements, RSVP to events, view their groups & upcoming events.
- **Leader** (template): everything a Member can do + manage their group membership & mark attendance for events assigned to them.
- **Admin** (church admin staff): full CRUD on people, groups, events, announcements, simple giving records, role assignment, and access to audit logs.
- **Super Admin** (system owner; optional for multi-tenant): manage churches/organisations and environment-wide configs.

> Templates seed new churches with sensible defaults; Admins can adjust or duplicate them, but the Admin role itself cannot be deleted.

---

## 3) Core MVP Use Cases & Acceptance Criteria

### 3.1 Auth & Account

- **As a user**, I can sign in with **Google or Facebook**.
  - AC: Successful OAuth returns a JWT (or session) mapped to a **User** with a **Profile**.
  - AC: First-time sign-in creates a user; duplicates by email are prevented.
  - AC: Role defaults to the **Member** template; Admin can assign any available custom role.

### 3.2 Member Directory

- **As an Admin**, I can create/edit/search members.
  - AC: Required fields: firstName, lastName, email; optional: phone, address, birthday, notes.
  - AC: Search by name/email; paginate & sort.
  - AC: Import CSV (post-MVP; optional stub in MVP).
- **As an Admin**, I can manage the role catalog (create, edit, delete non-system roles).
  - AC: Roles capture name, description, and permission scopes (modules/actions toggles).
  - AC: System roles (e.g., Admin) are read-only and non-deletable; deleting a role with assignees prompts reassignment.

### 3.3 Groups / Ministries

- **As an Admin/Leader**, I can create groups, assign leaders, and add members **who may belong to multiple groups simultaneously** (e.g., a Christian can be in a geographical ministry, a service ministry, and a volunteer team).
  - AC: Group has `name`, `description`, `type` (taxonomy below), optional `meetingDay/time`, and tags.
- **As an Admin/Leader**, I can manage group membership.
  - AC: Members can be added to many groups.
  - AC: Group-level roles are supported (Member, Leader, Coordinator, Volunteer).
  - AC: Leaders can see and manage only their own group(s).
- **As a Member**, I can view the roster for groups I belong to.
  - AC: Members can see a list of other members in their groups.

### **Group Taxonomy (MVP)**

- `GeographicalMinistry` (e.g., North Shore, West Auckland)
- `ServiceMinistry` (e.g., Worship Team, Kids, Tech/AV)
- `VolunteerTeam` (e.g., Set-up Crew, Outreach Team)
- `SmallGroup` (e.g., weekly Bible study)
- `Other`

### **Membership**

- Many-to-many (User↔Group) via `GroupMember`.
- Per-membership fields: `role` (Member/Leader/Coordinator/Volunteer), `status` (Active/Inactive), `joinedAt`.
- Bulk add/remove supported.

### 3.4 Small Group Enhancements

- **As a Leader**, I can share resources with my group.
  - AC: Leaders can add a name and a shareable link (e.g., from Google Drive) to a resource.
  - AC: Group members can view the list of resources.
- **As a Member**, I can RSVP to a group meeting.
  - AC: Members can indicate if they will be attending a meeting.
  - AC: Leaders can view the list of RSVPs.

### 3.5 Events & Attendance

- **As an Admin/Leader**, I can create events and record attendance.
  - AC: Event fields: title, description, start/end, location, tags, groupId (optional), visibility (public/private).
  - AC: Attendance: check-in/check-out; add note per attendee.
  - AC: Export attendance CSV (MVP).

### 3.5 Announcements

- **As an Admin**, I can post announcements visible to all members or to selected groups.
  - AC: Announcement has title, body (basic rich text/markdown), audience (All or selected groupIds), publishAt, expireAt.
- **As a Member**, I can view and interact with the announcements feed.
  - AC: Members see an **Announcements feed**.
  - AC: Members can mark announcements as read.
  - AC: Email delivery can be a **no-op** in MVP with a “Send email” stub (log only) to avoid deliverability setup; real email in roadmap.

### 3.7 Giving (Manual Records)

- **As an Admin**, I can record pledges and received giving **manually** per member.
  - AC: Contribution: memberId, date, amount, method (cash, bank transfer), fund (General, Missions, etc.), note.
  - AC: Filter by date range/member/fund; CSV export.
  - AC: Provide summary metrics (overall, month-to-date, previous month, average gift) and breakdowns by fund/month for dashboards.
- **As a Member**, I can view my own giving history.
  - AC: Members can see a list of their past contributions.
  - AC: Members can download a CSV export of their giving history for a specified date range.

### 3.8 PWA

- **As a Member**, I can install the app on my phone and quickly access announcements, my groups, and upcoming events.
  - AC: Web app meets PWA install criteria (manifest + service worker).
  - AC: Basic offline read cache for last-seen announcements & event list; write operations require online.

### 3.9 Pastoral Care & Prayer

This feature is designed to provide spiritual support to the congregation through two distinct, yet related, functions: a public Prayer Wall and a confidential Pastoral Care ticketing system.

#### **3.9.1 Public Prayer Wall**

- **As a User (Member or Anonymous)**, I can submit a prayer request to the public prayer wall.
  - AC: The submission form must include a `title` and `description`.
  - AC: Users can choose to submit **anonymously**.
  - AC: Anonymous submissions generate a secure, unique link/token, allowing the original poster to manage their request later (e.g., mark it as "answered").
  - AC: All submitted prayer requests enter a **moderation queue** and are not publicly visible until approved by a staff member.
- **As an Admin/Pastor**, I can moderate incoming prayer requests.
  - AC: A dedicated "Moderation Queue" screen displays all prayer requests with a `PENDING_APPROVAL` status.
  - AC: Staff can **approve** or **deny** requests. Approved requests become visible on the public prayer wall.
- **As a Member**, I can view the public prayer wall and see how I can be praying for my community.
  - AC: The prayer wall only displays `APPROVED` prayer requests.
  - AC: I can click an "I'm praying" button on a request. The total count of prayers is visible to all, providing encouragement to the original poster.
- **As the original poster**, I can update the status of my prayer request.
  - AC: I can mark my request as "Answered", moving it to an archived view. (Authenticated users can do this from their profile; anonymous users must use their secure link).

#### **3.9.2 Confidential Pastoral Care Tickets**

- **As a Member**, I can submit a confidential request for pastoral care.
  - AC: The submission form will include `title`, `description`, and an optional `priority` level (e.g., Low, Normal, High, Urgent).
  - AC: The form must display a clear, reassuring message stating that the request is **confidential** and will only be seen by the pastoral care team.
  - AC: Upon submission, I will receive an **automated confirmation email** letting me know my request has been received.
- **As an Admin/Pastor**, I can receive and manage pastoral care tickets.
  - AC: When a new ticket is submitted, a **notification email** is sent to a designated pastoral staff email address/group.
  - AC: A dashboard allows staff to view all tickets, which can be sorted and filtered by `status` (e.g., New, In Progress, Resolved) and `priority`.
  - AC: Staff can assign tickets to specific pastors.
  - AC: Staff can add private comments to a ticket, creating a threaded conversation for internal case notes and follow-up.

### 3.10 Child Check-In and Safety

- **As a Parent or Guardian**, I can manage my children's information.
  - AC: Children are linked to a `Household` so multiple guardians are supported.
  - AC: Required child fields: `fullName`, `dateOfBirth`. Optional fields: `allergies`, `medicalNotes`.
- **As a Parent or Staff Member**, I can check a child into an event.
  - AC: Parents may self-check-in via the PWA; self-check-ins create a `PENDING_CONFIRMATION` record that requires staff confirmation.
  - AC: Staff can perform the complete check-in flow on behalf of a parent and confirm immediately.
  - AC: The system records the check-in timestamp and the staff member who confirmed it.
  - AC: A dedicated "Childcare Volunteer" role has permissions to manage check-in and check-out.
- **As a Staff Member**, I can view and manage check-ins via a staff dashboard.
  - AC: Dashboard lists children with statuses (Pending Confirmation, Checked In, Checked Out).
  - AC: Each row shows child's name, computed age, allergies, medical notes, event/group, and check-in/check-out timestamps.
  - AC: Staff can filter/search by status, event/group, name, or flagged medical/allergy notes and can confirm/override entries.
  - AC: All confirmations and overrides record actor and timestamp for auditing.
- **As a Staff Member**, I can check a child out.
  - AC: The system records the check-out timestamp and the staff member who performed the action.
  - AC: The system initiates a PWA push notification to the parent's device upon checkout.
- **As a Parent**, I am notified of checkout and must confirm it.
  - AC: Parents receive a push notification when their child is checked out and must confirm the checkout via the app.
  - AC: A configurable timeout exists for staff and parent confirmations; timed-out items surface in the staff dashboard for follow-up.
- **As an Admin or Staff Member**, I can manage visitor/child check-ins for events.
  - AC: Provide a spreadsheet-like rapid-entry interface (and optional CSV import) for quick single-event visitor/child check-ins.
- AC: All check-in/out and confirmation actions are auditable (actor, action, timestamps, eventId, optional notes).

### 3.11 Unified Request Form

- **As a Member**, I can submit various types of requests through a single, unified form.
  - AC: The form will include a dropdown to select from a list of available request types.
  - AC: The list of request types is dynamically populated based on what the church administrator has configured.
  - AC: The form's placeholder text and description will dynamically update based on the selected request type.
  - AC: All submissions will be routed to the Pastoral Care dashboard for review.
- **As an Admin**, I can configure the available request types for the unified form.
  - AC: On the settings page, I can view a list of all request types (both built-in and custom).
  - AC: I can create new custom request types by providing a name.
  - AC: I can rename existing custom request types.
  - AC: I can archive (soft-delete) any request type, which will hide it from the public request form but preserve historical data. Archiving is prevented if there are open requests of that type.
  - AC: I can re-order the request types using a drag-and-drop interface to control their display order on the public form.
- **As an Admin/Pastor**, I can view all submitted requests in the Pastoral Care dashboard.
  - AC: The dashboard table will include a "Type" column to distinguish between different request types.
  - AC: A "View Details" modal will display the full details of each request.
  - > _Future Enhancement Note: The ability to sort and filter the dashboard by request type is a planned future enhancement._

---

## 4) Architecture & Tech Choices

### 4.1 Database (Recommended)

#### **PostgreSQL** (managed; e.g., Supabase/Neon/RDS)

#### **Why Postgres?**

- Strong relational consistency for church data (people↔groups↔events↔attendance).
- Mature SQL, JSONB for flexible metadata, robust indexing & constraints.
- Great ecosystem (Prisma, TypeORM), simple migrations, easy to scale and back up.

> Alternative considered: Firebase/MongoDB—fast iteration but weaker relational integrity for this domain; payments/attendance/giving queries benefit from SQL.

### 4.2 Backend (API-first)

- **NestJS (TypeScript) + Fastify** for performance, modularity.
- **Prisma ORM** for Postgres schema & migrations (mock store ships today; Prisma wiring is stubbed for future persistence).
- **OpenAPI 3.1** generated via `@nestjs/swagger`; exposed at `/docs`.
- **Auth**: OAuth 2.0 / OIDC via **Auth0** (fastest path) or **Passport (Google, Facebook)** with JWT access tokens.
- **Validation**: Zod or class-validator (DTOs).
- **Rate limiting** & **RBAC** (role-based access control) middleware.
- **Storage**: Cloud object storage for profile images (optional in MVP).

### 4.3 Frontend (PWA)

- **Next.js (App Router) + React + TypeScript**
- **UI**: Tailwind CSS + shadcn/ui
- **State/query**: React Query (TanStack) against REST API.
- **Auth client**: OIDC/OAuth via Auth0 SDK or custom OIDC client.
- **PWA**: Next PWA plugin, service worker for caching “shell” + key GETs.

### 4.3.1 UI & Theming

- **Theme Switching**: The application supports both light and dark themes, with a toggle available in the user navigation header. The user's preference is persisted in local storage.
- **Sidebar Navigation**: The main sidebar navigation has been updated to include icons for each menu item, providing a more intuitive user experience. The currently active page is highlighted.
- **UI Automation IDs**: To ensure testability, all major interactive elements (buttons, links, inputs, etc.) are assigned a unique `id` attribute. This is a strict requirement for all new UI components.

### 4.4 Testing & Quality

- **Unit/Integration**: **Jest** (backend), **Vitest** (frontend if preferred).
- **API integration**: **Supertest** (NestJS), Prisma test DB.
- **UI e2e**: **Playwright** (login, CRUD happy paths, attendance flow).
- **Contract tests** (optional): **Pact** between API and web client.
- **Lint/Format**: ESLint + Prettier; **Husky** pre-commit hooks.
- **CI/CD**: GitHub Actions (build, test, lint, e2e on preview deploy).

### 4.5 Observability & Operations

- **Logging**: Structured JSON via `pino`; adjustable through `LOG_LEVEL`.
- **Error monitoring**: Optional Sentry integration (`SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`) captures uncaught exceptions and traces.
- **Metrics**: Prometheus-compatible counters/histograms exposed at `/api/v1/metrics`.
- **Audit logging**: All mutating actions recorded via the audit module; mock mode persists snapshots to disk, production mode stores via Prisma.

---

## 5) Data Model (MVP)

### **Organisation / Multi-Tenant**

- `Church` (id, name, timezone, address, createdAt)
- `Role` (id, churchId, name, description, permissions JSONB, isSystem boolean default false, isDeletable boolean default true)
- `ChurchUser` (churchId, userId, roleId FK → Role, assignedAt)  ← allows multi-church later

### **Identity**

- `User` (id, primaryEmail, status, createdAt, lastLoginAt)
- `Household` (id, churchId, name, address, phone, anniversary)
- `Profile` (userId FK, firstName, lastName, phone, address, birthday, photoUrl, notes, householdId, householdRole)
- `OAuthAccount` (userId FK, provider: google|facebook, providerUserId, accessToken*, refreshToken*, expiresAt*) _stored securely or via Auth0_

### **Groups**

- `Group` (id, churchId, name, description, `type` enum, meetingDay, meetingTime, tags JSONB)
- `GroupMember` (groupId, userId, `role` enum, `status` enum, joinedAt)

### **Events & Attendance**

- `Event` (id, churchId, title, description, startAt, endAt, location, visibility, groupId?)
- `Attendance` (eventId, userId, status: checkedIn|absent|excused, note, recordedBy, recordedAt)

### **Announcements**

- `Announcement` (id, churchId, title, body, audience: all|custom, groupIds JSONB, publishAt, expireAt)
- `AnnouncementRead` (announcementId, userId, readAt)

### **Giving (Manual)**

- `Fund` (id, churchId, name)
- `Contribution` (id, churchId, memberId, date, amount decimal(10,2), method enum, fundId, note)

### **Pastoral & Prayer**

- `PrayerRequest` (id, churchId, title, description, isAnonymous, authorId?, managementToken?, `status` enum: PENDING_APPROVAL|APPROVED|ANSWERED, createdAt, updatedAt)
- `Prayer` (id, prayerRequestId, userId, createdAt)
- `PastoralCareTicket` (id, churchId, title, description, `status` enum: NEW|ASSIGNED|IN_PROGRESS|RESOLVED, `priority` enum: LOW|NORMAL|HIGH|URGENT, authorId, assigneeId?, createdAt, updatedAt)
- `PastoralCareComment` (id, ticketId, authorId, body, createdAt)

### **Audit & System**

- `AuditLog` (id, churchId, actorUserId, action, entity, entityId, diff JSONB, createdAt)
- `FeatureFlag` (key, value JSONB)

> Migrations managed via Prisma. Add indices for common queries (email, groupId, eventId+userId, churchId filters).

---

## 6) REST API (v1) — High-Level Endpoints

All endpoints prefixed by `/api/v1`. Auth via Bearer JWT (OIDC). Responses in JSON. Pagination: `?page=&pageSize=`, sorting: `?sort=field:asc`, filtering with query params.

### **Auth endpoints**

- `POST /auth/oauth/callback` (if self-hosted OAuth) — exchanges code → JWT.
- `GET /auth/me` → current user + roles per church.

### **Households endpoints**

- `GET /households` (Admin)
- `GET /households/:id`

### **Users & Profiles endpoints**

- `GET /users` (Admin) — list; filters: `q, role, groupId`
- `POST /users` (Admin) — create bare user (invite flow post-MVP)
- `GET /users/:id`
- `PATCH /users/:id` (Admin, or self for own profile limited fields)
- `GET /profiles/:userId`
- `PATCH /profiles/:userId`

### **Groups endpoints**

- `GET /groups` (Member sees groups they belong to; Admin sees all)
- `POST /groups` (Admin/Leader for own ministry scope)
- `GET /groups/:id`
- `PATCH /groups/:id`
- `POST /groups/:id/members` (bulk add)
- `DELETE /groups/:id/members/:userId`
- `GET /groups/:id/members`

### **Events endpoints**

- `GET /events?from=&to=&groupId=`
- `POST /events` (Admin/Leader)
- `GET /events/:id`
- `PATCH /events/:id`
- `GET /events/:id/attendees`
- `POST /events/:id/attendance` (bulk upsert: [{userId, status, note}])
- `GET /events/:id/attendance.csv` (Admin) — export attendance report

### **Announcements endpoints**

- `GET /announcements` (filters: activeOnly=true, groupId)
- `POST /announcements` (Admin)
- `GET /announcements/:id`
- `PATCH /announcements/:id`
- `POST /announcements/:id/read` (Member marks read)

### **Giving (Manual) endpoints**

- `GET /giving/funds`
- `POST /giving/funds`
- `GET /giving/contributions?memberId=&from=&to=&fundId=`
- `POST /giving/contributions`
- `PATCH /giving/contributions/:id`
- `GET /giving/contributions.csv?memberId=&from=&to=&fundId=` (Admin)
- `GET /giving/reports/summary` (Admin)

### **Requests endpoints**

- `GET /requests` (Admin/Pastor)
- `POST /requests` (Member)

### **Prayer Requests endpoints**

- `GET /prayer-requests` (Public, approved requests)
- `POST /prayer-requests` (Submit a new request, authenticated or anonymous)
- `POST /prayer-requests/:id/pray` (Authenticated member)
- `PUT /prayer-requests/:id` (Original poster via auth or management token to mark as answered)
- `GET /prayer-requests/pending` (Admin: moderation queue)
- `PUT /prayer-requests/:id/status` (Admin: approve/deny request)

### **Pastoral Care endpoints**

- `GET /pastoral-care/tickets` (Admin/Pastor or member for own tickets)
- `POST /pastoral-care/tickets` (Member)
- `GET /pastoral-care/tickets/:id` (Admin/Pastor or member for own ticket)
- `PATCH /pastoral-care/tickets/:id` (Admin/Pastor: update status, assignee)
- `POST /pastoral-care/tickets/:id/comments` (Admin/Pastor or member for own ticket)

### **Admin & Audit endpoints**

- `GET /roles` (Admin) — list roles + assignment counts
- `POST /roles` (Admin) — create custom role
- `PATCH /roles/:id` (Admin) — update non-system role metadata/permissions
- `DELETE /roles/:id` (Admin) — delete role (reject if system role or without reassignment)
- `GET /audit?entity=&actorUserId=&from=&to=`
- `GET /health` (readiness/liveness)
- `GET /metrics` (prometheus—optional)

**Errors:** RFC 7807 Problem+JSON (`type`, `title`, `status`, `detail`, `instance`)

---

## 7) Frontend (PWA) Screens (MVP)

### **Member**

- Login (Google/Facebook)
- Home / Announcements Feed
- My Profile (edit core fields)
- My Groups (list → roster)
- Events (list, details, RSVP—optional, at least view & attend)
- Offline fallback (read-only cached announcements & events)

### **Leader**

- Group Detail (manage members)
- Event Attendance (check-in/out, quick search, mark all present/absent)

### **Admin**

- Dashboard (quick stats: members, groups, events this week)
- Prayer Wall (view public requests, "I prayed" button)
- Submit Prayer Request Form
- My Pastoral Tickets (for members to view their own)
- People (CRUD, search)
- Groups (CRUD, membership)
- **Prayer Moderation Queue** (for staff to approve/deny requests)
- **Pastoral Care Dashboard** (for staff to view, assign, and manage tickets)
- Events (CRUD, attendance export)
- Announcements (CRUD, target audience)
- Giving (manual records, summary dashboard, CSV export)
- Audit Logs (view)

---

## 8) Security, Privacy, Compliance

- OAuth/OIDC with state/nonce protections; short-lived access tokens, refresh rotation.
- RBAC enforcement on every endpoint (church-scoped).
- Data tenancy: every entity scoped by `churchId`.
- Protect PII at rest (encrypted volumes) and in transit (TLS).
- Secrets in a secure vault (e.g., GitHub OIDC → cloud secrets manager).
- Audit log for sensitive changes.
- Backups: daily snapshots, PITR if managed Postgres supports it.
- GDPR/NZ Privacy Principles alignment (data export/delete on request).
- Rate limiting & IP throttling for auth & write endpoints.
- Content validation & sanitisation of rich text (announcements).

---

## 9) Performance, Availability, Accessibility

- API target p95 < 300ms for typical queries at 1k MAU.
- Indexes for high-cardinality lookups (email, group membership).
- SLO: 99.5% (MVP); health checks & readiness probes.
- WCAG 2.1 AA; keyboard nav; prefers-reduced-motion respected.
- Timezone support; default church timezone configurable.

---

## 10) Observability & Analytics

- Structured logging (pino) with request IDs; log redaction for PII.
- Error tracking: Sentry (frontend+backend).
- Metrics: Prometheus/OTel (requests, latency, errors).
- Basic product analytics (privacy-respecting) for page views and feature usage—configurable per church.

---

## 11) Testing Strategy (MVP—must have)

### **Coverage Goals:**  

- Unit ≥ 70% statements/branches on backend services & controllers.  
- Integration: critical flows (auth, CRUD for members/groups/events/attendance).  
- UI e2e: smoke suite covering login, create group, add member, create event, record attendance, post announcement, member reads announcement.

### **Test Types & Tooling**

- **Backend Unit**: Jest (service logic, DTO validation).
- **Backend Integration**: Jest + Supertest against ephemeral Postgres (Testcontainers) & Prisma migrations.
- **Frontend Unit**: Vitest + React Testing Library.
- **UI e2e**: Playwright (headless + trace on failure).
- **Contract Tests** (optional): Pact (API provider vs client).
- **Static Checks**: ESLint/TypeScript strict, Zod/class-validator schemas.

### **CI Pipeline (GitHub Actions)**

1. `install → lint → typecheck → unit → integration (spins Postgres) → build`
2. Preview deploy to staging
3. Run Playwright e2e against preview
4. Gate `main` merges on green CI; enforce code owners for critical modules.

---

## 12) Delivery Plan (MVP Milestones)

### **Milestone 0 — Foundations (1–2 weeks)**

- Repo setup (pnpm), workspaces (api, web).
- Postgres (managed), Prisma init & base schema.
- NestJS skeleton (Auth, Users modules), OpenAPI scaffolding.
- Next.js app shell, Tailwind, auth client wiring (Auth0 or Passport flow).
- CI/CD pipeline + pre-commit hooks.

### **Milestone 1 — People & Auth (1–2 weeks)**

- OAuth login (Google/Facebook).
- Users/Profiles CRUD (Admin) + basic RBAC.
- Member directory UI (search/paginate).
- Unit/integration tests for users/auth.

### **Milestone 2 — Groups & Events (1–2 weeks)**

- Groups CRUD + membership.
- Events CRUD + list/calendar view.
- Attendance recording (Leader/Admin) + exports.
- e2e flows for groups/events/attendance.

### **Milestone 3 — Announcements & PWA (1–2 weeks)**

- Announcements CRUD + member feed + mark read.
- PWA manifest + service worker + basic offline cache.
- Manual Giving records (simple CRUD + export).
- Observability (Sentry) + audit logs.
- Final test hardening, perf checks, accessibility pass.

### **Go/No-Go Checklist**

- Auth works across Google & Facebook.
- CRUD happy paths covered by e2e.
- OpenAPI docs accurate; 400/401/403/404/409/500 handled.
- Rollback plan (zero-downtime migrations).

---

## 13) OpenAPI Example Snippets (for the generator)

```yaml
openapi: 3.1.0
info:
  title: Church Management API
  version: 1.0.0
servers:
  - url: https://api.example.com/api/v1
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
security: [{ bearerAuth: [] }]
paths:
  /auth/me:
    get:
      summary: Get current user
      responses:
        '200':
          description: Current user
  /users:
    get:
      summary: List users
      parameters:
        - in: query
          name: q
          schema: { type: string }
        - in: query
          name: page
          schema: { type: integer, minimum: 1, default: 1 }
        - in: query
          name: pageSize
          schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
      responses:
        '200': { description: Paged users }
    post:
      summary: Create user (admin)
      responses:
        '201': { description: Created }
  /groups/{id}/members:
    post:
      summary: Add members to group (bulk)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                userIds:
                  type: array
                  items: { type: string }
              required: [userIds]
      responses:
        '200': { description: Upserted }
```

---

## 14) Coding Standards & Project Structure

### **Backend (NestJS)**

```sh
/api
  /src
    /modules
      auth/
      users/
      profiles/
      groups/
      events/
      attendance/
      announcements/
      giving/
      audit/
    /common (filters, pipes, guards, interceptors, rbac)
    main.ts
  prisma/
    schema.prisma
  test/ (unit & integration)
```

### **Frontend (Next.js)**

```sh
/web
  /app
    /(auth)/login
    /dashboard
    /people
    /groups
    /events
    /announcements
    /giving
  /components
  /lib (api client, hooks)
  /e2e (playwright)
```

### **Conventions**

- TypeScript strict mode, no `any`.
- DTOs validated at boundaries; never trust client input.
- Feature flags for risky features.
- Env config via typed schema (zod).

---

## 15) Risks & Mitigations

- **Auth provider changes / app review (Facebook)** → Start with Google; add Facebook once Google path is stable. Consider Auth0 to simplify compliance.
- **Data migration** as schema evolves → Prisma migrations, never destructive without backups; feature-toggle new fields.
- **Email deliverability** → MVP logs/simulates “send” and posts to in-app feed; real email in Phase 2 with a provider (SESV2/Resend) + domain DKIM/SPF.

---

## 16) Roadmap (Post-MVP)

- **Email/SMS** communications (SendGrid/SESV2, Twilio), templates, audiences.
- **Payments/Donations** (Stripe), gift-aid/receipts.
- **Content Management System (CMS):** A lightweight CMS for churches to manage their own content, such as sermon notes, blog posts, and custom pages.
- **Google Drive Integration:** Full integration with Google Drive for seamless document management.
- **Volunteer Management and Scheduling (Rota):** A comprehensive system for managing volunteers, including skills and interests, scheduling, and automated reminders.
- **Rota/Scheduling**, volunteer sign-ups.
- **Check-in via QR**, attendance kiosks.
- **Forms** (prayer requests, sign-ups) with workflow.
- **Multi-campus** hierarchy and reporting.
- **Internationalisation** (i18n).
- **Mobile apps** (React Native) consuming the same API.

---

### TL;DR Build Decisions (for Codex)

- **DB:** PostgreSQL (managed) + Prisma.
- **API:** NestJS (Fastify), OpenAPI 3.1, JWT (OIDC).
- **Auth:** Google + Facebook via Auth0 (or Passport strategies).
- **Web (PWA):** Next.js + React + Tailwind + React Query.
- **Tests:** Jest (unit/integration), Supertest (API), Playwright (e2e).
- **Ops:** GitHub Actions CI, Sentry, managed Postgres backups.

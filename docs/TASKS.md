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
- ✅ **Flowbite UI Migration (Complete):**
  - ✅ **Phase 0:** Pre-Migration Assessment - Audited Radix UI usage across codebase
  - ✅ **Phase 1:** Tailwind Configuration - Configured Flowbite plugin and content paths
  - ✅ **Phase 2:** Created 13 Flowbite wrapper components (Alert, Button, Checkbox, Dialog, Dropdown, Input, Label, Modal, Progress, Select, Spinner, Table, Textarea)
  - ✅ **Phase 3:** Pilot migration with Settings module (2 files)
  - ✅ **Phase 4:** Migrated 16 major pages (Requests, Prayer, Pastoral Care, Onboarding modules)
  - ✅ **Phase 5:** E2E testing and bug fixes (Select form integration, Modal completion, data-testid support)
  - ✅ **Phase 6:** Removed all 5 Radix UI dependencies (41 total packages removed), deleted old component files (573 lines)
  - ✅ **Phase 7:** Complete documentation (FLOWBITE_MIGRATION.md)
  - **Results:** 100% feature parity, 41 packages removed, bundle size improvements (-9 kB Onboarding, -2.5 kB Settings), all 55 E2E tests passing
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
- ✅ **Sprint 4: Domain Layer Extraction**
  - ✅ **Domain Entities:** Created immutable Document, Group, and User entities with factory methods, validation, and soft delete support
  - ✅ **Value Objects:** Implemented ChurchId, DocumentId, GroupId, UserId, and Email value objects with proper validation and equality checks
  - ✅ **Repository Interfaces:** Created IDocumentsRepository and IGroupsRepository interfaces with proper abstraction
  - ✅ **Unit Tests:** Added comprehensive unit tests (158 total) covering all domain entities, value objects, and repository interfaces
  - ✅ **Code Quality:** Fixed all ESLint errors (4 errors resolved: crypto import issue, unused imports) and validated all tests pass (158/158)
  - ✅ **Architecture Compliance:** Maintained DDD principles with clean separation of concerns and proper dependency injection
  - ✅ **Code Review Feedback:** Addressed ALL 12 code review points (8 initial + 4 final) including import consistency, true immutability enforcement with readonly arrays and deep freezing, redundant fallback removal, domain method extraction, and generic deep freeze utility
  - ✅ **Production Ready:** All tests pass, TypeScript compiles without errors, true immutability enforced, and ready for merge
- ✅ **Sprint 5: Enhanced Testing Infrastructure**
  - ✅ **Test Fixtures Infrastructure:** Created comprehensive test fixtures with builder pattern for User, Group, and Document entities including pre-configured scenarios and fluent API
  - ✅ **Test Utilities:** Implemented TestDatabase with mock in-memory store, DatabaseSetup utilities, and AuthTestUtils for authentication testing
  - ✅ **Integration Tests:** Built complete integration test suite with 15 passing tests covering UsersService, GroupsService, and DocumentsService with realistic scenarios
  - ✅ **Test Coverage Improvement:** Increased test coverage from ~5% to 9% with domain entities at 70%+ coverage and comprehensive service testing
  - ✅ **CI Performance:** All integration tests execute in under 6 seconds maintaining fast feedback loops
  - ✅ **Reusable Components:** Created modular test infrastructure enabling easy expansion to additional services and complex test scenarios
  - ✅ **Code Review Fixes:** Addressed all review feedback including deep cloning for value object preservation, proper undefined description handling, and mock data role consistency
- ✅ **Sprint 6: Advanced Patterns & Optimizations - CQRS for Audit Logs**
  - ✅ **CQRS Interfaces:** Created IAuditLogQueries and IAuditLogCommands interfaces with proper separation of read and write operations
  - ✅ **Query Service:** Implemented AuditLogQueryService with listAuditLogs method, type-safe transformations, and data store integration
  - ✅ **Command Service:** Implemented AuditLogCommandService with createAuditLog method, actor resolution, and read model transformation
  - ✅ **Module Integration:** Updated AuditModule to provide CQRS services alongside backward-compatible AuditService
  - ✅ **Controller Refactoring:** Updated AuditController to use AuditLogQueryService for read operations while maintaining existing functionality
  - ✅ **Comprehensive Testing:** Created unit tests for both CQRS services (6 tests total) with 100% coverage and proper mocking
  - ✅ **Type Safety:** Resolved TypeScript compilation issues with proper type casting and interface alignment
  - ✅ **Backward Compatibility:** Maintained existing API contracts and functionality while introducing CQRS pattern

- ✅ **Sprint 6: Advanced Patterns & Optimizations - CQRS for Audit Logs**
  - ✅ **CQRS Interfaces:** Created IAuditLogQueries and IAuditLogCommands interfaces for clear separation of read/write operations
  - ✅ **AuditLogQueryService:** Implemented query service with complex filtering, pagination, and actor resolution for audit log reads
  - ✅ **AuditLogCommandService:** Implemented command service for audit log creation with proper actor resolution and read model transformation
  - ✅ **Module Integration:** Updated AuditModule to provide CQRS services alongside backward-compatible AuditService
  - ✅ **Controller Refactoring:** Updated AuditController to use AuditLogQueryService for read operations while maintaining existing API contracts
  - ✅ **Comprehensive Testing:** Added 6 unit tests covering both CQRS services with mocked dependencies and edge cases
  - ✅ **Type Safety:** Ensured proper TypeScript compilation with correct import paths and interface alignment
  - ✅ **Backward Compatibility:** Maintained existing functionality while introducing CQRS pattern for improved separation of concerns
  - ✅ **Performance Optimization:** Laid foundation for independent scaling of read and write operations
  - ✅ **All Tests Pass:** 10/10 audit tests passing with no regressions introduced

- ✅ **Sprint 6B.4: Advanced Observability & Metrics**
  - ✅ **ObservabilityService:** Centralized metrics collection for event store, circuit breaker, and CQRS with span tracing
  - ✅ **Metrics Categories:** Track event store operations (append/query/rebuild), circuit breaker state transitions/failures/recoveries, and CQRS command/query execution
  - ✅ **Span Tracing:** startSpan() creates tracked spans with operation name and attributes, endSpan() returns duration and operation name with status tracking
  - ✅ **Metrics Calculation:** On-demand average calculation for operations with success/failure tracking, 100% coverage
  - ✅ **Unit Tests:** 25 comprehensive tests covering all metrics types, span operations, edge cases, and 1000+ operation handling
  - ✅ **Audit Integration:** Injected ObservabilityService into AuditLogQueryService and AuditLogCommandService with CQRS recording
  - ✅ **Test Updates:** Updated audit service unit tests (4/4 command, 4/4 query tests) to verify observability calls
  - ✅ **Module DI:** Created ObservabilityModule for dependency injection, integrated with AuditModule
  - ✅ **Production Ready:** Fully typed, error handling, concurrent operations support, proper metric calculations

- ✅ **Sprint 6B.5: Documentation & Examples for Observability Infrastructure**
  - ✅ **OBSERVABILITY_ARCHITECTURE.md:** 300+ lines documenting design principles, architecture components, integration patterns, metrics interpretation, performance characteristics, testing strategies, best practices
  - ✅ **OBSERVABILITY_METRICS_REFERENCE.md:** 300+ lines complete reference guide for all metrics (Event Store, Circuit Breaker, CQRS), interpretation guidance, common patterns, alert thresholds, example PromQL queries
  - ✅ **SPAN_TRACING_GUIDE.md:** 400+ lines comprehensive guide covering basic usage, complete lifecycle examples, advanced patterns, naming conventions, error handling, logging integration, testing, common issues, best practices
  - ✅ **OBSERVABILITY_INTEGRATION_EXAMPLES.md:** Quick start guide, complete Audit Module reference implementation, before/after UserService comparison, module configuration patterns, testing patterns, common integration points (repositories, controllers, event handlers), integration checklist
  - ✅ **OBSERVABILITY_PRODUCTION_SETUP.md:** 600+ lines production deployment guide including metrics endpoints, health checks, Prometheus/Datadog/CloudWatch integration, alert rules, Grafana dashboards, production best practices, metric retention policies, graceful shutdown, environment-specific configs, troubleshooting, maintenance checklist
  - ✅ **OBSERVABILITY_PERFORMANCE.md:** 700+ lines performance characteristics including per-operation cost analysis (0.07-0.15ms overhead), scalability characteristics, memory profiling, optimization techniques (retention policy, lazy evaluation, sampling), load testing results, environment-specific tuning, capacity planning, troubleshooting
  - ✅ **REFACTORING_CHECKLIST.md Update:** Marked Sprint 6B.5 complete with full documentation of all 6 guides

- ✅ **Sprint 6B.6: OpenTelemetry Integration**
  - ✅ **OpenTelemetry SDK Setup:** Installed @opentelemetry/api, @opentelemetry/sdk-node, exporters (Prometheus, Jaeger), and auto-instrumentations
  - ✅ **SDK Configuration:** Created opentelemetry.ts with NodeSDK initialization, resource detection, Prometheus exporter (port 9464), Jaeger exporter, and graceful shutdown
  - ✅ **Application Bootstrap:** Updated main.ts to initialize OpenTelemetry SDK before NestJS app startup
  - ✅ **OpenTelemetry Service:** Created OpenTelemetryService and OpenTelemetryModule for Meter/Tracer dependency injection
  - ✅ **ObservabilityService Refactor:** Migrated from custom metrics to OpenTelemetry instruments (histograms, counters) while maintaining backward compatibility
  - ✅ **Audit Services Integration:** Updated AuditLogCommandService and AuditLogQueryService to use OpenTelemetry spans instead of custom span tracking
  - ✅ **Module Integration:** Added OpenTelemetryModule to AuditModule for proper dependency injection
  - ✅ **Type Safety:** Added ObservabilityMetrics interface and fixed all TypeScript compilation errors
  - ✅ **Build Validation:** All code compiles successfully with OpenTelemetry integration
  - ✅ **Backward Compatibility:** Maintained existing ObservabilityService API for seamless migration
  - ✅ **Code Quality:** Fixed all linting errors (0 errors, 361 acceptable warnings)
  - ✅ **PR Created:** [PR #138](https://github.com/jon-salud/church-mgmt-app/pull/138) - Complete Sprint 6B implementation ready for review
- ✅ **Sprint 8B: E2E Test Fixes - Fixme Tests Resolution**
  - ✅ **Dashboard Landmarks Test:** Unmasked and verified passing - AppLayout refactored as server component
  - ✅ **Admin CRUD Test:** Fixed archived members display issue by normalizing value objects (id, primaryEmail, churchId) from API response
  - ✅ **Onboarding Full Flow Test:** Unmasked and verified passing - test was already functional
  - ✅ **React Server Component Fixes:** Resolved RSC violation by making OnboardingModal onClose prop optional
  - ✅ **MenuToggle Refactor:** Converted from direct DOM manipulation to proper React state management
  - ✅ **Final Status:** 54 tests passing, 1 skipped (allows skipping onboarding - serial execution conflict), 0 failing
  - ✅ **Improvement:** Increased from 33 baseline passing tests to 54 passing tests (21 tests fixed)
  - ✅ **Branch:** feature/sprint8b-fixme-tests - 3 commits pushed and ready for review

### 🔄 In Progress

- **None** - All planned sprints completed!

### ✅ E2E Test Run & Fix Results

- ✅ **Fixed API Guard Injection Issue:**
  - ✅ Fixed "Invalid guard passed to @UseGuards()" error in TenantProvisioningController
  - ✅ Added `AuthModule` import to `TenantModule` for proper DI of AuthGuard
  - ✅ API now starts successfully with `pnpm -C api start`

- ✅ **Cross-Platform E2E Test Script:**
  - ✅ Added `scripts/run-e2e.ps1` (PowerShell) for Windows-native E2E test runs, mirroring the existing `scripts/run-e2e.sh` (Bash/WSL/Linux/macOS).
  - ✅ Added port cleanup functionality to both scripts to prevent port conflicts.
  - ✅ Updated documentation in `SETUP.md` to reflect both options and usage.

- ✅ **E2E Test Run & Results:**
  - ✅ Ran full E2E suite after enabling all previously skipped tests
  - ✅ **23 tests passed** (smoke tests, public pages, basic navigation)
  - ❌ **29 tests failed** (authentication and page rendering issues)
  - ⏭️ **3 tests did not run** (skipped as expected)

- **E2E Test Failure Analysis (Sprint 8 Backlog):**
  - **14 failures:** Direct page navigation returns `net::ERR_ABORTED` (no auth context)
  - **11 failures:** Page content not rendering after navigation (auth not propagated to React)
  - **2 failures:** UI elements timing out (events page button never appears)
  - **2 failures:** Onboarding modal not appearing after login
  - **See TASKS.md backlog for detailed next steps**

### ✅ Completed Recent Work

- ✅ **Sprint 6B.6: OpenTelemetry Integration** - Integrated OpenTelemetry SDK with Prometheus and Jaeger exporters
- ✅ **API Test Migration to Vitest:**
  - ✅ Migrated from Jest + ts-jest to Vitest for faster, more reliable test execution
  - ✅ Fixed NestJS DI class-identity mismatch caused by Vitest's TypeScript transformation
  - ✅ Implemented deterministic in-process bootstrap (TestAppModule) with full service injection
  - ✅ Resolved AuthGuard injection in controller decorators via prototype patching
  - ✅ Added comprehensive service caching and getter-based DI resolution
  - ✅ All 38 test files (284 tests) passing with 100% success rate
  - ✅ Tests now run in ~13 seconds with full coverage reporting

**Key Fix:** The NestJS DI class-identity mismatch under Vitest was solved by:
1. Pre-resolving all services into a global cache after app initialization
2. Patching AuthGuard CLASS prototype (not instance) after app.init() for controller decorators
3. Deleting own properties from instances to allow prototype getters to work
4. This ensures both global APP_GUARD and controller-level @UseGuards(AuthGuard) work correctly

- **Sprint 7: Production Migration & System Hardening**
  - ✅ **PostgreSQL Multi-tenant Architecture Design:**
    - ✅ Created system metadata database schema (`system-schema.prisma`) with Tenant, TenantSettings, TenantUsage, SystemUser, and SystemAuditLog models
    - ✅ Created tenant database schema (`tenant-schema.prisma`) by removing Church model and preparing for single-tenant context
    - ✅ Generated Prisma clients for both system and tenant databases
    - ✅ Implemented multi-tenant Prisma service with connection pooling and tenant-aware client management
  - ✅ **Self-Service Tenant Provisioning:**
    - ✅ Created TenantProvisioningService with automated database creation, resource limits, and security controls
    - ✅ Implemented TenantProvisioningController with REST API endpoints for tenant lifecycle management
    - ✅ Created TenantModule to wire together provisioning components
    - ✅ Integrated tenant module into main application
  - ✅ **Prisma Multi-tenant Datastore Implementation:** Completed PrismaMultiTenantDataStore service with full DataStore interface compliance, tenant-aware database operations, and comprehensive CRUD operations for all entities. Fixed lint issues by prefixing unused parameters with underscores, reducing total project errors from 18 to 13.
- ✅ **Sprint 7: API Test Pipeline Fixes**
  - ✅ Fixed port conflicts in test setup by using dynamic port allocation with get-port
  - ✅ Fixed AuthGuard unit test failures by adding early token validation and proper mock setup
  - ✅ Ensured Prisma client generation in CI workflows
  - ✅ **Pipeline Validation:** All 284 tests pass (38 test files) with full coverage reporting - ready for CI/CD deployment

### 📝 Backlog / Upcoming

## Phase 1: Complete Core Initial Release Features

## Phase 2: Admin Experience & Polish

- **E2E Test Stabilization & Authentication Fixes:**
  - ✅ **Completed:** Fixed authentication method changes from click-based to cookie-based login across all E2E tests
  - ✅ **Completed:** Updated LoginPage to set demo_token and session_provider cookies directly with httpOnly: true
  - ✅ **Completed:** Exempted /prayer route from middleware authentication for public access
  - ✅ **Completed:** Added login beforeEach hooks to all test suites requiring authentication
  - ✅ **Completed:** Fixed households test selector to use heading role instead of link name
  - ✅ **Completed:** Updated dashboard tests with correct loading state detection and selectors
  - ✅ **Completed (Sprint 8B):** Fixed all 3 remaining fixme tests (dashboard landmarks, admin CRUD, onboarding full flow)
  - ✅ **Completed (Sprint 8B):** Resolved React Server Component violations and archived member display issues
  - ✅ **Final Status:** 54/55 E2E tests passing (98% success rate, up from 60% initially)
  - **Remaining:** 1 test skipped (allows skipping onboarding) due to serial execution conflict - not blocking

- **Complete CRUD Operations for All Entities:**
  - **Backend:** Implement full Create, Read, Update, Delete operations for missing database entities (groups, announcements, funds, contributions, households, children).
  - **Soft Delete Implementation:** Extend soft delete functionality to remaining entities to maintain data integrity and audit trails.
    - **Current Status:** Schema includes `deletedAt` fields for all tables. Users and events have full soft delete (create/update/delete/listDeleted/undelete). Some join tables (group_members, document_permissions, announcement_audiences) have soft delete.
    - **Missing:** Groups, announcements, funds, contributions, households, and children lack delete operations entirely.
  - **Frontend:** Implement soft delete UI for all entities (show archived items, recovery buttons, "Archived" status badges).
    - **Current Status:** Events have basic soft delete UI (show archived checkbox, recover button, "Archived" status badge).
    - **Missing:** All other entities lack soft delete UI and admin controls for viewing/managing archived items.

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

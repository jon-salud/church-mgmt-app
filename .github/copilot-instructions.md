# AI Agent Workflow for Church Management App

This guide outlines the standardized workflow for AI agents when handling user prompts in this church management application.

## Core Principles

1. **Certainty Before Action:** Achieve absolute certainty of the user's expectations and goals before starting any work. Ask clarifying questions to confirm assumptions, even if the task seems clear. The goal is to achieve zero doubt about the requirements.
2. **Codebase as Source of Truth:** The actual codebase files are the source of truth for the current code state. If documentation like `TASKS.md` is out of sync, the code prevails, and the documentation must be updated.
3. **User Request Supersedes:** Always prioritize the user's current, explicit request over any conflicting information in this document or other project files.
4. **Regression Prevention (MUST):** Before making any code changes, systematically review where methods, functions, or components are used to identify dependencies. If fundamental changes risk breaking existing functionality, introduce new implementations or update incrementally to ensure no regressions. Use code search and analysis tools to identify dependencies, such as those that search the entire codebase to list all usages (e.g., `list_code_usages`), perform text searches (e.g., `grep_search`), or semantic queries (e.g., `semantic_search`), and validate through comprehensive testing and builds.

## Workflow Steps

When a user submits a prompt to the AI Agent:

1. **Understand the Task**
   - Begin by reading the `TASKS.md` file to understand the current state of the project and the backlog
   - Cross-reference the source of truth documents (all files in `docs/source-of-truth/`) to ensure deep understanding of feature requirements and acceptance criteria
   - Ask clarifying questions to resolve any ambiguities and achieve zero doubt about requirements

2. **Formulate a Plan**
   - Create a detailed, step-by-step plan based on the source of truth documents
   - Review usages of any methods, functions, or components to be changed using code search and analysis tools, such as those that search the entire codebase to list all usages (e.g., `list_code_usages`), perform text searches (e.g., `grep_search`), or semantic queries (e.g., `semantic_search`) to prevent regressions
   - Review the plan for robustness, identifying potential challenges and outlining workarounds and solutions
   - Present the plan to the user, highlighting any risks, and wait for explicit approval before proceeding
   - The plan must include a final documentation update and submission step

3. **Define Tests First (TDD)**
   - Before implementing any code changes, write or update tests to define the expected behavior
   - Use existing test files and add new ones if insufficient coverage
   - Ensure tests cover happy path, edge cases, and error conditions
   - Run tests to confirm they fail initially (red phase)

4. **Execute and Verify**
   - Upon approval, implement the plan, making tests pass (green phase)
   - Write minimal code to satisfy test requirements
   - Refactor code while keeping tests passing (refactor phase)
   - After each modification to the codebase, verify the changes using read-only tools

5. **Test Implementation**
   - Ensure no build failures and run all tests to validate the changes
   - Verify that all existing functionality still works correctly

6. **Update Documentation**
   - Update `TASKS.md` to reflect the progress of the task (e.g., moving it from "In Progress" to "Completed")
   - As part of the same branch/PR, update all relevant files in `docs/source-of-truth/` to reflect the new or updated features
   - Make documentation updates in separate commits from code changes for clarity
   - Ask the user to confirm each documentation update to keep them informed
   - If changes impact the product's features or requirements, update `PRD.md` and `USER_MANUAL.md` accordingly
   - Append any new findings or follow-up tasks to the backlog in `TASKS.md`

7. **Submit the Work**
   - Once all steps are complete and verified, commit and push the feature changes with proper title and description
   - Ensure that both code and documentation changes are reviewed and merged together in the same PR to keep the codebase and docs in sync

## Product Overview

A church management system with:

- Member directory with role-based access
- Groups/ministries management
- Events and attendance tracking
- Announcements and communications
- Manual giving records
- Pastoral care and prayer request system
- Child check-in safety features
- PWA capabilities with offline support

## Architecture Overview

- **Monorepo Structure** (`pnpm` workspaces):
  - `api/` - NestJS API with mock/Prisma data stores
  - `web/` - Next.js 13+ frontend with App Router
  - Cross-cutting: TypeScript, OpenAPI, E2E tests

### Key Design Patterns

1. **Data Layer Abstraction**
   - `DataStore` interface defined by `api/src/mock/mock-database.service.ts`
   - Mock store is default for development (`DATA_MODE=mock`)
   - Prisma schema ready for future persistent storage

2. **Frontend Architecture**
   - App Router pages in `web/app/`
   - Shared UI components in `web/components/`
   - PWA capabilities via service worker

## Development Workflow

### Essential Commands

```bash
# Install dependencies
pnpm install

# Development servers
pnpm dev:api:mock     # API on port 3001
pnpm -C web dev       # Web on port 3000

# Code Quality
pnpm lint             # Check linting issues
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting

# Testing
pnpm -C api test      # API tests (Vitest)
pnpm test:e2e:mock    # E2E tests
```

### Testing Patterns

- E2E tests use `demo-admin` token (set via cookie)
- API tests run against mock data store using Vitest for faster, more reliable execution
- Test files follow feature-based organization:
  - API: `api/test/*.spec.ts`
  - E2E: `web/e2e/*.spec.ts`

### Key Integration Points

1. **API Client**
   - Generated from OpenAPI spec
   - Base URL configurable via env vars
   - See `web/lib/api.client.ts`

2. **Authentication**
   - Development: Uses demo tokens
   - Production: OAuth via Google/Facebook
   - JWT token handling in middleware

3. **PWA Implementation**
   - Service worker in `web/public/service-worker.js`
   - Offline caching for announcements and events
   - Push notification infrastructure (configured but disabled in MVP)
   - See `web/components/service-worker-register.tsx`

## Project Conventions

- **Multi-tenancy**: All entities scoped by `churchId` for data isolation
- **Soft Delete**: All tables implement `deletedAt` timestamp for audit trails
- **Role-Based Access**: Admin/Leader/Member roles with granular permissions
- **Audit Logging**: All changes logged to `storage/audit-log.json`
- **Mock Data**: Canonical seed in `api/src/mock/mock-data.ts`
- **UI Automation**: All interactive elements have unique `id` attributes
- **Type Safety**: Strict TypeScript with DTOs in `api/src/modules/*/dto/`

## Common Development Tasks

### Adding a New Feature

1. **API Changes**
   ```typescript
   // 1. Define DTOs in api/src/modules/your-feature/dto/
   export class YourFeatureDto {
     @IsString()
     name: string;
   }

   // 2. Add to mock-data.ts
   export const mockYourFeatures = [{ id: '1', name: 'Example' }];

   // 3. Update mock-database.service.ts
   @Injectable()
   export class MockDatabaseService {
     async getYourFeature(id: string) {
       return mockYourFeatures.find(f => f.id === id);
     }
   }
   ```

2. **Frontend Changes**
   ```typescript
   // 1. Add page in web/app/your-feature/page.tsx
   export default function YourFeaturePage() {
     return <div>Your Feature</div>;
   }

   // 2. Add to navigation in web/app/layout.tsx
   // 3. Add E2E test in web/e2e/your-feature.spec.ts
   ```

### Working with Mock Data

1. Add mock data in `api/src/mock/mock-data.ts`
2. Update `MockDatabaseService` with new methods
3. Implement in controller using injected `DataStore`

## Technical Guidelines

- **Monorepo Management:** The project uses `pnpm` workspaces. The command to install all dependencies is `pnpm install`.
- **Development Servers:**
  - API (NestJS): `pnpm dev:api:mock` (runs on port 3001)
  - Frontend (Next.js): `pnpm -C web dev` (runs on port 3000)
  - Run servers in the background with `&` and redirect output to log files (e.g., `> api_dev.log &`).
  - If servers fail with `EADDRINUSE`, terminate existing processes with `pkill -f 'pnpm'` and `pkill -f 'node'`.
- **Data Layer:**
  - The application uses a mock datastore for development (`DATA_MODE=mock`).
  - The `DataStore` interface is derived from `api/src/mock/mock-database.service.ts`.
  - When updating the `DataStore` interface, changes must be implemented in both `PrismaDataStore` and `MockDataStoreAdapter`.
- **Testing:**
  - Build: `pnpm -r build`
  - API tests: `pnpm -C api test` (uses Vitest)
  - End-to-end tests: `pnpm test:e2e:mock`
  - To run a single E2E test: `pnpm -C web test:e2e <path_to_spec_file>`
- **Code Quality:**
  - Lint code: `pnpm lint`
  - Auto-fix linting issues: `pnpm lint:fix`
  - Format code: `pnpm format`
  - Check formatting: `pnpm format:check`
  - E2E tests may fail in the remote environment due to missing dependencies. These tests can be skipped if necessary, and the reason should be noted.
- **Authentication:**
  - E2E tests bypass the login UI by setting the `demo_token` cookie to `demo-admin`.
  - The web app uses OAuth with Google/Facebook providers.
- **Styling:** Follow the existing theme and styling conventions using Tailwind CSS and shadcn/ui components.
- **UI Automation:** All interactive elements must have a unique `id` attribute to facilitate end-to-end testing.

## UI Features

- **Theme Switching:** The application supports light and dark themes. A theme switcher component is available in the main layout.
- **Sidebar Navigation:** The sidebar menu uses icons and highlights the active link.

## Common Pitfalls

- Don't assume Prisma DB exists - use mock store
- Watch for port conflicts (3000, 3001)
- Remember to rebuild after certain dep changes
- Verify environment variables when OAuth flows fail
- Check port conflicts if E2E tests fail unexpectedly
- Remember: all entities require `churchId` for multi-tenancy
- Use `hasRole()` utility for role-based UI logic

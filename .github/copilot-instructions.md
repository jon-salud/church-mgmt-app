# AI Agent Workflow for Church Management App

This guide outlines the standardized workflow for AI agents when handling user prompts in this church management application.

## Core Principles

1. **Certainty Before Action:** Achieve absolute certainty of the user's expectations and goals before starting any work. Ask clarifying questions to confirm assumptions, even if the task seems clear. The goal is to achieve zero doubt about the requirements.
2. **Codebase as Source of Truth:** The actual codebase files are the source of truth for the current code state. If documentation like `TASKS.md` is out of sync, the code prevails, and the documentation must be updated.
3. **User Request Supersedes:** Always prioritize the user's current, explicit request over any conflicting information in this document or other project files.
4. **Regression Prevention (MUST):** Before making any code changes, systematically review where methods, functions, or components are used to identify dependencies. If fundamental changes risk breaking existing functionality, introduce new implementations or update incrementally to ensure no regressions. Use code search and analysis tools to identify dependencies, such as those that search the entire codebase to list all usages (e.g., `list_code_usages`), perform text searches (e.g., `grep_search`), or semantic queries (e.g., `semantic_search`), and validate through comprehensive testing and builds.

## Sprint and Phase Management Protocol (MUST)

This project follows a structured sprint and phase workflow for organizing multi-phase feature development. **You MUST follow this protocol for all sprint-based work.**

### Sprint-Level Workflow

For every sprint (a collection of related phases):

1. **Create Sprint Branch**
   - Branch from `main` with naming: `feature/{sprint-name}-main-sprint`
   - Example: `feature/soft-delete-main-sprint`
   - This branch serves as the integration point for all phases in the sprint

2. **Create Sprint Plan Document**
   - Create a new file: `docs/sprints/{sprint-name}-PLAN.md`
   - Document the overall approved plan for the entire sprint
   - Include: sprint goals, all phases overview, acceptance criteria, timeline
   - This is NOT a task tracking file - it's the strategic plan document

3. **Sprint Completion**
   - After all phases are complete and merged to the sprint branch
   - Create a Pull Request from sprint branch → `main`
   - PR title: "Sprint: {Sprint Name}"
   - PR includes all completed phases and documentation

### Phase-Level Workflow

For each phase within a sprint:

1. **Move Phase to In Progress**
   - In `TASKS.md`, move the entire phase section from "Backlog" to "🔄 In Progress"
   - Clearly mark which phase you are working on

2. **Create Phase Branch**
   - Branch OFF the sprint branch (not main)
   - Naming convention: `feature/{sprint-name}-phase{N}-{brief-description}`
   - Example: `feature/soft-delete-phase4-giving-frontend`

3. **Create Phase Plan Document**
   - Create: `docs/sprints/{sprint-name}-phase{N}-PLAN.md`
   - Document the approved implementation plan for this specific phase
   - Include: detailed technical approach, files to modify, testing strategy
   - Written BEFORE implementation begins

4. **Implementation and Review**
   - Implement the phase following the plan
   - Commit and push changes to the phase branch
   - Address all code review feedback with additional commits
   - Run all tests and ensure no regressions

5. **Document Phase Accomplishments**
   - After implementation is complete, append to the phase plan document
   - Add a "## Accomplishments" section at the end
   - Include comprehensive details of what was actually done
   - Note any deviations from the original plan and why
   - Include: files changed, test results, any issues resolved
   - This captures the reality vs. the plan

6. **Create Phase Pull Request**
   - Create PR from phase branch → sprint branch (NOT to main)
   - PR title: "Phase {N}: {Description}"
   - Reference the phase plan document in PR description

7. **Update TASKS.md**
   - Once PR is merged, move the phase from "In Progress" to "✅ Completed"
   - Add accomplishment summary with commit hashes
   - Keep documentation in sync with actual state

### File Organization

```
docs/
  sprints/
    soft-delete-PLAN.md                    # Sprint overview (no phase designation)
    soft-delete-phase1-PLAN.md             # Phase 1 plan + accomplishments
    soft-delete-phase2-PLAN.md             # Phase 2 plan + accomplishments
    soft-delete-phase3-PLAN.md             # Phase 3 plan + accomplishments
    ...
```

### Branch Structure

```
main
  └─ feature/soft-delete-main-sprint
       ├─ feature/soft-delete-phase1-users-events-backend
       ├─ feature/soft-delete-phase2-groups-announcements-frontend
       ├─ feature/soft-delete-phase3-giving-backend
       └─ feature/soft-delete-phase4-giving-frontend
```

### Key Rules

- **NEVER** create a phase branch from `main` - always from the sprint branch
- **NEVER** merge a phase directly to `main` - always to sprint branch first
- **ALWAYS** create the sprint plan before starting any phases, and create each phase plan before starting that phase's implementation
- **ALWAYS** append accomplishments to phase plan after completion
- **ALWAYS** update `TASKS.md` to reflect current sprint/phase status
- Plan documents are strategic/historical records, NOT task lists

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
- **Never commit `api/storage/audit-log.json`** - This file grows every time E2E tests run as the application logs all actions. It should always be excluded from version control.

## Cross-Platform Development

- **Line Ending Normalization:** The `.gitattributes` file ensures consistent LF line endings for text files across all platforms
- **Pre-commit Hooks:** Automatic code quality checks (linting, formatting, type checking) run before each commit
- **CI Pipeline:** Includes encoding and line ending validation to prevent platform-specific issues
- **Platform Scripts:** The standard way to run end-to-end tests is with `pnpm test:e2e:mock`, which works in most local development environments. However, if your shell or environment does not support the `pnpm` command directly (such as in certain CI/CD pipelines or when running tests outside of a Node.js shell), use the platform-specific scripts provided: `scripts/run-e2e.sh` for Unix/macOS and `scripts/run-e2e.ps1` for Windows. These scripts ensure the correct environment and dependencies are set up for E2E testing on your platform.
- **File Transfers:** When moving files between macOS and Windows, always run `pnpm format` to fix encoding issues

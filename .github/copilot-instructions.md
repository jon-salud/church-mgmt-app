# AI Agent Workflow for Church Management App

This guide outlines the standardized workflow for AI agents when handling user prompts in this church management application.

## Workflow Steps

When a user submits a prompt to the AI Agent:

1. **Create a branch from latest main**
   - Start by creating a new branch from the latest main branch to isolate changes.

2. **AI Agent expands the prompt by coming up with a plan**
   - Based on the source of truth documents (all files in `docs/source-of-truth/`), develop a detailed plan to attack the task.

3. **AI Agent challenges the plan**
   - Review the plan for robustness, identifying potential challenges and outlining workarounds and solutions.

4. **AI Agent shows the plan and waits for approval**
   - Present the plan to the user, highlighting any risks, and wait for explicit approval before proceeding.

5. **AI Agent defines tests first (TDD)**
   - Before implementing any code changes, write or update tests to define the expected behavior
   - Use existing test files and add new ones if insufficient coverage
   - Ensure tests cover happy path, edge cases, and error conditions
   - Run tests to confirm they fail initially (red phase)

6. **AI Agent executes the plan**
   - Upon approval, implement the plan, making tests pass (green phase)
   - Write minimal code to satisfy test requirements
   - Refactor code while keeping tests passing (refactor phase)

7. **AI Agent tests the implementation**
   - Ensure no build failures and run all tests to validate the changes.

8. **Update TASKS.md**
   - Mark completed tasks as done in #file:../docs/TASKS.md. Add any technical debts to the backlog.

9. **Commit and push feature branch**
   - Commit and push the feature changes with a proper title and description.

10. **Update source-of-truth documents in the same feature branch/PR**
    - As part of the feature branch, update all relevant files in `docs/source-of-truth/` to reflect the new or updated features.
    - Make documentation updates in separate commits from code changes for clarity.
    - Ask the user to confirm each documentation update to keep them informed.
    - Ensure that both code and documentation changes are reviewed and merged together in the same PR to keep the codebase and docs in sync.

11. **Review and align USER_MANUAL.md**
    - Consider reprioritizing the backlog logically based on project knowledge. Review and align #file:../docs/USER_MANUAL.md with the latest progress.

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
pnpm format:fix       # Auto-fix code formatting

# Testing
pnpm -C api test      # API tests
pnpm test:e2e:mock    # E2E tests
```

### Testing Patterns

- E2E tests use `demo-admin` token (set via cookie)
- API tests run against mock data store
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

## Common Pitfalls

- Don't assume Prisma DB exists - use mock store
- Watch for port conflicts (3000, 3001)
- Remember to rebuild after certain dep changes
- Verify environment variables when OAuth flows fail
- Check port conflicts if E2E tests fail unexpectedly
- All entities require `churchId` for multi-tenancy
- Use `hasRole()` utility for role-based UI logic

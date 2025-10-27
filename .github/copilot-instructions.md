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

5. **AI Agent executes the plan**
   - Upon approval, implement the plan, including adding additional unit, UI, and API tests when applicable.

6. **AI Agent tests the implementation**
   - Ensure no build failures and run all tests to validate the changes.

7. **Update TASKS.md**
   - Mark completed tasks as done in #file:TASKS.md. Add any technical debts to the backlog.

8. **Update source of truth documents**
   - Propose updates to the source of truth documents, but ask the user to confirm each update to keep them informed.

9. **Review and align USER_MANUAL.md**
   - Consider reprioritizing the backlog logically based on project knowledge. Review and align #file:USER_MANUAL.md with the latest progress.

10. **Commit and push changes**
    - Commit and push the changes with a proper title and description.

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

## Feature Implementation Status

### Core Features

- Member management with role-based permissions
- Groups/ministries with many-to-many memberships
- Events with attendance tracking and reporting
- Announcements with read tracking
- Manual giving records and fund management

### Recently Completed

- Pastoral Care & Prayer Request system
  - Public prayer wall with moderation
  - Confidential pastoral care tickets
- Child Check-In and Safety feature
- Household data model implementation
- PWA offline capabilities

## Data Models & Relationships

### Core Entities

1. **User & Profile**
   - Users have one Profile
   - Users can belong to multiple Groups
   - Users can be linked to one Household

2. **Groups & Memberships**
   - Many-to-many User↔Group relationships
   - Membership fields: role, status, joinedAt
   - Group types: GeographicalMinistry, ServiceMinistry, VolunteerTeam, SmallGroup

3. **Household Model**
   - Links family members together
   - Supports multiple guardians for children
   - Used for Child Check-In features

4. **Events & Attendance**
   - Events can be linked to Groups
   - Attendance tracking per event
   - Support for public/private visibility

5. **Pastoral Care**
   - Prayer requests with moderation workflow
   - Confidential care tickets with staff-only access
   - Threaded comments for internal communication

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

## Testing Strategy

### API Tests

- Unit tests in `api/test/unit/`
- Integration tests in `api/test/*.spec.ts`
- Mock data store used for all tests
- Coverage reporting in CI pipeline

### E2E Tests

- Playwright tests in `web/e2e/`
- Feature-based organization (e.g., `checkin.spec.ts`, `prayer.spec.ts`)
- Uses `demo-admin` token for auth
- Test recordings stored in `web/test-results/`

### Test Commands

```bash
# API Tests
pnpm -C api test                # Run all API tests
pnpm -C api test -- --coverage  # Generate coverage report

# E2E Tests
pnpm test:e2e:mock             # Run all E2E tests
pnpm -C web test:e2e <file>    # Run specific test file
```

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

   // 2. Add to navigation
   // web/app/layout.tsx or relevant parent
   <Link href="/your-feature">Your Feature</Link>

   // 3. Add E2E test
   // web/e2e/your-feature.spec.ts
   test('should display your feature', async ({ page }) => {
     await page.goto('/your-feature');
   });
   ```

### Working with Mock Data

1. Add mock data in `api/src/mock/mock-data.ts`
2. Update `MockDatabaseService` with new methods
3. Implement in controller using injected `DataStore`

### Debugging Tips

1. API debugging:
   - Check Swagger docs at `/docs`
   - Use structured logs (`LOG_LEVEL=debug`)
   - Monitor audit log for changes

2. Frontend debugging:
   - React DevTools for component inspection
   - Network tab for API calls
   - Service Worker tab for PWA issues

### Environment Setup

1. **Initial Setup**

   ```bash
   corepack enable              # Enable pnpm
   pnpm install                # Install dependencies
   cp api/.env.example api/.env  # Configure API env
   cp web/.env.example web/.env  # Configure web env
   ```

2. **Development Flow**

   ```bash
   # Terminal 1 - API
   pnpm dev:api:mock     # Start API on 3001

   # Terminal 2 - Web
   pnpm -C web dev      # Start web on 3000
   ```

3. **Environment Variables**
   - API: `LOG_LEVEL`, `SENTRY_DSN`, `AUDIT_LOG_FILE`
   - Web: `NEXT_PUBLIC_API_BASE_URL`, `API_BASE_URL`
   - OAuth: Configure provider credentials in `api/.env`

## Common Tasks

### Adding New Features

1. Define DTOs and routes in API controllers
2. Implement mock data in `api/src/mock/mock-data.ts`
3. Add API tests in `api/test/`
4. Create frontend pages in `web/app/`
5. Add E2E tests in `web/e2e/`

### Debugging

- API Swagger docs: [http://localhost:3001/docs](http://localhost:3001/docs)
- Mock data store inspection via API endpoints
- E2E test recordings in `web/test-results/`

## Project Conventions

- Use shadcn-style UI components
- Follow existing file/folder structure for new features
- Maintain type safety across API boundaries
- Keep mock data realistic for demo purposes

## Environment & Configuration

### Authentication

- OAuth providers (Google/Facebook) need configuration in `api/.env`:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
  - `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `FACEBOOK_CALLBACK_URL`
- Development uses `demo-admin` token by default
- JWT stored in httpOnly `session_token` cookie

### Observability

- Structured logging via pino (`LOG_LEVEL` control)
- Sentry integration available (`SENTRY_DSN`)
- Metrics endpoint at `/api/v1/metrics` (Prometheus-compatible)
- Audit logs persist to `storage/audit-log.json` (configurable)

## Common Pitfalls

- Don't assume Prisma DB exists - use mock store
- Watch for port conflicts (3000, 3001)
- Remember to rebuild after certain dep changes
- Verify environment variables when OAuth flows fail
- Check port conflicts if E2E tests fail unexpectedly

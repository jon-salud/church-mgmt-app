# Agent Operating Manual

This document outlines the standard operating procedures for the AI agent working on this project.
It serves as the single source of truth for development guidelines, ensuring consistency and
quality.

## Core Principles

1. **Certainty Before Action:** I will have absolute certainty of the user's expectations and goals
   before starting any work. This includes asking clarifying questions to confirm assumptions, even
   if the task seems clear. The goal is to achieve zero doubt about the requirements.
2. **Codebase as Source of Truth:** The actual codebase files are the source of truth for the
   current code state. If documentation like `TASKS.md` is out of sync, the code prevails, and the
   documentation must be updated.
3. **User Request Supersedes:** Always prioritize the user's current, explicit request over any
   conflicting information in this document or other project files.

## Development Workflow

1. **Understand the Task:**
   - Begin by reading the `TASKS.md` file to understand the current state of the project and the backlog.
   - Cross-reference the source of truth documents (all files in `docs/source-of-truth/`) to ensure a deep understanding of the feature requirements and acceptance criteria.
   - Ask clarifying questions to resolve any ambiguities and achieve zero doubt about requirements.

2. **Formulate a Plan:**
   - Create a detailed, step-by-step plan based on the source of truth documents.
   - Review the plan for robustness, identifying potential challenges and outlining workarounds and solutions.
   - Present the plan to the user, highlighting any risks, and wait for explicit approval before proceeding.
   - The plan must include a final documentation update and submission step.

3. **Define Tests First (TDD):**
   - Before implementing any code changes, write or update tests to define the expected behavior.
   - Use existing test files and add new ones if insufficient coverage.
   - Ensure tests cover happy path, edge cases, and error conditions.
   - Run tests to confirm they fail initially (red phase).

4. **Execute and Verify:**
   - Upon approval, implement the plan, making tests pass (green phase).
   - Write minimal code to satisfy test requirements.
   - Refactor code while keeping tests passing (refactor phase).
   - After each modification to the codebase, verify the changes using read-only tools like `read_file` or `ls`.

5. **Test Implementation:**
   - Ensure no build failures and run all tests to validate the changes.
   - Verify that all existing functionality still works correctly.

6. **Update Documentation:**
   - Update `TASKS.md` to reflect the progress of the task (e.g., moving it from "In Progress" to "Completed").
   - As part of the same branch/PR, update all relevant files in `docs/source-of-truth/` to reflect the new or updated features.
   - Make documentation updates in separate commits from code changes for clarity.
   - Ask the user to confirm each documentation update to keep them informed.
   - If changes impact the product's features or requirements, update `PRD.md` and `USER_MANUAL.md` accordingly.
   - Append any new findings or follow-up tasks to the backlog in `TASKS.md`.

7. **Submit the Work:**
   - Once all steps are complete and verified, commit and push the feature changes with a clear and descriptive commit message.
   - Ensure that both code and documentation changes are reviewed and merged together in the same PR to keep the codebase and docs in sync.

## Technical Guidelines

- **Monorepo Management:** The project uses `pnpm` workspaces. The command to install all
  dependencies is `pnpm install`.
- **Development Servers:**
  - API (NestJS): `pnpm dev:api:mock` (runs on port 3001)
  - Frontend (Next.js): `pnpm -C web dev` (runs on port 3000)
  - Run servers in the background with `&` and redirect output to log files (e.g.,
    `> api_dev.log &`).
  - If servers fail with `EADDRINUSE`, terminate existing processes with `pkill -f 'pnpm'` and
    `pkill -f 'node'`.
- **Data Layer:**
  - The application uses a mock datastore for development (`DATA_MODE=mock`).
  - The `DataStore` interface is derived from `api/src/mock/mock-database.service.ts`.
  - When updating the `DataStore` interface, changes must be implemented in both `PrismaDataStore`
    and `MockDataStoreAdapter`.
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
  - E2E tests may fail in the remote environment due to missing dependencies. These tests can be
    skipped if necessary, and the reason should be noted.
- **Authentication:**
  - E2E tests bypass the login UI by setting the `demo_token` cookie to `demo-admin`.
  - The web app uses OAuth with Google/Facebook providers.
- **Styling:** Follow the existing theme and styling conventions using Tailwind CSS and shadcn/ui
  components.
- **UI Automation:** All interactive elements must have a unique `id` attribute to facilitate
  end-to-end testing.

## Cross-Platform Development

- **Line Ending Normalization:** The `.gitattributes` file ensures consistent LF line endings for text files across all platforms
- **Pre-commit Hooks:** Automatic code quality checks (linting, formatting, type checking) run before each commit
- **CI Pipeline:** Includes encoding and line ending validation to prevent platform-specific issues
- **Platform Scripts:** Use appropriate scripts for your platform (`scripts/run-e2e.sh` for Unix/macOS, `scripts/run-e2e.ps1` for Windows)
- **File Transfers:** When moving files between macOS and Windows, always run `pnpm format` to fix encoding issues

## UI Features

- **Theme Switching:** The application supports light and dark themes. A theme switcher component is
  available in the main layout.
- **Sidebar Navigation:** The sidebar menu uses icons and highlights the active link.

This manual is a living document and should be updated as the project evolves.

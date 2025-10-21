# Agent Operating Manual

This document outlines the standard operating procedures for the AI agent working on this project. It serves as the single source of truth for development guidelines, ensuring consistency and quality.

## Core Principles

1. **Certainty Before Action:** I will have absolute certainty of the user's expectations and goals before starting any work. This includes asking clarifying questions to confirm assumptions, even if the task seems clear. The goal is to achieve zero doubt about the requirements.
2. **Codebase as Source of Truth:** The actual codebase files are the source of truth for the current code state. If documentation like `TASKS.md` is out of sync, the code prevails, and the documentation must be updated.
3. **User Request Supersedes:** Always prioritize the user's current, explicit request over any conflicting information in this document or other project files.

## Development Workflow

1. **Understand the Task:**
    * Begin by reading the `TASKS.md` file to understand the current state of the project and the backlog.
    * Cross-reference the `PRD.md` to ensure a deep understanding of the feature requirements and acceptance criteria.
    * Ask clarifying questions (`request_user_input`) to resolve any ambiguities.

2. **Formulate a Plan:**
    * Create a detailed, step-by-step plan using `set_plan`.
    * The plan must include a final submission step.

3. **Execute and Verify:**
    * Work through the plan step-by-step.
    * After each modification to the codebase, verify the changes using read-only tools like `read_file` or `ls`.

4. **Update Documentation:**
    * Update `TASKS.md` to reflect the progress of the task (e.g., moving it from "In Progress" to "Completed").
    * If the changes impact the product's features or requirements, update `PRD.md` accordingly.
    * Append any new findings or follow-up tasks to the backlog in `TASKS.md`.

5. **Submit the Work:**
    * Once all steps are complete and verified, submit the changes using `submit` with a clear and descriptive commit message.

## Technical Guidelines

* **Monorepo Management:** The project uses `pnpm` workspaces. The command to install all dependencies is `pnpm install`.
* **Development Servers:**
  * API (NestJS): `pnpm dev:api:mock` (runs on port 3001)
  * Frontend (Next.js): `pnpm -C web dev` (runs on port 3000)
  * Run servers in the background with `&` and redirect output to log files (e.g., `> api_dev.log &`).
  * If servers fail with `EADDRINUSE`, terminate existing processes with `pkill -f 'pnpm'` and `pkill -f 'node'`.
* **Data Layer:**
  * The application uses a mock datastore for development (`DATA_MODE=mock`).
  * The `DataStore` interface is derived from `api/src/mock/mock-database.service.ts`.
  * When updating the `DataStore` interface, changes must be implemented in both `PrismaDataStore` and `MockDataStoreAdapter`.
* **Testing:**
  * API tests: `pnpm -C api test`
  * End-to-end tests: `pnpm test:e2e:mock`
  * To run a single E2E test: `pnpm -C web test:e2e <path_to_spec_file>`
  * E2E tests may fail in the remote environment due to missing dependencies. These tests can be skipped if necessary, and the reason should be noted.
* **Authentication:**
  * E2E tests bypass the login UI by setting the `demo_token` cookie to `demo-admin`.
  * The web app requires Auth0 environment variables in `web/.env.local`.
* **Styling:** Follow the existing theme and styling conventions using Tailwind CSS and shadcn/ui components.

This manual is a living document and should be updated as the project evolves.

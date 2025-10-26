# Development Environment Setup

This document provides instructions for setting up and running the Church Management System for
local development.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 20 or higher.
- **pnpm**: Enabled via `corepack enable`.
- **PostgreSQL**: Optional, as the system is configured to use an in-memory mock datastore for
  development by default.

## 2. Initial Installation

1. **Enable pnpm**:

   ```bash
   corepack enable
   ```

2. **Install Monorepo Dependencies**: From the root directory of the project, run:

   ```bash
   pnpm install
   ```

## 3. Environment Configuration

The project requires environment variables for both the backend and frontend applications.

### 3.1. Backend API (`api`)

1. Navigate to the `api` directory.
2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Review the `.env` file: For standard development using the mock datastore, no changes are
   required. If you intend to connect to a real PostgreSQL database, you will need to configure the
   `DATABASE_URL` variable.

### 3.2. Frontend Web App (`web`)

1. Navigate to the `web` directory.
2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Review the `.env` file: You will need to populate the Auth0 configuration variables to enable
   authentication. The application uses Next.js middleware to protect all routes - unauthenticated
   users are automatically redirected to the login page.

## 3.3. Data Management

The application uses a mock datastore for development, which includes soft delete functionality:

- **Soft Delete Behavior**: Records are "archived" rather than permanently deleted, preserving data integrity
- **Recovery**: Admin users can recover archived records through the UI or API
- **Data Persistence**: Mock data is stored in memory and resets on server restart
- **Audit Trail**: All changes are logged to `api/storage/audit-log.json`

## 4. Running the Application

The most common development workflow involves running the backend API and the frontend web
application concurrently.

1. **Start the Backend API (with Mock Data)**: From the root directory, run the following command to
   start the API in watch mode. The logs will be output to `api_dev.log`.

   ```bash
   pnpm dev:api:mock > api_dev.log &
   ```

   The API will be available at `http://localhost:3001`.

2. **Start the Frontend Web App**: From the root directory, run the following command to start the
   Next.js development server. The logs will be output to `web_dev.log`.

   ```bash
   pnpm -C web dev > web_dev.log &
   ```

   The web application will be available at `http://localhost:3000`.

### 4.1. Accessing API Documentation

With the API running, you can access the auto-generated Swagger documentation in your browser at:
`http://localhost:3001/docs`

## 5. Building for Production

To build all packages in the monorepo, run the following command from the root directory:

```bash
pnpm -r build
```

## 6. Running Tests

The project is equipped with a full suite of tests to ensure code quality and prevent regressions.

- **Run All Tests**: To run every test across all workspaces, use the following command from the
  root directory:

  ```bash
  pnpm -r test
  ```

- **Run API Tests**: To run only the backend tests (unit and integration), use:

  ```bash
  pnpm -C api test
  ```

- **Run End-to-End (E2E) Tests**: The E2E tests use Playwright and require the development servers
  to be running.
  1. Start the API and web servers as described in Section 4.
  2. Run the E2E tests:

     ```bash
     pnpm -C web test:e2e
     ```

## 7. Code Quality

The project uses ESLint and Prettier to maintain code quality and consistent formatting.

- **Lint Code**: `pnpm lint`
- **Auto-fix Linting Issues**: `pnpm lint:fix`
- **Format Code**: `pnpm format`
- **Check Formatting**: `pnpm format:check`

VS Code is configured to automatically format code on save and fix linting issues. Before committing
changes, run the quality checks to ensure your code meets the project's standards.

> For more details on the project's architecture, data model, and coding conventions, please refer
> to the relevant documents in the `/docs` directory.

---

## Change Records

### v1.0.0 - Soft Delete Documentation

- **Date**: 2025-10-27
- **Changes**:
  - Added data management section explaining soft delete behavior
  - Documented archive/recovery functionality in mock datastore
  - Added audit trail information

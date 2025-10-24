# Coding Standards

## 1. Introduction

This document outlines the coding standards and best practices for the Church Management SaaS Platform. Adhering to these guidelines is crucial for maintaining a clean, scalable, and maintainable codebase. The goal is to ensure that code is readable, consistent, and easy to reason about for all developers.

---

## 2. General Principles

- **Readability:** Write code for humans first, computers second. Use clear, descriptive names for variables, functions, and classes.
- **Consistency:** Adhere to the patterns and conventions already present in the codebase. Consistency is more important than personal preference.
- **Single Responsibility Principle (SRP):** Each module, class, and function should have one, and only one, reason to change. Keep components small and focused.
- **Don't Repeat Yourself (DRY):** Avoid duplicating code. Abstract and reuse common logic and UI components.

---

## 3. TypeScript Best Practices

- **Strict Mode:** All new code should be written with TypeScript's `strict` mode enabled to catch common errors at compile time.
- **Type Everything:** Avoid using `any`. Provide explicit types for all variables, function parameters, and return values. Use `unknown` for values that are truly unknown and perform type checking.
- **Interfaces over Types (for objects):** For defining the shape of objects, prefer `interface` over `type`. Use `type` for unions, intersections, and primitives.
- **Shared Types:** For types that are used in both the frontend and backend (e.g., data models), define them in a shared location.

---

## 4. Backend (NestJS) Conventions

### 4.1. Architecture

- **Modular Structure:** The backend is organized into feature modules (e.g., `users`, `groups`, `events`). All code related to a specific feature (controller, service, DTOs, etc.) should reside within its respective module directory.
- **Service Layer:** Business logic must reside in the service layer (`*.service.ts`). Controllers should be lean and only responsible for handling HTTP requests, validating input, and calling the appropriate service methods.
- **Data Transfer Objects (DTOs):** Use DTOs with `class-validator` decorators for all incoming request bodies. This ensures that data is validated before it reaches the service layer.

### 4.2. Naming Conventions

- **Files:** Use kebab-case for filenames (e.g., `users.controller.ts`).
- **Classes:** Use PascalCase for class names (e.g., `UsersService`).
- **Methods:** Use camelCase for method names (e.g., `findAll`).

### 4.3. Error Handling

- **Standard Exceptions:** Use NestJS's built-in HTTP exceptions (e.g., `NotFoundException`, `BadRequestException`) to return standard error responses.
- **Error Logging:** All unexpected errors should be logged with a proper logging framework.

---

## 5. Frontend (Next.js) Conventions

### 5.1. Architecture

- **Feature-Based Routing:** The frontend's directory structure in `web/app` mirrors the backend's module structure. Each feature should have its own directory, which corresponds to a URL route (e.g., `/web/app/members` maps to the `/members` URL).
- **Server and Client Components:**
  - **Server Components (`page.tsx`):** Use Server Components for fetching data and performing server-side logic. They should be the entry point for a page.
  - **Client Components (`*-client.tsx`):** Use Client Components for all interactive UI elements that require state, effects, or browser-only APIs. Name them descriptively (e.g., `members-client.tsx`).
  - **Data Flow:** Server Components should fetch data and pass it as props to Client Components. Avoid data fetching directly in Client Components unless absolutely necessary (e.g., for data that changes frequently on the client-side).

### 5.2. Date Handling and Server/Client Consistency

- **Date Formatting:**
  - Use `toISOString().split('T')[0]` for date display to avoid hydration errors
  - Avoid `toLocaleDateString()` and `toLocaleString()` which can cause server/client mismatches
  - For localized date formatting, use client-side components or explicit locale settings
  - Consider using date libraries (like `date-fns`) with explicit locale configuration

- **Server/Client Hydration:**
  - Ensure server and client render identical output to prevent hydration errors
  - Use environment-agnostic methods for data formatting
  - For locale-dependent content, defer formatting to client-side effects
  - Document any components that must be client-side rendered

### 5.3. Filter and State Management

- **Filter State:**
  - Initialize filters with meaningful defaults (e.g., show all vs. show none)
  - Clear visual indication of current filter state
  - Handle empty state explicitly (e.g., empty array vs. null)
  - Document filter behavior in comments

- **Multi-Select Filters:**
  - Use controlled components for filter state
  - Provide "Select All" option when appropriate
  - Show clear feedback about selected state
  - Handle edge cases (no selection, all selected, partial selection)
  - Consider performance implications for large datasets

- **Filter Logic:**
  - Keep filter predicates simple and composable
  - Use early returns for better readability
  - Consider memoization for complex filters
  - Document complex filter logic
  - Test edge cases (empty selection, all selected, invalid values)

### 5.4. Form Handling and State Management

- **Form State:**
  - Use controlled components for form inputs to ensure React is the single source of truth
  - Initialize form state with meaningful default values to avoid undefined states
  - Consider using form libraries like `react-hook-form` for complex forms
  - Always handle loading and error states explicitly in the UI

- **Dropdown Components:**
  - Always provide a default "Select..." or similar placeholder option
  - Include proper ARIA labels and roles for accessibility
  - Implement proper keyboard navigation support
  - Use the `value` prop (not defaultValue) to ensure controlled behavior
  - Handle empty/null states gracefully in both UI and data submission

- **State Updates:**
  - Use proper state update functions (e.g., `setState`) instead of direct mutations
  - Consider using reducers for complex state logic
  - Keep related state together in a single object when managing multiple form fields
  - Implement proper validation before state updates
  - Always handle edge cases (undefined, null, empty strings)

### 5.3. Styling

- **Tailwind CSS:** All styling should be done using Tailwind CSS utility classes. Avoid writing custom CSS files.
- **Theme-Aware Colors:** Use theme-aware utility classes (e.g., `bg-primary`, `text-foreground`) instead of hardcoded colors to support light and dark modes.
- **UI Components:** Use the shared UI components from `web/components/ui` whenever possible to maintain a consistent look and feel.

---

## 6. Git and Version Control

- **Conventional Commits:** All commit messages must follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/). This is essential for automated versioning and changelog generation.
  - **Format:** `<type>(<scope>): <subject>`
  - **Example:** `feat(api): add endpoint for creating users`
- **Small, Focused Commits:** Each commit should represent a single, logical change. Avoid large, monolithic commits that touch many unrelated files.
- **Branching:** Create a new branch for every new feature or bugfix. Branch names should be descriptive (e.g., `feat/add-user-profile-page`).

---

## 7. Code Quality & Formatting

### 7.1. Linting

- **ESLint:** All code must pass ESLint checks without errors. ESLint is configured to enforce TypeScript best practices, code consistency, and error prevention.
- **Prettier:** All code must be formatted according to Prettier's rules. Prettier ensures consistent formatting across the codebase, eliminating formatting-related diffs.
- **IDE Integration:** VS Code is configured to run ESLint and Prettier automatically on save. Format on save is enabled for all supported file types.

### 7.2. Code Quality Commands

- **Lint Code:** `pnpm lint` - Check for linting issues
- **Fix Linting Issues:** `pnpm lint:fix` - Automatically fix linting issues where possible
- **Format Code:** `pnpm format` - Format all code files with Prettier
- **Check Formatting:** `pnpm format:check` - Verify that all code is properly formatted

### 7.3. Pre-commit Hooks

Before committing code, ensure it passes all quality checks:

```bash
pnpm lint:fix
pnpm format
pnpm lint
```

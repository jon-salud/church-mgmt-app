# Coding Standards

## 1. Introduction

This document outlines the coding standards and best practices for the Church Management SaaS
Platform. Adhering to these guidelines is crucial for maintaining a clean, scalable, and
maintainable codebase. The goal is to ensure that code is readable, consistent, and easy to reason
about for all developers.

---

## 2. General Principles

- **Readability:** Write code for humans first, computers second. Use clear, descriptive names for
  variables, functions, and classes.
- **Consistency:** Adhere to the patterns and conventions already present in the codebase.
  Consistency is more important than personal preference.
- **Single Responsibility Principle (SRP):** Each module, class, and function should have one, and
  only one, reason to change. Keep components small and focused.
- **Don't Repeat Yourself (DRY):** Avoid duplicating code. Abstract and reuse common logic and UI
  components.

---

## 3. TypeScript Best Practices

- **Strict Mode:** All new code should be written with TypeScript's `strict` mode enabled to catch
  common errors at compile time.
- **Type Everything:** Avoid using `any`. Provide explicit types for all variables, function
  parameters, and return values. Use `unknown` for values that are truly unknown and perform type
  checking.
- **Interfaces over Types (for objects):** For defining the shape of objects, prefer `interface`
  over `type`. Use `type` for unions, intersections, and primitives.
- **Shared Types:** For types that are used in both the frontend and backend (e.g., data models),
  define them in a shared location.

---

## 4. Backend (NestJS) Conventions

### 4.1. Architecture

- **Modular Structure:** The backend is organized into feature modules (e.g., `users`, `groups`,
  `events`). All code related to a specific feature (controller, service, DTOs, etc.) should reside
  within its respective module directory.
- **Service Layer:** Business logic must reside in the service layer (`*.service.ts`). Controllers
  should be lean and only responsible for handling HTTP requests, validating input, and calling the
  appropriate service methods.
- **Data Transfer Objects (DTOs):** Use DTOs with `class-validator` decorators for all incoming
  request bodies. This ensures that data is validated before it reaches the service layer.

### 4.1.1 Dependency Injection

- **Token Convention:** Use Symbols for injection tokens to avoid naming conflicts. Format: `export const TOKEN_NAME = Symbol('TOKEN_NAME');`
- **Provider Registration:** Register providers in the module's providers array using the `useClass` pattern for implementations.
- **Repository Interfaces:** Every module with data access must define an interface for its repository (e.g., `IUsersRepository`) and inject it via a token.
- **Service Interfaces:** For cross-module services, define minimal interfaces to enforce ISP.
- **Test Expectations:** Unit tests for services must mock external dependencies (repositories, other services) using the injection tokens. Avoid booting the full `AppModule` in unit tests.

### 4.2. Naming Conventions

- **Files:** Use kebab-case for filenames (e.g., `users.controller.ts`).
- **Classes:** Use PascalCase for class names (e.g., `UsersService`).
- **Methods:** Use camelCase for method names (e.g., `findAll`).

### 4.3. Error Handling

- **Standard Exceptions:** Use NestJS's built-in HTTP exceptions (e.g., `NotFoundException`,
  `BadRequestException`) to return standard error responses.
- **Error Logging:** All unexpected errors should be logged with a proper logging framework.

---

## 5. Frontend (Next.js) Conventions

### 5.1. Architecture

- **Feature-Based Routing:** The frontend's directory structure in `web/app` mirrors the backend's
  module structure. Each feature should have its own directory, which corresponds to a URL route
  (e.g., `/web/app/members` maps to the `/members` URL).
- **Server and Client Components:**
  - **Server Components (`page.tsx`):** Use Server Components for fetching data and performing
    server-side logic. They should be the entry point for a page.
  - **Client Components (`*-client.tsx`):** Use Client Components for all interactive UI elements
    that require state, effects, or browser-only APIs. Name them descriptively (e.g.,
    `members-client.tsx`).
  - **Data Flow:** Server Components should fetch data and pass it as props to Client Components.
    Avoid data fetching directly in Client Components unless absolutely necessary (e.g., for data
    that changes frequently on the client-side).

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

### 5.5. Styling

- **Tailwind CSS:** All styling should be done using Tailwind CSS utility classes. Avoid writing
  custom CSS files.
- **Theme-Aware Colors:** Use theme-aware utility classes (e.g., `bg-primary`, `text-foreground`)
  instead of hardcoded colors to support light and dark modes.
- **UI Components:** Use the shared UI components from `web/components/ui-flowbite/` whenever possible to
  maintain a consistent look and feel. The project uses Flowbite components with custom API-compatible
  wrappers that match the previous Radix UI interface. Legacy components in `web/components/ui/` are
  retained for non-Radix custom implementations.
- **Component Selection:**
  - **Flowbite Components** (`ui-flowbite/`): Alert, Button, Checkbox, Dialog, Dropdown, Input, Label, Modal, Progress, Select, Spinner, Table, Textarea
  - **Legacy Components** (`ui/`): Modal (custom), PageHeader, Card, Table (custom), Progress (custom)

### 5.6. UI Component Guidelines

See [`docs/guides/DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for the comprehensive design system reference. This section provides practical rules for consistent UI implementation.

#### 5.6.1. Design Token Usage

**Color System (HSL-based):**
- Always use CSS custom properties from `web/app/globals.css`:
  - Backgrounds: `--background`, `--background-subtle`
  - Cards: `--card`, `--card-hover`
  - Semantic colors: `--primary`, `--secondary`, `--destructive`, `--muted`
- Never hardcode colors (e.g., `#fff`, `rgb()`, `oklch()`)
- Use Tailwind utilities that map to these tokens: `bg-card`, `text-primary`, `border-border`
- Tokens automatically adapt to light/dark mode

**Border Radius:**
- Use tokens from globals.css: `--radius-sm` (6px), `--radius` (8px), `--radius-lg` (12px), `--radius-xl` (16px), `--radius-full` (pill)
- Cards: `rounded-lg` (12px)
- Buttons: `rounded` (8px)
- Inputs: `rounded` (8px)
- Badges/Pills: `rounded-full`
- Modals: `rounded-lg` (12px)

**Shadows (for elevation/depth):**
- Buttons (default): `shadow-sm` (subtle)
- Cards (resting): `shadow-md` (medium)
- Cards (hover): `shadow-lg` (large, interactive feedback)
- Modals/Dialogs: `shadow-xl` (extra large)
- Avoid `shadow` (default Tailwind) unless specifically needed
- Never use `shadow-2xl` (reserved for tooltips/popovers)

**Typography:**
- Use utility classes from `globals.css`:
  - Display: `.heading-display` (3rem bold, page titles)
  - Headings: `.heading-1` through `.heading-5` (2.25rem → 1rem)
  - Body: `.body-text` (1rem) and `.body-text-sm` (0.875rem)
  - Captions: `.caption-text` (0.75rem) and `.caption-text-xs` (0.625rem)
- Never use arbitrary text sizes (e.g., `text-[18px]`)
- Prefer semantic classes over Tailwind size utilities (e.g., `.heading-2` over `text-2xl font-bold`)

**Spacing:**
- Use Tailwind spacing scale (0.25rem = 1 unit, 0.5rem = 2 units, etc.)
- Standard gaps:
  - Card padding: `p-6` (1.5rem)
  - Section spacing: `space-y-6` (1.5rem)
  - Form field groups: `space-y-4` (1rem)
  - Button groups: `space-x-2` (0.5rem)
  - Tight groups: `space-y-2` (0.5rem)

#### 5.6.2. Component Variants

**Button:**
```tsx
// Primary action (most important on page)
<Button variant="default">Save</Button>

// Secondary action (less important)
<Button variant="outline">Cancel</Button>

// Destructive action (delete, remove)
<Button variant="destructive">Delete</Button>

// Ghost action (minimal visual weight)
<Button variant="ghost">View Details</Button>

// Link action (text-like)
<Button variant="link">Learn More</Button>
```

**Rules:**
- Only ONE primary button (`variant="default"`) per visible section
- Destructive buttons must confirm before action (modal or inline confirmation)
- Loading state: `<Button disabled>{isLoading ? 'Loading...' : 'Submit'}</Button>`
- Icons: left-aligned for actions, right-aligned for navigation

**Card:**
```tsx
// Default card (content container)
<Card className="shadow-md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
</Card>

// Interactive card (clickable, hoverable)
<Card className="shadow-md hover:shadow-lg cursor-pointer transition-shadow">
  {/* Content */}
</Card>

// Elevated card (higher visual priority)
<Card className="shadow-lg">
  {/* Content */}
</Card>
```

**Rules:**
- Default elevation: `shadow-md`
- Interactive cards: add `hover:shadow-lg` and `cursor-pointer`
- Important/modal cards: `shadow-xl`
- Never stack cards inside cards (flatten hierarchy)
- Card padding: `p-6` for content, `p-4` for compact layouts

**Input & Textarea:**
```tsx
// Text input
<Input type="text" placeholder="Enter text" />

// Required field
<Input type="text" required />

// Error state (validation)
<Input type="text" error="This field is required" className="border-destructive" />

// Disabled state
<Input type="text" disabled />

// Textarea (multiline)
<Textarea rows={4} placeholder="Enter description" />
```

**Rules:**
- Always pair with `<Label>` for accessibility
- Show error messages below input (red text, `text-destructive`)
- Use `placeholder` for hints, not as label replacement
- Disabled inputs: `opacity-50 cursor-not-allowed`
- Error state: `border-destructive focus:ring-destructive`

**Select (Dropdown):**
```tsx
<Select value={value} onChange={setValue}>
  <option value="">Select an option</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</Select>
```

**Rules:**
- Always include a default "Select..." option with empty value
- Use `value` (controlled) not `defaultValue` (uncontrolled)
- For accessibility: wrap in `<Label>` or use `aria-label`
- Multi-select: consider checkbox list instead of native `<select multiple>`

#### 5.6.3. Layout Patterns

**Page Header:**
```tsx
<div className="mb-6">
  <h1 className="heading-2 mb-2">Page Title</h1>
  <p className="body-text-sm text-muted-foreground">Optional description</p>
</div>
```

**Form Layout:**
```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="field">Field Label</Label>
    <Input id="field" type="text" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="textarea">Description</Label>
    <Textarea id="textarea" rows={3} />
  </div>
  <div className="flex gap-2 justify-end">
    <Button variant="outline">Cancel</Button>
    <Button variant="default">Submit</Button>
  </div>
</form>
```

**Card Grid (responsive):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="shadow-md">...</Card>
  <Card className="shadow-md">...</Card>
  <Card className="shadow-md">...</Card>
</div>
```

**List Pattern:**
```tsx
<div className="space-y-4">
  {items.map(item => (
    <Card key={item.id} className="shadow-md hover:shadow-lg cursor-pointer transition-shadow">
      {/* Item content */}
    </Card>
  ))}
</div>
```

#### 5.6.4. Accessibility Requirements

**Focus States:**
- All interactive elements must have visible focus indicators
- Universal focus style: `ring-2 ring-ring ring-offset-2 ring-offset-background`
- Never remove focus outlines with `outline-none` without replacement
- Test keyboard navigation (Tab, Shift+Tab, Enter, Escape)

**Motion Preferences:**
- All animations/transitions respect `prefers-reduced-motion` media query
- Default: `transition-all duration-200`
- Reduced motion: `transition-none` or instant changes
- Avoid gratuitous animation (subtle > flashy)

**Color Contrast:**
- All text must meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
- Test in both light and dark modes
- Never rely on color alone to convey information (add icons or text)

**Semantic HTML:**
- Use proper heading hierarchy (`<h1>` → `<h2>` → `<h3>`)
- Use `<button>` for actions, `<a>` for navigation
- Form inputs must have associated `<label>` elements
- Use ARIA attributes when semantic HTML is insufficient

**Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Modal dialogs: trap focus, close on Escape
- Dropdowns: arrow keys for navigation, Enter to select
- Skip links: provide "Skip to main content" for screen readers

#### 5.6.5. Testing UI Changes

Before committing UI changes, verify:

1. **Visual Regression:**
   - Test in both light and dark modes
   - Verify on multiple screen sizes (mobile, tablet, desktop)
   - Check hover states, focus states, active states
   - Confirm shadows, spacing, and typography are consistent

2. **Accessibility:**
   - Run keyboard-only navigation test (unplug mouse)
   - Verify all interactive elements have focus indicators
   - Check color contrast with browser DevTools
   - Test with screen reader (VoiceOver on macOS, NVDA on Windows)

3. **Responsive Design:**
   - Test breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
   - Verify no horizontal scroll on small screens
   - Check touch target sizes (minimum 44x44px for mobile)

4. **Performance:**
   - Avoid excessive re-renders (use React DevTools Profiler)
   - Optimize images (use Next.js `<Image>` component)
   - Minimize layout shifts (reserve space for dynamic content)

#### 5.6.6. Common Mistakes to Avoid

❌ **Don't:**
- Hardcode colors (`bg-white`, `text-black`, hex values)
- Use arbitrary values (`p-[23px]`, `text-[17px]`)
- Mix shadow sizes inconsistently (button with `shadow-xl`, card with `shadow-sm`)
- Skip hover states on interactive elements
- Use `shadow` (Tailwind default) for cards or buttons
- Nest cards inside cards
- Remove focus outlines without replacement
- Use `any` type in TypeScript
- Create one-off component variants (extend existing variants instead)

✅ **Do:**
- Use design tokens (`bg-card`, `text-primary`, `shadow-md`)
- Use standard spacing scale (`p-6`, `gap-4`, `space-y-2`)
- Apply consistent shadows: buttons `shadow-sm`, cards `shadow-md`, modals `shadow-xl`
- Add hover states (`hover:shadow-lg`, `hover:bg-accent`)
- Use `shadow-sm` for buttons, `shadow-md` for cards at rest
- Flatten card hierarchies with sections or dividers
- Maintain visible focus indicators on all interactive elements
- Type everything explicitly (no `any`)
- Reuse existing components and variants from `ui-flowbite/`

---

## 6. Git and Version Control

- **Conventional Commits:** All commit messages must follow the
  [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/). This is
  essential for automated versioning and changelog generation.
  - **Format:** `<type>(<scope>): <subject>`
  - **Example:** `feat(api): add endpoint for creating users`
- **Small, Focused Commits:** Each commit should represent a single, logical change. Avoid large,
  monolithic commits that touch many unrelated files.
- **Branching:** Create a new branch for every new feature or bugfix. Branch names should be
  descriptive (e.g., `feat/add-user-profile-page`).

---

## 7. Code Quality & Formatting

### 7.1. Linting

- **ESLint:** All code must pass ESLint checks without errors. ESLint is configured to enforce
  TypeScript best practices, code consistency, and error prevention.
- **Prettier:** All code must be formatted according to Prettier's rules. Prettier ensures
  consistent formatting across the codebase, eliminating formatting-related diffs.
- **IDE Integration:** VS Code is configured to run ESLint and Prettier automatically on save.
  Format on save is enabled for all supported file types.

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

A pre-commit hook automatically runs these checks on every commit:
- Linting with ESLint
- Code formatting with Prettier
- Type checking with TypeScript

**Husky** is the tool that manages Git hooks for this project. It automatically installs and configures Git hooks based on the `.husky/` directory. The pre-commit hook runs `pnpm pre-commit` which executes all quality checks before allowing the commit to proceed.

### 7.4. Cross-Platform Development

This project supports development across multiple platforms (macOS, Windows, Linux):

- **Line Ending Normalization**: `.gitattributes` ensures consistent LF line endings for text files
- **Encoding Consistency**: Prettier automatically fixes invisible Unicode characters
- **Platform-Specific Scripts**: Use appropriate scripts for your platform (`run-e2e.sh` for Unix/macOS, `run-e2e.ps1` for Windows)

When transferring files between platforms, always run `pnpm format` to prevent encoding issues.

### 7.5. CI/CD Integration

All code quality checks are automatically enforced in the CI pipeline:

- **Linting:** ESLint checks run on every push and pull request
- **Formatting:** Prettier formatting validation runs on every push and pull request
- **Line Endings:** Automatic validation prevents CRLF line endings in text files
- **Type Checking:** TypeScript compilation runs on every push and pull request
- **Tests:** API and E2E tests run with coverage reporting

Code that fails these checks will not be merged until the issues are resolved.

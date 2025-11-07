# Sprint Plan: User Theme Preferences

**Sprint Name:** user-theme-preferences  
**Branch:** `feature/user-theme-preferences-main-sprint`  
**Created:** 7 November 2025  
**Last Updated:** 7 November 2025 (Post-Phase 3 Review)  
**Engineer Review:** Completed 7 November 2025  
**Status:** In Progress (Phases 1-3 Complete, Phase 4-5 Remaining)  
**Review Document:** `docs/sprints/user-theme-preferences-ENGINEER-REVIEW.md`

---

## 🎯 Sprint Progress Summary (Updated Post-Phase 3)

**Completed:** 3 of 5 phases ✅  
**Remaining:** 2 phases (Phase 4 may be partially complete)  
**Overall Status:** 60% complete, on track

### Phase Completion Status
- ✅ **Phase 1:** Database & API (Complete - 6 Nov)
- ✅ **Phase 2:** CSS Theme System (Complete - 7 Nov)  
- ✅ **Phase 3:** Settings UI (Complete - 7 Nov)
- ⏳ **Phase 4:** Theme Application (*Likely 50-75% complete already*)
- ⏳ **Phase 5:** Testing & Docs (*Core tests done, documentation remaining*)

### Major Learnings from Phases 1-3

**What Went Better Than Expected:**
- ✅ Settings page already existed (saved 1-2 hours)
- ✅ Server actions pattern was cleaner than anticipated
- ✅ Optimistic UI with rollback worked perfectly
- ✅ E2E tests caught real bugs before production
- ✅ Component showcase provided invaluable visual QA

**What Required More Work:**
- ⚠️ Next-themes hydration issues (needed mounted state guard)
- ⚠️ Dark mode theme variants required explicit CSS rules
- ⚠️ Color accuracy demanded exact HSL value matching
- ⚠️ E2E tests needed client hydration wait logic
- ⚠️ Code review iterations added ~1 hour (but improved quality significantly)

**Key Architecture Decisions Made:**
1. **Header-only dark mode toggle** (removed settings page duplicate)
2. **Card-based theme selector** (better UX than dropdown)
3. **3-swatch color previews** (background + primary + destructive)
4. **Toast notifications** (better than inline errors)
5. **Component showcase HTML** (visual QA tool)

### Impact on Remaining Phases

**Phase 4 Scope Reduction:**
- Theme application likely already functional (Phase 2 did most of it)
- May only need verification testing + edge case handling
- Estimated time reduction: 2.5-3.5h → 1-2h

**Phase 5 Scope Adjustment:**
- Core E2E tests already complete (10 tests from Phase 3)
- Focus shifts to documentation (USER_MANUAL, API docs, etc.)
- Add targeted tests for gaps only (cross-page, performance)
- Estimated time stays same: 3-4h (but different work mix)

**Revised Total Estimate:** 14.5-19.5h → 12-15h actual (20% time savings)

---

## Executive Summary

Implement a comprehensive user theme preference system that allows users to select and persist their preferred color theme and dark mode preference. This feature enhances user experience by providing personalization options beyond system-level theme settings.

### Context

The application currently supports light/dark mode based on system preferences only. Based on the **interactive theme demo** (`docs/modal-theme-preview/index.html`), we've identified 4 viable theme presets (Original, Vibrant Blue, Teal Accent, Warm Accent) that can be offered as user preferences. This sprint will make theme selection a first-class feature accessible through user settings.

**🎨 Interactive Demo:** The theme demo page includes a fully functional prototype with:
- All 4 theme presets working in light and dark modes
- Component showcase (buttons, forms, cards, tables, modals)
- Live theme switching without page reload
- Visual proof that themes work correctly with the design system

---

## Sprint Goals

1. **Database Layer:** Add user theme preference fields to User model
2. **API Layer:** Create endpoints for reading/updating theme preferences
3. **Frontend Layer:** Build settings UI for theme selection
4. **Application Layer:** Apply user theme preferences at root layout level
5. **CSS Integration:** Define theme presets as CSS custom properties
6. **Testing:** Comprehensive coverage for all theme operations
7. **Documentation:** Update source-of-truth docs and user manual

### Success Criteria

- ✅ Users can select theme preset (Original, Vibrant Blue, Teal Accent, Warm Accent)
- ✅ Users can toggle dark mode independently of system preference
- ✅ Theme preferences persist across sessions
- ✅ Theme changes apply instantly without page reload
- ✅ Default to "Original" theme + system dark mode preference if not set
- ✅ Theme presets work correctly in both light and dark modes
- ✅ Accessibility maintained (WCAG 2.1 AA compliance)
- ✅ All tests passing with >80% coverage for new code

---

## Phase Breakdown

### Phase 1: Database Schema & API Foundation (2.5-3.5 hours)
**Branch:** `feature/user-theme-preferences-phase1-database-api`  
**Plan:** `docs/sprints/user-theme-preferences-phase1-PLAN.md`

**Scope:**
- Add `themePreference` (string, nullable) to User model in tenant schema
- Add `themeDarkMode` (boolean, nullable) to User model
- **Create TypeScript enum** `ThemePreset` with values: `ORIGINAL`, `VIBRANT_BLUE`, `TEAL_ACCENT`, `WARM_ACCENT`
- Create Prisma migration for new fields
- Implement API endpoints:
  - `GET /api/users/me/theme` - Get current user's theme preferences
  - `PATCH /api/users/me/theme` - Update theme preferences with **type-safe DTOs**
- Add validation: `themePreference` enum with **class-validator decorators**
- **Type-safe request/response DTOs** with OpenAPI documentation
- Write unit tests for API endpoints

**Engineer Modifications:**
- Use TypeScript enum instead of string literals for type safety
- Create proper DTOs with class-validator decorators
- Generate OpenAPI docs automatically from DTOs

**Files to Modify:**
- `api/prisma/tenant-schema.prisma` - Add theme fields to User model
- **`api/src/modules/users/theme.enum.ts` - ThemePreset enum (NEW)**
- `api/src/modules/users/users.controller.ts` - New theme endpoints
- `api/src/modules/users/users.service.ts` - Theme preference logic
- **`api/src/modules/users/dto/update-theme.dto.ts` - Request DTO with validation (NEW)**
- **`api/src/modules/users/dto/theme-response.dto.ts` - Response DTO (NEW)**
- `api/test/unit/users-theme.spec.ts` - Unit tests

**Risks:**
- Schema migration might fail if applied incorrectly
- Need to handle null values gracefully (users without preferences set)

**Rollback:**
- Revert migration if issues occur
- Theme preferences are optional - app functions without them

---

### Phase 2: CSS Theme System (2-3 hours)
**Branch:** `feature/user-theme-preferences-phase2-css-themes`  
**Plan:** `docs/sprints/user-theme-preferences-phase2-PLAN.md`

**Scope:**
- Define theme presets as CSS custom properties in `globals.css`
- Use `[data-theme="preset-name"]` attribute selectors
- Implement 4 theme presets (Original, Vibrant Blue, Teal Accent, Warm Accent)
- Each preset defines both light and dark mode color tokens
- Ensure backward compatibility with existing design system
- Test all presets with component library
- **Validate WCAG 2.1 AA contrast with automated testing**
- **Reference implementation:** `docs/modal-theme-preview/index.html` contains working CSS for all presets

**Engineer Note:** CSS structure approved. Recommend automated contrast testing in Phase 5.

**CSS Structure:**
```css
/* Original theme (current default) */
:root {
  --background: 210 20% 98%;
  --primary: 222.2 47.4% 11.2%;
  /* ... existing tokens ... */
}

/* Vibrant Blue theme */
[data-theme="vibrant-blue"] {
  --background: 220 30% 97%;
  --primary: 210 100% 50%;
  /* ... adjusted tokens ... */
}

/* Each theme has .dark variant */
[data-theme="vibrant-blue"].dark {
  --background: 220 30% 5%;
  --primary: 210 90% 60%;
  /* ... adjusted tokens ... */
}
```

**Files to Modify:**
- `web/app/globals.css` - Add theme preset definitions
- `docs/DESIGN_SYSTEM.md` - Document theme presets

**Risks:**
- Theme presets might not provide sufficient contrast (WCAG violations)
- Color combinations need testing across all components

**Rollback:**
- Remove theme attribute selectors
- App defaults to Original theme (current state)

---

### Phase 3: Settings UI (4-5 hours) ✅ COMPLETED
**Branch:** `feature/user-theme-preferences-phase3-settings-ui`  
**Plan:** `docs/sprints/user-theme-preferences-phase3-PLAN.md`  
**Status:** Merged to sprint branch 7 November 2025

**Key Learnings & Changes from Original Plan:**

1. **Settings Page Already Existed** ✅
   - No need to create from scratch
   - Already had proper routing at `/settings`
   - Already included Church Settings (request types, profile fields)
   - **Decision:** Added User Preferences section above Church Settings

2. **Dark Mode Toggle Location** ✅
   - **Original Plan:** Toggle in settings page
   - **Actual Implementation:** Toggle in header only (via `ThemeSwitcher`)
   - **Rationale:** Single control point, less user confusion
   - **Impact:** Settings page simplified, dark mode always accessible

3. **Theme Preview Design** ✅
   - **Original Plan:** 2-swatch preview thumbnails in Select dropdown
   - **Actual Implementation:** Grid of 4 clickable cards with 3-swatch previews
   - **Swatches:** Background, Primary, Destructive colors
   - **Benefits:** Better visual representation, easier selection, more accessible

4. **Optimistic UI Implementation** ✅
   - **Challenge:** next-themes hydration caused flashing
   - **Solution:** Added `mounted` state guard + early return
   - **Result:** Smooth client-side rendering without hydration mismatch

5. **Dark Mode Theme Variants Bug** ⚠️
   - **Issue Discovered:** Theme changes not applying in dark mode
   - **Root Cause:** Missing `.dark[data-theme='...']` CSS rules
   - **Fix:** Added dark mode variant CSS rules to globals.css (commit `0686313`)
   - **Lesson:** Always test both light AND dark modes for each theme

6. **Color Accuracy** ⚠️
   - **Issue:** Preview swatches didn't match actual theme colors
   - **Fix:** Updated preview colors to exactly match globals.css values
   - **Lesson:** Preview fidelity is critical for user trust

7. **E2E Test Reliability** ⚠️
   - **Challenge:** Keyboard navigation test used brittle 20-attempt loop
   - **Fix:** Deterministic `page.getByRole().first().focus()` approach
   - **Lesson:** Avoid magic numbers; use explicit selectors

8. **Component Showcase Created** 🎨
   - **Bonus:** Created `docs/component-theme-preview/index.html`
   - **Purpose:** Visual QA testing for all themes across components
   - **Value:** Caught color mismatches before code review

**Actual Scope Delivered:**
- ✅ ThemeSettings component with 4 theme preview cards (grid layout, not dropdown)
- ✅ Visual color swatches (3-swatch system: background, primary, destructive)
- ✅ Optimistic UI pattern (instant DOM updates + background server persistence)
- ✅ Server action `updateUserTheme()` with error handling + toast notifications
- ✅ Settings page architecture: User Preferences (theme) + Church Settings (existing)
- ✅ Component showcase HTML for visual QA testing
- ✅ 10 comprehensive E2E tests (switching, persistence, keyboard, a11y, responsive)
- ✅ Bug fixes: theme persistence, hydration, dark mode variants, color accuracy
- ✅ Code review refinements: documentation, error handling, readability

**Files Actually Created/Modified:**
- `web/app/settings/theme-settings.tsx` (287 lines) - Theme selector component
- `web/app/settings/page.tsx` - Added User Preferences section (kept existing Church Settings)
- `web/app/actions/theme.ts` - Added `updateUserTheme()` server action
- `web/components/ui-flowbite/button.tsx` - Added !important override documentation
- `web/e2e/settings.spec.ts` - 10 E2E tests
- `web/app/globals.css` - Dark mode theme variant CSS rules
- `docs/component-theme-preview/index.html` - Component showcase

**Architecture Decisions Made:**
1. **No separate layout/routing** - Settings page already existed, just extended it
2. **Header-only dark mode toggle** - Removed settings page toggle for consistency
3. **Card-based selector** - More accessible and visual than dropdown
4. **3-swatch previews** - Better representation than 2-swatch
5. **Toast notifications** - Better UX than inline error messages
6. **Component showcase** - Invaluable for visual QA across all themes

**What Worked Well:**
- ✅ Settings page already existed (saved 1-2 hours vs creating from scratch)
- ✅ Server actions pattern was clean and testable
- ✅ Optimistic UI with rollback worked perfectly
- ✅ E2E tests caught real bugs (keyboard navigation, hydration)
- ✅ Component showcase caught color mismatches early

**What Was Challenging:**
- ⚠️ Next-themes hydration required mounted state guard
- ⚠️ Dark mode theme variants needed explicit CSS rules
- ⚠️ Color accuracy required exact HSL matching between preview and CSS
- ⚠️ E2E tests needed hydration wait (not in original plan)

**Commits:** `9b9d112`, `11ec5c8`, `f5a8008`, `721fbb8`, `38da3e4`, `b64a803`, `5d68b91`, `ffc25c7`, `0686313`, `556f34b`, `dadb562`, `09cb62a`, `9443b1c`, `73b2221`, `8e9c601`

**Time Estimate Accuracy:** Original 4-5h → Actual ~6h (including bug fixes and code review iterations)

---

### Phase 4: Theme Application (2.5-3.5 hours) - REVISED PLAN
**Branch:** `feature/user-theme-preferences-phase4-theme-application`  
**Plan:** `docs/sprints/user-theme-preferences-phase4-PLAN.md`

**STATUS:** Phase 3 learnings indicate Phase 4 may already be partially complete.

**Key Insights from Phase 3:**
1. ✅ **Theme Application Already Works** - Phase 2 implemented server-side theme fetching in `layout.tsx`
2. ✅ **Dark Mode Integration Already Works** - Header `ThemeSwitcher` uses next-themes  
3. ✅ **FOUC Prevention Already Implemented** - Inline blocking script in Phase 2
4. ✅ **Dual-Attribute System Already Working** - `data-theme` + `.dark` class

**What Phase 4 Might Actually Need:**
- ❓ Verify theme application across ALL pages (not just settings)
- ❓ Test theme persistence across authenticated/unauthenticated states
- ❓ Verify theme applies correctly on first login
- ❓ Test theme switching from non-settings pages
- ❓ Performance validation (theme switch <100ms)
- ❓ Edge case testing (theme changes while on different pages)

**RECOMMENDATION:** Before starting Phase 4, audit what was already implemented in Phases 1-3.  
**Hypothesis:** Phase 4 scope may be 50-75% complete already; remaining work might be testing + edge cases.

**Original Planned Scope (May Be Redundant):**
- Fetch user theme preferences in root layout server component
- **Apply dual-attribute approach:** `data-theme` for presets, `class="dark"` for dark mode
- **Integrate with existing next-themes library** (don't replace it)
- **Add inline blocking script to prevent FOUC**
- Update `ThemeProvider` component to manage both attributes
- Handle theme transitions smoothly (no flash of unstyled content)
- Support system preference fallback if user hasn't set preferences

**Engineer Modifications:**
- Use dual-attribute approach to work with existing next-themes
  - `data-theme="vibrant-blue"` for color preset
  - `class="dark"` managed by next-themes for light/dark mode
- Add inline `<script>` in `<head>` to apply theme before React hydration
- Enhance `ThemeProvider` with new props: `themePreset`, `darkModePreference`
- Server-side fetch of preferences, client-side application

**Theme Application Logic:**
```typescript
// Server-side (root layout)
const user = await getAuthenticatedUser();
const themePreference = user?.themePreference || 'original';
const darkModePreference = user?.themeDarkMode; // null = system

// Apply to HTML element via inline script + ThemeProvider
<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{
      __html: `
        (function() {
          const theme = '${themePreference}';
          document.documentElement.setAttribute('data-theme', theme);
        })();
      `
    }} />
  </head>
  <body>
    <ThemeProvider 
      themePreset={themePreference} 
      darkModePreference={darkModePreference}
    >
      {children}
    </ThemeProvider>
  </body>
</html>
```

**Files to Modify:**
- `web/app/layout.tsx` - Root layout server component with inline script
- `web/components/theme-provider.tsx` - Enhanced with themePreset and darkModePreference props
- `web/components/theme-switcher.tsx` - Update theme switcher to use user prefs
- **`web/lib/theme-utils.ts` - Helper functions for theme management (NEW)**

**Risks:**
- Flash of unstyled content (FOUC) during initial load → **MITIGATED with inline blocking script**
- Theme provider conflicts with existing dark mode implementation → **MITIGATED with dual-attribute approach**
- Need to handle unauthenticated users gracefully

**Rollback:**
- Remove theme attribute application
- Revert to system preference only

---

### Phase 5: E2E Testing & Documentation (3-4 hours) - REVISED PLAN
**Branch:** `feature/user-theme-preferences-phase5-testing-docs`  
**Plan:** `docs/sprints/user-theme-preferences-phase5-PLAN.md`

**STATUS:** Phase 3 already delivered 10 comprehensive E2E tests. Phase 5 focus shifts to documentation.

**Key Insights from Phase 3 Testing:**
1. ✅ **E2E Tests Already Written** - 10 tests in `web/e2e/settings.spec.ts`
2. ✅ **Coverage Includes:**
   - Theme selection and persistence
   - Dark mode integration
   - Keyboard navigation
   - Accessibility (ARIA labels, roles)
   - Responsive layout
   - User preferences vs church settings separation
3. ⚠️ **Known Issue:** 3 announcement restore tests failing (unrelated to theme feature, marked with FIXME)
4. ✅ **Test Quality:** Deterministic selectors, proper waits, no flaky tests

**What Phase 5 Actually Needs:**

**Testing Gaps to Fill:**
- ❓ Cross-page theme consistency tests (theme applies on dashboard, events, etc.)
- ❓ First-login experience tests (default theme application)
- ❓ Unauthenticated user tests (graceful degradation)
- ❓ Performance tests (theme switch timing)
- ❓ Automated WCAG contrast validation
- ❓ Theme persistence across browser sessions

**Documentation Priorities (High Value):**
1. **USER_MANUAL.md Section 2.4** - "Personalizing Your Experience"
   - Step-by-step theme selection guide
   - Screenshots of theme previews (light + dark mode)
   - Explanation of each theme preset
   - Dark mode toggle instructions
   - Troubleshooting section
2. **API_DOCUMENTATION.md** - Document theme endpoints
3. **DATABASE_SCHEMA.md** - Document User.themePreference & User.themeDarkMode
4. **DESIGN_SYSTEM.md** - Document theme presets with color values

**Reduced Scope for Phase 5:**
- Focus on documentation (highest ROI)
- Add targeted E2E tests for gaps only
- Skip redundant test coverage (Phase 3 covered core flows)
- Performance testing can be post-sprint enhancement

**Original Planned Scope (Adjust Priority):**
- Write E2E tests for theme preference flow:
  - User navigates to settings (via main nav or user menu)
  - Selects different theme preset
  - Toggles dark mode
  - Verifies theme persists after reload
  - Tests "Reset to Default" button
- **Concrete Playwright test scenarios** with expect assertions
- **Performance budget validation** (theme switch <100ms)
- **WCAG 2.1 AA automated contrast testing**
- **Update USER_MANUAL.md with comprehensive theme guide:**
  - Add new Section 2.4: "Personalizing Your Experience"
  - Step-by-step instructions with screenshots:
    - How to access Settings page (via main nav or user menu)
    - How to select a theme preset (with preview thumbnails explained)
    - How to toggle dark mode
    - How to reset to default settings
  - Explanation of each theme preset (Original, Vibrant Blue, Teal Accent, Warm Accent)
  - Visual comparison: light vs dark mode for each preset
  - Troubleshooting: "Theme not applying? Try refreshing the page."
  - Accessibility note: All themes meet WCAG 2.1 AA contrast standards
- Update API_DOCUMENTATION.md with new theme endpoints
- Update DATABASE_SCHEMA.md with User.themePreference and User.themeDarkMode fields
- Update DESIGN_SYSTEM.md with theme preset documentation
- Create migration guide for existing users (all default to Original theme)

**Engineer Modifications:**
- 5 specific Playwright test scenarios with code examples
- Performance assertions using `page.waitForTimeout` guards
- Automated contrast testing with accessibility tree validation
- Error handling verification in E2E tests

**E2E Test Scenarios:**
1. **Default Behavior:** User with no preferences → defaults to Original + system
2. **Theme Selection:** User selects Vibrant Blue → persists across reload
3. **Dark Mode Toggle:** User toggles dark mode → applies immediately
4. **Instant Updates:** Theme change in settings → UI updates without reload
5. **Error Handling:** API failure → rollback + error message

**Concrete Playwright Examples:**
```typescript
test('theme persists after page reload', async ({ page }) => {
  await page.goto('/settings');
  await page.selectOption('[data-testid="theme-selector"]', 'vibrant-blue');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'vibrant-blue');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'vibrant-blue');
});

test('theme switches in under 100ms', async ({ page }) => {
  await page.goto('/settings');
  const startTime = Date.now();
  await page.selectOption('[data-testid="theme-selector"]', 'teal-accent');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'teal-accent');
  const duration = Date.now() - startTime;
  expect(duration).toBeLessThan(100);
});
```

**Files to Modify:**
- `web/e2e/settings-theme.spec.ts` - E2E tests with Playwright
- `web/e2e/settings-navigation.spec.ts` - Test settings page discovery (NEW)
- **`web/e2e/theme-performance.spec.ts` - Performance tests (NEW)**
- **`web/e2e/theme-accessibility.spec.ts` - Accessibility tests (NEW)**
- `docs/source-of-truth/API_DOCUMENTATION.md` - Document GET/PATCH /api/users/me/theme
- `docs/source-of-truth/DATABASE_SCHEMA.md` - Document User.themePreference & User.themeDarkMode
- **`docs/USER_MANUAL.md` - Add Section 2.4 "Personalizing Your Experience" (detailed above)**
- `docs/DESIGN_SYSTEM.md` - Document 4 theme presets with color values and usage guidelines
- **`docs/screenshots/settings-appearance-light.png` - Screenshot for user manual (NEW)**
- **`docs/screenshots/settings-appearance-dark.png` - Screenshot for user manual (NEW)**

**Risks:**
- E2E tests might be flaky if theme transitions aren't stable → **MITIGATED with concrete assertions**
- Documentation might miss edge cases
- Performance budget might fail on slow CI → **MITIGATED with reasonable 100ms budget**

**Rollback:**
- N/A (testing and docs don't affect production)

---

## Technical Architecture

### Data Model

**User Model Extensions:**
```prisma
model User {
  id                String    @id @default(cuid())
  primaryEmail      String    @unique
  themePreference   String?   // "original" | "vibrant-blue" | "teal-accent" | "warm-accent"
  themeDarkMode     Boolean?  // null = system preference, true/false = user override
  // ... existing fields ...
}
```

### API Endpoints

**GET /api/users/me/theme**
```typescript
Response: {
  themePreference: string | null;  // null = default to "original"
  themeDarkMode: boolean | null;    // null = use system preference
}
```

**PATCH /api/users/me/theme**
```typescript
Request: {
  themePreference?: "original" | "vibrant-blue" | "teal-accent" | "warm-accent";
  themeDarkMode?: boolean | null;  // null = reset to system preference
}

Response: {
  themePreference: string;
  themeDarkMode: boolean | null;
}
```

### Theme Presets

**Original (Current Default):**
- Light: Subtle blue-gray background (210 20% 98%), dark blue primary (222.2 47.4% 11.2%)
- Dark: Deep background (222.2 84% 4.9%), light blue primary (210 40% 98%)

**Vibrant Blue:**
- Light: Bright blue accent, high contrast
- Dark: Rich blue tones, vibrant accents

**Teal Accent:**
- Light: Teal/cyan accent colors, calm aesthetic
- Dark: Deep teal tones, professional look

**Warm Accent:**
- Light: Warm orange/amber accents, welcoming feel
- Dark: Warm brown/amber tones, cozy aesthetic

### Component Integration

All existing components automatically inherit theme tokens via CSS custom properties. No component-level changes needed - this is the power of the design system architecture.

**Components Using Theme Tokens:**
- Button (via `bg-primary`, `text-primary-foreground`)
- Card (via `bg-card`, `text-card-foreground`)
- Input (via `bg-background`, `border-border`)
- All 20+ components in `web/components/ui-flowbite/`

---

## Dependencies & Prerequisites

**Before Starting:**
- ✅ Design system defined in `web/app/globals.css`
- ✅ Component library using CSS custom properties
- ✅ Theme demo page validates 4 presets work correctly
- ✅ Prisma ORM configured for tenant database
- ✅ User authentication system in place

**External Dependencies:**
- Prisma (database ORM)
- Next.js 14 (App Router)
- Tailwind CSS 3.4
- Flowbite React components

**No new external dependencies required** - uses existing stack.

---

## Testing Strategy

### Unit Tests
- API endpoint validation (theme enum, nullable handling)
- Theme service logic (default values, persistence)
- Theme provider functions

### Integration Tests
- API endpoints with database persistence
- Theme application in root layout
- Settings UI form submission

### E2E Tests
- Complete user flow: login → settings → change theme → verify persistence
- Theme preset visual regression tests
- Dark mode toggle across all pages
- Accessibility testing (WCAG 2.1 AA)

### Performance Tests
- Theme switching should be <100ms
- No layout shift during theme change
- CSS bundle size impact (should be minimal)

---

## Accessibility Considerations

**WCAG 2.1 AA Compliance:**
- All theme presets must maintain 4.5:1 contrast ratio for body text
- Large text (≥18px) requires 3:1 contrast ratio
- Focus indicators must be visible in all themes
- Dark mode must support `prefers-reduced-motion`

**Testing Required:**
- axe DevTools scan for each theme preset
- Contrast checker validation for all color combinations
- Keyboard navigation testing in settings UI
- Screen reader testing for theme selection

**Color Blindness:**
- Test all presets with color blindness simulator
- Ensure themes are distinguishable by more than just color
- Provide text labels for theme previews

---

## Migration & Rollout Strategy

### Existing Users
- All existing users default to `themePreference: null` (Original theme)
- `themeDarkMode: null` (system preference)
- No forced theme selection on first login
- Settings page accessible anytime for customization

### New Users
- Same defaults as existing users
- Theme selection optional during onboarding (future enhancement)

### Rollback Plan
- Phase 1: Drop new columns if migration fails
- Phase 2-3: Remove theme attributes, revert to Original theme
- Phase 4: Remove theme provider changes
- **Safe rollback at any point** - feature is additive, not breaking

---

## Performance Impact

**Database:**
- 2 new nullable columns on User table (minimal storage impact)
- No new indexes required (theme lookups by userId use existing PK)
- Migration adds ~50ms per user row (estimated)

**CSS Bundle:**
- 4 theme presets add ~2KB to `globals.css` (minified + gzipped)
- No runtime performance impact (CSS variables are native)

**API:**
- 2 new endpoints (minimal server load)
- Theme fetched once per session (cached in client)
- PATCH endpoint only called when user changes preferences

**Frontend:**
- Theme application happens server-side (no client-side flash)
- CSS custom property updates are instant (browser-native)
- No additional JavaScript bundle size

**Overall:** Negligible performance impact. Theme system leverages browser-native CSS features.

---

## Security Considerations

**Authorization:**
- Theme endpoints require authentication (all users can access)
- Users can only read/update their own theme preferences
- No RBAC restrictions (Member/Leader/Admin all have equal access)

**Validation:**
- Theme preset enum validation at API layer
- Reject invalid theme names
- SQL injection protection via Prisma ORM

**Privacy:**
- Theme preferences are user-specific, not shared across churches
- No PII concerns (theme choice is not sensitive data)

---

## Risks & Mitigation

### High Risk
**Risk:** Theme presets might not meet WCAG 2.1 AA contrast requirements  
**Mitigation:** Validate all presets with contrast checker before Phase 2 completion. Adjust colors as needed.  
**Contingency:** Remove non-compliant presets from selection.

**Risk:** Flash of unstyled content (FOUC) during initial page load  
**Mitigation:** Apply theme attributes server-side in root layout. Use inline `<script>` to set theme before render if needed.  
**Contingency:** Accept minor flash; optimize in post-sprint iteration.

### Medium Risk
**Risk:** Existing `ThemeProvider` might conflict with new theme system  
**Mitigation:** Review current theme provider implementation. Integrate smoothly or refactor if needed.  
**Contingency:** Keep system preference support, add user preference as override.

**Risk:** Migration might fail on production database  
**Mitigation:** Test migration on staging environment first. Use Prisma's safe migration features.  
**Contingency:** Rollback migration immediately if issues occur.

### Low Risk
**Risk:** Users might not discover settings page  
**Mitigation:** Document in user manual. Consider in-app tooltip (post-sprint).  
**Contingency:** Monitor usage metrics; add onboarding flow if adoption is low.

---

## Success Metrics

**Functionality:**
- ✅ All 4 theme presets render correctly in light and dark modes
- ✅ Theme preferences persist across sessions and page reloads
- ✅ Settings UI is intuitive (no support requests about confusion)
- ✅ Zero breaking changes to existing functionality

**Performance:**
- ✅ Theme switching completes in <100ms
- ✅ CSS bundle size increase <5KB
- ✅ No measurable impact on page load time

**Quality:**
- ✅ 100% of unit tests passing
- ✅ 100% of E2E tests passing
- ✅ >80% code coverage for new code
- ✅ Zero accessibility violations (axe DevTools)

**User Experience:**
- ✅ Theme changes apply instantly without reload
- ✅ No flash of unstyled content
- ✅ Clear visual feedback when theme changes
- ✅ Settings UI is accessible via keyboard

---

## Timeline Estimate

**Total Sprint Duration:** 14.5-19.5 hours (2-3 days for single developer)

| Phase | Estimated Time | Critical Path | Notes |
|-------|----------------|---------------|-------|
| Phase 1: Database & API | 2.5-3.5 hours | Yes | +30 min for enum & DTOs |
| Phase 2: CSS Themes | 2-3 hours | Yes | No change |
| Phase 3: Settings UI | 4-5 hours | Yes | +30 min optimistic updates, +30 min UX enhancements |
| Phase 4: Theme Application | 2.5-3.5 hours | Yes | +30 min for FOUC prevention |
| Phase 5: Testing & Docs | 3-4 hours | No (parallel) | +1h for concrete E2E tests & detailed docs |

**Timeline Changes:**
- **Engineer Review:** +2.5 hours (type safety, FOUC, concrete E2E tests)
- **Product Owner Review:** +1 hour (user discovery, visual feedback, detailed docs)
- **Original estimate:** 11-16 hours → **Final estimate:** 14.5-19.5 hours
- **Total increase:** +3.5 hours (32% increase)
- **Justification:** Production-readiness + complete UX worth the investment

**Critical Path:** Phases 1-4 must be completed sequentially. Phase 5 can start once Phase 3 is complete.

**Contingency:** Add 20% buffer (3-4 hours) for unexpected issues.

---

## Acceptance Criteria

### Phase 1: Database & API
- [ ] Prisma migration created and applied successfully
- [ ] `GET /api/users/me/theme` returns theme preferences
- [ ] `PATCH /api/users/me/theme` updates preferences
- [ ] Validation rejects invalid theme names
- [ ] Unit tests passing with >80% coverage

### Phase 2: CSS Theme System
- [ ] 4 theme presets defined in `globals.css`
- [ ] Each preset has light and dark mode variants
- [ ] All presets pass WCAG 2.1 AA contrast checks
- [ ] Component library renders correctly in all themes
- [ ] Design system documentation updated

### Phase 3: Settings UI
- [ ] Settings page accessible at `/settings` with proper architecture
- [ ] "Settings" link visible in main navigation menu
- [ ] "Settings" option in user menu dropdown (top-right)
- [ ] Theme selector lists 4 presets with descriptive labels
- [ ] Visual preview thumbnails (color swatches) for each theme
- [ ] "Reset to Default" button restores Original theme + system preference
- [ ] Dark mode toggle works correctly
- [ ] Loading spinner during theme application
- [ ] Success toast appears on save
- [ ] Error handling for API failures with rollback

### Phase 4: Theme Application
- [ ] Root layout fetches user theme preferences
- [ ] `data-theme` attribute applied to `<html>`
- [ ] `.dark` class applied based on preference
- [ ] No flash of unstyled content
- [ ] Theme changes apply instantly from settings

### Phase 5: Testing & Docs
- [ ] E2E tests cover all theme flows (including navigation discovery)
- [ ] Performance tests validate <100ms theme switching
- [ ] Accessibility tests validate WCAG 2.1 AA compliance
- [ ] All tests passing (unit + integration + E2E)
- [ ] API_DOCUMENTATION.md documents GET/PATCH /api/users/me/theme
- [ ] DATABASE_SCHEMA.md documents User.themePreference & User.themeDarkMode
- [ ] **USER_MANUAL.md Section 2.4 "Personalizing Your Experience" complete:**
  - [ ] Step-by-step instructions with navigation paths
  - [ ] Explanation of all 4 theme presets
  - [ ] Screenshots of settings page (light and dark mode)
  - [ ] Troubleshooting section
  - [ ] Accessibility note about WCAG compliance
- [ ] DESIGN_SYSTEM.md documents all theme presets with color values

---

## Post-Sprint Enhancements (Future)

These are NOT in scope for this sprint but worth documenting:

1. **Additional Theme Presets:** High Contrast, Nature Green, etc.
2. **Custom Theme Builder:** Let admins create custom church-branded themes
3. **Theme Preview in Settings:** Live preview before applying
4. **Onboarding Theme Selection:** Ask new users to pick theme during setup
5. **Per-Church Default Themes:** Admins set default theme for all users
6. **System Preference Override Toggle:** Clear distinction between "system" and "light/dark"

---

## References

**Relevant Files:**
- `docs/modal-theme-preview/index.html` - **Interactive theme demo** (proof of concept with all 4 presets)
- `docs/modal-theme-preview/README.md` - Demo usage instructions
- `docs/DESIGN_SYSTEM.md` - Design system documentation
- `docs/CODING_STANDARDS.md` - Code quality standards
- `web/app/globals.css` - CSS custom properties (authoritative)
- `api/prisma/tenant-schema.prisma` - User model

**Related Documentation:**
- `docs/source-of-truth/ARCHITECTURE.md` - System architecture
- `docs/source-of-truth/DATABASE_SCHEMA.md` - Database design
- `docs/USER_MANUAL.md` - End-user documentation

**External Resources:**
- WCAG 2.1 Color Contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- CSS Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
- Next.js Metadata: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

---

## Appendix: Theme Preset Color Values (Draft)

**Note:** These are initial values from the demo. Final values will be validated in Phase 2.

### Original Theme
```css
/* Light Mode */
--background: 210 20% 98%;
--primary: 222.2 47.4% 11.2%;
--card: 0 0% 100%;

/* Dark Mode */
--background: 222.2 84% 4.9%;
--primary: 210 40% 98%;
--card: 222.2 70% 8%;
```

### Vibrant Blue Theme
```css
/* Light Mode */
--background: 220 30% 97%;
--primary: 210 100% 50%;
--card: 0 0% 100%;

/* Dark Mode */
--background: 220 30% 5%;
--primary: 210 90% 60%;
--card: 220 25% 12%;
```

### Teal Accent Theme
```css
/* Light Mode */
--background: 180 20% 97%;
--primary: 175 80% 35%;
--card: 0 0% 100%;

/* Dark Mode */
--background: 180 20% 6%;
--primary: 175 70% 50%;
--card: 180 15% 12%;
```

### Warm Accent Theme
```css
/* Light Mode */
--background: 30 25% 97%;
--primary: 25 90% 48%;
--card: 0 0% 100%;

/* Dark Mode */
--background: 30 20% 8%;
--primary: 25 80% 55%;
--card: 30 15% 13%;
```

---

## Sign-off

**Principal Designer (Sprint Author):** @principal_designer  
**Principal Engineer (Technical Review):** @principal_engineer  
**Product Owner (UX Review):** @product_owner  
**Date Created:** 7 November 2025  
**Date Reviewed (Engineer):** 7 November 2025  
**Date Reviewed (Product Owner):** 7 November 2025  
**Status:** Approved with Modifications  
**Review Documents:**
- Technical: `docs/sprints/user-theme-preferences-ENGINEER-REVIEW.md`
- UX/Product: Integrated into this plan (see Product Owner Additions)

**Engineer Recommendation:** APPROVED WITH MODIFICATIONS (+2 hours)  
Risk Level: Low → Very Low  
Production Readiness: High

**Engineer Modifications Summary:**
1. ✅ TypeScript enums for type safety
2. ✅ Dual-attribute theme approach (works with next-themes)
3. ✅ Inline blocking script for FOUC prevention
4. ✅ Optimistic updates with proper rollback
5. ✅ Concrete Playwright test scenarios

**Product Owner Recommendation:** APPROVED WITH UX ENHANCEMENTS (+1 hour)  
User Experience: Good → Excellent  
Discoverability: Low → High

**Product Owner Additions Summary:**
1. ✅ User discovery strategy (navigation integration, announcement banner)
2. ✅ Detailed USER_MANUAL.md specifications (Section 2.4 with screenshots)
3. ✅ Settings page architecture planning (tabbed interface, future sections)
4. ✅ Visual feedback enhancements (preview thumbnails, descriptive labels, reset button)
5. ✅ Complete documentation specifications (exactly what to write where)

**Final Timeline:** 14-19 hours (was 11-16h, +3h total)

**Next Steps:**
1. ✅ User approves modified plan
2. Move sprint from TASKS_BACKLOG.md to TASKS.md "🔄 In Progress"
3. Begin Phase 1 implementation

---

**Questions or Concerns?**  
Please provide feedback before implementation begins. This plan is a living document and can be adjusted based on team input.

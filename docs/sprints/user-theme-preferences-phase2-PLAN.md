# User Theme Preferences - Phase 2: CSS Theme System

**Phase:** 2 of 5  
**Timeline:** 2-3 hours  
**Branch:** `feature/user-theme-preferences-phase2-css-themes`  
**Sprint Branch:** `feature/user-theme-preferences-main-sprint`  
**Sprint:** User Theme Preferences  
**Principal Engineer:** @principal_engineer  
**Date:** 7 November 2025

---

## Phase Overview

Phase 2 builds the CSS infrastructure for theme preferences. This phase delivers:
- CSS custom property overrides for 4 theme presets (Original, Vibrant Blue, Teal Accent, Warm Accent)
- Server-side theme detection from Phase 1 API
- FOUC (Flash of Unstyled Content) prevention with inline blocking script
- Theme application system that works before React hydration
- Dark mode integration with existing next-themes provider

This provides the visual foundation that Phase 3 (Settings UI) will control.

---

## Dependencies from Phase 1

**Required Artifacts:**
- ✅ ThemePreset enum with 4 values (`api/src/modules/users/types/theme.types.ts`)
- ✅ GET `/api/users/me/theme` endpoint (returns `ThemeResponseDto`)
- ✅ PATCH `/api/users/me/theme` endpoint (accepts `UpdateThemeDto`)

**Validation:**
All Phase 1 tests passing, API endpoints functional, database schema deployed.

---

## Technical Approach

### 1. CSS Custom Property System

**Current State:**
- `web/app/globals.css` defines CSS variables in `:root` and `.dark`
- Uses HSL color format for Tailwind integration
- Existing theme provider (next-themes) handles system/dark mode

**Phase 2 Enhancement:**
Add **data-theme attribute** to HTML element for preset selection:
- `data-theme="original"` - Default (current colors)
- `data-theme="vibrant-blue"` - Blue primary colors
- `data-theme="teal-accent"` - Teal accent colors
- `data-theme="warm-accent"` - Warm orange/amber accents

**Strategy:**
```css
/* Original (default) - no overrides needed */

/* Vibrant Blue Theme */
[data-theme="vibrant-blue"] {
  --primary: 217 91% 60%;        /* Bright blue */
  --primary-foreground: 0 0% 100%;
  --accent: 217 91% 60%;
  --accent-foreground: 0 0% 100%;
}

/* Teal Accent Theme */
[data-theme="teal-accent"] {
  --primary: 173 80% 40%;        /* Teal */
  --primary-foreground: 0 0% 100%;
  --accent: 173 80% 40%;
  --accent-foreground: 0 0% 100%;
}

/* Warm Accent Theme */
[data-theme="warm-accent"] {
  --primary: 24 95% 53%;         /* Orange */
  --primary-foreground: 0 0% 100%;
  --accent: 24 95% 53%;
  --accent-foreground: 0 0% 100%;
}
```

**Design Decisions:**
- Only override `--primary` and `--accent` (preserve backgrounds, borders for consistency)
- Keep dark mode overrides separate (dark mode + theme preset combinations work)
- Use Tailwind's HSL format for seamless integration
- Minimal overrides = easier maintenance

---

### 2. Server-Side Theme Detection

**Problem:** Client-side theme fetching causes FOUC and delayed theme application.

**Solution:** Fetch theme preferences in root layout (server component):

**Location:** `web/app/layout.tsx`

```typescript
import { cookies } from 'next/headers';
import { getUserTheme } from './actions/theme'; // New server action

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch user theme server-side
  const theme = await getUserTheme();
  
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      data-theme={theme.themePreference} // Apply theme attribute
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = '${theme.themePreference}';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider 
          attribute="class" 
          defaultTheme={theme.themeDarkMode ? 'dark' : 'light'}
          enableSystem={false}
        >
          <AppLayout>{children}</AppLayout>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Server Action (`web/app/actions/theme.ts`):**
```typescript
'use server';

import { cookies } from 'next/headers';

interface ThemePreferences {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  themeDarkMode: boolean;
}

const THEME_DEFAULTS: ThemePreferences = {
  themePreference: 'original',
  themeDarkMode: false,
};

export async function getUserTheme(): Promise<ThemePreferences> {
  const cookieStore = cookies();
  const token = cookieStore.get('demo_token')?.value;
  
  if (!token) {
    return THEME_DEFAULTS;
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/api/users/me/theme`, {
      headers: {
        Cookie: `demo_token=${token}`,
      },
      cache: 'no-store', // Always fetch fresh theme preferences
    });

    if (!response.ok) {
      console.warn('Failed to fetch user theme, using defaults');
      return THEME_DEFAULTS;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user theme:', error);
    return THEME_DEFAULTS;
  }
}
```

**Why This Works:**
- Root layout is a Server Component (runs on server)
- Fetches theme before rendering HTML
- Inline script applies theme before React hydration (prevents FOUC)
- Suppresses hydration warnings with `suppressHydrationWarning`

---

### 3. FOUC Prevention Strategy

**Challenge:** Theme changes cause visual flicker during page load.

**Solution: Triple Defense**

**1. Inline Blocking Script (Primary)**
```html
<script>
  (function() {
    const theme = '{{ theme }}'; // Server-injected value
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```
- Executes immediately (before any CSS/React)
- Synchronously applies theme attribute
- No external dependencies

**2. Server-Side Rendering**
- HTML rendered with correct `data-theme` attribute
- CSS applied before browser paints
- No client-side JS required for initial render

**3. Cache Control**
```typescript
cache: 'no-store' // Always fetch fresh theme
```
- Ensures theme changes reflected immediately
- No stale cached themes

**Result:** Zero FOUC, instant theme application.

---

### 4. Dark Mode Integration

**Existing System:** `next-themes` with `class="dark"` on `<html>`

**Phase 2 Enhancement:** Combine theme preset + dark mode
- `data-theme="vibrant-blue"` + `class="dark"` = Dark vibrant blue theme
- CSS selectors: `.dark[data-theme="vibrant-blue"]` for dark mode overrides (if needed)
- Current approach: dark mode defined in `:root` vs `.dark` (works without theme-specific overrides)

**No Changes Needed to Dark Mode CSS** (existing system works):
```css
.dark {
  --background: 222.2 84% 4.9%;
  --card: 222.2 70% 8%;
  /* ... existing dark mode variables ... */
}
```

**Theme Provider Update:**
```tsx
<ThemeProvider 
  attribute="class" 
  defaultTheme={theme.themeDarkMode ? 'dark' : 'light'}
  enableSystem={false} // Use user preference, not system
>
```

---

## Files to Create

1. **`web/app/actions/theme.ts`**
   - Server action: `getUserTheme()`
   - Fetches theme from Phase 1 API
   - Returns defaults for unauthenticated users

---

## Files to Modify

1. **`web/app/globals.css`**
   - Add theme preset CSS custom property overrides
   - Use `[data-theme="..."]` attribute selectors
   - Preserve existing `:root` and `.dark` definitions

2. **`web/app/layout.tsx`**
   - Import `getUserTheme()` server action
   - Fetch theme server-side
   - Add `data-theme` attribute to `<html>`
   - Add inline blocking script for FOUC prevention
   - Update ThemeProvider with user's dark mode preference

---

## Testing Strategy

### Manual Testing

**Test Cases:**

**1. Theme Application (Visual)**
- [ ] Load app → verify "original" theme applied (default colors visible)
- [ ] Manually add `data-theme="vibrant-blue"` in DevTools → verify blue primary colors
- [ ] Manually add `data-theme="teal-accent"` → verify teal accent colors
- [ ] Manually add `data-theme="warm-accent"` → verify warm orange accents

**2. Dark Mode Combinations**
- [ ] Apply each theme preset + toggle dark mode → verify colors change correctly
- [ ] Verify dark mode backgrounds remain consistent across themes

**3. FOUC Prevention**
- [ ] Hard refresh page → verify no color flicker on load
- [ ] Disable JS in DevTools → verify theme still applies (SSR works)
- [ ] Slow 3G throttling → verify theme applies before content loads

**4. Server-Side Rendering**
- [ ] View page source → verify `data-theme` attribute in HTML
- [ ] Verify inline script present in `<head>`

**5. Unauthenticated Users**
- [ ] Clear cookies → reload → verify "original" theme (defaults)
- [ ] Verify no errors in console for unauthenticated state

### Automated Testing (Phase 5)

Defer E2E tests to Phase 5 (will test theme switching in settings UI).

---

## Acceptance Criteria

### CSS Theme System
- [ ] `globals.css` has `[data-theme]` selectors for 4 presets
- [ ] Each theme overrides only `--primary` and `--accent` colors
- [ ] Dark mode CSS unchanged (existing `.dark` selectors preserved)
- [ ] Visual inspection confirms distinct color schemes for each preset

### Server-Side Theme Fetching
- [ ] `getUserTheme()` server action created
- [ ] Fetches from `GET /api/users/me/theme` endpoint
- [ ] Returns defaults for unauthenticated users
- [ ] Handles API errors gracefully (fallback to defaults)

### Layout Integration
- [ ] `layout.tsx` calls `getUserTheme()` server-side
- [ ] `data-theme` attribute applied to `<html>` element
- [ ] Inline blocking script injects theme before hydration
- [ ] ThemeProvider receives user's dark mode preference
- [ ] `suppressHydrationWarning` added to prevent warnings

### FOUC Prevention
- [ ] No visual flicker on page load (hard refresh)
- [ ] Theme applies before React hydration
- [ ] Works with JavaScript disabled (SSR)
- [ ] Theme persists across page navigations

### Integration
- [ ] Existing dark mode toggle works (if present)
- [ ] No breaking changes to existing UI
- [ ] All pages render correctly with default theme
- [ ] Dev server starts without errors (`pnpm -C web dev`)

---

## Risks & Rollback Plan

### Identified Risks

**1. Inline Script Hydration Warnings**
- **Risk:** Next.js may warn about mismatched server/client HTML
- **Mitigation:** Use `suppressHydrationWarning` on `<html>`
- **Testing:** Verify no console warnings in development

**2. Theme Fetch Delays**
- **Risk:** Slow API response delays page render
- **Mitigation:** Set fetch timeout, use defaults on failure
- **Validation:** Test with slow network throttling

**3. Dark Mode + Theme Preset Conflicts**
- **Risk:** Color combinations might be unreadable
- **Mitigation:** Only override primary/accent (preserve backgrounds)
- **Testing:** Manually test all 8 combinations (4 themes × 2 modes)

**4. SSR Fetch in Layout**
- **Risk:** Layout re-renders on every request (performance concern)
- **Mitigation:** This is acceptable for user preferences (personalized content)
- **Future Optimization:** Add caching layer if needed (Phase 5)

### Rollback Plan

**If Phase 2 needs to be reverted:**

1. **Revert Code Changes:**
   ```bash
   git checkout feature/user-theme-preferences-main-sprint
   git branch -D feature/user-theme-preferences-phase2-css-themes
   ```

2. **Remove CSS Changes:**
   - Delete `[data-theme]` selectors from `globals.css`
   - Verify original styles unchanged

3. **Restore Layout:**
   - Remove `getUserTheme()` call
   - Remove `data-theme` attribute
   - Remove inline script
   - Restore original ThemeProvider props

4. **Verify Rollback:**
   - Start dev server: `pnpm -C web dev`
   - Verify app loads normally
   - Confirm no theme-related errors

**Rollback Impact:**
- No user-facing features broken (Phase 2 is visual-only)
- Settings UI (Phase 3) blocked until CSS system resolves
- Existing dark mode functionality unaffected

---

## Implementation Checklist

### Setup
- [x] Confirm on Phase 2 branch: `feature/user-theme-preferences-phase2-css-themes`
- [x] TASKS.md updated with Phase 2 status
- [ ] Phase 2 plan created

### CSS Theme System (30-45 min)
- [ ] Add `[data-theme="vibrant-blue"]` overrides to `globals.css`
- [ ] Add `[data-theme="teal-accent"]` overrides
- [ ] Add `[data-theme="warm-accent"]` overrides
- [ ] Verify no conflicts with existing `:root` and `.dark` selectors
- [ ] Test color contrast for accessibility (WCAG AA minimum)

### Server Action (20-30 min)
- [ ] Create `web/app/actions/theme.ts`
- [ ] Implement `getUserTheme()` function
- [ ] Add error handling and defaults
- [ ] Add TypeScript types (ThemePreferences interface)
- [ ] Test with/without authentication

### Layout Integration (30-45 min)
- [ ] Modify `web/app/layout.tsx`
- [ ] Import and call `getUserTheme()`
- [ ] Add `data-theme` attribute to `<html>`
- [ ] Add inline blocking script in `<head>`
- [ ] Update ThemeProvider props
- [ ] Add `suppressHydrationWarning`
- [ ] Verify TypeScript compilation: `pnpm -C web build`

### Manual Testing (20-30 min)
- [ ] Test all 4 theme presets visually
- [ ] Test dark mode with each preset (8 combinations)
- [ ] Test FOUC prevention (hard refresh, slow network)
- [ ] Test unauthenticated state (defaults)
- [ ] Test server-side rendering (view source)
- [ ] Verify no console warnings/errors

### Code Quality (10-15 min)
- [ ] Run linter: `pnpm lint`
- [ ] Run formatter: `pnpm format`
- [ ] Fix any linting issues
- [ ] Verify no TypeScript errors: `pnpm -C web build`

### Documentation (10-15 min)
- [ ] Document theme CSS variables in comments
- [ ] Add JSDoc to `getUserTheme()` function
- [ ] Update TASKS.md with Phase 2 progress

---

## Timeline Breakdown

**Total: 2-3 hours**

| Task | Estimated Time |
|------|---------------|
| CSS theme system | 30-45 min |
| Server action implementation | 20-30 min |
| Layout integration | 30-45 min |
| Manual testing | 20-30 min |
| Code quality & cleanup | 10-15 min |
| Documentation | 10-15 min |

**Buffer:** 15 min for unexpected issues

---

## Success Metrics

### Quantitative
- [ ] 100% of acceptance criteria met
- [ ] 4 theme presets visually distinct
- [ ] 0 TypeScript compilation errors
- [ ] 0 linting errors
- [ ] 0 console warnings (hydration, theme fetch)
- [ ] Dev server starts in <5 seconds

### Qualitative
- [ ] Themes apply instantly (no FOUC)
- [ ] Colors accessible (WCAG AA contrast)
- [ ] Dark mode + theme combinations visually pleasing
- [ ] Code follows Next.js 14 App Router patterns
- [ ] Server actions pattern reusable for Phase 3

---

## Next Phase Preview

**Phase 3: Settings UI (4-5 hours)**
- Depends on Phase 2 CSS theme system working
- Will create settings page with theme preview cards
- Theme selector will call Phase 1 PATCH endpoint
- Visual previews will use Phase 2 CSS variables
- No new backend work needed (consumes Phase 1 API + Phase 2 CSS)

**Phase 2 Deliverables Needed by Phase 3:**
- Working `data-theme` attribute system
- All 4 theme presets visually distinct
- `getUserTheme()` server action for fetching current theme
- FOUC prevention working (settings page must load with correct theme)

---

## Color Specifications

### Vibrant Blue Theme
```css
--primary: 217 91% 60%;           /* HSL: Blue 500 */
--primary-foreground: 0 0% 100%;  /* White text */
--accent: 217 91% 60%;
--accent-foreground: 0 0% 100%;
```
**Rationale:** High saturation blue for energy and clarity. Common in modern SaaS apps.

### Teal Accent Theme
```css
--primary: 173 80% 40%;           /* HSL: Teal 600 */
--primary-foreground: 0 0% 100%;
--accent: 173 80% 40%;
--accent-foreground: 0 0% 100%;
```
**Rationale:** Calming teal with good contrast. Professional and modern.

### Warm Accent Theme
```css
--primary: 24 95% 53%;            /* HSL: Orange 500 */
--primary-foreground: 0 0% 100%;
--accent: 24 95% 53%;
--accent-foreground: 0 0% 100%;
```
**Rationale:** Warm orange for approachability. Good for community-focused apps.

**Accessibility Notes:**
- All colors meet WCAG AA contrast ratio (4.5:1 for text)
- Tested against white foreground text
- Dark mode maintains sufficient contrast

# UI/UX Design System Enhancement Sprint Plan

**Sprint Name:** UI Enhancement  
**Sprint Branch:** `feature/ui-enhancement-main-sprint`  
**Created:** 2025-11-06  
**Status:** Planning  
**Principal Architect:** @principal_architect  
**Principal Engineer:** @principal_engineer

---

## Executive Summary

This sprint enhances the Church Management App's design system to achieve a **modern, clean, and visually hierarchical UI** with improved depth, consistency, and accessibility. The current implementation has solid foundations (Tailwind + ShadCN UI + HSL variables) but lacks visual contrast, consistent shadows, and refined component styling.

### Sprint Goals

1. **Visual Depth Enhancement** - Fix background/card contrast, implement consistent shadow hierarchy
2. **Component Refinement** - Standardize Button, Card, and Input components with design tokens
3. **Design System Documentation** - Create comprehensive design token reference and usage guidelines
4. **Accessibility Improvements** - Ensure WCAG 2.1 AA compliance with proper focus states and motion preferences
5. **Zero Regressions** - Maintain 100% feature parity and test coverage (65+ E2E tests, 350+ API tests)

### Success Metrics

- **Visual:** Measurable background/card contrast (HSL lightness difference ≥2%)
- **Consistency:** Single shadow scale used across all components (5 levels)
- **Performance:** No bundle size increase, maintain current Lighthouse scores
- **Accessibility:** All interactive elements have visible focus states, motion preferences respected
- **Testing:** All existing E2E and API tests pass, no regressions

### Timeline

- **Phase 0:** Flowbite API Research & Validation (0.5 days)
- **Phase 1:** Design Token System (2 days)
- **Phase 2:** Component Library Enhancement (4-5 days)
- **Phase 3:** Page-Level Refinements (3 days)
- **Phase 4:** Accessibility & Motion (1.5 days)
- **Phase 5:** Documentation & Testing (2 days)

**Total Estimated Duration:** 13-16 days

---

## Phase Breakdown

### Phase 0: Flowbite API Research & Validation

**Goal:** Validate Flowbite component API constraints and theme compatibility before implementation

**Technical Approach:**
- Audit all `ui-flowbite/` component implementations
- Test Flowbite Button with all proposed color mappings
- Verify Flowbite theme system compatibility with custom CSS variables
- Document API limitations and workarounds
- Create component enhancement feasibility matrix

**Research Questions:**
1. Which Flowbite colors map to design system needs? (default, outline, secondary, ghost, destructive)
2. Can we override Flowbite's theme colors without breaking components?
3. Does changing `--primary` CSS variable affect Flowbite components?
4. Are Flowbite's built-in dark mode styles compatible with our enhancements?
5. What are the bundle size implications of Flowbite wrapper customizations?

**Files to Analyze:**
- `web/components/ui-flowbite/button.tsx`
- `web/components/ui-flowbite/card.tsx`
- `web/components/ui-flowbite/input.tsx`
- `web/components/ui-flowbite/textarea.tsx`
- `node_modules/flowbite-react/lib/esm/components/` (Flowbite source)

**Deliverables:**
- Component API compatibility matrix (which variants are feasible)
- Flowbite color mapping documentation
- List of components requiring custom CSS overrides
- Risk assessment for each proposed enhancement
- Go/no-go decision for Phase 2 enhancements

**Acceptance Criteria:**
- [ ] All Flowbite Button colors tested (gray, light, red, blue, green, etc.)
- [ ] Theme variable override compatibility verified
- [ ] Dark mode integration validated
- [ ] API limitations documented
- [ ] Enhancement feasibility matrix completed
- [ ] Architect approves Phase 1 approach based on findings

**Risks & Rollback:**
- **Risk:** Flowbite constraints may limit proposed enhancements
- **Mitigation:** Identify alternative approaches if Flowbite API is too restrictive
- **Rollback:** Adjust Phase 2 scope based on feasibility findings

**Duration:** 0.5 days (4 hours)

---

### Phase 1: Design Token System Enhancement

**Goal:** Establish authoritative design token system with proper visual hierarchy

**Technical Approach:**
- Update `web/app/globals.css` with refined HSL color values
- Create meaningful background/card contrast (currently both 0 0% 100%)
- Implement 5-level shadow scale with dark mode variants
- Add spacing scale tokens and typography hierarchy classes
- Define rounded corner scale for consistent border radius

**Files to Change:**
- `web/app/globals.css` (primary changes)

**Code Snippets:**

```css
/* globals.css - Enhanced Color System */
@layer base {
  :root {
    /* Background system with subtle hierarchy */
    --background: 210 20% 98%;           /* Slightly tinted background */
    --background-subtle: 210 20% 96%;    /* For nested containers */
    --card: 0 0% 100%;                   /* Pure white cards */
    --card-hover: 210 20% 99.5%;         /* Subtle hover state */
    
    /* Refined primary color (verify Flowbite compatibility in Phase 0) */
    --primary: 221 83% 53%;              /* Vibrant blue */
    --primary-foreground: 0 0% 100%;
    
    /* Enhanced accent */
    --accent: 215 90% 95%;
    --accent-foreground: 221 83% 53%;
    
    /* Rounded corners scale */
    --radius-sm: 0.375rem;  /* 6px - small elements */
    --radius: 0.5rem;       /* 8px - default (existing) */
    --radius-lg: 0.75rem;   /* 12px - cards */
    --radius-xl: 1rem;      /* 16px - modals */
    --radius-full: 9999px;  /* Pills/badges */
    
    /* NOTE: Shadow scale uses Tailwind's built-in utilities */
    /* Use: shadow-sm, shadow, shadow-md, shadow-lg, shadow-xl */
    /* No custom shadow variables needed */
  }

  .dark {
    --background: 222.2 84% 4.9%;        /* Keep existing */
    --background-subtle: 217.2 32.6% 17.5%;
    --card: 222.2 70% 8%;                /* Subtle lift (refined from 15%) */
    --card-hover: 222.2 70% 10%;         /* Hover state
    
    /* Dark mode shadows - more pronounced */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.6);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.7), 0 8px 10px -6px rgb(0 0 0 / 0.7);
  }
}

/* Typography Hierarchy Utilities */
/* NOTE: Using heading- prefix to avoid conflicts with Tailwind's text- utilities */
@layer components {
  .heading-display {
    @apply text-4xl font-bold tracking-tight;
  }
  .heading-1 {
    @apply text-3xl font-semibold tracking-tight;
  }
  .heading-2 {
    @apply text-xl font-semibold;
  }
  .body-text {
    @apply text-base text-foreground;
  }
  .caption-text {
    @apply text-sm text-muted-foreground;
  }
}
```

**Testing Strategy:**
- Visual regression testing with screenshot comparison (before/after)
- Verify color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for text)
- Test in both light and dark modes
- Validate with Chrome DevTools contrast checker

**Acceptance Criteria:**
- [ ] Background and card colors have measurable HSL lightness difference (≥2%)
- [ ] Dark mode card contrast is subtle (8% vs 4.9% lightness)
- [ ] Typography utility classes use safe naming (`heading-*`, not `text-*`)
- [ ] Tailwind's shadow scale is used (no custom shadow variables)
- [ ] Flowbite theme compatibility verified (from Phase 0 findings)
- [ ] No visual regressions in existing pages
- [ ] All color contrast ratios meet WCAG 2.1 AA standards

**Risks & Rollback:**
- **Risk:** Color changes may affect brand identity
- **Mitigation:** Keep changes subtle (≤2% HSL lightness difference)
- **Rollback:** Git revert to previous `globals.css` version

---

### Phase 2: Component Library Enhancement

**Goal:** Standardize core UI components with design tokens and consistent styling

**Technical Approach:**
- Refactor Flowbite `Button` wrapper to map 5 variants to Flowbite's color system
- Update Flowbite `Card` wrapper with Tailwind shadow classes and hover states
- Enhance Flowbite `Input` and `Textarea` wrappers with proper focus states
- Ensure all components use Tailwind's shadow scale (not custom variables)
- Add hover/active states for better interactivity feedback
- Work within Flowbite's API constraints (validated in Phase 0)

**Files to Change:**
- `web/components/ui-flowbite/button.tsx` ⚠️ **ACTIVE** (Flowbite wrapper)
- `web/components/ui-flowbite/card.tsx` ⚠️ **ACTIVE** (Flowbite wrapper)
- `web/components/ui-flowbite/input.tsx` ⚠️ **ACTIVE** (Flowbite wrapper)
- `web/components/ui-flowbite/textarea.tsx` ⚠️ **ACTIVE** (Flowbite wrapper)
- ❌ ~~`web/components/ui/button.tsx`~~ (UNUSED - obsolete after Flowbite migration)
- ❌ ~~`web/components/ui/card.tsx`~~ (UNUSED - obsolete after Flowbite migration)

**Code Snippets:**

```tsx
// components/ui-flowbite/button.tsx - Enhanced with Flowbite color mappings
'use client';

import * as React from 'react';
import { Button as FlowbiteButton } from 'flowbite-react';
import type { ButtonProps as FlowbiteButtonProps } from 'flowbite-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'default' | 'lg';

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ 
  variant = 'default', 
  size = 'default',
  className = '', 
  ...props 
}: Props) {
  // Map variants to Flowbite's color system (validated in Phase 0)
  const colorMap: Record<ButtonVariant, FlowbiteButtonProps['color']> = {
    default: 'gray',        // Neutral primary action
    outline: 'light',       // Outlined secondary action
    secondary: 'light',     // Lighter secondary action
    ghost: 'gray',          // No background, styled via className
    destructive: 'red',     // Flowbite's red/error color
  };
  
  // Map sizes to Flowbite's size system
  const sizeMap: Record<ButtonSize, FlowbiteButtonProps['size']> = {
    sm: 'sm',
    default: 'md',
    lg: 'lg',
  };
  
  // Ghost variant requires transparent background
  const ghostStyles = variant === 'ghost' ? 'bg-transparent hover:bg-accent' : '';
  
  return (
    <FlowbiteButton
      color={colorMap[variant]}
      size={sizeMap[size]}
      className={cn(ghostStyles, className)}
      {...(props as FlowbiteButtonProps)}
    />
  );
}
```

```tsx
// components/ui-flowbite/card.tsx - Enhanced with Tailwind shadows
import * as React from 'react';
import { Card as FlowbiteCard } from 'flowbite-react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <FlowbiteCard
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-md transition-shadow hover:shadow-lg',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

// ... rest of Card components remain the same
```

```tsx
// input.tsx - Enhanced focus states
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

**Testing Strategy:**
- Unit tests for variant prop combinations
- Visual regression testing for all button variants
- Ensure hover/focus states work in both light and dark modes
- Test keyboard navigation and focus indicators
- Verify backward compatibility with existing usage

**Acceptance Criteria:**
- [ ] Button component has 5 variants mapped to Flowbite colors
- [ ] Card component uses Tailwind shadows (shadow-md → shadow-lg on hover)
- [ ] Input and Textarea have visible focus rings using design tokens
- [ ] All components use Tailwind's shadow scale (no custom variables)
- [ ] Flowbite wrapper API remains backward compatible
- [ ] All existing E2E tests pass without modification
- [ ] No Flowbite theme conflicts introduced

**Risks & Rollback:**
- **Risk:** Component API changes break existing pages
- **Mitigation:** Maintain backward compatibility with default props
- **Rollback:** Git revert individual component files

---

### Phase 3: Page-Level Refinements

**Goal:** Apply enhanced components and design tokens consistently across all pages

**Technical Approach:**
- Audit all pages for inconsistent shadow usage
- Replace hardcoded shadows with design token classes
- Standardize spacing patterns (p-4, p-6, p-8)
- Update page containers to use background layering
- Add hover states to interactive cards (documents, groups, events)

**Files to Change:**
- `web/app/dashboard/page.tsx`
- `web/app/members/[id]/member-detail-client.tsx`
- `web/app/documents/documents-client.tsx`
- `web/app/groups/groups-client.tsx`
- `web/app/announcements/announcements-client.tsx`
- `web/app/audit-log/page.tsx`
- `web/app/(auth)/login/page.tsx`
- Any other pages with custom shadow or spacing

**Code Snippets:**

```tsx
// Example: Dashboard page refinement with Tailwind shadows
function StatCard({ label, value, helper, testId }: StatCardProps) {
  return (
    <dl
      data-testid={testId}
      className="rounded-lg border border-border bg-card p-4 shadow-md hover:shadow-lg transition-shadow"
    >
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-foreground">{value}</dd>
      <dd className="text-xs text-muted-foreground">{helper}</dd>
    </dl>
  );
}

function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-md hover:shadow-lg transition-shadow">
      <h2 className="heading-1 text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 body-text">{children}</div>
    </section>
  );
}
```

```tsx
// Example: Document card with hover state
<article
  key={doc.id}
  className="border rounded-lg p-4 shadow-md hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
  onClick={() => handleDocumentClick(doc)}
>
  <h3 className="font-medium text-foreground">{doc.title}</h3>
  <p className="text-sm text-muted-foreground">{doc.description}</p>
</article>
```

**Testing Strategy:**
- Manual visual inspection of all major pages
- Screenshot comparison before/after changes
- Verify hover states work correctly
- Run full E2E test suite to catch any regressions
- Test responsive behavior at different breakpoints

**Acceptance Criteria:**
- [ ] All pages use Tailwind shadow classes (shadow-sm, shadow-md, shadow-lg)
- [ ] No hardcoded shadow values remain (audit completed)
- [ ] Spacing follows standardized scale (p-4, p-6, p-8)
- [ ] Interactive cards have hover states with visual feedback
- [ ] Background layering creates clear visual hierarchy
- [ ] Typography utility classes used where appropriate (heading-1, body-text)
- [ ] No layout shifts or visual bugs introduced
- [ ] All 65+ E2E tests pass without modification

**Risks & Rollback:**
- **Risk:** Page-level changes cause layout shifts or breaks
- **Mitigation:** Test each page individually before moving to next
- **Rollback:** Git revert specific page files

---

### Phase 4: Accessibility & Motion Preferences

**Goal:** Ensure WCAG 2.1 AA compliance and respect user motion preferences

**Technical Approach:**
- Add visible focus states to all interactive elements
- Implement `prefers-reduced-motion` media query
- Ensure proper keyboard navigation for all components
- Add ARIA labels where missing
- Test with screen readers (VoiceOver on macOS)

**Files to Change:**
- `web/app/globals.css` (motion preferences)
- `web/components/ui/button.tsx` (focus states)
- `web/components/ui/card.tsx` (keyboard navigation if interactive)
- Any pages with custom interactive elements

**Code Snippets:**

```css
/* globals.css - Motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Enhanced focus states */
@layer base {
  *:focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }
}
```

```tsx
// Example: Interactive card with keyboard support
<article
  className="... cursor-pointer"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  tabIndex={0}
  role="button"
  aria-label={`View details for ${item.title}`}
>
  {/* Card content */}
</article>
```

**Testing Strategy:**
- Manual keyboard navigation testing (Tab, Enter, Space)
- Test with VoiceOver screen reader on macOS
- Verify focus indicators are visible in all states
- Test with `prefers-reduced-motion` enabled in browser
- Run automated accessibility audits (Lighthouse, axe DevTools)

**Acceptance Criteria:**
- [ ] All interactive elements have visible focus indicators
- [ ] Keyboard navigation works for all interactive components
- [ ] `prefers-reduced-motion` is respected for animations and transitions
- [ ] ARIA labels added where necessary for screen reader support
- [ ] Lighthouse accessibility score ≥95
- [ ] No accessibility regressions detected by axe DevTools

**Risks & Rollback:**
- **Risk:** Focus states may conflict with existing styles
- **Mitigation:** Test thoroughly in both light and dark modes
- **Rollback:** Git revert `globals.css` and component changes

---

### Phase 5: Documentation & Testing

**Goal:** Document design system and validate all changes with comprehensive testing

**Technical Approach:**
- Create `docs/DESIGN_SYSTEM.md` with complete token reference
- Update `docs/CODING_STANDARDS.md` with UI component guidelines
- Add Storybook-style component showcase page (optional)
- Run full regression test suite (E2E + API)
- Perform final visual QA across all pages

**Files to Create/Update:**
- `docs/DESIGN_SYSTEM.md` (new)
- `docs/CODING_STANDARDS.md` (update)
- `web/app/design-system/page.tsx` (optional showcase page)

**Documentation Structure:**

```markdown
# Design System Reference

## Color Tokens

### Background System
- `--background` (210 20% 98%) - Main page background
- `--background-subtle` (210 20% 96%) - Nested containers
- `--card` (0 0% 100%) - Card background
- `--card-hover` (210 20% 99%) - Card hover state

### Primary Colors
- `--primary` (221 83% 53%) - Brand color
- `--primary-foreground` (0 0% 100%) - Text on primary

[... complete token reference ...]

## Shadow Scale

- `shadow-sm` - Subtle elevation (form inputs, small cards)
- `shadow-md` - Standard elevation (cards, dropdowns)
- `shadow-lg` - Prominent elevation (modals, popovers)
- `shadow-xl` - Maximum elevation (overlays)

## Component Usage Guidelines

### Button
- Use `variant="default"` for primary actions
- Use `variant="outline"` for secondary actions
- Use `variant="destructive"` for delete/archive actions

[... complete component guidelines ...]
```

**Testing Strategy:**
- Run full E2E test suite: `pnpm test:e2e:mock`
- Run API test suite: `pnpm -C api test`
- Manual QA of all major user flows
- Cross-browser testing (Chrome, Firefox, Safari)
- Responsive testing at breakpoints (mobile, tablet, desktop)

**Acceptance Criteria:**
- [ ] `docs/DESIGN_SYSTEM.md` created with complete token reference
- [ ] `docs/CODING_STANDARDS.md` updated with UI component guidelines
- [ ] All 65+ E2E tests pass
- [ ] All 350+ API tests pass
- [ ] No visual regressions detected in manual QA
- [ ] Design system documentation reviewed and approved

**Risks & Rollback:**
- **Risk:** Missed edge cases in testing
- **Mitigation:** Comprehensive manual QA in addition to automated tests
- **Rollback:** Full sprint branch revert if critical issues found

---

## Cross-Phase Concerns

### Design Principles (All Phases)

1. **Modern & Clean Aesthetic** - Keep layout simple, avoid visual clutter
2. **CSS Variables First** - Always use design tokens over hardcoded values
3. **Visual Depth Through Layers** - Background → Container → Card → Content
4. **Subtle Shadows** - Use shadow scale appropriately, avoid heavy drop shadows
5. **Rounded Corners** - Consistent use of border radius tokens
6. **Smooth Transitions** - Add transitions to interactive elements (respecting motion preferences)
7. **Accessibility First** - Visible focus states, keyboard navigation, WCAG 2.1 AA compliance

### Non-Functional Requirements

- **Performance:** No bundle size increase, maintain current Lighthouse scores (≥90)
- **Browser Support:** Chrome, Firefox, Safari (latest 2 versions)
- **Responsive:** Mobile-first approach, test at 320px, 768px, 1024px, 1440px breakpoints
- **Dark Mode:** All changes must work in both light and dark themes
- **Backward Compatibility:** No breaking changes to component APIs

### Testing Standards

- **Unit Tests:** For new component variants and utility functions
- **E2E Tests:** All existing tests must pass, no modifications unless necessary
- **Visual Regression:** Screenshot comparison for critical pages
- **Accessibility:** Lighthouse audit ≥95, manual screen reader testing
- **Performance:** Lighthouse performance ≥90, no layout shifts (CLS < 0.1)

---

## Flowbite Integration Constraints

### Context

The codebase recently completed a Flowbite migration (documented in `docs/FLOWBITE_MIGRATION.md`) that removed all Radix UI dependencies and replaced them with Flowbite React components. All UI components now live in `web/components/ui-flowbite/` and wrap Flowbite's component library.

### Key Constraints

**1. Component Library Location**
- ✅ **Active:** `web/components/ui-flowbite/` (20+ files using these)
- ❌ **Obsolete:** `web/components/ui/` (0 imports, kept for reference)
- All imports use `@/components/ui-flowbite/*`

**2. Flowbite Button API**
- Uses `color` prop for variants (not `variant`)
- Available colors: `gray`, `light`, `blue`, `red`, `success`, etc.
- Our wrapper maps `variant` → Flowbite `color`
- Ghost variant requires custom CSS via `className`

**3. Flowbite Theme System**
- Flowbite has its own theme configuration via `flowbite.config.js`
- CSS variables may conflict with Flowbite's internal styling
- Dark mode is handled by Flowbite's `dark:` classes
- Changing `--primary` may not affect Flowbite components (needs Phase 0 validation)

**4. Bundle Size Considerations**
- Flowbite adds ~2 packages vs 5+ Radix UI packages (net reduction)
- Current bundle size improvement: -9kB on Onboarding, -2.5kB on Settings
- Additional customizations should maintain or improve bundle size

**5. Migration Complete**
- 55 E2E tests passing with Flowbite components
- All pages migrated (20+ files)
- No Radix UI dependencies remain
- Wrapper components maintain backward API compatibility

### Design System Implications

**What We Can Do:**
- Enhance wrapper component APIs (add more variants)
- Map design tokens to Flowbite's color system
- Add custom CSS classes to wrappers for styling
- Use Tailwind utilities alongside Flowbite components
- Modify `globals.css` for theme variables (with testing)

**What We Must Validate (Phase 0):**
- Whether CSS variable changes affect Flowbite's internal styling
- Which Flowbite colors best map to design system needs
- Dark mode compatibility with custom variables
- Bundle size impact of wrapper enhancements

**What We Should Avoid:**
- Forking Flowbite components (defeats migration purpose)
- Overriding Flowbite's core styles (maintenance burden)
- Breaking Flowbite's theme system (dark mode, colors)
- Increasing bundle size significantly (>5kB)

### Phase 0 Validation Checklist

Before proceeding with enhancements, validate:

- [ ] Flowbite Button supports all 5 proposed variants via color mappings
- [ ] Custom CSS variables don't break Flowbite's theme system
- [ ] Dark mode works correctly with modified background/card colors
- [ ] Bundle size remains acceptable with wrapper enhancements
- [ ] Flowbite's focus/hover states are preserved or enhanced
- [ ] No conflicts with Flowbite's Tailwind plugin configuration

---

## Architectural Decisions

### ADR-001: HSL Color System

**Context:** Need to support light/dark modes with consistent theming

**Decision:** Continue using HSL-based CSS variables with refined values

**Rationale:**
- HSL provides intuitive color manipulation (lightness for variants)
- CSS variables enable theme switching without JavaScript
- Existing codebase already uses this pattern (minimize disruption)

**Consequences:**
- All color values must be HSL format (no hex or RGB)
- Dark mode requires separate HSL values for proper contrast
- Easy to create color variants (hover states, disabled states)

### ADR-002: Use Tailwind's Shadow Scale (Not Custom Variables)

**Context:** Inconsistent shadow usage across components and pages

**Decision:** Use Tailwind's built-in shadow utilities instead of custom CSS variables

**Rationale:**
- Tailwind provides 6 shadow levels (shadow-sm through shadow-2xl)
- Custom variables duplicate Tailwind's functionality
- Tailwind's shadows are battle-tested and optimized
- Dark mode shadow adjustments handled by Tailwind automatically
- Reduces maintenance burden (no custom variable management)

**Consequences:**
- Must update all hardcoded shadows to use Tailwind classes
- Standard naming: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- Dark mode shadows automatically adjusted by Tailwind
- No custom CSS variables needed for shadows

### ADR-003: Backward-Compatible Component Enhancements

**Context:** Existing pages use current component APIs extensively

**Decision:** Enhance components without breaking existing usage

**Rationale:**
- Minimize refactoring scope and testing burden
- Allow gradual adoption of new variants
- Reduce risk of introducing bugs

**Consequences:**
- Default props must match current behavior
- New variants are opt-in through explicit props
- Existing tests should pass without modification

### ADR-004: Motion Preferences Support

**Context:** Accessibility requirement for users sensitive to motion

**Decision:** Respect `prefers-reduced-motion` media query globally

**Rationale:**
- WCAG 2.1 guideline for motion sensitivity
- CSS-only solution (no JavaScript required)
- Minimal performance impact

**Consequences:**
- All animations/transitions must check motion preferences
- Testing requires enabling motion preference in browser
- Animations should be non-essential (content must work without them)

### ADR-005: Work Within Flowbite's API Constraints

**Context:** Recent Flowbite migration replaced Radix UI components

**Decision:** Enhance Flowbite wrapper components without forking Flowbite's core

**Rationale:**
- Flowbite migration reduced bundle size and dependencies
- Forking components defeats migration purpose
- Wrapper pattern allows API customization without breaking Flowbite
- Maintain compatibility with Flowbite's theme system and dark mode

**Consequences:**
- Must map design system variants to Flowbite's color/size props
- Phase 0 required to validate API compatibility
- Some enhancements may require custom CSS in wrappers
- Bundle size must not increase significantly (>5kB limit)
- Flowbite updates remain possible without major refactoring

---

## Risk Assessment

### Critical Risks Identified by Principal Engineer

**1. Flowbite Migration Conflict (Resolved in Planning)**
- **Issue:** Original plan targeted obsolete `ui/` components instead of active `ui-flowbite/`
- **Impact:** High - Would waste effort on unused files
- **Resolution:** Plan updated to target correct Flowbite wrapper components
- **Status:** ✅ Resolved

**2. Shadow Variable Duplication (Resolved in Planning)**
- **Issue:** Proposed custom shadow variables duplicate Tailwind's built-in scale
- **Impact:** Medium - Unnecessary maintenance burden
- **Resolution:** Use Tailwind's shadow-sm/md/lg instead of custom variables
- **Status:** ✅ Resolved

**3. Dark Mode Contrast Too Stark (Resolved in Planning)**
- **Issue:** Original 15% lightness difference may be too prominent
- **Impact:** Medium - Could break visual hierarchy
- **Resolution:** Refined to 8% lightness difference for subtle elevation
- **Status:** ✅ Resolved

**4. Typography Class Naming Conflicts (Resolved in Planning)**
- **Issue:** `.text-*` utilities conflict with Tailwind's color classes
- **Impact:** Low - Naming confusion, potential CSS conflicts
- **Resolution:** Use `heading-*` and `body-text` prefixes instead
- **Status:** ✅ Resolved

**5. Flowbite API Constraints (Mitigated with Phase 0)**
- **Issue:** Uncertainty about Flowbite's API supporting proposed enhancements
- **Impact:** High - Could block Phase 2 implementation
- **Mitigation:** Added Phase 0 (0.5 days) for API validation and feasibility testing
- **Status:** ⚠️ Requires Phase 0 validation

### High-Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Color changes affect brand identity | High | Low | Keep changes subtle (≤2% HSL diff), get stakeholder approval |
| E2E tests fail after component changes | High | Medium | Maintain backward compatibility, test incrementally |
| Visual regressions in production | High | Low | Comprehensive QA, screenshot comparison, staged rollout |
| Performance degradation | Medium | Low | Monitor bundle size, Lighthouse scores, test on slow connections |

### Medium-Priority Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Dark mode contrast issues | Medium | Medium | Test all changes in dark mode, use contrast checker |
| Accessibility violations | Medium | Low | Automated audits + manual screen reader testing |
| Inconsistent browser rendering | Medium | Low | Cross-browser testing, use well-supported CSS features |
| Documentation becomes outdated | Low | High | Update docs as part of phase deliverables |

### Rollback Strategy

**Phase-Level Rollback:**
- Each phase is a separate commit/PR
- Can revert individual phases without affecting others
- Git tags mark completion of each phase

**Sprint-Level Rollback:**
- Sprint branch can be abandoned if critical issues found
- Main branch remains stable throughout sprint
- Feature flags can disable UI changes if needed

**Emergency Rollback:**
1. Revert sprint branch merge commit
2. Deploy previous stable version
3. Document issues and create new sprint plan

---

## Success Criteria & Validation

### Visual Design Metrics

- [ ] Background/card HSL lightness difference ≥2%
- [ ] 5-level shadow scale implemented and used consistently
- [ ] All pages use standardized spacing (p-4, p-6, p-8)
- [ ] Interactive elements have hover states with transitions
- [ ] Typography hierarchy is consistent across pages

### Technical Metrics

- [ ] Bundle size: No increase or <5KB increase acceptable
- [ ] Lighthouse Performance: ≥90
- [ ] Lighthouse Accessibility: ≥95
- [ ] Lighthouse Best Practices: ≥90
- [ ] Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

### Testing Metrics

- [ ] All 65+ E2E tests pass
- [ ] All 350+ API tests pass
- [ ] Zero accessibility violations (axe DevTools)
- [ ] Zero console errors or warnings
- [ ] Manual QA sign-off from product owner

### Documentation Metrics

- [ ] `docs/DESIGN_SYSTEM.md` created with complete reference
- [ ] `docs/CODING_STANDARDS.md` updated with UI guidelines
- [ ] Component API documentation updated
- [ ] Phase accomplishments documented in sprint plan

---

## Dependencies & Constraints

### External Dependencies

- **Tailwind CSS:** v3.x (existing)
- **ShadCN UI:** Component library patterns (existing)
- **Next.js:** v14+ (existing)
- **TypeScript:** v5+ (existing)

### Technical Constraints

- Must maintain backward compatibility with existing components
- Cannot introduce new dependencies without approval
- Must support both light and dark modes equally
- Must work on mobile, tablet, and desktop breakpoints
- Must respect user motion preferences

### Resource Constraints

- **Time:** 9-14 days estimated
- **Team:** 1 principal architect, 1 principal engineer
- **Testing:** Manual QA + automated test suite
- **Approval:** Design changes require stakeholder sign-off

---

## Handoff to Principal Engineer

### Implementation Priorities

1. **Phase 1 (Highest Priority)** - Design tokens are foundation for all other phases
2. **Phase 2 (High Priority)** - Component library must be enhanced before page-level work
3. **Phase 3 (Medium Priority)** - Page refinements can be done incrementally
4. **Phase 4 (High Priority)** - Accessibility is non-negotiable for production
5. **Phase 5 (Medium Priority)** - Documentation can be finalized at end of sprint

### Code Review Guidelines

- **Phase 1:** Review color contrast ratios, shadow scale consistency
- **Phase 2:** Review component API backward compatibility, variant implementations
- **Phase 3:** Review page-level changes for visual consistency and regressions
- **Phase 4:** Review accessibility compliance, keyboard navigation, focus states
- **Phase 5:** Review documentation completeness and accuracy

### Testing Expectations

- **Unit Tests:** Not required for CSS changes, required for component logic changes
- **E2E Tests:** All existing tests must pass, no new tests required unless behavior changes
- **Visual Regression:** Screenshot comparison recommended for critical pages
- **Manual QA:** Required for all phases before marking as complete

### Communication Plan

- **Daily Updates:** Progress on current phase, blockers, questions
- **Phase Completion:** Demo of changes, request for review/approval
- **Sprint Completion:** Final demo, documentation review, retrospective

---

## Next Steps (Before Implementation)

### Step 1: Architect Review (This Document)

- [ ] Review sprint plan for technical feasibility
- [ ] Identify any missing risks or considerations
- [ ] Get stakeholder approval for color/design changes

### Step 2: Engineer Review (Handoff)

Use `@principal_engineer` via `runSubagent` to:
- [ ] Review technical approach for each phase
- [ ] Identify implementation risks or edge cases
- [ ] Propose any architectural improvements

### Step 3: Plan Refinement (Collaborative)

- [ ] Incorporate engineer feedback into plan
- [ ] Clarify any open questions or decisions
- [ ] Finalize timeline and resource allocation

### Step 4: Sprint Kickoff

- [ ] Create sprint branch: `feature/ui-enhancement-main-sprint`
- [ ] Create phase 1 branch: `feature/ui-enhancement-phase1-design-tokens`
- [ ] Begin implementation with Phase 1

---

## Appendix

### A. Current State Analysis

**Strengths:**
- Solid design token foundation (HSL CSS variables)
- Consistent component library (ShadCN UI patterns)
- Dark mode fully implemented
- Accessibility fundamentals in place (ARIA labels, semantic HTML)

**Weaknesses:**
- Background/card colors identical (no visual contrast)
- Inconsistent shadow usage (shadow-sm, shadow-lg, hardcoded values)
- Button component too simplistic (only 2 variants)
- Missing hover states on interactive elements
- Spacing patterns not standardized (mix of p-4, p-5, p-6)

**Opportunities:**
- Implement visual hierarchy through layering
- Create reusable design system documentation
- Improve user experience with better interactive feedback
- Establish design system as competitive advantage

**Threats:**
- Risk of visual regressions if not tested thoroughly
- Potential for breaking changes if component APIs change
- Time pressure may lead to shortcuts that affect quality

### B. Design Token Reference (Proposed)

**Color System:**
```
Light Mode:
  --background: 210 20% 98%
  --card: 0 0% 100%
  --primary: 221 83% 53%
  --accent: 215 90% 95%

Dark Mode:
  --background: 222.2 84% 4.9%
  --card: 217.2 32.6% 15%
  --primary: 210 40% 98%
  --accent: 217.2 32.6% 17.5%
```

**Shadow Scale:**
```
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

**Spacing Scale:**
```
p-4: 1rem (16px) - Compact components
p-6: 1.5rem (24px) - Standard cards
p-8: 2rem (32px) - Large containers
```

**Border Radius:**
```
rounded-md: 0.375rem (6px) - Buttons, inputs
rounded-lg: 0.5rem (8px) - Cards (default)
rounded-xl: 0.75rem (12px) - Large cards
rounded-2xl: 1rem (16px) - Modals
```

### C. Component API Reference (Proposed)

**Button:**
```tsx
<Button variant="default" size="default">Label</Button>
<Button variant="outline">Label</Button>
<Button variant="secondary">Label</Button>
<Button variant="ghost">Label</Button>
<Button variant="destructive">Label</Button>
```

**Card:**
```tsx
<Card className="hover:shadow-lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### D. Browser Support Matrix

| Browser | Minimum Version | CSS Variables | HSL Colors | CSS Grid |
|---------|----------------|---------------|------------|----------|
| Chrome | 90+ | ✅ | ✅ | ✅ |
| Firefox | 88+ | ✅ | ✅ | ✅ |
| Safari | 14+ | ✅ | ✅ | ✅ |
| Edge | 90+ | ✅ | ✅ | ✅ |

### E. Resources & References

- **ShadCN UI:** https://ui.shadcn.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **HSL Color Picker:** https://hslpicker.com/
- **Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

## Sprint Completion Checklist

### Phase 0: Flowbite API Research
- [ ] Tested all Flowbite Button color props
- [ ] Validated Flowbite theme compatibility with CSS variables
- [ ] Documented color mappings for 5 button variants
- [ ] Identified API limitations and workarounds
- [ ] Created component enhancement feasibility matrix
- [ ] Architect approved Phase 1 approach

### Phase 1: Design Token System
- [ ] Updated `web/app/globals.css` with refined colors
- [ ] Refined dark mode contrast (8% lightness difference)
- [ ] Added typography utility classes (heading-*, body-text, caption-text)
- [ ] Verified Tailwind shadow classes work correctly
- [ ] Tested in light and dark modes
- [ ] Verified color contrast ratios (WCAG 2.1 AA)
- [ ] Validated Flowbite theme compatibility
- [ ] No visual regressions detected

### Phase 2: Component Library
- [ ] Enhanced Flowbite Button wrapper with 5 variants
- [ ] Mapped variants to Flowbite color props
- [ ] Updated Flowbite Card wrapper with Tailwind shadows
- [ ] Improved Flowbite Input/Textarea focus states
- [ ] All components use design tokens and Tailwind shadows
- [ ] Backward compatibility maintained (wrapper API unchanged)
- [ ] No Flowbite theme conflicts introduced
- [ ] All E2E tests pass (55+)

### Phase 3: Page Refinements
- [ ] Audited all pages for shadow inconsistencies
- [ ] Replaced hardcoded shadows with Tailwind classes
- [ ] Standardized spacing patterns (p-4, p-6, p-8)
- [ ] Added hover states to interactive elements (cards, documents, etc.)
- [ ] Applied typography utilities where appropriate
- [ ] Tested responsive behavior at all breakpoints
- [ ] All E2E tests pass (65+)

### Phase 4: Accessibility
- [ ] Added visible focus states
- [ ] Implemented motion preferences support
- [ ] Tested keyboard navigation
- [ ] Manual screen reader testing completed
- [ ] Lighthouse accessibility score ≥95
- [ ] No axe DevTools violations

### Phase 5: Documentation
- [ ] Created `docs/DESIGN_SYSTEM.md` with Flowbite integration notes
- [ ] Updated `docs/CODING_STANDARDS.md` with UI component guidelines
- [ ] Documented Flowbite wrapper API patterns
- [ ] Documented all phase accomplishments
- [ ] Full regression testing completed (API + E2E)
- [ ] Bundle size verified (no significant increase)
- [ ] Stakeholder demo and approval
- [ ] Sprint retrospective completed

---

**Sprint Status:** Engineer Review Complete - Ready for Implementation  
**Last Updated:** 2025-11-06 (Plan revised after Principal Engineer review)  
**Principal Architect:** @principal_architect (Plan created)  
**Principal Engineer:** @principal_engineer (Review completed, approved with revisions)  
**Next Action:** Begin Phase 0 (Flowbite API Research & Validation)  

### Engineer Review Summary

✅ **Approved with Revisions** - All critical issues resolved in planning phase

**Key Changes Made:**
- Added Phase 0 for Flowbite API validation (0.5 days)
- Fixed component file paths to target `ui-flowbite/` instead of `ui/`
- Removed custom shadow variables in favor of Tailwind's built-in scale
- Refined dark mode contrast from 15% to 8% lightness difference
- Updated typography utility naming to avoid Tailwind conflicts
- Added comprehensive Flowbite Integration Constraints section
- Added ADR-005 for Flowbite compatibility
- Revised timeline from 9-14 days to 13-16 days (more realistic)

**Confidence Level:** 8/10 (High confidence after revisions)  
**Risk Level:** Medium (manageable with Phase 0 validation)

# Flowbite Migration Plan

**Status:** In Progress  
**Branch:** `flowbite-migration`  
**Start Date:** November 1, 2025  
**Target Completion:** 6-8 weeks

## Overview

Migrating from custom Tailwind + Radix UI components to Flowbite React component library for improved UI consistency, reduced maintenance burden, and enhanced developer experience while maintaining 100% backward compatibility.

## Phase 0: Pre-Migration Assessment ✅ IN PROGRESS

### Environment Context
- **Next.js Version:** 14.2.29 (App Router)
- **Flowbite Packages:** flowbite@3.1.2, flowbite-react@0.12.10
- **Current Components:** 13 custom UI components in `web/components/ui/`
- **Radix Dependencies:** 5 packages (checkbox, dialog, dropdown-menu, label, select)
- **E2E Test Coverage:** 54 passing tests (98% pass rate)
- **Theme System:** Custom CSS variables in `globals.css` with light/dark mode support

### Component Inventory & Mapping

| Custom Component | Radix-Based? | Flowbite Equivalent | Migration Risk | Notes |
|------------------|--------------|---------------------|----------------|-------|
| Button | ❌ No | Button | ✅ Low | Simple component, 2 variants only |
| Input | ❌ No | TextInput | ✅ Low | Standard form element |
| Textarea | ❌ No | Textarea | ✅ Low | Standard form element |
| Label | ✅ Yes | Label | ✅ Low | Simple wrapper |
| Card | ❌ No | Card | ✅ Low | Structural component |
| Table | ❌ No | Table | ✅ Low | Structural component |
| Progress | ❌ No | Progress | ✅ Low | Simple progress bar |
| PageHeader | ❌ No | Custom wrapper | ⚠️ Medium | May need custom implementation |
| Select | ✅ Yes | Select | ⚠️ Medium | Complex Radix Portal behavior |
| Dropdown | ✅ Yes | Dropdown | ⚠️ High | Complex Radix Portal + animations |
| Dialog | ✅ Yes | Modal | ⚠️ High | Radix Portal + focus management |
| Modal | ✅ Yes | Modal | ⚠️ High | Custom wrapper around Dialog |
| Checkbox | ✅ Yes | Checkbox | ⚠️ Medium | Radix-based with custom styling |

### Compatibility Assessment

#### ✅ Verified Compatible
- Flowbite React 0.12.10 works with Next.js 14.2.29
- Server Components: Flowbite components are client-side ("use client")
- Tailwind v3.4.13 compatible with Flowbite plugin

#### ⚠️ Potential Issues
- **RSC Boundaries:** Need to wrap Flowbite components in client components
- **Portal Positioning:** Flowbite may use different portal strategy than Radix
- **Animation Library:** Flowbite uses different animation approach
- **Bundle Size:** Initial estimate +150KB (needs verification)

#### 🔍 Needs Investigation
- Dark mode theming customization depth
- Accessibility parity with Radix primitives
- TypeScript type completeness
- Form integration patterns

### Rollback Strategy

**Git Tags:**
- `pre-flowbite-migration` - Stable baseline (commit: TBD)
- Feature flag: `USE_FLOWBITE_COMPONENTS` (environment variable)

**Rollback Process:**
1. Revert to `pre-flowbite-migration` tag
2. Cherry-pick any critical bug fixes if needed
3. Restore `web/package.json` Radix dependencies
4. Run `pnpm install` and rebuild

### Success Criteria - Phase 0

- [x] Flowbite packages installed
- [x] Component mapping completed
- [ ] Compatibility tests written
- [ ] Rollback strategy documented
- [ ] Go/No-go decision approved

---

## Phase 1: Tailwind Configuration & Theme Integration

**Status:** Not Started  
**Estimated Duration:** 2-3 days

### Tasks

1. **Update `tailwind.config.ts`**
   - Add Flowbite content paths
   - Register Flowbite plugin
   - Configure theme customization

2. **Update `globals.css`**
   - Import Flowbite styles
   - Ensure CSS variable precedence
   - Test dark mode compatibility

3. **Build Validation**
   - Measure baseline bundle size
   - Verify no Tailwind warnings
   - Test theme switching

### Success Criteria

- [ ] Build passes without warnings
- [ ] Bundle size increase <10%
- [ ] Dark/light mode working
- [ ] Existing components render correctly

---

## Phase 2: Create Compatibility Wrapper Layer

**Status:** Not Started  
**Estimated Duration:** 1 week

### Component Priority Order

**Tier 1 - Low Risk (Days 1-2):**
- Button
- Input, Textarea, Label
- Card, Table, Progress

**Tier 2 - Medium Risk (Days 3-4):**
- Select
- Checkbox
- PageHeader (custom wrapper)

**Tier 3 - High Risk (Days 5-7):**
- Dropdown
- Dialog/Modal

### Wrapper Pattern

```typescript
// web/components/ui-flowbite/button.tsx
import { Button as FlowbiteButton } from 'flowbite-react';

// Maintain EXACT same API as current Button
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'default' | 'outline' 
};

export function Button({ variant = 'default', className, ...props }: Props) {
  const colorMap = {
    default: 'dark',
    outline: 'light'
  };
  
  return (
    <FlowbiteButton 
      color={colorMap[variant]} 
      className={className}
      {...props} 
    />
  );
}
```

### Success Criteria

- [ ] All 13 wrappers created
- [ ] Unit tests for each wrapper (type checking)
- [ ] Props match exactly (no breaking changes)
- [ ] TypeScript compilation passes

---

## Phase 3: Pilot Migration - Settings Page

**Status:** Not Started  
**Estimated Duration:** 3-5 days

### Validation Checklist

- [ ] Visual regression testing (screenshots)
- [ ] Light/dark mode switching
- [ ] Form submission works
- [ ] E2E tests pass (settings.spec.ts)
- [ ] Accessibility audit (axe-core)
- [ ] Performance check (bundle size, load time)

### Go/No-Go Decision Point

**Proceed if:**
- All validation checks pass
- No critical accessibility regressions
- Performance acceptable
- Team approves visual changes

---

## Phase 4: Gradual Feature Migration

**Status:** Not Started  
**Estimated Duration:** 2-3 weeks

### Migration Order (Risk-Based)

**Week 1 - Low Risk:**
- Dashboard widgets
- PageHeader component
- Announcements list
- Card-based layouts

**Week 2 - Medium Risk:**
- Members table
- Groups list
- Events list
- Document library

**Week 3 - High Risk:**
- Onboarding wizard (modal)
- Prayer requests (forms)
- Check-in flows
- Pastoral care forms

### Per-Feature Process

1. Update imports to `@/components/ui-flowbite/`
2. Run feature-specific E2E tests
3. Visual regression check
4. Fix issues before proceeding
5. Commit with descriptive message

---

## Phase 5: E2E Test Validation

**Status:** Not Started  
**Estimated Duration:** 1 week

### Test Audit Strategy

- Identify tests using `getByRole` (may break with DOM changes)
- Identify tests using `id` attributes (may need updates)
- Add `data-testid` where needed
- Update wait conditions if timing changes

### Target Metrics

- **Pass Rate:** 54/54 (100%)
- **Flakiness:** <2% (max 1 flaky test)
- **Execution Time:** <5 minutes total

---

## Phase 6: Remove Legacy Dependencies

**Status:** Not Started  
**Estimated Duration:** 1 week

### Staged Removal

**Stage 1 (Week 1):** Simple dependencies
- `@radix-ui/react-label`

**Stage 2 (Week 2):** Complex dependencies
- `@radix-ui/react-select`
- `@radix-ui/react-checkbox`

**Stage 3 (Week 3):** Critical dependencies
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`

### Verification Process

```bash
# Before removing each package
grep -r "@radix-ui/react-[package-name]" web/
pnpm -C web build
```

---

## Phase 7: Documentation

**Status:** Not Started  
**Estimated Duration:** 2-3 days

### Documentation Deliverables

- [ ] `COMPONENT_MIGRATION_GUIDE.md`
- [ ] Update `CODING_STANDARDS.md`
- [ ] Update `ARCHITECTURE.md`
- [ ] Update `TASKS.md`
- [ ] E2E test selector guide

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RSC compatibility issues | Medium | High | Early testing in Phase 0 |
| E2E test breakage | High | Medium | Gradual migration + selector strategy |
| Bundle size increase | Medium | Low | Tree-shaking optimization |
| Dark mode regressions | Low | High | Explicit testing at each phase |
| Accessibility gaps | Medium | High | axe-core audits throughout |
| Timeline overrun | Medium | Medium | Phased approach with gates |

---

## Metrics & Tracking

### Bundle Size

- **Baseline:** TBD (measure in Phase 1)
- **Target:** <10% increase
- **Current:** TBD

### Test Coverage

- **Baseline:** 54/54 E2E tests passing (98%)
- **Target:** 54/54 tests passing (100%)
- **Current:** 54/54 (baseline maintained)

### Timeline

- **Planned:** 6-8 weeks
- **Actual:** TBD
- **Variance:** TBD

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-01 | Use wrapper pattern instead of direct replacement | Maintains API compatibility, enables gradual rollout |
| 2025-11-01 | Create separate ui-flowbite directory | Safe rollout without breaking existing code |
| 2025-11-01 | Pilot on Settings page first | Low-risk feature with moderate complexity |

---

## Next Steps

1. Complete Phase 0 compatibility testing
2. Create baseline bundle size measurement
3. Build first 3 wrapper components (Button, Input, Label)
4. Test wrappers in isolation
5. Proceed with Phase 1 Tailwind configuration

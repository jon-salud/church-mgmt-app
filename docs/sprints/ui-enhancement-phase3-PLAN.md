# Phase 3: Page-Level Refinements - Implementation Plan

**Sprint:** UI/UX Enhancement Sprint  
**Phase:** 3 of 5  
**Duration:** 3 days  
**Status:** In Progress

## Goal

Apply enhanced Card, Button, and design tokens consistently across all application pages to achieve uniform visual depth, hover states, spacing, and interactive feedback.

## Technical Approach

### Foundation from Previous Phases
- **Phase 1:** Design tokens established (background colors, typography utilities)
- **Phase 2:** Card with Tailwind shadows (shadow-sm → shadow-md hover), Input/Textarea with error states, Button with 5 variants

### Page Refinement Strategy
1. **Shadow Consistency:** Replace all hardcoded shadows with Tailwind classes (shadow-sm, shadow-md, shadow-lg)
2. **Hover States:** Add interactive feedback to all clickable cards (groups, events, documents, members)
3. **Spacing Standardization:** Use consistent padding scale (p-4, p-6, p-8)
4. **Typography Application:** Apply heading-* and body-text utilities from Phase 1

## Scope

### Pages to Refine (Priority Order)

**High-Traffic Pages (Priority 1):**
- `web/app/dashboard/page.tsx` - Main dashboard with stat cards
- `web/app/members/members-client.tsx` - Member directory listing
- `web/app/groups/groups-client.tsx` - Groups listing
- `web/app/events/events-client.tsx` - Events listing

**Content Pages (Priority 2):**
- `web/app/documents/documents-client.tsx` - Document library
- `web/app/announcements/announcements-client.tsx` - Announcements feed
- `web/app/giving/page.tsx` - Giving page
- `web/app/prayer/page.tsx` - Prayer wall

**Detail Pages (Priority 3):**
- `web/app/members/[id]/member-detail-client.tsx` - Member profile
- `web/app/groups/[id]/group-detail-client.tsx` - Group details
- `web/app/events/[id]/events-detail-client.tsx` - Event details (if exists)

**Forms & Settings (Priority 4):**
- `web/app/settings/page.tsx` - Settings page
- `web/app/requests/request-form.tsx` - Request submission form
- `web/app/pastoral-care/client-page.tsx` - Pastoral care dashboard

**Auth Pages (Priority 5):**
- `web/app/(auth)/login/page.tsx` - Login page

## Implementation Steps

### Step 1: Audit Current State
**Goal:** Document inconsistencies before making changes

**Tasks:**
- [ ] Search for hardcoded shadow values (shadow-*, drop-shadow-, box-shadow)
- [ ] Identify cards without hover states
- [ ] Note inconsistent padding patterns (p-3, p-5, p-7)
- [ ] List pages with outdated button variants

**Commands:**
```bash
# Find hardcoded shadows
grep -r "shadow-\[" web/app --include="*.tsx"
grep -r "drop-shadow" web/app --include="*.tsx"

# Find inconsistent padding
grep -r "p-[0-9]" web/app --include="*.tsx" | grep -v "p-4\|p-6\|p-8"

# Check for old button usage
grep -r "<button" web/app --include="*.tsx"
```

### Step 2: Dashboard Page Refinement
**File:** `web/app/dashboard/page.tsx`

**Changes:**
- [ ] Update stat cards to use shadow-md with hover:shadow-lg
- [ ] Apply heading-1 class to page title
- [ ] Standardize spacing (p-6 for cards, p-4 for compact stat cards)
- [ ] Add transition-shadow duration-200 to interactive elements

**Example:**
```tsx
// Before
<div className="rounded-lg border bg-card p-4 shadow-sm">

// After
<div className="rounded-lg border bg-card p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
```

### Step 3: Listing Pages (Members, Groups, Events, Documents)
**Files:**
- `web/app/members/members-client.tsx`
- `web/app/groups/groups-client.tsx`
- `web/app/events/events-client.tsx`
- `web/app/documents/documents-client.tsx`

**Changes:**
- [ ] Add hover:shadow-lg to clickable cards
- [ ] Add hover:border-primary/50 to indicate interactivity
- [ ] Apply transition-all duration-200 for smooth transitions
- [ ] Use heading-2 for card titles
- [ ] Use body-text for descriptions

**Example:**
```tsx
// Interactive card with hover state
<article
  key={item.id}
  onClick={() => navigate(item.id)}
  className="border rounded-lg p-4 shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer"
>
  <h3 className="heading-2">{item.title}</h3>
  <p className="body-text text-muted-foreground">{item.description}</p>
</article>
```

### Step 4: Detail Pages
**Files:**
- `web/app/members/[id]/member-detail-client.tsx`
- `web/app/groups/[id]/group-detail-client.tsx`

**Changes:**
- [ ] Update section cards to shadow-md
- [ ] Add hover states to nested cards (attendance history, giving history)
- [ ] Standardize spacing (p-6 for main sections)
- [ ] Apply typography utilities

### Step 5: Forms & Settings
**Files:**
- `web/app/settings/page.tsx`
- `web/app/requests/request-form.tsx`
- `web/app/pastoral-care/client-page.tsx`

**Changes:**
- [ ] Ensure Input/Textarea components use error prop (Phase 2)
- [ ] Update form container cards to shadow-md
- [ ] Standardize button variants (outline for secondary, destructive for delete)
- [ ] Apply consistent spacing

### Step 6: Auth Pages
**Files:**
- `web/app/(auth)/login/page.tsx`

**Changes:**
- [ ] Update login card to shadow-lg (prominent elevation)
- [ ] Apply heading-display to title
- [ ] Ensure button uses default variant

### Step 7: Regression Testing
**Tasks:**
- [ ] Visual inspection of all updated pages
- [ ] Test hover states work correctly
- [ ] Verify responsive behavior at mobile/tablet breakpoints
- [ ] Run E2E test suite: `pnpm test:e2e:mock`
- [ ] Confirm no layout shifts or broken styles

## Acceptance Criteria

### Visual Consistency
- [ ] All cards use Tailwind shadow classes (no hardcoded shadows)
- [ ] Interactive cards have hover:shadow-lg and hover:border-primary/50
- [ ] Smooth transitions on all hover states (duration-200)
- [ ] Consistent spacing across all pages (p-4, p-6, p-8)

### Typography
- [ ] Page titles use heading-display or heading-1
- [ ] Card titles use heading-2
- [ ] Body text uses body-text class
- [ ] Caption text uses caption-text class

### Interactive States
- [ ] All clickable cards show visual feedback on hover
- [ ] Cursor changes to pointer on interactive elements
- [ ] Focus states visible on keyboard navigation

### Quality Gates
- [ ] TypeScript: 0 errors
- [ ] ESLint: No new warnings
- [ ] Build: Success
- [ ] All E2E tests pass (65+)
- [ ] No visual regressions reported

## Testing Strategy

### Manual Testing Checklist
- [ ] Dashboard loads correctly with stat card hover states
- [ ] Member directory cards have hover effects
- [ ] Group cards show hover elevation
- [ ] Event cards respond to hover
- [ ] Document cards have interactive feedback
- [ ] Forms render correctly with new Input/Textarea styles
- [ ] Login page displays with proper elevation
- [ ] Dark mode works correctly on all pages
- [ ] Mobile/tablet layouts remain functional

### Automated Testing
- [ ] Run full E2E suite: `pnpm test:e2e:mock`
- [ ] Run API tests: `pnpm -C api test`
- [ ] Check build: `pnpm build`
- [ ] Lint check: `pnpm lint`

## Risks & Rollback

**Risk:** Page-level changes cause layout shifts or breaks  
**Mitigation:** Test each page individually before moving to next, commit incrementally  
**Rollback:** Git revert specific page files, or revert entire branch if multiple issues

**Risk:** Hover states interfere with mobile touch interactions  
**Mitigation:** Test on actual mobile devices, use hover:* classes (automatically disabled on touch devices)  
**Rollback:** Remove hover classes if issues detected

**Risk:** E2E tests fail due to visual changes  
**Mitigation:** Most tests use data-testid attributes (not visual selectors), should be unaffected  
**Rollback:** Adjust test selectors if necessary (unlikely)

## Quality Gates

Before committing each page:
1. ✅ TypeScript builds without errors
2. ✅ Page renders correctly in light and dark modes
3. ✅ Hover states work as expected
4. ✅ No layout shifts or visual bugs
5. ✅ Prettier formatting applied

Before marking phase complete:
1. ✅ All E2E tests pass (65+)
2. ✅ All API tests pass (350+)
3. ✅ Build succeeds without warnings
4. ✅ ESLint shows no new warnings
5. ✅ Manual QA sign-off for visual consistency

## Notes

- Focus on high-traffic pages first (dashboard, members, groups, events)
- Commit incrementally (per page or small groups of related pages)
- Keep changes minimal - only shadows, spacing, typography utilities
- Document any unexpected issues or workarounds
- Take screenshots before/after for accomplishments section

---

## Accomplishments

**Status:** 🔄 In Progress  
**Started:** 2025-11-06

_Accomplishments will be documented here as the phase progresses._

### Commits
- TBD

### Pages Updated
- TBD

### Issues Resolved
- TBD

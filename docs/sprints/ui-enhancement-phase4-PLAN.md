# Phase 4: Accessibility & Motion Preferences - Implementation Plan

**Sprint:** UI/UX Enhancement Sprint  
**Phase:** 4 of 5  
**Duration:** 1.5 days  
**Status:** In Progress

## Goal

Ensure WCAG 2.1 AA compliance and respect user motion preferences across the Church Management App. This phase focuses on making all UI enhancements accessible to users with disabilities and those sensitive to motion/animations.

## Technical Approach

### 1. Motion Preferences Support
Implement global `prefers-reduced-motion` media query to respect user accessibility settings:
- Disable or minimize animations for users who prefer reduced motion
- Reduce transition durations to near-instantaneous (0.01ms)
- Disable auto-playing animations and smooth scrolling
- Ensure all content remains accessible without motion effects

### 2. Focus State Enhancement
Ensure all interactive elements have visible, consistent focus indicators:
- Apply global focus-visible styles with ring-2 and ring-offset-2
- Use `--ring` color token for consistent theming
- Test focus visibility in both light and dark modes
- Verify focus indicators don't overlap with content

### 3. Keyboard Navigation Validation
Verify all interactive elements are keyboard accessible:
- Test Tab navigation order makes logical sense
- Ensure Enter/Space keys activate buttons and links
- Verify Escape key closes modals and dropdowns
- Test arrow keys for navigation where appropriate

### 4. ARIA Labels & Semantic HTML
Add missing accessibility attributes:
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Add aria-label to icon-only buttons
- Use semantic HTML (button, nav, article, section)
- Provide sr-only text for screen reader context

## Scope

### Priority 1: Motion Preferences (Critical for WCAG)
**Target:** `web/app/globals.css`

Add global motion preference handling at the base layer to affect all animations and transitions throughout the app.

**Implementation:**
```css
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
```

**Acceptance Criteria:**
- All hover transitions respect motion preferences
- Shadow transitions (shadow-md → shadow-lg) are disabled
- Page scrolling is instantaneous (no smooth behavior)
- Animations are reduced to near-instantaneous
- Content remains fully functional without animations

### Priority 2: Focus State Enhancement (Critical for Keyboard Users)
**Target:** `web/app/globals.css`

Enhance global focus-visible styles to provide clear visual indicators for keyboard navigation.

**Current State:**
- Basic focus styles may be inconsistent
- Some interactive elements may lack visible focus indicators
- Focus rings may not be visible in all themes

**Proposed Enhancement:**
```css
@layer base {
  *:focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }
  
  /* Specific focus styles for buttons */
  button:focus-visible,
  a:focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }
}
```

**Acceptance Criteria:**
- All buttons have visible focus rings when navigated via keyboard
- All links have visible focus rings
- Focus rings are visible in both light and dark modes
- Focus offset prevents overlap with content
- Focus styles use design system color tokens

### Priority 3: Interactive Card Accessibility (High Priority)
**Target:** Cards with onClick handlers across pages

Ensure cards that act as buttons are keyboard accessible and properly labeled for screen readers.

**Pages with Interactive Cards:**
- `web/app/groups/groups-client.tsx` - Group cards
- `web/app/events/events-client.tsx` - Event cards
- `web/app/documents/documents-client.tsx` - Document cards
- `web/app/announcements/announcements-client.tsx` - Announcement cards
- `web/app/prayer/client-page.tsx` - Prayer request cards

**Pattern to Apply:**
```tsx
<article
  className="rounded-lg border border-border bg-card p-6 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  tabIndex={0}
  role="button"
  aria-label={`View ${item.title}`}
>
  {/* Card content */}
</article>
```

**Acceptance Criteria:**
- All clickable cards are keyboard accessible (Tab + Enter/Space)
- Cards have proper ARIA labels for screen readers
- Tab order is logical and follows visual layout
- Cursor changes to pointer on hover
- Focus states are visible

### Priority 4: Icon-Only Buttons (Medium Priority)
**Target:** Buttons with only icons (no text labels)

Add accessible labels to icon-only buttons throughout the application.

**Files to Audit:**
- `web/app/dashboard/page.tsx` - Action buttons
- `web/app/members/members-client.tsx` - Table actions
- `web/app/events/events-client.tsx` - Edit/delete buttons
- `web/components/ui-flowbite/button.tsx` - Button component itself

**Pattern to Apply:**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleEdit}
  aria-label="Edit event"
>
  <PencilIcon className="h-4 w-4" />
  <span className="sr-only">Edit event</span>
</Button>
```

**Acceptance Criteria:**
- All icon-only buttons have aria-label attributes
- Screen readers announce button purpose clearly
- Visual appearance unchanged
- Hover tooltips added where helpful (optional enhancement)

### Priority 5: Form Accessibility (Medium Priority)
**Target:** Forms with inputs and validation

Ensure form inputs have proper labels and error messages are accessible.

**Files to Audit:**
- `web/app/requests/request-form.tsx` - Request submission form
- `web/app/settings/settings-form.tsx` - Settings form
- Any forms in modal dialogs

**Pattern to Apply:**
```tsx
<div>
  <label htmlFor="requestType" className="heading-2">
    Request Type
  </label>
  <select
    id="requestType"
    aria-describedby="requestType-error"
    aria-invalid={!!errors.requestType}
    className="..."
  >
    {/* options */}
  </select>
  {errors.requestType && (
    <p id="requestType-error" className="text-sm text-destructive" role="alert">
      {errors.requestType.message}
    </p>
  )}
</div>
```

**Acceptance Criteria:**
- All form inputs have associated labels (via htmlFor)
- Error messages are announced by screen readers
- Required fields are marked with aria-required
- Invalid fields are marked with aria-invalid
- Error messages use role="alert" for immediate announcement

## Testing Strategy

### Manual Testing

**1. Keyboard Navigation**
- Navigate entire app using only keyboard (no mouse)
- Verify Tab order makes logical sense on each page
- Test Enter/Space to activate buttons and links
- Test Escape to close modals and dropdowns
- Verify no keyboard traps exist

**2. Motion Preferences**
- Enable "Reduce motion" in macOS System Preferences
- Navigate through app and verify no jarring animations
- Confirm hover transitions are near-instantaneous
- Check that shadow transitions are disabled
- Verify smooth scrolling is disabled

**3. Screen Reader Testing**
- Enable VoiceOver on macOS (Cmd+F5)
- Navigate through dashboard and verify all content is announced
- Test interactive cards are properly labeled
- Verify icon-only buttons announce their purpose
- Check form error messages are announced
- Test modal dialogs for proper focus management

**4. Focus Visibility**
- Tab through all interactive elements
- Verify focus rings are visible on all buttons/links
- Test in both light and dark modes
- Check focus rings don't overlap content
- Verify focus styles are consistent

### Automated Testing

**1. Lighthouse Accessibility Audit**
```bash
# Run Lighthouse in dev mode
npm run dev
# Open http://localhost:3000 in Chrome
# DevTools > Lighthouse > Accessibility category
# Target score: ≥95
```

**2. axe DevTools Extension**
- Install axe DevTools browser extension
- Run automated scan on each major page
- Address all critical and serious issues
- Document any warnings that are false positives

**3. E2E Accessibility Tests**
Verify existing E2E tests continue to pass:
```bash
pnpm test:e2e:mock
```

**Expected Results:**
- 57+ tests passing (current baseline)
- No new accessibility violations introduced
- Focus management tests pass
- Keyboard navigation tests pass

## Implementation Steps

### Step 1: Motion Preferences (0.5 days)
1. Add `prefers-reduced-motion` media query to `globals.css`
2. Test hover transitions on cards (should be instantaneous)
3. Verify shadow transitions are disabled
4. Test smooth scrolling is disabled
5. Run visual QA to ensure no layout issues
6. Commit: `feat(a11y): Add prefers-reduced-motion support`

### Step 2: Focus State Enhancement (0.5 days)
1. Add enhanced focus-visible styles to `globals.css`
2. Test keyboard navigation on all major pages
3. Verify focus rings in light and dark modes
4. Check focus offset doesn't cause layout shifts
5. Test with real keyboard users if possible
6. Commit: `feat(a11y): Enhance focus-visible states globally`

### Step 3: Interactive Card Accessibility (0.25 days)
1. Identify all clickable cards in the app (5-7 pages)
2. Add keyboard event handlers (Enter/Space)
3. Add tabIndex={0} and role="button"
4. Add descriptive aria-label attributes
5. Test keyboard navigation on each page
6. Commit: `feat(a11y): Make interactive cards keyboard accessible`

### Step 4: Icon Button Labels (0.15 days)
1. Audit all icon-only buttons
2. Add aria-label to each button
3. Add sr-only spans where helpful
4. Test with screen reader
5. Commit: `feat(a11y): Add labels to icon-only buttons`

### Step 5: Form Accessibility (0.1 days)
1. Verify all inputs have labels (most already do)
2. Add aria-describedby to inputs with errors
3. Add aria-invalid to invalid inputs
4. Add role="alert" to error messages
5. Test form submission with screen reader
6. Commit: `feat(a11y): Enhance form accessibility`

## Risk Management

### Key Risks

1. **Focus States Too Prominent** - Focus rings may be visually distracting
   - **Mitigation:** Use subtle ring-offset-2 and test with designers
   - **Rollback:** Reduce ring width from ring-2 to ring-1

2. **Motion Preferences Break Animations** - Important animations may be disabled
   - **Mitigation:** Ensure all animations are non-essential (content works without them)
   - **Rollback:** Reduce scope to only specific animations

3. **Keyboard Navigation Conflicts** - Tab order may be illogical on complex pages
   - **Mitigation:** Test incrementally, adjust tabIndex where needed
   - **Rollback:** Revert keyboard handlers on problematic components

4. **Screen Reader Compatibility** - ARIA labels may not work as expected
   - **Mitigation:** Test with VoiceOver on macOS, follow ARIA best practices
   - **Rollback:** Remove ARIA attributes if they cause confusion

### Mitigation Strategies

- **Incremental Implementation:** Commit each priority separately
- **Thorough Testing:** Manual keyboard/screen reader testing before each commit
- **Cross-Browser Testing:** Test in Chrome, Safari, Firefox
- **Real User Testing:** Get feedback from users who rely on accessibility features
- **Automated Audits:** Run Lighthouse and axe DevTools after each change

### Rollback Plan

If critical accessibility issues are discovered:
1. Identify problematic commit (Step 1-5 are separate commits)
2. Git revert specific commit without affecting others
3. Document issue and create follow-up task
4. Consider alternative implementation approach

---

## Success Criteria

✅ Motion preferences respected (animations disabled when user preference set)  
✅ All interactive elements have visible focus indicators  
✅ Keyboard navigation works for all interactive components  
✅ All icon-only buttons have accessible labels  
✅ Form inputs have proper labels and error associations  
✅ Lighthouse accessibility score ≥95  
✅ No accessibility regressions detected by axe DevTools  
✅ All E2E tests pass (57+ passing)  
✅ VoiceOver screen reader testing successful

---

## Accomplishments

**Status:** 🔄 In Progress  
**Started:** 2025-11-06

_Accomplishments will be documented here as the phase progresses._

### Commits
- TBD

### Issues Resolved
- TBD

### Accessibility Improvements
- TBD

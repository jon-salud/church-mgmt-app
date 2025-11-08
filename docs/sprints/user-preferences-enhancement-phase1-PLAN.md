# User Preferences Enhancement - Phase 1 Plan

**Sprint:** user-preferences-enhancement  
**Phase:** 1  
**Title:** User Settings Dropdown Menu  
**Timeline:** 3-4 hours  
**Created by:** @principal_engineer  
**Date:** 7 November 2025  
**Status:** Ready for Implementation

---

## 🎯 Phase Objectives

Add a user settings dropdown menu to the header that provides easy access to user preferences. This replaces the current pattern of displaying username text + logout button with a more discoverable dropdown menu.

### Success Criteria
- ✅ Dropdown appears when clicking username in header
- ✅ Dropdown contains user info (name + email), Settings link, and Logout button
- ✅ Settings link opens modal (Phase 3 integration)
- ✅ Dropdown works on all pages with header
- ✅ Keyboard navigation (Enter/Escape) works
- ✅ Mobile responsive (44px+ tap targets)
- ✅ Accessibility compliant (ARIA labels, focus management)
- ✅ No regression in existing logout functionality

---

## 🏗️ Technical Approach

### Architecture Decision: Component Extraction Pattern

**Decision:** Extract `AppLayout` header to `AppLayoutClient` component

**Rationale:**
- `AppLayout` is a React Server Component (cannot use `useState` for modal)
- Header needs client interactivity for dropdown and future modal state
- Maintains server-side data fetching for user info
- Follows established pattern from theme system

**Pattern:** Server Component → Client Component boundary
```
AppLayout (RSC) → AppLayoutClient (Client)
                    ↓
              UserMenu (Client)
```

### Files to Change

#### 1. New Files
- `web/components/user-menu.tsx` - Dropdown component
- `web/app/app-layout-client.tsx` - Client wrapper for header

#### 2. Modified Files
- `web/app/app-layout.tsx` - Extract header to client component

#### 3. Test Files
- `web/components/__tests__/user-menu.test.tsx` - Unit tests
- `web/e2e/user-menu.spec.ts` - E2E tests

---

## 📋 Implementation Tasks

### 1.1 Create UserMenu Component
- [ ] Create `web/components/user-menu.tsx` with `'use client'` directive
- [ ] Implement DropdownMenu compound component usage
- [ ] Add user info display (name + email)
- [ ] Add Settings and Logout menu items
- [ ] Implement accessibility features (ARIA labels, keyboard nav)

### 1.2 Create AppLayoutClient Wrapper
- [ ] Create `web/app/app-layout-client.tsx` with `'use client'` directive
- [ ] Extract header JSX from AppLayout
- [ ] Preserve existing header styling and layout
- [ ] Add UserMenu integration
- [ ] Prepare for Phase 3 modal state (commented out)

### 1.3 Update AppLayout
- [ ] Modify `web/app/app-layout.tsx` to use AppLayoutClient
- [ ] Pass user data as props (displayName, email)
- [ ] Maintain server-side user fetching logic
- [ ] Ensure no visual regression in header layout

### 1.4 Testing Implementation
- [ ] Write unit tests for UserMenu (80%+ coverage)
- [ ] Write E2E tests for dropdown interaction
- [ ] Test keyboard navigation and accessibility
- [ ] Test mobile responsiveness

### 1.5 Visual QA
- [ ] Compare header layout before/after (screenshot diff)
- [ ] Test on all major pages (/dashboard, /members, /events)
- [ ] Verify logout still works
- [ ] Test dropdown positioning and z-index

---

## 🧪 Testing Strategy

### Unit Tests (`web/components/__tests__/user-menu.test.tsx`)
- Component renders with correct user info
- Dropdown opens/closes on trigger click
- Settings click calls onSettingsClick prop
- Keyboard navigation (Enter opens, Escape closes)
- Accessibility attributes present

### E2E Tests (`web/e2e/user-menu.spec.ts`)
- Dropdown appears on username click
- User info displays correctly
- Settings link visible and clickable
- Logout button visible and functional
- Works on mobile viewport (375px)
- Keyboard navigation works

### Manual Testing
- Visual regression testing (header layout)
- Accessibility testing (screen reader, keyboard)
- Mobile testing (tap targets, positioning)

---

## ⚠️ Risks & Rollback Plan

### Risk 1: Header Layout Breaks
**Likelihood:** Medium  
**Impact:** High (affects all pages)  
**Mitigation:** 
- Take before/after screenshots
- Test on multiple pages before committing
- Keep original AppLayout intact as backup

**Rollback:**
```bash
git checkout HEAD~1 -- web/app/app-layout.tsx
rm web/app/app-layout-client.tsx web/components/user-menu.tsx
```

### Risk 2: DropdownMenu Component Issues
**Likelihood:** Low  
**Impact:** Medium  
**Mitigation:** 
- Test DropdownMenu usage in isolation first
- Verify existing dropdowns still work

**Rollback:**
- Remove UserMenu import and usage
- Revert to original username + logout button display

### Risk 3: Client Component Hydration Issues
**Likelihood:** Low  
**Impact:** Medium  
**Mitigation:** 
- Test SSR vs client rendering
- Verify no hydration mismatches

**Rollback:**
- Move UserMenu back to server component if possible
- Or revert to simpler button-based approach

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Username in header is clickable and opens dropdown
- [ ] Dropdown shows user name and email
- [ ] Dropdown has "Settings" menu item
- [ ] Dropdown has "Logout" menu item
- [ ] Clicking Settings calls onSettingsClick callback
- [ ] Clicking Logout triggers logout action
- [ ] Dropdown closes on outside click or Escape key

### Non-Functional Requirements
- [ ] No visual regression in header layout
- [ ] Works on all screen sizes (375px+)
- [ ] Keyboard accessible (Tab, Enter, Escape)
- [ ] Screen reader compatible
- [ ] No impact on existing logout functionality
- [ ] Dropdown positioned correctly (no cutoff)

### Code Quality
- [ ] TypeScript strict mode compliant
- [ ] Unit test coverage >80%
- [ ] E2E tests pass
- [ ] Follows existing component patterns
- [ ] Proper error handling

---

## 📊 Effort Estimation

**Total:** 3-4 hours

- Component creation: 1.5h
- AppLayout extraction: 1h
- Testing: 1h
- QA & fixes: 0.5h

---

## 🔗 Dependencies

**Phase 1 has no dependencies** - can be implemented independently.

**Phase 2 depends on Phase 1** - needs dropdown to exist for integration.

**Phase 3 depends on Phase 1 + Phase 2** - needs dropdown and font size system.

---

## 📝 Implementation Notes

### Component Patterns to Follow
- Use existing `DropdownMenu` compound component
- Follow `Button` component variants and styling
- Use design system tokens (`text-muted-foreground`, etc.)
- Maintain consistent spacing and typography

### Accessibility Requirements
- `aria-label="User menu"` on trigger
- `role="menuitem"` on dropdown items
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### Mobile Considerations
- Minimum 44px tap targets
- Dropdown positioning (align="end" to prevent cutoff)
- Touch-friendly spacing

---

## 🎯 Next Steps

After Phase 1 completion:
1. Create Phase 1 PR → sprint branch
2. Move Phase 1 to TASKS_COMPLETED.md
3. Start Phase 2: Font Size Preference System

---

**Phase Plan Version:** 1.0  
**Last Updated:** 7 November 2025  
**Status:** Ready for Implementation
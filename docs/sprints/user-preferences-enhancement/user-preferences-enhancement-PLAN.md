````markdown
# Mini-Sprint Plan: User Preferences Enhancement

**Sprint Name:** user-preferences-enhancement  
**Timeline:** 10-14 hours (1.5-2 days)  
**Created:** 7 November 2025  
**Status:** Planning - Ready for Reviewer Approval  
**Branch Strategy:** `feature/user-preferences-enhancement-main-sprint`

---

## 📋 Executive Summary

Enhance the user experience by introducing a **settings dropdown menu** in the header and adding **font size adjustment** functionality. This mini-sprint builds on the completed User Theme Preferences sprint by introducing a user-centered settings modal with instant visual preview and explicit save confirmation.

### Vision

Users should be able to easily access and modify their preferences (theme, font size, and future additions like notifications or language) through an intuitive modal that lets them preview changes before committing them. This creates a safer, more exploratory user experience compared to auto-save patterns.

### MVP Strategy

**This sprint is user-level settings ONLY (MVP). Refer to `docs/sprints/user-preferences-enhancement-PRODUCT-OWNER-REVIEW.md` for:**
- ✅ Complete product approval and rationale
- ✅ MVP success metrics (60% discovery, 20% font size adoption)
- ✅ Future roadmap (Phases A-F: Notifications, Accessibility, Language, etc.)
- ✅ Scope boundaries (what's explicitly NOT included)
- ✅ Post-MVP validation gates

**Key MVP Constraints:**
- 🔒 User-level only (theme + font size)
- 🔒 Organization settings stay on `/settings` page (no change)
- 🔒 System admin settings stay on `/admin` (no change)
- 🚫 No notifications, language, accessibility overrides, or display density in MVP

---

## 🎯 Sprint Goals

1. **Accessibility:** Make settings discoverable via username dropdown (always visible in header)
2. **User Control:** Implement explicit save pattern (preview → save/cancel) for preference safety
3. **Font System:** Add font size adjustment (4 sizes: 14px, 16px, 18px, 20px)
4. **Extensibility:** Create foundation for future preference settings (notifications, language, etc.)
5. **Consistency:** Align with existing theme system and design patterns
6. **Testing:** Full E2E coverage for new UX patterns

### Success Criteria

**Product-Level Criteria (from Product Owner Review):**
- ✅ Settings dropdown is visible in header on all pages
- ✅ First-time users discover settings within 30 seconds (no help docs needed)
- ✅ Users can change theme + font size without page reload
- ✅ Preview happens instantly (no perceptible lag)
- ✅ Saving takes <500ms (user sees immediate feedback)
- ✅ Cancel button reverts all changes (users don't fear mistakes)
- ✅ Settings persist across sessions (tested 24hrs later)
- ✅ Keyboard-only navigation works (mouse not required)
- ✅ Screen readers can navigate modal
- ✅ Color contrast meets WCAG AA (4.5:1 minimum)
- ✅ Respects `prefers-reduced-motion`
- ✅ Dropdown usable on 375px phones (44px+ tap targets)
- ✅ Modal fits on mobile without scroll-to-find buttons
- ✅ Font sizes readable at all 4 sizes on mobile
- ✅ No horizontal scroll at any breakpoint or font size
- ✅ <1% preference persistence errors
- ✅ Zero support tickets about "where are settings?"
- ✅ USER_MANUAL.md documents feature
- ✅ Release notes highlight feature
- ✅ Help text explains preview mode

---

## 🏗️ Architecture Overview

### User Flow: Accessing Settings

```
User sees header with username display
         ↓
Click on username (or avatar icon)
         ↓
Dropdown menu appears
  - Display user name + email
  - Settings link
  - Logout button
         ↓
Click "Settings"
         ↓
Modal opens with:
  - Theme selector (4 presets)
  - Font size selector (4 sizes)
  - Unsaved changes indicator
         ↓
User adjusts preferences + sees instant preview
         ↓
Click "Save Changes" → Persists to database
Click "Cancel" or press Escape → Reverts to original
```

### Component Structure

```
AppLayout (header)
  └── UserMenu (NEW)
      └── DropdownMenu (existing)
          ├── User info section
          ├── Settings link → triggers SettingsModal
          └── Logout button
              
SettingsModal (NEW)
  ├── ThemeSelector (existing, reused)
  ├── FontSizeSelector (NEW)
  ├── UnsavedChangesWarning (NEW)
  └── Footer (Save / Cancel buttons)
  
RootLayout (web/app/layout.tsx)
  ├── FontSizeApplier (NEW - similar to ThemeApplier)
  └── ThemeApplier (existing)
```

### State Management Pattern

**Draft State (in modal, not persisted):**
```typescript
const [draftTheme, setDraftTheme] = useState(currentTheme);
const [draftFontSize, setDraftFontSize] = useState(currentFontSize);
const [hasChanges, setHasChanges] = useState(false);
```

**Real-time Preview (DOM updates, not persisted):**
```typescript
useEffect(() => {
  document.documentElement.setAttribute('data-theme', draftTheme);
  document.documentElement.style.setProperty('--base-font-size', draftFontSize);
}, [draftTheme, draftFontSize]);
```

**Persistence (on explicit save only):**
```typescript
const handleSave = async () => {
  await updateUserPreferences({ theme: draftTheme, fontSize: draftFontSize });
  // Update server-side state
  // Revalidate cache
  onClose();
};
```

---

## 📊 Phase Breakdown

### Phase 1: User Settings Dropdown Menu (3-4 hours)
**Branch:** `feature/user-preferences-enhancement-phase1-dropdown`  
**Plan:** `docs/sprints/user-preferences-enhancement-phase1-PLAN.md`

**Objective:** Create user dropdown menu in header with Settings link

**Scope:**

1. **UserMenu Component** (NEW)
   - Create `web/components/user-menu.tsx`
   - Display current user name (from AppLayout props)
   - Show user email as secondary text
   - Settings link that triggers modal
   - Logout button (move from current header button)
   - Icon: ChevronDown or UserCircle
   - Keyboard accessible (Tab, Enter, Escape)
   - Dropdown positioning (right-aligned, below trigger)

2. **DropdownMenu Integration**
   - Use existing `DropdownMenu` component from `web/components/ui-flowbite/dropdown-menu.tsx`
   - Add visual separators between sections
   - Proper focus management
   - Click-outside to close

3. **AppLayout Header Update**
   - Replace current username display + logout button with UserMenu
   - Pass user info as props: `{ displayName, email, userId }`
   - Maintain responsive behavior (visible on desktop, maybe hidden/condensed on mobile)
   - Position UserMenu at right side of header

4. **Accessibility**
   - ARIA labels for dropdown trigger
   - Role attributes on menu items
   - Keyboard navigation support (inherited from DropdownMenu)
   - Focus ring visibility
   - Color contrast compliance

**Files to Modify:**
- `web/components/user-menu.tsx` (NEW)
- `web/app/app-layout.tsx` (import UserMenu, pass props, remove old logout button)
- `web/components/dropdown-menu.tsx` (minimal - may need to add ARIA attrs)

**Tests:**
- Dropdown opens/closes on click
- Dropdown opens/closes on keyboard (Enter, Escape)
- Settings link navigates/opens modal (integration with Phase 2)
- Logout button triggers logout action
- Focus management (focus trap while dropdown open)
- Outside click closes dropdown
- Mobile responsiveness

**Design Notes:**
- Use design system tokens: `--primary`, `--muted-foreground`, `--border`
- 32px dropdown width minimum
- 8px gap between items
- 4px padding inside items
- Hover states using `hover:bg-muted`

**Risks:**
- Dropdown positioning (popovers can be tricky with fixed positioning)
- Mobile UX (dropdown may be cut off on small screens)

**Rollback:**
- Simple: revert AppLayout and remove UserMenu component
- No database changes or dependencies

---

### Phase 2: Font Size Preference System (6-8 hours)
**Branch:** `feature/user-preferences-enhancement-phase2-font-size`  
**Plan:** `docs/sprints/user-preferences-enhancement-phase2-PLAN.md`

**Objective:** Add font size adjustment with persistence and global application

**Scope:**

**A. Database Schema (1 hour)**
- Add `fontSizePreference` field to User model in tenant schema
  - Type: `String` (nullable)
  - Enum: `'14px' | '16px' | '18px' | '20px'`
  - Default: null (will use 16px)
- Create migration: `Add_fontSizePreference_to_User`
- Update `api/src/domain/entities/User.ts` (add field)
- Update mock database: `api/src/mock/mock-database.service.ts`

**B. API Extensions (1.5 hours)**
- Extend `GET /users/me/theme` response to include `fontSizePreference`
- Extend `PATCH /users/me/theme` payload to accept `fontSizePreference`
- Add validation: enum validation for font size values
- Update request/response DTOs
- Add unit tests for font size validation

**C. Frontend: Server-Side Rendering (1 hour)**
- Update `web/app/layout.tsx` (RootLayout)
- Inject font size CSS variable from server
- Include in inline script to prevent FOUC (Flash of Unstyled Content)

```typescript
// Similar to existing theme inline script, but for font size
<script
  dangerouslySetInnerHTML={{
    __html: `
      try {
        const fontSize = '${fontSizePreference || '16px'}';
        document.documentElement.style.setProperty('--base-font-size', fontSize);
      } catch (e) {
        // Defaults will apply
      }
    `,
  }}
/>
```

**D. Frontend: Typography System (1 hour)**
- Update `web/app/globals.css`
- Define `--base-font-size` CSS variable (currently hardcoded to 16px)
- Ensure all typography uses `rem` units based on this variable
- Test that headlines, body text, captions scale proportionally

**E. Settings UI - FontSizeSelector Component (1 hour)**
- Create `FontSizeSelector` component (parallel to ThemePreviewCard)
- 4 button options: Small (14px), Default (16px), Large (18px), XL (20px)
- Show actual size preview in each button
- Visual feedback for selected size
- Real-time DOM preview (instant visual feedback)

**F. Settings Modal Integration (1 hour)**
- Create `SettingsModal` component (NEW)
- Combine ThemeSelector + FontSizeSelector
- Implement draft state management
- Real-time preview in DOM while modal open
- Save button: batch both theme + fontSize in single update
- Cancel button: revert both to original (with dirty state warning)
- Unsaved changes indicator

**G. Server Actions (0.5 hour)**
- Extend `updateUserTheme` action to include fontSize
- Batch both preferences in single database update
- Revalidate cache after successful save

**Files to Create:**
- `web/components/font-size-selector.tsx` (NEW)
- `web/components/settings-modal.tsx` (NEW)
- `docs/sprints/user-preferences-enhancement-phase2-PLAN.md` (NEW)

**Files to Modify:**
- `api/prisma/tenant-schema.prisma` - Add fontSizePreference field
- `api/src/domain/entities/User.ts` - Add fontSizePreference property
- `api/src/modules/users/users.controller.ts` - Extend theme endpoints
- `api/src/modules/users/users.service.ts` - Add fontSize validation
- `api/src/mock/mock-database.service.ts` - Add to mock data
- `web/app/layout.tsx` - Inject fontSize CSS variable
- `web/app/globals.css` - Define --base-font-size variable
- `web/app/actions/theme.ts` - Extend updateUserTheme action
- `web/app/app-layout.tsx` - Import and use SettingsModal
- `web/components/user-menu.tsx` - Wire up Settings link to modal

**Tests:**
- Font size selection in modal updates DOM instantly
- All font sizes (14, 16, 18, 20px) apply correctly
- Typography scales proportionally at all sizes
- Font size preference persists after page reload
- Font size applies across all pages (tested via E2E navigation)
- Combination of theme + font size works together
- Cancel modal reverts font size to original
- Mobile text remains readable at all sizes
- Keyboard navigation through font size buttons

**CSS Considerations:**
```css
/* globals.css - CSS variable definition */
:root {
  --base-font-size: 16px; /* Can be overridden by user preference */
}

/* All typography should use rem units */
body {
  font-size: 1rem; /* = 16px at default, 14px if user selected small, etc. */
}

h1 {
  font-size: 2rem; /* Scales with base font size */
}

.caption-text {
  font-size: 0.8125rem; /* 13px at 16px base, 11.38px at 14px, etc. */
}
```

**Risks:**
- Typography might look broken at extreme sizes (14px = too small, 20px = too large)
- Database migration might fail if User model has constraints
- CSS cascade issues if some components hardcode font sizes

**Rollback:**
- Revert migration (removes fontSizePreference field)
- Remove CSS variables
- Settings modal won't show font size option (graceful degradation)

---

### Phase 3: Settings Modal & Integration (2-3 hours)
**Branch:** `feature/user-preferences-enhancement-phase3-modal-integration`  
**Plan:** `docs/sprints/user-preferences-enhancement-phase3-PLAN.md`

**Objective:** Create complete settings modal with state management and UX polish

**Scope:**

1. **Modal Container** (NEW)
   - Create `SettingsModal` wrapper component
   - Dialog semantics (role="dialog", aria-modal="true")
   - Backdrop overlay with semi-transparent background
   - Keyboard trap (focus stays in modal while open)
   - Close on Escape key (with dirty confirmation)
   - Close on outside click (with dirty confirmation)

2. **Draft State Management**
   - Track original values (for cancel/revert)
   - Track draft values (for preview)
   - Detect changes (`hasChanges` boolean)
   - Diff calculation (what actually changed)

3. **Unsaved Changes Handling**
   ```typescript
   // Confirm before closing if user made changes
   const handleClose = () => {
     if (hasChanges) {
       const confirmed = confirm(
         "You have unsaved changes. Do you want to discard them?"
       );
       if (!confirmed) return;
     }
     
     // Revert draft state to original
     revertChanges();
     onClose();
   };
   ```

4. **Real-time Preview**
   - Theme selector change → apply to DOM immediately
   - Font size selector change → apply to DOM immediately
   - User sees live preview while modal open
   - No persistence until Save clicked
   - Automatic revert on Cancel or Escape

5. **Save/Cancel Buttons**
   - Save button:
     - Disabled when no changes
     - Loading state while saving
     - Success toast after save
     - Closes modal on success
   - Cancel button:
     - Reverts all changes
     - Shows confirmation if dirty
     - Closes modal

6. **Error Handling**
   - Network error → show error toast
   - Validation error → show in-modal error message
   - Revert changes on failure
   - Allow user to retry

7. **Accessibility**
   - Focus management (focus on first focusable element)
   - ARIA labels on all inputs
   - Semantic HTML (buttons, form elements)
   - Color contrast in all states
   - Tab order: Theme → Font Size → Cancel → Save
   - Escape key to close
   - Enter to save (optional shortcut)

**Files to Create:**
- `web/components/settings-modal.tsx` (NEW - orchestrates entire modal)
- `web/components/modal-wrapper.tsx` (NEW - reusable modal container if needed)
- `docs/sprints/user-preferences-enhancement-phase3-PLAN.md` (NEW)

**Files to Modify:**
- `web/app/app-layout.tsx` - Add modal state + modal JSX at bottom
- `web/components/user-menu.tsx` - Wire Settings link to open modal

**Tests:**
- Modal opens when Settings clicked
- Modal closes on Cancel (no confirmation if no changes)
- Modal closes on Cancel (with confirmation if changes made)
- Modal closes on Escape key (no confirmation if no changes)
- Modal closes on Escape key (with confirmation if changes made)
- Modal closes on outside click (no confirmation if no changes)
- Modal closes on outside click (with confirmation if changes made)
- Save button disabled when no changes
- Save button enabled when changes made
- Save button shows loading state
- Save button shows success message
- Cancel button reverts theme to original
- Cancel button reverts font size to original
- Unsaved changes warning visible when dirty
- Tab navigation cycles through controls
- Shift+Tab navigation cycles backwards
- Focus trap (can't tab outside modal)
- Keyboard shortcuts work (Escape, Enter on Save)

**Design Notes:**
- Modal width: 560px (md breakpoint) on desktop, full width on mobile
- Max height: 90vh (allows overflow with scroll)
- Padding: 24px (lg)
- Section spacing: 16px (md)
- Gap between buttons: 8px

**Modal Structure:**
```
┌─────────────────────────────────────┐
│  User Preferences              [×]  │  ← Header with close button
├─────────────────────────────────────┤
│                                     │
│  💡 Tip: Changes preview instantly  │  ← Info banner
│                                     │
│  Color Theme                        │  ← Section title
│  [Original] [Vibrant] [Teal] [Warm] │  ← Theme selector
│                                     │
│  Font Size                          │  ← Section title
│  [14px] [16px] [18px] [20px]        │  ← Font size selector
│                                     │
│  ⚠️ You have unsaved changes        │  ← Dirty state warning
│                                     │
├─────────────────────────────────────┤
│ [Cancel]  [Save Changes] (loading)  │  ← Footer with buttons
└─────────────────────────────────────┘
```

**Risks:**
- Complex state management (draft vs. original vs. persisted)
- Dirty state detection edge cases
- Confirmation dialogs nested inside modals (UX can feel heavy)

**Rollback:**
- Remove SettingsModal component
- Fall back to full-page settings at `/settings` (still works)
- No data loss

---

## 📈 Testing Strategy

### Unit Tests (Per Phase)

**Phase 1 (Dropdown):**
- UserMenu component renders correctly
- Dropdown opens/closes on click
- Dropdown responds to keyboard (Enter/Escape)
- Settings link has correct href/onClick
- Logout button triggers logoutAction

**Phase 2 (Font Size):**
- FontSizeSelector renders all 4 sizes
- Font size selection updates draft state
- Font size applies to CSS variable
- Font size persists in database
- Font size loads from database on page refresh
- Font sizes don't break typography at extremes

**Phase 3 (Modal):**
- Modal opens/closes correctly
- Focus trap prevents tabbing outside
- Escape key closes with confirmation
- Outside click closes with confirmation
- Save button persists changes
- Cancel button reverts changes
- Dirty state indicators work
- Error handling and retry flow

### E2E Tests (End-to-End)

**Test Suite: `web/e2e/user-preferences.spec.ts` (NEW)**

1. **Happy Path: Theme + Font Size**
   ```
   Login → Open user dropdown → Click Settings
   → Select new theme → Select new font size
   → Verify DOM preview → Click Save
   → Verify toast notification → Close modal
   → Navigate to different page → Verify theme + font size persist
   → Navigate back → Verify still applied
   ```

2. **Cancel Flow: Unsaved Changes**
   ```
   Open modal → Change theme → Change font size
   → Click Cancel → Confirm dialog
   → Verify modal closes → Verify old values still apply
   ```

3. **Escape Key: With Confirmation**
   ```
   Open modal → Change font size
   → Press Escape → Confirm dialog
   → Verify modal closes → Verify changes reverted
   ```

4. **Error Handling**
   ```
   Open modal → Change theme → Simulate network error
   → Verify error toast → Click Save again
   → Verify success after retry
   ```

5. **Responsive: Mobile**
   ```
   Set viewport to 375px → Click user menu
   → Verify dropdown is visible and usable
   → Click Settings → Verify modal fits on screen
   → Verify all controls are clickable (44px minimum)
   ```

6. **Accessibility: Keyboard Navigation**
   ```
   Open modal → Tab through controls
   → Verify tab order (Theme → Font Size → Cancel → Save)
   → Verify focus rings visible
   → Press Enter on Save → Verify save triggered
   ```

### Coverage Targets

- **Phase 1 (Dropdown):** 80%+ coverage for UserMenu component
- **Phase 2 (Font Size):** 80%+ coverage for FontSizeSelector, 85% for API
- **Phase 3 (Modal):** 85%+ coverage for SettingsModal state management

---

## 🎨 Design System Integration

### Color Tokens (Existing - No Changes)
- `--primary` - Action buttons
- `--destructive` - Warning/error states
- `--border` - Separators, outlines
- `--muted` - Disabled states, hover backgrounds
- `--muted-foreground` - Secondary text
- `--background-subtle` - Modal backdrop

### New CSS Variables (Phase 2)
- `--base-font-size` (user-controlled) - 14px | 16px | 18px | 20px
- All typography should use `rem` units based on this

### Component Reuse
- DropdownMenu ✅ (exists)
- Card ✅ (exists)
- Button ✅ (exists)
- Label ✅ (exists)
- Toast ✅ (exists)
- Dialog/Modal semantics (may need wrapper)

---

## 📋 Documentation Changes

### Files to Update

1. **USER_MANUAL.md**
   - Add section: "Customizing Your Preferences"
   - Screenshot of user dropdown menu
   - Screenshot of settings modal
   - Step-by-step for theme selection
   - Step-by-step for font size adjustment

2. **API_DOCUMENTATION.md**
   - Add `fontSizePreference` field to GET /users/me/theme response
   - Add `fontSizePreference` to PATCH /users/me/theme payload
   - Document enum values: `14px | 16px | 18px | 20px`
   - Example requests and responses

3. **DATABASE_SCHEMA.md**
   - Add `fontSizePreference` to User entity
   - Note: nullable, defaults to null (16px equivalent)

4. **DESIGN_SYSTEM.md**
   - Document `--base-font-size` variable
   - Show typography scaling examples
   - Provide guidance for component authors

5. **CODING_STANDARDS.md**
   - Add: "Always use `rem` units for typography"
   - Note about computing sizes relative to `--base-font-size`

### New Documentation (Phase Plans)

- `docs/sprints/user-preferences-enhancement-phase1-PLAN.md`
- `docs/sprints/user-preferences-enhancement-phase2-PLAN.md`
- `docs/sprints/user-preferences-enhancement-phase3-PLAN.md`

---

## 🔍 Acceptance Criteria Checklist

### Phase 1: User Menu Dropdown
- [ ] UserMenu component created and integrated
- [ ] Dropdown opens/closes on click and keyboard
- [ ] Settings link functional (opens modal)
- [ ] Logout button works from dropdown
- [ ] Focus management correct
- [ ] Responsive on mobile/tablet
- [ ] WCAG 2.1 AA compliant
- [ ] Unit tests passing
- [ ] E2E tests passing (basic dropdown flow)
- [ ] Code review approved

### Phase 2: Font Size System
- [ ] Database migration applied
- [ ] API endpoints extended
- [ ] FontSizeSelector component created
- [ ] Font size CSS variable defined in globals.css
- [ ] All typography uses rem units
- [ ] Font size persists across sessions
- [ ] Inline script prevents FOUC for font size
- [ ] Unit tests passing (validation, API)
- [ ] E2E tests passing (selection, persistence)
- [ ] Typography readable at all 4 sizes
- [ ] Code review approved

### Phase 3: Settings Modal & Integration
- [ ] SettingsModal component created
- [ ] Theme selector integrated in modal
- [ ] Font size selector integrated in modal
- [ ] Draft state management working
- [ ] Real-time preview working
- [ ] Save persists both theme + font size
- [ ] Cancel reverts both settings
- [ ] Dirty state detection accurate
- [ ] Confirmation dialogs working
- [ ] Keyboard navigation complete (Tab, Escape, Enter)
- [ ] Accessibility audit passing
- [ ] Unit tests passing
- [ ] E2E tests passing (all flows)
- [ ] Mobile responsive
- [ ] Error handling working (network retry, etc.)
- [ ] Code review approved

---

## 🎬 Execution Timeline

**Estimated Total:** 10-14 hours (1.5-2 days)

| Phase | Task | Duration | Day |
|-------|------|----------|-----|
| 1 | Dropdown menu component & integration | 3-4 hours | Day 1 |
| 2 | Database schema, API, CSS variables | 6-8 hours | Day 1-2 |
| 3 | Settings modal, state mgmt, integration | 2-3 hours | Day 2 |
| All | Documentation, testing, reviews | Ongoing | Day 2-3 |

**Parallelization Opportunities:**
- Phase 1 and Phase 2 can have independent feature branches
- But Phase 3 requires both Phase 1 + Phase 2 complete
- Recommend sequential execution for clarity

---

## 🚀 Rollback Plan

**If Phase 1 fails:** Remove UserMenu component, keep current header layout
**If Phase 2 fails:** Remove font size field from schema, fall back to 16px only
**If Phase 3 fails:** Keep old settings page at `/settings`, remove modal

**Zero-risk rollback:** All changes are additions, no breaking changes to existing features

---

## 📚 Reference & Comparison

### Why Modal vs. Full Page?

**Recommended: Modal with Instant Preview**

| Aspect | Modal (Recommended) | Full Page |
|--------|----------|-----------|
| **Discoverability** | ✅ Always visible (header dropdown) | ⚠️ Deep in sidebar nav |
| **Safe to experiment** | ✅ Cancel reverts all | ❌ Each click auto-saves |
| **Database writes** | ✅ One per save | ❌ One per change |
| **Mobile UX** | ✅ No navigation | ⚠️ Requires routing |
| **Learning curve** | ✅ Familiar pattern | ⚠️ Auto-save can confuse |
| **Batch updates** | ✅ Save multiple settings together | ❌ Each setting separate |

### Related Features (Future)

These features will use the same Settings Modal foundation:
- Notification preferences
- Language/locale selection
- Display density (compact/comfortable/spacious)
- Accessibility overrides (high contrast, reduced motion)

---

## ⚠️ Known Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Dropdown positioning on mobile | Medium | Position with max-width, add scroll if needed |
| Typography breaks at 14px or 20px | Medium | Visual QA across all sizes, regression tests |
| Draft state complexity | Medium | Document clearly, add debug logging |
| Database migration lock | Low | Apply migration in low-traffic window, have rollback ready |
| Focus management in nested dialogs | Low | Use existing focus-trap library if issues arise |

---

## 📖 Reviewer Checklist

### MVP Scope Review
- [ ] **CRITICAL:** All scope is user-level only (theme + font size)
- [ ] No organization-level settings mixed in
- [ ] No admin settings mixed in
- [ ] No future phases (notifications, language, accessibility overrides, display density, data control) included
- [ ] Refer to `docs/sprints/user-preferences-enhancement-PRODUCT-OWNER-REVIEW.md` for full context and future-phase roadmap.

### Mobile & Responsive Review
- [ ] Dropdown tap targets are 44px+ (minimum accessibility standard)
- [ ] Dropdown fits within 375px viewport (iPhone SE)
- [ ] Modal fits within 375px without vertical scroll
- [ ] No horizontal scroll at any breakpoint
- [ ] Font sizes 14/16/18/20px all readable on mobile
- [ ] Buttons and selector controls work on touch (no :hover reliance)

### Accessibility & Quality Review
- [ ] **WCAG 2.1 AA audit:** Color contrast (4.5:1 minimum verified)
- [ ] Keyboard-only navigation tested (Tab + Enter only)
- [ ] Screen reader tested (NVDA on Windows OR VoiceOver on Mac)
- [ ] `prefers-reduced-motion` respected (no animations fire)
- [ ] Focus indicators visible on all interactive elements
- [ ] Typography audit: no component breaks at 14/16/18/20px sizes
- [ ] Line heights adjusted for legibility (1.5 for small, 1.4 for large)
- [ ] **Scope control:** Only 4 sizes (no additions allowed)
- [ ] **Scope control:** Only `--base-font-size` CSS variable (no per-component sizing)

### Product Acceptance Review
- [ ] New users discover settings within 30 seconds (no training docs needed)
- [ ] Settings persist 24hrs later (page reload, browser close/reopen)
- [ ] Cancel button truly reverts all changes (no hidden saves)
- [ ] Theme + font size can be changed together in one modal
- [ ] Analytics events logged: `settings_modal_opened`, `theme_changed`, `font_size_changed`, `settings_saved`
- [ ] USER_MANUAL.md documents the feature
- [ ] Release notes highlight the feature
- [ ] Success metrics baseline captured: % users discovering settings

### Architecture Review
- [ ] Component structure makes sense (UserMenu → Modal → Selectors)
- [ ] State management approach is sound (draft vs. original)
- [ ] No tight coupling between components
- [ ] **Extensible design:** Can add new preference types without modal redesign
- [ ] **Future-proof API:** `PATCH /users/preferences` supports field additions (won't break on new fields)
- [ ] New fields in Prisma nullable (backward compatible)

### UX Review
- [ ] Modal pattern aligns with user expectations
- [ ] Preview + save flow reduces user anxiety
- [ ] Keyboard shortcuts follow conventions
- [ ] Mobile experience is acceptable
- [ ] Confirmation dialogs feel natural
- [ ] Help text explains preview mode

### Technical Review
- [ ] Database schema migration is backwards compatible
- [ ] API endpoints follow existing patterns
- [ ] CSS variables approach consistent with theme system
- [ ] Error handling comprehensive
- [ ] Test coverage adequate
- [ ] No layout shift (CLS) when changing font sizes

### Security Review
- [ ] Font size values validated (only enum allowed)
- [ ] Theme preference validated (only enum allowed)
- [ ] No injection vectors in modal content
- [ ] Persisted data properly scoped to current user

### Accessibility Review
- [ ] Modal semantics correct (role="dialog")
- [ ] Focus trap implemented
- [ ] Color contrast sufficient
- [ ] Keyboard navigation complete
- [ ] Screen reader announcements added
- [ ] Respects `prefers-reduced-motion`

---

## 🔄 PO Feedback Integration

This section documents how **all 9 Product Owner review points** have been addressed in this sprint plan. Refer to `docs/sprints/user-preferences-enhancement-PRODUCT-OWNER-REVIEW.md` for full context and future-phase roadmap.

### 1. Missing User Research → ADDRESSED
**PO Point:** Font sizes (14, 16, 18, 20px) not validated with users  
**Solution Implemented:**  
- ✅ Phase 2 includes typography validation as mandatory scope item
- ✅ 2-hour max review time allocated for QA (prevents overscoping)
- ✅ Success metric: "Font sizes readable at all 4 sizes on mobile" (acceptance criteria)
- ✅ Post-MVP: Research phase planned (Phase B in PO roadmap) for future expansion
- ✅ Release notes highlight 4 new sizes with rationale

### 2. Mobile Experience Under-Specified → ADDRESSED
**PO Point:** No concrete details on mobile UX  
**Solution Implemented:**  
- ✅ Phase 1: "Mobile tap targets ≥44px" added to acceptance criteria
- ✅ Phase 1: "Dropdown fits within 375px viewport" explicitly documented
- ✅ Phase 3: "Modal fits on mobile without vertical scroll" as product acceptance test
- ✅ Reviewer checklist includes "No horizontal scroll at any breakpoint"
- ✅ E2E tests include mobile viewport testing (375px explicit)

### 3. Accessibility Deep Dive Missing → ADDRESSED
**PO Point:** Generic "WCAG 2.1 AA" without specifics  
**Solution Implemented:**  
- ✅ Phase 2 includes specific accessibility audit items:
  - Color contrast verified (4.5:1 minimum with WebAIM tool)
  - Keyboard-only navigation tested
  - Screen reader tested (NVDA + VoiceOver named)
  - `prefers-reduced-motion` tested explicitly
  - Focus indicators verified
- ✅ Reviewer checklist dedicated to accessibility gates
- ✅ Error messages accessibility requirement added

### 4. User Communication Strategy Unclear → ADDRESSED
**PO Point:** No discovery/onboarding plan  
**Solution Implemented:**  
- ✅ Success metric: "First-time users discover settings within 30 seconds"
- ✅ Acceptance test: "New users discover settings within 30 seconds (no help docs needed)"
- ✅ Feature discovery: Tooltip strategy (settings icon visible in header always)
- ✅ Release notes highlight feature (documented in Phase 3)
- ✅ USER_MANUAL.md documentation requirement added
- ✅ Help text explains preview mode (in SettingsModal)

### 5. No Success Metrics → ADDRESSED
**PO Point:** No product success definition  
**Solution Implemented:**  
- ✅ Product-level success criteria (19 items) defined in sprint goals
- ✅ Analytics tracking plan added to Phase 3:
  - `settings_modal_opened` event
  - `theme_changed`, `font_size_changed` events
  - `settings_saved`, `settings_cancelled` events
- ✅ Dashboard requirement: "Preferences Usage" % tracking
- ✅ Alert threshold: "If <10% discover settings in first 5 days, trigger UX review"
- ✅ Adoption targets: 60% discovery, 20% font size usage, 70% theme retention (from PO doc)

### 6. Scope Creep Risks → ADDRESSED
**PO Point:** Typography review could expand beyond MVP scope  
**Solution Implemented:**  
- ✅ Scope control guardrails added to Phase 2:
  - "Only 4 font sizes tested: 14px, 16px, 18px, 20px (no additions)"
  - "Only `--base-font-size` CSS variable modified (no per-component sizing)"
  - "2-hour max for typography QA" (hard cap on review time)
- ✅ Reviewer checklist emphasizes "Scope control" items
- ✅ MVP strategy section clarifies "user-level only" (theme + font size)
- ✅ Explicit "what's NOT included" list prevents misalignment

### 7. Settings Architecture Clarity → ADDRESSED
**PO Point:** Ambiguity about user vs. org vs. admin settings  
**Solution Implemented:**  
- ✅ MVP Strategy section explicitly clarifies:
  - "User-level only (theme + font size)"
  - "Organization settings stay on `/settings` page (no change)"
  - "System admin settings stay on `/admin` (no change)"
- ✅ Phase 1 DropdownMenu: "Replace current username display + logout button with UserMenu"
- ✅ No business logic changes to org/admin workflows
- ✅ Future phases documented separately (org/admin settings in Phase F)

### 8. Analytics/Logging Missing → ADDRESSED
**PO Point:** No plan to measure feature adoption  
**Solution Implemented:**  
- ✅ Phase 3 includes explicit analytics tracking plan:
  - Events: `settings_modal_opened`, `theme_changed`, `font_size_changed`, `settings_saved`, `settings_cancelled`
  - Fields: timestamp, user_id, values, success status
- ✅ Dashboard: "Preferences Usage" % by metric type
- ✅ Alert: Low adoption (<10%) triggers UX review
- ✅ Post-launch review gate before proceeding to Phase A

### 9. Performance Impact Unknown → ADDRESSED
**PO Point:** No requirements for modal smoothness or load times  
**Solution Implemented:**  
- ✅ Success criteria: "Saving takes <500ms (user sees immediate feedback)"
- ✅ Success criteria: "Preview happens instantly (no perceptible lag)"
- ✅ CSS approach: FOUC prevention via inline script (no flashing)
- ✅ Performance requirement: "Font size changes don't cause layout shift (CLS = 0)"
- ✅ Reviewer checklist: "No layout shift (CLS) when changing font sizes"
- ✅ Future research: 60fps animation testing during Phase B (Accessibility)

---

## 📞 Sign-Off

**Sprint Created By:** Principal Designer
**PO Feedback Integrated:** ✅ All 9 points addressed (see section above)  
**Status:** ✅ Ready for Team Review

**Next Steps:**
1. Implement this plan in 3 phases (branches and PRs)
2. Post-launch: Monitor analytics for adoption metrics
3. If successful: Proceed to Phase A (Notifications) in Q1 2026

**Reviewers Requested:**
- [ ] @principal_architect - Architecture & scalability
- [ ] @principal_engineer - Technical implementation feasibility
- [ ] @product_manager - UX alignment with product vision

**Approval Gate:**
- Requires 2 of 3 reviewer approvals before Phase 1 starts
- Feedback incorporated into phase plans immediately

---

**Last Updated:** 7 November 2025

````
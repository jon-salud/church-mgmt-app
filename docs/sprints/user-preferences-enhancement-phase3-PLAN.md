# User Preferences Enhancement - Phase 3: Settings Modal & Integration

**Phase:** 3 of 3
**Sprint:** user-preferences-enhancement
**Created by:** @principal_engineer
**Date:** 7 November 2025
**Estimated Time:** 2-3 hours

---

## 🎯 Phase Objective

Create a settings modal with instant preview and explicit save pattern for user preferences (theme + font size).

## 📋 Requirements

### Functional Requirements
- [ ] Settings modal opens from user menu dropdown
- [ ] Modal displays current theme and font size preferences
- [ ] Changes preview instantly in the modal and background
- [ ] Explicit save/cancel pattern (no auto-save)
- [ ] Cancel reverts all preview changes
- [ ] Save persists changes to database
- [ ] Modal closes on save or cancel
- [ ] Unsaved changes warning on cancel/close

### Technical Requirements
- [ ] Draft state management (separate from persisted state)
- [ ] Real-time DOM preview without persistence
- [ ] Proper cleanup on modal close/unmount
- [ ] Keyboard navigation (Escape to close)
- [ ] Accessibility (ARIA labels, focus management)
- [ ] Error handling for save failures
- [ ] Loading states during save

### Integration Requirements
- [ ] Connect UserMenu "Settings" click to modal
- [ ] Pass current preferences from server to modal
- [ ] Update AppLayoutClient to handle modal state
- [ ] Maintain existing header layout and functionality

## 🏗️ Technical Approach

### Architecture Decisions
1. **Modal State**: Client component with useState (not server state)
2. **Draft State**: Separate from persisted preferences
3. **Preview**: Direct DOM manipulation for instant feedback
4. **Persistence**: Server actions for atomic updates
5. **Cleanup**: Effect cleanup to prevent preview leaks

### Files to Create/Modify
- `web/components/settings-modal.tsx` (NEW)
- `web/components/theme-selector.tsx` (NEW)
- `web/components/font-size-selector.tsx` (MODIFY - add previewOnly prop)
- `web/app/app-layout-client.tsx` (MODIFY - add modal state and integration)
- `web/app/app-layout.tsx` (MODIFY - pass preferences to client)

### Component Structure
```
SettingsModal
├── Modal (backdrop + dialog)
├── Header (title + close button)
├── Body
│   ├── Info banner
│   ├── ThemeSelector
│   ├── FontSizeSelector
│   ├── Unsaved changes warning
│   └── Error message
└── Footer (Cancel + Save buttons)
```

## 🧪 Testing Strategy

### Unit Tests
- Modal open/close behavior
- Draft state management
- Preview functionality
- Save/cancel actions
- Error handling

### E2E Tests
- Complete preferences workflow
- Cancel reverts changes
- Persistence across page reloads
- Keyboard navigation

## ✅ Acceptance Criteria

- [ ] Modal opens from user menu "Settings"
- [ ] Current preferences display correctly
- [ ] Theme/font size changes preview instantly
- [ ] Save persists changes to database
- [ ] Cancel reverts preview changes
- [ ] Modal handles errors gracefully
- [ ] Keyboard navigation works (Escape, Tab)
- [ ] No regressions in existing functionality

## 🚨 Risk Mitigation

### Preview Leaks
- **Risk**: Preview changes persist after modal close
- **Mitigation**: Cleanup effects on unmount, explicit revert on close

### State Inconsistency
- **Risk**: Draft state gets out of sync with DOM
- **Mitigation**: Single source of truth, proper effect dependencies

### Save Failures
- **Risk**: Network errors leave user in bad state
- **Mitigation**: Error boundaries, revert on failure, user feedback

## 📝 Implementation Notes

- Follow existing component patterns (Modal, Button from ui-flowbite)
- Use design tokens for consistent styling
- Maintain accessibility standards
- Test at all font sizes (14px, 16px, 18px, 20px)
- Verify mobile responsiveness

---

## 📊 Success Metrics

- Modal opens within 300ms
- Preview updates within 50ms
- Save completes within 2 seconds
- Zero accessibility violations
- 100% test coverage for new components
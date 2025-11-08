# User Preferences Sprint - Learnings & Technical Insights

**Sprint:** User Preferences Enhancement (Phase 1-3)  
**Dates:** November 2025  
**Status:** ✅ COMPLETED  
**Commit:** `80acfb1`

---

## Summary

Successfully implemented a complete user preferences system with instant preview and persistent storage for both theme and font size selections. The implementation includes real-time UI updates, explicit save/cancel pattern, and full backend persistence with audit logging.

**Final Result:**
- ✅ Theme preferences persist across page reloads
- ✅ Font size preferences persist across page reloads
- ✅ Instant preview without persistence (draft state pattern)
- ✅ Unsaved changes warning
- ✅ Proper cleanup and memory leak prevention
- ✅ Automated API testing script for verification

---

## Critical Bug Discovery & Resolution

### The Problem

Font size preferences appeared to work on initial save (API returned 200 OK with the correct value), but after refreshing the page, the font size would reset to 16px instead of persisting the user's selected value (e.g., 20px).

Theme preferences, however, persisted correctly.

### Root Cause Analysis

The bug existed in the **repository layer's entity mapping**, specifically in `/api/src/modules/users/users.datastore.repository.ts`:

```typescript
// BEFORE (BUGGY):
private mapToUser = (profile: any): User => {
  return User.from({
    // ... other fields ...
    themePreference: profile.themePreference,
    themeDarkMode: profile.themeDarkMode,
    // ❌ fontSizePreference was COMPLETELY MISSING
  });
};
```

**Why it happened:**
1. Mock database correctly saved `fontSizePreference` to its in-memory store
2. Service layer correctly handled the update via `updateUserTheme()`
3. Repository retrieved the updated record from the mock database
4. **BUT** when mapping the database record back to the `User` domain entity, `fontSizePreference` wasn't included in the mapping
5. The User entity was returned without `fontSizePreference`, causing the service to return undefined
6. The API response showed the default value instead of the persisted value

**Why theme worked but font size didn't:**
- `themePreference` and `themeDarkMode` were already in the `mapToUser` mapper (from previous work)
- `fontSizePreference` was the new field added during this sprint, but the mapper wasn't updated
- This is a classic data loss bug: correct storage, incorrect retrieval

### The Fix

Added one line to the repository's entity mapper:

```typescript
// AFTER (FIXED):
private mapToUser = (profile: any): User => {
  return User.from({
    // ... other fields ...
    themePreference: profile.themePreference,
    themeDarkMode: profile.themeDarkMode,
    fontSizePreference: profile.fontSizePreference, // ✅ ADDED THIS LINE
  });
};
```

**Verification:**
- Created automated test script (`test-font-persistence.sh`) that validated the fix
- Test output confirmed font size now persists correctly (20px → 20px after save/reload)

---

## Key Technical Insights

### 1. Repository Layer Entity Mapping is Critical

**Lesson:** When adding new fields to domain entities, **always update the repository's mapping layer** that converts database records to domain objects.

**Why it matters:**
- Database persistence ≠ Data retrieval
- A field can be correctly saved but lost during entity mapping
- DTOs validate on input, but mappers control what's retrieved

**Pattern for new fields:**
```
Add field to:
1. ✅ Domain Entity (User.ts)
2. ✅ DTOs (theme.dto.ts, update-user.dto.ts)
3. ✅ Service layer (users.service.ts)
4. ✅ Mock database (mock-database.service.ts)
5. ✅ Repository mapper (users.datastore.repository.ts) ← Often forgotten!
```

### 2. Real-Time Preview Pattern

**Pattern:** Separate draft state from persisted state
```typescript
// Frontend: Draft state for preview
const [draftFontSize, setDraftFontSize] = useState(currentFontSize);

// Real-time preview
useEffect(() => {
  if (isOpen) {
    document.documentElement.style.setProperty('--base-font-size', draftFontSize);
  }
}, [draftFontSize]);

// Save only when user clicks Save
const handleSave = async () => {
  await updateUserPreferences({ fontSizePreference: draftFontSize });
  window.location.reload();
};
```

**Benefits:**
- Users see changes immediately without waiting for API
- Changes are ephemeral until Save is clicked
- Network failures don't affect already-applied styles
- Proper cleanup prevents FOUC (Flash of Unstyled Content)

### 3. CSS Custom Properties for Dynamic Scaling

**Pattern:** Use CSS custom properties on `html` element (not `body`) for rem unit scaling

```css
/* In globals.css */
:root {
  --base-font-size: 16px;
}

html {
  font-size: var(--base-font-size, 16px);
}
```

**Why `html` not `body`:**
- `html` is the root context for rem calculations
- Ensures all child elements scale proportionally
- Body margins/padding don't interfere with root rem calculations

**JavaScript update pattern:**
```typescript
// Updates all rem-based sizing throughout the app
document.documentElement.style.setProperty('--base-font-size', '20px');
```

### 4. Automated API Testing for Debugging

**Pattern:** Create isolated API test scripts for debugging persistence issues

```bash
#!/bin/bash
# 1. GET initial state
# 2. PATCH with new value
# 3. GET again to verify persistence
# 4. Restore original
```

**Benefits:**
- Isolates API layer from UI complexities
- Proves bug at correct layer
- Easy to run repeatedly
- Reproducible bug reports

### 5. Server-Side Preference Initialization

**Pattern:** Fetch and apply user preferences via inline script in `<head>` before page render

```typescript
// layout.tsx
const preferences = await getUserPreferences();

return (
  <html>
    <head>
      <script dangerouslySetInnerHTML={{__html: `
        document.documentElement.style.setProperty('--base-font-size', '${preferences.fontSizePreference}');
        document.documentElement.setAttribute('data-theme', '${preferences.themePreference}');
      `}} />
    </head>
  </html>
);
```

**Prevents FOUC:** Users never see the default font size flash before their preference loads.

---

## What Worked Well

1. **Multi-layered debugging approach:**
   - Started with UI inspection
   - Created automated test script
   - Traced through service → repository → mock database
   - Found the exact missing line

2. **Draft state pattern:** Enabled real-time preview without risking persistence

3. **Comprehensive field coverage:** Extended all layers (entity, DTOs, service, repository, mock DB)

4. **Audit logging:** Made it easy to verify what was actually saved in the mock database

---

## What to Watch For on Similar Features

1. **New persistent fields:**
   - Don't forget repository mappers
   - Test round-trip: save → fetch → verify
   - Use automated tests to catch mapping bugs

2. **Real-time previews:**
   - Always include cleanup logic in useEffect
   - Handle unsaved changes warnings
   - Prevent memory leaks from event listeners

3. **Preferences/settings:**
   - Server-side initialization prevents FOUC
   - Separate draft from persisted state
   - Include audit logs for troubleshooting

---

## Files Changed

### Backend
- `api/src/domain/entities/User.ts` - Added `fontSizePreference` field
- `api/src/modules/users/types/theme.types.ts` - Added `FontSizePreset` enum
- `api/src/modules/users/dto/theme.dto.ts` - Extended with `fontSizePreference`
- `api/src/modules/users/dto/update-user.dto.ts` - Added theme preference fields
- `api/src/modules/users/users.service.ts` - Implemented `updateUserTheme()` method
- `api/src/modules/users/users.datastore.repository.ts` - **CRITICAL FIX:** Added `fontSizePreference` to `mapToUser()` mapper
- `api/src/mock/mock-database.service.ts` - Added `fontSizePreference` to interfaces and persistence logic

### Frontend
- `web/app/layout.tsx` - Server-side preference initialization with inline script
- `web/app/globals.css` - Added `--base-font-size` CSS custom property
- `web/components/settings-modal.tsx` - Settings modal with draft state and instant preview
- `web/components/ui-flowbite/button.tsx` - Enhanced Button variant styling
- `web/app/actions/preferences.ts` - Server actions for preference management

### Testing & Documentation
- `test-font-persistence.sh` - Automated API test script for persistence verification
- `PHASE3_USER_PREFERENCES_PR_DESCRIPTION.md` - PR description and accomplishments

---

## Next Steps for Similar Features

1. **Settings validation:** Add server-side validation for preference values
2. **User activity tracking:** Log preference changes in activity/audit system
3. **Export/import:** Allow users to backup/restore their preferences
4. **Device sync:** Extend to multiple devices (requires backend enhancement)
5. **A/B testing:** Track which preferences users select most frequently

---

## References

- **Initial Issue:** Font size not persisting despite 200 OK API response
- **Solution Commit:** `80acfb1` - Fix: Font size persistence in settings modal
- **Test Script:** `test-font-persistence.sh` (use for verification on future changes)

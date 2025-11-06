# User Theme Preferences - Phase 3: Settings UI

**Phase:** 3 of 5  
**Timeline:** 4-5 hours  
**Branch:** `feature/user-theme-preferences-phase3-settings-ui`  
**Sprint Branch:** `feature/user-theme-preferences-main-sprint`  
**Sprint:** User Theme Preferences  
**Principal Engineer:** @principal_engineer  
**Date:** 7 November 2025

---

## Phase Overview

Phase 3 builds the user-facing Settings UI for theme customization. This phase delivers:
- Visual theme preview cards for all 4 presets
- Interactive theme selector with instant preview
- Dark mode toggle integration
- Real-time theme switching (no page reload)
- Integration with Phase 1 API and Phase 2 CSS system
- Mobile-responsive design
- Settings page enhancement with theme section

This provides the control interface that allows users to customize their visual experience.

---

## Dependencies from Previous Phases

**Phase 1 (API Foundation):**
- ✅ `PATCH /api/v1/users/me/theme` endpoint
- ✅ `GET /api/v1/users/me/theme` endpoint
- ✅ ThemePreset enum: `['original', 'vibrant-blue', 'teal-accent', 'warm-accent']`
- ✅ Database schema with `theme_preference` and `theme_dark_mode` columns

**Phase 2 (CSS Theme System):**
- ✅ CSS custom properties for 4 theme presets
- ✅ `[data-theme]` attribute system
- ✅ `getUserTheme()` server action
- ✅ FOUC prevention with inline script
- ✅ Dark mode integration with next-themes

**Validation:**
- Both Phase 1 and Phase 2 merged to sprint branch
- API endpoints tested and functional
- CSS themes visually distinct
- No regressions in existing features

---

## Technical Approach

### 1. Settings Page Enhancement

**Current State:**
- Settings page exists at `/settings`
- Contains church-wide settings (request types, profile fields)
- Uses Flowbite UI components (Card, Button, Checkbox)
- Client-side form with server actions

**Phase 3 Enhancement:**
Add **User Preferences** section above church settings:
- Personal settings card (theme preferences)
- Clear visual separation from church-wide settings
- Consistent with existing design patterns

**Location:** `web/app/settings/page.tsx` (server component)

**Strategy:**
```tsx
export default async function SettingsPage() {
  const me = await api.currentUser();
  if (!me?.user) redirect('/api/auth/login');
  
  const churchId = me.user.roles[0]?.churchId;
  if (!churchId) redirect('/');

  // Fetch user theme preferences (server-side)
  const userTheme = await getUserTheme();
  
  // Fetch church settings
  const settings = await api.getSettings(churchId);

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Settings" />
      
      {/* NEW: User Preferences Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Preferences</h2>
        <ThemeSettings initialTheme={userTheme} />
      </div>

      {/* Existing Church Settings */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Church Settings</h2>
        <SettingsForm
          initialRequestTypes={requestTypes}
          initialSettings={settings}
          churchId={churchId}
        />
      </div>
    </div>
  );
}
```

---

### 2. Theme Settings Component

**New File:** `web/app/settings/theme-settings.tsx`

**Component Structure:**
```tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-flowbite/card';
import { Label } from '@/components/ui-flowbite/label';
import { Switch } from '@/components/ui-flowbite/switch';
import { updateUserTheme } from '@/app/actions/theme';
import { useTheme } from 'next-themes';

interface ThemeSettingsProps {
  initialTheme: {
    themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
    themeDarkMode: boolean;
  };
}

export function ThemeSettings({ initialTheme }: ThemeSettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState(initialTheme.themePreference);
  const [darkMode, setDarkMode] = useState(initialTheme.themeDarkMode);
  const { setTheme } = useTheme(); // next-themes hook

  const themes = [
    {
      id: 'original' as const,
      name: 'Original',
      description: 'Classic blue-gray theme',
      colors: { primary: '#3b82f6', accent: '#3b82f6' }, // For preview
    },
    {
      id: 'vibrant-blue' as const,
      name: 'Vibrant Blue',
      description: 'Bright and energetic',
      colors: { primary: '#3b82f6', accent: '#3b82f6' },
    },
    {
      id: 'teal-accent' as const,
      name: 'Teal Accent',
      description: 'Calm and professional',
      colors: { primary: '#14b8a6', accent: '#14b8a6' },
    },
    {
      id: 'warm-accent' as const,
      name: 'Warm Accent',
      description: 'Friendly and inviting',
      colors: { primary: '#f97316', accent: '#f97316' },
    },
  ];

  const handleThemeChange = async (themeId: typeof themes[number]['id']) => {
    setSelectedTheme(themeId);
    
    // Update DOM immediately (instant visual feedback)
    document.documentElement.setAttribute('data-theme', themeId);
    
    // Persist to backend
    try {
      await updateUserTheme({
        themePreference: themeId,
        themeDarkMode: darkMode,
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Optionally revert on error
    }
  };

  const handleDarkModeToggle = async (enabled: boolean) => {
    setDarkMode(enabled);
    
    // Update dark mode immediately
    setTheme(enabled ? 'dark' : 'light');
    
    // Persist to backend
    try {
      await updateUserTheme({
        themePreference: selectedTheme,
        themeDarkMode: enabled,
      });
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dark-mode" className="text-base font-medium">
              Dark Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark appearance
            </p>
          </div>
          <Switch
            id="dark-mode"
            checked={darkMode}
            onCheckedChange={handleDarkModeToggle}
          />
        </div>

        {/* Theme Selector */}
        <div>
          <Label className="text-base font-medium">Color Theme</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Choose your preferred color scheme
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={() => handleThemeChange(theme.id)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 3. Theme Preview Card Component

**Component:** `ThemePreviewCard` (within theme-settings.tsx)

**Visual Design:**
- Preview of primary/accent colors
- Theme name and description
- Selected state indicator (checkmark or border)
- Hover effect for interactivity
- Responsive grid layout

**Implementation:**
```tsx
interface ThemePreviewCardProps {
  theme: {
    id: string;
    name: string;
    description: string;
    colors: { primary: string; accent: string };
  };
  isSelected: boolean;
  onSelect: () => void;
}

function ThemePreviewCard({ theme, isSelected, onSelect }: ThemePreviewCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`
        relative p-4 rounded-lg border-2 transition-all
        ${isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'}
        text-left
      `}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Color Preview Swatches */}
      <div className="flex gap-2 mb-3">
        <div
          className="h-10 w-10 rounded-md"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div
          className="h-10 w-10 rounded-md"
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>

      {/* Theme Info */}
      <div>
        <h3 className="font-semibold text-sm mb-1">{theme.name}</h3>
        <p className="text-xs text-muted-foreground">{theme.description}</p>
      </div>
    </button>
  );
}
```

**Accessibility:**
- Semantic button element (keyboard accessible)
- Clear selected state (visual + ARIA)
- Focus indicators for keyboard navigation
- Descriptive labels

---

### 4. Theme Update Server Action

**New Function:** `updateUserTheme()` in `web/app/actions/theme.ts`

**Purpose:** Persist theme changes to backend via Phase 1 API

**Implementation:**
```typescript
'use server';

import { cookies } from 'next/headers';
import { apiFetch } from '../../lib/api.server';

interface UpdateThemeDto {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  themeDarkMode: boolean;
}

export async function updateUserTheme(dto: UpdateThemeDto): Promise<void> {
  const cookieStore = cookies();
  const token = cookieStore.get('demo_token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    await apiFetch('/users/me/theme', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
  } catch (error) {
    console.error('Failed to update theme:', error);
    throw error;
  }
}
```

**Error Handling:**
- Throws error if unauthenticated (component can handle retry)
- Logs errors for debugging
- Uses apiFetch for consistency with Phase 2

---

### 5. Real-Time Theme Switching

**Challenge:** Theme changes should be instant without page reload.

**Solution: Two-Phase Update**

**Phase 1 - Immediate Visual Update (Optimistic UI):**
```typescript
const handleThemeChange = async (themeId: ThemePreset) => {
  // Update state immediately
  setSelectedTheme(themeId);
  
  // Update DOM immediately (instant visual feedback)
  document.documentElement.setAttribute('data-theme', themeId);
  
  // Persist to backend (async)
  try {
    await updateUserTheme({ themePreference: themeId, themeDarkMode });
  } catch (error) {
    // Optionally revert on failure
    console.error('Failed to save theme:', error);
  }
};
```

**Phase 2 - Dark Mode Integration:**
```typescript
import { useTheme } from 'next-themes';

const { setTheme } = useTheme();

const handleDarkModeToggle = async (enabled: boolean) => {
  setDarkMode(enabled);
  setTheme(enabled ? 'dark' : 'light'); // next-themes handles class
  
  await updateUserTheme({ themePreference: selectedTheme, themeDarkMode: enabled });
};
```

**Why This Works:**
- DOM updates are instant (no network latency)
- Background API call persists preference
- next-themes handles dark mode class toggle
- Optimistic UI pattern (assume success, revert on error)

---

### 6. Mobile-Responsive Design

**Desktop Layout (≥768px):**
- 2-column grid for theme cards
- Side-by-side dark mode toggle and label
- Full card width for better visual previews

**Mobile Layout (<768px):**
- 1-column stack for theme cards
- Stacked dark mode toggle
- Touch-friendly tap targets (min 44px)

**Implementation:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {themes.map((theme) => (
    <ThemePreviewCard key={theme.id} {...theme} />
  ))}
</div>
```

**Flowbite Components** (already responsive):
- Card, CardHeader, CardContent
- Switch (touch-friendly)
- Label

---

## Files to Create

1. **`web/app/settings/theme-settings.tsx`**
   - ThemeSettings component (main UI)
   - ThemePreviewCard component (preview cards)
   - Theme selection logic
   - Dark mode toggle
   - Real-time theme switching

---

## Files to Modify

1. **`web/app/settings/page.tsx`**
   - Import `getUserTheme()` server action
   - Fetch user theme server-side
   - Add "User Preferences" section
   - Render ThemeSettings component
   - Maintain existing church settings

2. **`web/app/actions/theme.ts`**
   - Add `updateUserTheme()` server action
   - PATCH to `/users/me/theme` endpoint
   - Error handling and validation

---

## Testing Strategy

### Manual Testing

**Test Cases:**

**1. Theme Selection**
- [ ] Click each theme preview → verify instant visual change
- [ ] Verify selected theme has checkmark indicator
- [ ] Verify only one theme selected at a time
- [ ] Reload page → verify theme persists (from database)

**2. Dark Mode Toggle**
- [ ] Toggle dark mode on → verify dark background
- [ ] Toggle dark mode off → verify light background
- [ ] Test with each theme preset (4 × 2 = 8 combinations)
- [ ] Verify dark mode state persists after reload

**3. Real-Time Updates**
- [ ] Change theme → no page reload required
- [ ] Toggle dark mode → instant visual change
- [ ] Open settings in two tabs → changes sync after reload

**4. API Integration**
- [ ] Network tab: verify PATCH `/api/v1/users/me/theme` called
- [ ] Verify request body: `{ themePreference, themeDarkMode }`
- [ ] Test error handling: stop API server → verify error logged

**5. Mobile Responsiveness**
- [ ] Resize to mobile width → verify 1-column layout
- [ ] Verify touch targets are large enough (≥44px)
- [ ] Verify text readable on small screens
- [ ] Test on actual mobile device (iOS/Android)

**6. Accessibility**
- [ ] Tab navigation through theme cards → verify focus visible
- [ ] Enter/Space to select theme → verify works
- [ ] Screen reader: verify labels announced correctly
- [ ] Verify color contrast meets WCAG AA

**7. Edge Cases**
- [ ] Unauthenticated user → verify redirect to login
- [ ] User without role → verify redirect to home
- [ ] API error → verify error handling (console log, no crash)
- [ ] Slow network → verify optimistic UI works

### Automated Testing (Phase 5)

E2E tests will be added in Phase 5 to validate:
- Theme persistence across sessions
- Dark mode toggle functionality
- Settings page navigation

---

## Acceptance Criteria

### Theme Settings Component
- [ ] ThemeSettings component created with TypeScript
- [ ] Receives `initialTheme` prop from server
- [ ] Renders 4 theme preview cards in responsive grid
- [ ] Dark mode toggle functional (uses next-themes)
- [ ] Selected theme visually indicated (checkmark)

### Theme Preview Cards
- [ ] Each card shows color swatches (primary + accent)
- [ ] Theme name and description displayed
- [ ] Hover effect for better UX
- [ ] Click to select theme
- [ ] Keyboard accessible (Tab + Enter)

### Real-Time Theme Switching
- [ ] Theme changes apply instantly (no reload)
- [ ] DOM `data-theme` attribute updated immediately
- [ ] Dark mode class updated via next-themes
- [ ] Background API call persists preference
- [ ] Optimistic UI pattern implemented

### API Integration
- [ ] `updateUserTheme()` server action created
- [ ] Uses apiFetch helper (consistency with Phase 2)
- [ ] PATCH to `/users/me/theme` endpoint
- [ ] Request validation (DTO types)
- [ ] Error handling and logging

### Settings Page Integration
- [ ] "User Preferences" section added above church settings
- [ ] Server-side theme fetch via `getUserTheme()`
- [ ] ThemeSettings component rendered with initial data
- [ ] Existing church settings unchanged
- [ ] Page layout responsive

### Mobile & Accessibility
- [ ] 2-column grid on desktop, 1-column on mobile
- [ ] Touch targets ≥44px on mobile
- [ ] Focus indicators visible
- [ ] ARIA labels correct
- [ ] Screen reader compatible

### Quality
- [ ] TypeScript types for all components
- [ ] No linting errors
- [ ] Formatted with Prettier
- [ ] No console warnings (except intentional error logs)
- [ ] Build successful (`pnpm -C web build`)

---

## Risks & Rollback Plan

### Identified Risks

**1. Optimistic UI Synchronization**
- **Risk:** Theme changes in one tab not reflected in other tabs
- **Mitigation:** Reload on tab focus to sync from backend
- **Acceptable:** Settings page not frequently used in multiple tabs

**2. PATCH Endpoint Failures**
- **Risk:** API errors leave UI out of sync with database
- **Mitigation:** Error logging, graceful degradation
- **Future:** Add toast notifications for user feedback (Phase 5)

**3. Switch Component Availability**
- **Risk:** Flowbite UI might not have Switch component
- **Mitigation:** Use Checkbox as fallback or create custom Switch
- **Validation:** Check Flowbite docs before implementation

**4. Theme Switching Performance**
- **Risk:** CSS variable updates might cause reflow/repaint
- **Mitigation:** Only override minimal variables (primary + accent)
- **Testing:** Test with Chrome DevTools Performance tab

**5. Dark Mode + Theme Conflicts**
- **Risk:** Some theme combinations might be unreadable
- **Mitigation:** Test all 8 combinations manually
- **Future:** Add theme-specific dark mode overrides if needed

### Rollback Plan

**If Phase 3 needs to be reverted:**

1. **Revert Code Changes:**
   ```bash
   git checkout feature/user-theme-preferences-main-sprint
   git branch -D feature/user-theme-preferences-phase3-settings-ui
   ```

2. **Remove New Files:**
   - Delete `web/app/settings/theme-settings.tsx`
   - Remove `updateUserTheme()` from `web/app/actions/theme.ts`

3. **Restore Settings Page:**
   - Revert `web/app/settings/page.tsx` to original (church settings only)
   - Verify existing settings functionality works

4. **Verify Rollback:**
   - Start dev server: `pnpm -C web dev`
   - Navigate to `/settings` → verify church settings render
   - Verify no theme-related code present

**Rollback Impact:**
- Users cannot change theme preferences via UI
- Phase 1 API and Phase 2 CSS still functional (manual testing possible)
- No data loss (database schema unchanged)
- Settings page reverts to original functionality

---

## Implementation Checklist

### Setup
- [x] Confirm on Phase 3 branch: `feature/user-theme-preferences-phase3-settings-ui`
- [x] TASKS.md updated with Phase 3 status
- [x] Phase 3 plan created

### Theme Settings Component (2-2.5h)
- [ ] Create `web/app/settings/theme-settings.tsx`
- [ ] Implement ThemeSettings component with TypeScript
- [ ] Add theme preview card data (4 themes with colors)
- [ ] Implement ThemePreviewCard component
- [ ] Add color swatch previews (primary + accent)
- [ ] Add selection indicator (checkmark icon)
- [ ] Implement dark mode toggle with Switch/Checkbox
- [ ] Add responsive grid layout (1 col mobile, 2 col desktop)
- [ ] Verify component renders in isolation

### Theme Switching Logic (1-1.5h)
- [ ] Import useTheme from next-themes
- [ ] Implement handleThemeChange function
- [ ] Add optimistic DOM update (`data-theme` attribute)
- [ ] Implement handleDarkModeToggle function
- [ ] Integrate with next-themes setTheme()
- [ ] Test instant theme switching in browser

### Server Action (30-45min)
- [ ] Add `updateUserTheme()` to `web/app/actions/theme.ts`
- [ ] Import apiFetch helper
- [ ] Implement PATCH to `/users/me/theme`
- [ ] Add error handling and logging
- [ ] Add TypeScript types (UpdateThemeDto)
- [ ] Test with API server running

### Settings Page Integration (45min-1h)
- [ ] Modify `web/app/settings/page.tsx`
- [ ] Import `getUserTheme()` server action
- [ ] Fetch user theme server-side
- [ ] Add "User Preferences" heading
- [ ] Render ThemeSettings component with initialTheme
- [ ] Separate user preferences from church settings visually
- [ ] Verify existing church settings unchanged

### Manual Testing (1-1.5h)
- [ ] Test all 4 theme selections (instant visual change)
- [ ] Test dark mode toggle with each theme (8 combinations)
- [ ] Test theme persistence (reload page)
- [ ] Test mobile responsive layout
- [ ] Test keyboard navigation (Tab + Enter)
- [ ] Test with API errors (stop server)
- [ ] Test unauthenticated state (redirect)
- [ ] Verify no console warnings

### Code Quality (15-20min)
- [ ] Run linter: `pnpm lint`
- [ ] Run formatter: `pnpm format`
- [ ] Fix any linting issues
- [ ] Verify TypeScript compilation: `pnpm -C web build`
- [ ] Verify no breaking changes to existing features

### Documentation (15-20min)
- [ ] Add JSDoc to ThemeSettings component
- [ ] Document component props (TypeScript interfaces)
- [ ] Update TASKS.md with Phase 3 progress

---

## Timeline Breakdown

**Total: 4-5 hours**

| Task | Estimated Time |
|------|---------------|
| Theme Settings component | 2-2.5h |
| Theme switching logic | 1-1.5h |
| Server action implementation | 30-45min |
| Settings page integration | 45min-1h |
| Manual testing | 1-1.5h |
| Code quality & cleanup | 15-20min |
| Documentation | 15-20min |

**Buffer:** 20-30min for unexpected issues

---

## Success Metrics

### Quantitative
- [ ] 100% of acceptance criteria met
- [ ] 4 theme preview cards rendered correctly
- [ ] Dark mode toggle functional
- [ ] 0 TypeScript compilation errors
- [ ] 0 linting errors
- [ ] 0 console warnings (except error logs)
- [ ] Settings page loads in <2 seconds

### Qualitative
- [ ] Theme changes are instant (no perceived delay)
- [ ] UI visually consistent with existing Flowbite design
- [ ] Mobile layout usable on small screens
- [ ] Keyboard navigation intuitive
- [ ] Error states handled gracefully
- [ ] Code follows Next.js 14 App Router patterns

---

## Next Phase Preview

**Phase 4: Theme Application (2.5-3.5 hours)**
- Will add navigation header theme indicator (optional)
- Potentially add theme-specific logo variants
- Ensure theme applies correctly across all pages
- Test edge cases (theme + dark mode on all routes)

**Phase 3 Deliverables Needed by Phase 4:**
- Working theme selection UI
- Real-time theme switching functional
- Theme preferences persisting to database
- No regressions in existing features

**Phase 5: Testing & Documentation (3-4 hours)**
- E2E tests for theme switching
- Visual regression tests
- User manual updates
- API documentation updates

---

## Color Reference (from Phase 2)

### Theme Color Swatches for Preview Cards

**Original:**
- Primary: `#3b82f6` (Blue 500) - Default theme
- Accent: `#3b82f6`

**Vibrant Blue:**
- Primary: `#3b82f6` (Blue 500) - High saturation
- Accent: `#3b82f6`

**Teal Accent:**
- Primary: `#14b8a6` (Teal 500) - Calming professional
- Accent: `#14b8a6`

**Warm Accent:**
- Primary: `#f97316` (Orange 500) - Friendly inviting
- Accent: `#f97316`

**Note:** These hex values are approximations of the HSL values defined in Phase 2. The actual colors are controlled by CSS custom properties in `globals.css`.

---

## Design Mockup (Text Description)

```
┌─────────────────────────────────────────────────────────┐
│ Settings                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ User Preferences                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Theme Preferences                                   │ │
│ │                                                     │ │
│ │ Dark Mode                           [Toggle: OFF]  │ │
│ │ Switch between light and dark appearance           │ │
│ │                                                     │ │
│ │ Color Theme                                         │ │
│ │ Choose your preferred color scheme                 │ │
│ │                                                     │ │
│ │ ┌──────────────┐  ┌──────────────┐                 │ │
│ │ │ [Blue] [Blue]│  │ [Blue] [Blue]│                 │ │
│ │ │ Original ✓   │  │ Vibrant Blue │                 │ │
│ │ │ Classic...   │  │ Bright and...│                 │ │
│ │ └──────────────┘  └──────────────┘                 │ │
│ │                                                     │ │
│ │ ┌──────────────┐  ┌──────────────┐                 │ │
│ │ │ [Teal][Teal] │  │ [Org.][Org.] │                 │ │
│ │ │ Teal Accent  │  │ Warm Accent  │                 │ │
│ │ │ Calm and...  │  │ Friendly...  │                 │ │
│ │ └──────────────┘  └──────────────┘                 │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Church Settings                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Existing church settings content...]              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Legend:**
- `[Blue]` = Color swatch preview
- `✓` = Selected indicator
- `[Toggle]` = Switch component

---

## Component Hierarchy

```
settings/page.tsx (Server Component)
├── PageHeader
├── "User Preferences" section
│   └── ThemeSettings (Client Component)
│       ├── Card
│       │   ├── CardHeader
│       │   │   └── CardTitle
│       │   └── CardContent
│       │       ├── Dark Mode Toggle
│       │       │   ├── Label
│       │       │   └── Switch
│       │       └── Theme Selector Grid
│       │           ├── ThemePreviewCard (Original)
│       │           ├── ThemePreviewCard (Vibrant Blue)
│       │           ├── ThemePreviewCard (Teal Accent)
│       │           └── ThemePreviewCard (Warm Accent)
└── "Church Settings" section
    └── SettingsForm (existing)
```

---

## API Integration Flow

```
1. User visits /settings
   ↓
2. Server Component fetches getUserTheme() (Phase 2)
   ↓
3. Renders ThemeSettings with initialTheme prop
   ↓
4. User clicks theme preview card
   ↓
5. Client: Updates DOM (data-theme attribute) - INSTANT
   ↓
6. Client: Calls updateUserTheme() server action
   ↓
7. Server: PATCH /api/v1/users/me/theme (Phase 1)
   ↓
8. Database: Updates user.theme_preference
   ↓
9. Success: Theme persisted for future sessions
```

**Optimistic UI:**
- Step 5 happens immediately (no waiting for API)
- Step 6-8 happen in background
- If step 7 fails, optionally revert (or just log error)

---

## Switch Component Fallback

**If Flowbite UI lacks Switch component:**

**Option 1: Use Checkbox**
```tsx
<Checkbox
  id="dark-mode"
  checked={darkMode}
  onChange={(e) => handleDarkModeToggle(e.target.checked)}
/>
```

**Option 2: Create Custom Switch (Headless UI)**
```tsx
import { Switch as HeadlessSwitch } from '@headlessui/react';

<HeadlessSwitch
  checked={darkMode}
  onChange={handleDarkModeToggle}
  className={`
    ${darkMode ? 'bg-primary' : 'bg-gray-200'}
    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
  `}
>
  <span className={`
    ${darkMode ? 'translate-x-6' : 'translate-x-1'}
    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
  `} />
</HeadlessSwitch>
```

**Decision:** Check during implementation; use simplest available option.

---

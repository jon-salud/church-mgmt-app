# User Preferences Enhancement - Developer Implementation Plan

**Sprint:** user-preferences-enhancement  
**Created by:** @principal_architect  
**Date:** 7 November 2025  
**For:** @principal_engineer and development team  
**Status:** Ready for Implementation

---

## 📐 Architectural Analysis

### Current State Assessment

**Existing Architecture Foundations:**
1. ✅ **Theme System:** Complete implementation exists
   - Database: `themePreference`, `themeDarkMode` in User model
   - API: `GET/PATCH /users/me/theme` endpoints operational
   - Frontend: `getUserTheme()`, `updateUserTheme()` server actions
   - SSR: Inline script prevents FOUC
   - Design tokens: CSS variables in `globals.css`

2. ✅ **Component Library:** Design system mature
   - DropdownMenu component: Full compound component API
   - Modal/Dialog semantics: Available via Flowbite wrappers
   - Button variants: 5 variants (default, outline, secondary, ghost, destructive)
   - Design tokens: 50+ CSS custom properties in HSL

3. ✅ **Backend Patterns:** Established conventions
   - NestJS controllers with route guards
   - DTO validation with `class-validator`
   - Domain entities with value objects
   - Repository pattern for data access
   - Enum-based validation for user preferences

4. ✅ **Frontend Patterns:** Server-first architecture
   - Next.js 14 App Router with RSC
   - Server actions for mutations
   - Cookie-based auth with middleware
   - TypeScript strict mode

**Gaps to Address:**
- ❌ No user dropdown menu in header (displays username text + logout button)
- ❌ No font size preference system
- ❌ No settings modal (preferences changed via full-page `/settings`)
- ❌ No draft state management pattern for preferences
- ❌ Typography not using `rem` units consistently

### Architectural Implications

**✅ APPROVED PATTERNS:**

1. **Extend Existing Theme Endpoints (DO NOT create new endpoints)**
   - `/users/me/theme` already handles user preferences
   - Add `fontSizePreference` field to existing DTOs
   - Maintains RESTful resource design
   - Single database transaction for atomicity

2. **Reuse DropdownMenu Component (DO NOT rebuild)**
   - Existing component has full keyboard nav, focus management
   - Compound component API matches Radix patterns
   - Already handles click-outside, escape key

3. **Follow Theme System Patterns (CONSISTENCY)**
   - Mirror `themePreference` enum approach for `fontSizePreference`
   - Use nullable database fields (backward compatible)
   - Inline script pattern for FOUC prevention
   - CSS custom properties for runtime theming

4. **Server Actions for Mutations (ESTABLISHED CONVENTION)**
   - `updateUserTheme()` action already exists
   - Extend to handle `fontSizePreference`
   - Maintains Next.js 14 best practices

**🚫 ANTI-PATTERNS TO AVOID:**

1. ❌ **DO NOT create `/users/me/preferences` endpoint**
   - Would fragment user settings across multiple endpoints
   - Theme is already a preference type
   - Violates single resource principle

2. ❌ **DO NOT use client-side state management (Zustand, Redux)**
   - Server actions + React state sufficient
   - Adds unnecessary complexity
   - Goes against Next.js RSC architecture

3. ❌ **DO NOT hardcode font sizes in components**
   - Must use `rem` units based on `--base-font-size`
   - Creates maintenance burden
   - Breaks user preference system

4. ❌ **DO NOT auto-save preferences**
   - Violates explicit save pattern
   - Product requirement: preview + save/cancel
   - User anxiety prevention

---

## 🎯 Phase 1: User Settings Dropdown Menu

### Architecture Decision: Component Location

**Decision:** Create `web/components/user-menu.tsx` (NOT in `ui-flowbite/`)

**Rationale:**
- `ui-flowbite/` is for **generic reusable** UI primitives
- UserMenu is **domain-specific** to app header
- Contains business logic (logout action, user info display)
- Uses domain components (DropdownMenu) but isn't one itself

### Implementation Specification

#### 1.1 UserMenu Component

**File:** `web/components/user-menu.tsx`

**Props Interface:**
```typescript
interface UserMenuProps {
  displayName: string;    // "John Doe"
  email: string;          // "john@example.com"
  onSettingsClick: () => void;  // Opens SettingsModal
}
```

**Component Structure:**
```tsx
'use client'; // CRITICAL: Must be client component for onClick handlers

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, 
         DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui-flowbite/dropdown-menu';
import { ChevronDown, Settings, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions';

export function UserMenu({ displayName, email, onSettingsClick }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
        aria-label="User menu"
      >
        <span className="text-sm font-medium">{displayName}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => logoutAction()} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**🚨 COMMON PITFALL #1: Missing 'use client' directive**
- **Symptom:** Error: "You're importing a component that needs useState. It only works in a Client Component"
- **Cause:** Forgot 'use client' at top of file
- **Fix:** Add `'use client';` as first line of `user-menu.tsx`
- **Prevention:** Always check if component uses onClick, useState, or other client-only features

**Design Tokens Used:**
- `text-muted-foreground` - secondary text color
- `hover:bg-accent` - hover state
- `text-destructive` - logout button warning color
- `rounded-md` - uses `--radius` (0.5rem)

**Accessibility Requirements:**
- ✅ `aria-label="User menu"` on trigger
- ✅ `role="menuitem"` inherited from DropdownMenuItem
- ✅ Keyboard nav (Enter, Escape, Tab) inherited from DropdownMenu
- ✅ Focus ring via `focus:ring-2 focus:ring-ring` (design system default)

**Mobile Considerations:**
- Trigger has `px-3 py-2` = 24px padding = 48px min tap target ✅
- Dropdown `align="end"` prevents cutoff on right edge
- `w-56` (224px) fits within 375px viewport with margin

#### 1.2 AppLayout Integration

**File:** `web/app/app-layout.tsx`

**Changes Required:**

1. **Import UserMenu and add modal state:**
```typescript
import { UserMenu } from '@/components/user-menu';
import { useState } from 'react'; // ❌ WRONG - AppLayout is RSC
```

**⚠️ ARCHITECTURE CONSTRAINT:** `AppLayout` is a React Server Component (RSC).
- Cannot use `useState` or client-side hooks
- Must extract header to client component for modal state

**Solution:** Create `AppLayoutClient` wrapper

**File:** `web/app/app-layout-client.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { UserMenu } from '@/components/user-menu';
// Phase 2/3: Uncomment when SettingsModal is created
// import { SettingsModal } from '@/components/settings-modal';

interface AppLayoutClientProps {
  displayName: string;
  email: string;
  children: React.ReactNode;
}

export function AppLayoutClient({ displayName, email, children }: AppLayoutClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* IMPORTANT: Preserve existing header content from app-layout.tsx */}
          {/* Logo, ThemeSwitcher, MenuToggle, etc. go here */}
        </div>
        
        <UserMenu 
          displayName={displayName}
          email={email}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
      </header>
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      {/* Phase 2/3: Uncomment when SettingsModal is created
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme="original"
        currentFontSize="16px"
      />
      */}
    </>
  );
}
```

**🚨 COMMON PITFALL #2: Breaking existing header layout**
- **Symptom:** Logo, theme switcher, or menu toggle disappears
- **Cause:** Forgot to migrate existing header elements from AppLayout
- **Fix:** 
  1. Open current `web/app/app-layout.tsx`
  2. Find the `<header>` section
  3. Copy ALL existing header children to AppLayoutClient
  4. Preserve exact className and structure
- **Prevention:** Do a visual diff before/after extraction

**🚨 COMMON PITFALL #3: Phase 1 import errors**
- **Symptom:** TypeScript error: "Cannot find module '@/components/settings-modal'"
- **Cause:** SettingsModal doesn't exist yet (it's Phase 2/3)
- **Fix:** Comment out the import and JSX until Phase 2
- **Prevention:** Follow the phase order strictly - don't jump ahead

**File:** `web/app/app-layout.tsx` (MODIFY)

```typescript
// Remove direct header rendering
// Wrap in AppLayoutClient component

export async function AppLayout({ children }: AppLayoutProps) {
  // ... existing auth/settings fetch logic ...

  const displayName = me?.user?.profile
    ? `${me.user.profile.firstName} ${me.user.profile.lastName ?? ''}`.trim()
    : 'User';
  
  const email = me?.user?.primaryEmail ?? '';

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav {...navProps} />
      
      <AppLayoutClient 
        displayName={displayName}
        email={email}
      >
        {children}
      </AppLayoutClient>
    </div>
  );
}
```

**Rationale for Client Component:**
- Modal state (`isSettingsOpen`) requires client-side reactivity
- UserMenu trigger needs `onClick` handler
- Settings modal needs controlled open/close
- Maintains server-side data fetching for user info

#### 1.3 Testing Requirements

**Unit Tests:** `web/components/__tests__/user-menu.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserMenu } from '../user-menu';

describe('UserMenu', () => {
  const mockProps = {
    displayName: 'John Doe',
    email: 'john@example.com',
    onSettingsClick: jest.fn(),
  };

  it('displays user name and email', () => {
    render(<UserMenu {...mockProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('opens dropdown on trigger click', () => {
    render(<UserMenu {...mockProps} />);
    const trigger = screen.getByLabelText('User menu');
    fireEvent.click(trigger);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onSettingsClick when Settings clicked', () => {
    render(<UserMenu {...mockProps} />);
    fireEvent.click(screen.getByLabelText('User menu'));
    fireEvent.click(screen.getByText('Settings'));
    expect(mockProps.onSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('has accessible keyboard navigation', () => {
    render(<UserMenu {...mockProps} />);
    const trigger = screen.getByLabelText('User menu');
    
    // Enter key opens dropdown
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Escape key closes dropdown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });
});
```

**E2E Tests:** `web/e2e/user-menu.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Menu Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    // Login as demo user
    await page.goto('/');
    await page.context().addCookies([
      { name: 'demo_token', value: 'demo-admin', domain: 'localhost', path: '/' }
    ]);
    await page.goto('/dashboard');
  });

  test('opens dropdown and displays user info', async ({ page }) => {
    // Click user menu trigger
    await page.click('button[aria-label="User menu"]');
    
    // Verify dropdown visible
    await expect(page.locator('text=Settings')).toBeVisible();
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('clicking Settings opens modal', async ({ page }) => {
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Settings');
    
    // Verify modal opens (Phase 2/3 integration)
    await expect(page.locator('role=dialog')).toBeVisible();
  });

  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('button[aria-label="User menu"]');
    
    // Verify dropdown not cut off
    const dropdown = page.locator('[role="menu"]');
    const box = await dropdown.boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(375);
  });
});
```

---

## 🎯 Phase 2: Font Size Preference System

### Architecture Decision: Database Schema

**Decision:** Add `fontSizePreference` to existing User model

**Schema Change:**
```prisma
model User {
  // ... existing fields ...
  
  // Theme Preferences (Phase 1 - User Theme Preferences Sprint)
  themePreference String?  @default("original")
  themeDarkMode   Boolean? @default(false)
  
  // Font Size Preference (User Preferences Enhancement Sprint - Phase 2)
  fontSizePreference String? // '14px' | '16px' | '18px' | '20px'
  
  // ... rest of model ...
}
```

**Migration Strategy:**
- Nullable field = zero downtime deployment
- Default `null` = fallback to 16px in application logic
- No `@default` in Prisma = allows distinguishing "not set" vs "explicitly 16px"

**Rationale:**
- Consistency with `themePreference` pattern
- Single transaction for theme + fontSize updates
- Backward compatible (existing users unaffected)

### Implementation Specification

#### 2.1 Backend: Database Migration

**File:** `api/prisma/migrations/[timestamp]_add_font_size_preference/migration.sql`

```sql
-- Add fontSizePreference column to User table
-- Nullable to maintain backward compatibility
-- No default value to distinguish "not set" from "explicitly 16px"

ALTER TABLE "User" ADD COLUMN "fontSizePreference" TEXT;

-- Add check constraint for valid values (PostgreSQL)
ALTER TABLE "User" ADD CONSTRAINT "User_fontSizePreference_check" 
  CHECK ("fontSizePreference" IN ('14px', '16px', '18px', '20px') OR "fontSizePreference" IS NULL);

-- Optional: Add index if frequently queried (not needed for user preferences)
-- CREATE INDEX "User_fontSizePreference_idx" ON "User"("fontSizePreference");
```

**Rollback Script:**
```sql
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_fontSizePreference_check";
ALTER TABLE "User" DROP COLUMN IF EXISTS "fontSizePreference";
```

**Migration Command:**
```bash
cd api
pnpm prisma migrate dev --name add_font_size_preference
pnpm prisma generate
```

**🚨 COMMON PITFALL #4: Migration fails with "column already exists"**
- **Symptom:** Error: `column "fontSizePreference" of relation "User" already exists`
- **Cause:** Migration was partially applied or run multiple times
- **Fix:**
  ```bash
  # Check migration status
  pnpm prisma migrate status
  
  # If migration is applied but Prisma thinks it's not:
  pnpm prisma migrate resolve --applied [migration-name]
  
  # If migration is corrupted:
  # 1. Manually drop the column in database
  psql $DATABASE_URL -c 'ALTER TABLE "User" DROP COLUMN IF EXISTS "fontSizePreference";'
  # 2. Reset migration
  pnpm prisma migrate reset
  # 3. Re-run migration
  pnpm prisma migrate dev
  ```
- **Prevention:** Always check `pnpm prisma migrate status` before creating new migrations

**🚨 COMMON PITFALL #5: Prisma generate not reflecting schema changes**
- **Symptom:** TypeScript still shows old User type without fontSizePreference
- **Cause:** Prisma client cache not regenerated
- **Fix:**
  ```bash
  # Force regenerate Prisma client
  rm -rf node_modules/.prisma
  pnpm prisma generate --force
  
  # Restart TypeScript server in VS Code
  # CMD+Shift+P → "TypeScript: Restart TS Server"
  ```
- **Prevention:** Always run `pnpm prisma generate` after schema changes

#### 2.2 Backend: Domain Entity

**File:** `api/src/domain/entities/User.ts` (MODIFY)

```typescript
export interface UserProps {
  // ... existing props ...
  themePreference?: string;
  themeDarkMode?: boolean;
  fontSizePreference?: string; // ADD THIS
}

export class User {
  // ... existing properties ...
  readonly themePreference?: string;
  readonly themeDarkMode?: boolean;
  readonly fontSizePreference?: string; // ADD THIS

  private constructor(props: UserProps) {
    // ... existing assignments ...
    this.themePreference = props.themePreference;
    this.themeDarkMode = props.themeDarkMode;
    this.fontSizePreference = props.fontSizePreference; // ADD THIS
  }
}
```

**⚠️ NO VALIDATION IN DOMAIN ENTITY**
- Domain entity is data container only
- Validation happens in DTO layer (class-validator)
- Maintains separation of concerns

#### 2.3 Backend: Type Definitions

**File:** `api/src/modules/users/types/theme.types.ts` (MODIFY - RENAME to preferences.types.ts)

```typescript
/**
 * Supported theme presets for the application.
 */
export enum ThemePreset {
  ORIGINAL = 'original',
  VIBRANT_BLUE = 'vibrant-blue',
  TEAL_ACCENT = 'teal-accent',
  WARM_ACCENT = 'warm-accent',
}

/**
 * Supported font size presets (NEW)
 */
export enum FontSizePreset {
  SMALL = '14px',
  DEFAULT = '16px',
  LARGE = '18px',
  EXTRA_LARGE = '20px',
}

/**
 * User's complete preferences configuration
 */
export interface UserPreferences {
  themePreference: ThemePreset;
  themeDarkMode: boolean;
  fontSizePreference: FontSizePreset; // ADD THIS
}

/**
 * Type guard for font size presets (NEW)
 */
export function isValidFontSizePreset(value: string): value is FontSizePreset {
  return Object.values(FontSizePreset).includes(value as FontSizePreset);
}
```

#### 2.4 Backend: DTOs

**File:** `api/src/modules/users/dto/theme.dto.ts` (RENAME to preferences.dto.ts)

```typescript
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThemePreset, FontSizePreset } from '../types/preferences.types';

/**
 * DTO for updating user preferences
 */
export class UpdatePreferencesDto {
  @ApiProperty({
    enum: ThemePreset,
    description: 'Theme preset to apply',
    example: ThemePreset.VIBRANT_BLUE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ThemePreset, { message: 'Invalid theme preset' })
  themePreference?: ThemePreset;

  @ApiProperty({
    description: 'Enable dark mode',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'themeDarkMode must be a boolean' })
  themeDarkMode?: boolean;

  @ApiProperty({
    enum: FontSizePreset,
    description: 'Font size preset to apply',
    example: FontSizePreset.DEFAULT,
    required: false,
  })
  @IsOptional()
  @IsEnum(FontSizePreset, { message: 'Invalid font size preset' })
  fontSizePreference?: FontSizePreset;
}

/**
 * DTO for preferences response
 */
export class PreferencesResponseDto {
  @ApiProperty({
    enum: ThemePreset,
    description: 'Current theme preset',
    example: ThemePreset.ORIGINAL,
  })
  themePreference!: ThemePreset;

  @ApiProperty({
    description: 'Dark mode enabled',
    example: false,
  })
  themeDarkMode!: boolean;

  @ApiProperty({
    enum: FontSizePreset,
    description: 'Current font size preset',
    example: FontSizePreset.DEFAULT,
  })
  fontSizePreference!: FontSizePreset;
}
```

**⚠️ BREAKING CHANGE MITIGATION:**
- Keep `UpdateThemeDto` and `ThemeResponseDto` as **type aliases** for backward compatibility
- Existing frontend code continues to work
- Gradual migration to `UpdatePreferencesDto`

```typescript
// Backward compatibility aliases
export type UpdateThemeDto = UpdatePreferencesDto;
export type ThemeResponseDto = PreferencesResponseDto;
```

#### 2.5 Backend: Service Layer

**File:** `api/src/modules/users/users.service.ts` (MODIFY)

```typescript
import { FontSizePreset, isValidFontSizePreset } from './types/preferences.types';

// Rename method (keep old name as alias for backward compat)
async getUserPreferences(userId: string): Promise<PreferencesResponseDto> {
  const id = UserId.create(userId);
  const user = await this.repo.getUserProfile(id);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return {
    themePreference: (user.themePreference as ThemePreset) || ThemePreset.ORIGINAL,
    themeDarkMode: user.themeDarkMode ?? false,
    fontSizePreference: (user.fontSizePreference as FontSizePreset) || FontSizePreset.DEFAULT,
  };
}

// Backward compat alias
async getUserTheme(userId: string): Promise<ThemeResponseDto> {
  return this.getUserPreferences(userId);
}

async updateUserPreferences(
  userId: string,
  updateDto: UpdatePreferencesDto
): Promise<PreferencesResponseDto> {
  // Validate font size if provided
  if (updateDto.fontSizePreference && !isValidFontSizePreset(updateDto.fontSizePreference)) {
    throw new BadRequestException('Invalid font size preset');
  }

  const id = UserId.create(userId);
  const actorId = id; // User updating their own preferences

  const updateData: any = { actorUserId: actorId };
  
  if (updateDto.themePreference !== undefined) {
    updateData.themePreference = updateDto.themePreference;
  }
  if (updateDto.themeDarkMode !== undefined) {
    updateData.themeDarkMode = updateDto.themeDarkMode;
  }
  if (updateDto.fontSizePreference !== undefined) {
    updateData.fontSizePreference = updateDto.fontSizePreference;
  }

  const updatedUser = await this.repo.updateUser(id, updateData);
  if (!updatedUser) {
    throw new NotFoundException('User not found');
  }

  return {
    themePreference: (updatedUser.themePreference as ThemePreset) || ThemePreset.ORIGINAL,
    themeDarkMode: updatedUser.themeDarkMode ?? false,
    fontSizePreference: (updatedUser.fontSizePreference as FontSizePreset) || FontSizePreset.DEFAULT,
  };
}

// Backward compat alias
async updateUserTheme(userId: string, updateDto: UpdateThemeDto): Promise<ThemeResponseDto> {
  return this.updateUserPreferences(userId, updateDto);
}
```

**⚠️ ATOMICITY GUARANTEE:**
- Single `repo.updateUser()` call = single database transaction
- Theme + fontSize updated together or both fail
- No partial updates = data consistency maintained

#### 2.6 Backend: Controller

**File:** `api/src/modules/users/users.controller.ts` (MODIFY)

```typescript
import { UpdatePreferencesDto, PreferencesResponseDto } from './dto/preferences.dto';

// Keep existing routes for backward compatibility
// Add comments indicating they're aliases

@Get('me/theme')
@ApiOperation({ summary: 'Get current user preferences (theme + font size)' })
@ApiResponse({
  status: 200,
  description: 'Preferences retrieved successfully',
  type: PreferencesResponseDto,
})
async getMyTheme(@Req() req: any): Promise<PreferencesResponseDto> {
  const userId = req.user.id;
  return this.usersService.getUserPreferences(userId);
}

@Patch('me/theme')
@ApiOperation({ summary: 'Update current user preferences (theme + font size)' })
@ApiBody({ type: UpdatePreferencesDto })
@ApiResponse({
  status: 200,
  description: 'Preferences updated successfully',
  type: PreferencesResponseDto,
})
async updateMyTheme(
  @Req() req: any,
  @Body() updateDto: UpdatePreferencesDto
): Promise<PreferencesResponseDto> {
  const userId = req.user.id;
  return this.usersService.updateUserPreferences(userId, updateDto);
}
```

**⚠️ API DESIGN DECISION:**
- **DO NOT** create new `/users/me/preferences` endpoint
- **REUSE** existing `/users/me/theme` endpoint
- **EXPAND** payload to include `fontSizePreference`
- **BACKWARD COMPATIBLE:** Old clients sending only theme still work

**OpenAPI Documentation:**
```yaml
PATCH /users/me/theme:
  requestBody:
    content:
      application/json:
        schema:
          type: object
          properties:
            themePreference:
              type: string
              enum: [original, vibrant-blue, teal-accent, warm-accent]
            themeDarkMode:
              type: boolean
            fontSizePreference:
              type: string
              enum: ['14px', '16px', '18px', '20px']
        examples:
          theme-only:
            value: { "themePreference": "vibrant-blue", "themeDarkMode": true }
          font-only:
            value: { "fontSizePreference": "18px" }
          both:
            value: { "themePreference": "teal-accent", "fontSizePreference": "20px" }
```

#### 2.7 Backend: Mock Data

**File:** `api/src/mock/mock-database.service.ts` (MODIFY)

```typescript
// Add fontSizePreference to mock users
this.users = [
  {
    id: 'demo-admin-id',
    primaryEmail: 'admin@demo.church',
    // ... existing fields ...
    themePreference: 'original',
    themeDarkMode: false,
    fontSizePreference: '16px', // ADD THIS
  },
  // ... other mock users ...
];
```

#### 2.8 Frontend: Server Actions

**File:** `web/app/actions/theme.ts` (MODIFY - consider renaming to preferences.ts)

```typescript
'use server';

import { apiFetch } from '../../lib/api.server';

/**
 * User preferences from the API (expanded from theme-only)
 */
export interface UserPreferences {
  themePreference: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  themeDarkMode: boolean;
  fontSizePreference: '14px' | '16px' | '18px' | '20px';
}

/**
 * Default preferences for unauthenticated users or API failures
 */
const PREFERENCES_DEFAULTS: UserPreferences = {
  themePreference: 'original',
  themeDarkMode: false,
  fontSizePreference: '16px',
};

const VALID_THEMES = ['original', 'vibrant-blue', 'teal-accent', 'warm-accent'] as const;
const VALID_FONT_SIZES = ['14px', '16px', '18px', '20px'] as const;

/**
 * Type guard to validate API response
 */
function isValidPreferencesResponse(data: unknown): data is UserPreferences {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  // Validate theme
  if (
    typeof obj.themePreference !== 'string' ||
    !VALID_THEMES.includes(obj.themePreference as any)
  ) return false;

  // Validate dark mode
  if (typeof obj.themeDarkMode !== 'boolean') return false;

  // Validate font size (optional for backward compat)
  if (
    obj.fontSizePreference !== undefined &&
    (typeof obj.fontSizePreference !== 'string' ||
     !VALID_FONT_SIZES.includes(obj.fontSizePreference as any))
  ) return false;

  return true;
}

/**
 * Fetches the current user's preferences from the API
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const data = await apiFetch<unknown>('/users/me/theme');

    if (!isValidPreferencesResponse(data)) {
      console.warn('Invalid preferences data from API, using defaults:', data);
      return PREFERENCES_DEFAULTS;
    }

    // Fill in fontSizePreference if missing (backward compat)
    return {
      ...data,
      fontSizePreference: data.fontSizePreference || '16px',
    };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return PREFERENCES_DEFAULTS;
  }
}

// Backward compat alias
export async function getUserTheme() {
  return getUserPreferences();
}

/**
 * DTO for updating user preferences
 */
export interface UpdatePreferencesDto {
  themePreference?: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  themeDarkMode?: boolean;
  fontSizePreference?: '14px' | '16px' | '18px' | '20px';
}

/**
 * Updates the current user's preferences via the API
 */
export async function updateUserPreferences(dto: UpdatePreferencesDto): Promise<void> {
  try {
    await apiFetch('/users/me/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    throw error;
  }
}

// Backward compat alias
export async function updateUserTheme(dto: { themePreference?: string; themeDarkMode?: boolean }) {
  return updateUserPreferences(dto);
}
```

#### 2.9 Frontend: Server-Side Rendering

**File:** `web/app/layout.tsx` (MODIFY)

```typescript
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ... existing auth check ...

  const preferences = isAuthenticated
    ? await getUserPreferences()
    : { 
        themePreference: 'original' as const, 
        themeDarkMode: false,
        fontSizePreference: '16px' as const
      };

  return (
    <html lang="en" suppressHydrationWarning data-theme={preferences.themePreference}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = '${preferences.themePreference}';
                  const fontSize = '${preferences.fontSizePreference}';
                  
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.setProperty('--base-font-size', fontSize);
                } catch (e) {
                  console.warn('Failed to apply preferences:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme={preferences.themeDarkMode ? 'dark' : 'light'}
          enableSystem={false}
        >
          <ThemeApplier themePreference={preferences.themePreference} />
          <AppLayout>{children}</AppLayout>
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**⚠️ XSS PREVENTION:**
- `fontSize` is validated against enum before injection
- Server-side validation prevents malicious values
- Inline script uses template literal (safe in this context)

**🚨 COMMON PITFALL #6: Inline script causes hydration errors**
- **Symptom:** React warning: "Hydration failed because the initial UI does not match what was rendered on the server"
- **Cause:** Script runs before React hydrates, causing mismatch
- **Fix:** Add `suppressHydrationWarning` to `<html>` tag (already in layout.tsx)
- **Verification:**
  ```typescript
  <html lang="en" suppressHydrationWarning data-theme={preferences.themePreference}>
  ```
- **Prevention:** Always use suppressHydrationWarning when manipulating DOM before hydration

**🚨 COMMON PITFALL #7: Font size not applying on first load**
- **Symptom:** Page loads with 16px, then "flickers" to user's preference
- **Cause:** Inline script runs too late or has syntax error
- **Debug:**
  ```javascript
  // Add console.log to inline script
  console.log('Applying fontSize:', fontSize);
  document.documentElement.style.setProperty('--base-font-size', fontSize);
  console.log('Applied:', getComputedStyle(document.documentElement).getPropertyValue('--base-font-size'));
  ```
- **Fix:** Ensure inline script is in `<head>`, not `<body>`
- **Prevention:** Test with different font sizes and hard refresh (CMD+Shift+R)

#### 2.10 Frontend: CSS Typography System

**File:** `web/app/globals.css` (MODIFY)

```css
@layer base {
  :root {
    /* ... existing color tokens ... */

    /* Typography Scale - NEW */
    --base-font-size: 16px; /* User-configurable via fontSizePreference */
    
    /* Line heights adjusted per font size via JS or CSS calc */
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;
  }

  /* Base typography uses rem units relative to --base-font-size */
  html {
    font-size: var(--base-font-size);
  }

  body {
    font-size: 1rem; /* = --base-font-size */
    line-height: var(--line-height-normal);
  }

  /* Heading scale uses rem (scales with base font size) */
  h1 { font-size: 2.25rem; }    /* 36px at 16px base */
  h2 { font-size: 1.875rem; }   /* 30px at 16px base */
  h3 { font-size: 1.5rem; }     /* 24px at 16px base */
  h4 { font-size: 1.25rem; }    /* 20px at 16px base */
  h5 { font-size: 1.125rem; }   /* 18px at 16px base */
  h6 { font-size: 1rem; }       /* 16px at 16px base */

  /* Utility classes for typography */
  .text-xs { font-size: 0.75rem; }     /* 12px at 16px base */
  .text-sm { font-size: 0.875rem; }    /* 14px at 16px base */
  .text-base { font-size: 1rem; }      /* 16px at 16px base */
  .text-lg { font-size: 1.125rem; }    /* 18px at 16px base */
  .text-xl { font-size: 1.25rem; }     /* 20px at 16px base */
}
```

**⚠️ MIGRATION REQUIRED:**
- Audit all components for hardcoded `px` values
- Replace with `rem` or Tailwind classes
- Test at all 4 font sizes (14, 16, 18, 20px)

**Migration Script (manual review required):**
```bash
# Find all hardcoded font-size values
grep -r "font-size.*px" web/app web/components | grep -v node_modules
grep -r "text-\[.*px\]" web/app web/components | grep -v node_modules

# More comprehensive search including inline styles
grep -r 'style.*fontSize' web/app web/components | grep -v node_modules
grep -r 'style={{.*px' web/app web/components | grep -v node_modules
```

**🚨 COMMON PITFALL #8: Typography breaks at extreme font sizes**
- **Symptom:** 
  - At 14px: Text too small, buttons look cramped
  - At 20px: Text overflows containers, horizontal scroll appears
- **Cause:** Components hardcode pixel values or don't account for scaling
- **Debug Checklist:**
  ```bash
  # Test each font size systematically
  1. Set font to 14px
  2. Navigate to every page: /dashboard, /members, /events, etc.
  3. Check for:
     - Unreadable text (< 11px computed)
     - Overlapping elements
     - Cut-off text
     - Broken layouts
  4. Repeat for 16px, 18px, 20px
  ```
- **Common Problem Areas:**
  - Fixed-width containers with overflow:hidden
  - Buttons with fixed padding (use `py-2 px-4` not `h-10 w-20`)
  - Tables with fixed column widths
  - Modals with fixed heights
- **Fix Pattern:**
  ```css
  /* ❌ WRONG - Fixed size */
  .button { width: 120px; height: 40px; }
  
  /* ✅ CORRECT - Flexible size */
  .button { padding: 0.5rem 1rem; min-height: 2.5rem; }
  ```
- **Prevention:** Test at all 4 sizes before marking phase complete

#### 2.11 Frontend: FontSizeSelector Component

**File:** `web/components/font-size-selector.tsx` (NEW)

```typescript
'use client';

import { Button } from './ui-flowbite/button';
import { cn } from '@/lib/utils';

interface FontSizeSelectorProps {
  value: '14px' | '16px' | '18px' | '20px';
  onChange: (size: '14px' | '16px' | '18px' | '20px') => void;
}

const FONT_SIZES = [
  { value: '14px' as const, label: 'Small', description: '14px' },
  { value: '16px' as const, label: 'Default', description: '16px' },
  { value: '18px' as const, label: 'Large', description: '18px' },
  { value: '20px' as const, label: 'Extra Large', description: '20px' },
];

export function FontSizeSelector({ value, onChange }: FontSizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {FONT_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => onChange(size.value)}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
              'hover:bg-accent hover:border-primary',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              value === size.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-background'
            )}
            aria-label={`Set font size to ${size.label}`}
            aria-pressed={value === size.value}
          >
            <span 
              className="font-semibold mb-1" 
              style={{ fontSize: size.value }}
            >
              Aa
            </span>
            <span className="text-xs text-muted-foreground">{size.label}</span>
            <span className="text-xs text-muted-foreground">{size.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Accessibility:**
- ✅ `aria-label` describes action
- ✅ `aria-pressed` indicates selection state
- ✅ Keyboard focus ring via `focus:ring-2`
- ✅ 4x4 grid on mobile = minimum 44px tap targets

**Design Tokens:**
- `border-primary` - selected state
- `bg-primary/10` - selected background (10% opacity)
- `hover:bg-accent` - hover state
- `text-muted-foreground` - secondary text

---

## 🎯 Phase 3: Settings Modal & Integration

### Architecture Decision: Modal State Management

**Pattern:** Controlled component with draft state

**Rationale:**
- Preview changes without persisting (UX requirement)
- Cancel reverts to original (undo capability)
- Batch updates (theme + fontSize in single API call)
- Error handling with retry (network resilience)

### Implementation Specification

#### 3.1 SettingsModal Component

**File:** `web/components/settings-modal.tsx` (NEW)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui-flowbite/button';
import { FontSizeSelector } from './font-size-selector';
import { ThemeSelector } from './theme-selector'; // Existing component
import { updateUserPreferences } from '@/app/actions/theme';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  currentFontSize: '14px' | '16px' | '18px' | '20px';
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  currentTheme, 
  currentFontSize 
}: SettingsModalProps) {
  // Draft state (not persisted until save)
  const [draftTheme, setDraftTheme] = useState(currentTheme);
  const [draftFontSize, setDraftFontSize] = useState(currentFontSize);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if changes were made
  const hasChanges = 
    draftTheme !== currentTheme || 
    draftFontSize !== currentFontSize;

  // Reset draft state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftTheme(currentTheme);
      setDraftFontSize(currentFontSize);
      setError(null);
    }
  }, [isOpen, currentTheme, currentFontSize]);

  // Real-time preview (apply to DOM without persisting)
  useEffect(() => {
    if (isOpen) {
      document.documentElement.setAttribute('data-theme', draftTheme);
      document.documentElement.style.setProperty('--base-font-size', draftFontSize);
    }
  }, [isOpen, draftTheme, draftFontSize]);

  // Revert preview on close
  const handleClose = () => {
    if (hasChanges) {
      const confirmed = confirm(
        'You have unsaved changes. Do you want to discard them?'
      );
      if (!confirmed) return;
    }

    // Revert DOM to original values
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.style.setProperty('--base-font-size', currentFontSize);
    
    onClose();
  };

  // CRITICAL: Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Revert to original if modal unmounts unexpectedly
      if (isOpen) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.documentElement.style.setProperty('--base-font-size', currentFontSize);
      }
    };
  }, [isOpen, currentTheme, currentFontSize]);

  // Save changes to database
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateUserPreferences({
        themePreference: draftTheme,
        fontSizePreference: draftFontSize,
      });

      // Success - close modal (changes already applied to DOM)
      onClose();
      
      // Optional: Show success toast
      // toast.success('Preferences saved!');
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
      console.error('Save preferences error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, hasChanges]);

/**
 * 🚨 COMMON PITFALL #9: Modal doesn't close on Escape in production
 * 
 * Symptom: Escape key works in dev but not production build
 * Cause: Event listener added multiple times or not cleaned up
 * Debug:
 *   1. Open DevTools console
 *   2. Type: getEventListeners(document)
 *   3. Check 'keydown' - should see exactly 1 listener
 * Fix: Ensure useEffect cleanup removes listener (already in code above)
 * Prevention: Test production build before deployment
 */

/**
 * 🚨 COMMON PITFALL #10: Preview doesn't revert when user navigates away
 * 
 * Symptom: User changes font to 20px, closes modal, navigates to another page, still see 20px
 * Cause: Next.js client-side navigation doesn't trigger modal cleanup
 * Fix: Add router listener to revert on navigation
 * 
 * OPTIONAL Enhancement (if issue occurs):
 * ```typescript
 * import { useRouter } from 'next/navigation';
 * 
 * const router = useRouter();
 * useEffect(() => {
 *   const handleRouteChange = () => {
 *     if (isOpen && hasChanges) {
 *       // Revert to original
 *       document.documentElement.setAttribute('data-theme', currentTheme);
 *       document.documentElement.style.setProperty('--base-font-size', currentFontSize);
 *     }
 *   };
 *   
 *   // Note: Next.js 14 App Router doesn't have router.events
 *   // Alternative: Use pathname change detection
 *   return handleRouteChange;
 * }, [isOpen, hasChanges]);
 * ```
 */

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-card rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="settings-modal-title" className="text-lg font-semibold">
            User Preferences
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-accent/50 border border-accent rounded-md p-3 text-sm">
            💡 Changes preview instantly. Click "Save" to keep them.
          </div>

          {/* Theme Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Color Theme</label>
            <ThemeSelector 
              value={draftTheme}
              onChange={setDraftTheme}
            />
          </div>

          {/* Font Size Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Font Size</label>
            <FontSizeSelector 
              value={draftFontSize}
              onChange={setDraftFontSize}
            />
          </div>

          {/* Unsaved Changes Warning */}
          {hasChanges && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 text-sm text-destructive">
              ⚠️ You have unsaved changes
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-md p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>
  );
}
```

**Accessibility Features:**
- ✅ `role="dialog"` and `aria-modal="true"`
- ✅ `aria-labelledby` links to modal title
- ✅ Escape key closes modal
- ✅ Focus trap (clicking outside closes)
- ✅ Unsaved changes confirmation

**Performance Considerations:**
- Real-time preview uses direct DOM manipulation (fast)
- No React re-renders for preview (efficient)
- Single API call on save (batched)

#### 3.2 AppLayoutClient Integration

**File:** `web/app/app-layout-client.tsx` (MODIFY)

```typescript
'use client';

import { useState } from 'react';
import { UserMenu } from '@/components/user-menu';
import { SettingsModal } from '@/components/settings-modal';

interface AppLayoutClientProps {
  displayName: string;
  email: string;
  currentTheme: 'original' | 'vibrant-blue' | 'teal-accent' | 'warm-accent';
  currentFontSize: '14px' | '16px' | '18px' | '20px';
  children: React.ReactNode;
}

export function AppLayoutClient({ 
  displayName, 
  email, 
  currentTheme,
  currentFontSize,
  children 
}: AppLayoutClientProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo, menu toggle, etc. */}
        </div>
        
        <UserMenu 
          displayName={displayName}
          email={email}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
      </header>
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={currentTheme}
        currentFontSize={currentFontSize}
      />
    </>
  );
}
```

**File:** `web/app/app-layout.tsx` (MODIFY)

```typescript
import { getUserPreferences } from './actions/theme';

export async function AppLayout({ children }: AppLayoutProps) {
  // ... existing user fetch ...

  const preferences = await getUserPreferences();

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarNav {...navProps} />
      
      <AppLayoutClient 
        displayName={displayName}
        email={email}
        currentTheme={preferences.themePreference}
        currentFontSize={preferences.fontSizePreference}
      >
        {children}
      </AppLayoutClient>
    </div>
  );
}
```

**⚠️ SERVER-CLIENT BOUNDARY:**
- `AppLayout` (server) fetches preferences
- `AppLayoutClient` (client) manages modal state
- Props flow server → client (one direction)
- Mutations happen via server actions

---

## 🧪 Testing Strategy

### Unit Test Coverage

**Phase 1:** `web/components/__tests__/user-menu.test.tsx` (80%+ coverage)
**Phase 2:** `web/components/__tests__/font-size-selector.test.tsx` (80%+ coverage)
**Phase 3:** `web/components/__tests__/settings-modal.test.tsx` (85%+ coverage)

### E2E Test Suite

**File:** `web/e2e/user-preferences.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Preferences - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.context().addCookies([
      { name: 'demo_token', value: 'demo-admin', domain: 'localhost', path: '/' }
    ]);
    await page.goto('/dashboard');
  });

  test('complete preferences workflow', async ({ page }) => {
    // Open user menu
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Settings');

    // Modal should be visible
    await expect(page.locator('role=dialog')).toBeVisible();

    // Change theme
    await page.click('text=Vibrant Blue');
    
    // Change font size
    await page.click('text=Large');

    // Verify unsaved changes warning
    await expect(page.locator('text=You have unsaved changes')).toBeVisible();

    // Save
    await page.click('text=Save Changes');

    // Modal should close
    await expect(page.locator('role=dialog')).not.toBeVisible();

    // Verify preferences persist after page reload
    await page.reload();
    await expect(page.locator('[data-theme="vibrant-blue"]')).toBeVisible();
    
    // Verify font size applied
    const fontSize = await page.evaluate(() => 
      getComputedStyle(document.documentElement).getPropertyValue('--base-font-size')
    );
    expect(fontSize.trim()).toBe('18px');
  });

  test('cancel reverts changes', async ({ page }) => {
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Settings');

    // Change preferences
    await page.click('text=Teal Accent');
    await page.click('text=Extra Large');

    // Cancel
    await page.click('text=Cancel');
    
    // Confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Verify original theme still applied
    await expect(page.locator('[data-theme="original"]')).toBeVisible();
  });
});
```

---

## 🚨 Troubleshooting Guide

### Phase 1 Issues

#### Issue: UserMenu dropdown doesn't open
**Symptoms:**
- Click on user name, nothing happens
- No console errors

**Diagnostic Steps:**
1. Check browser console for errors
2. Verify DropdownMenu is imported correctly
3. Check if `'use client'` is at top of file
4. Inspect DOM - does `<button>` have `onClick` handler?

**Solutions:**
```typescript
// 1. Verify import path is correct
import { DropdownMenu } from '@/components/ui-flowbite/dropdown-menu'; // ✅
import { DropdownMenu } from '@/components/dropdown-menu'; // ❌ Wrong path

// 2. Ensure component is client component
'use client'; // MUST be first line

// 3. Check DropdownMenu implementation
// File: web/components/ui-flowbite/dropdown-menu.tsx
// Should have useState for open state
```

**Recovery Path:**
- If DropdownMenu component is broken, use native HTML `<select>` temporarily
- Copy working implementation from `web/components/theme-switcher.tsx` pattern

#### Issue: AppLayoutClient breaks existing layout
**Symptoms:**
- Logo disappears
- Sidebar positioning broken
- Header has wrong styling

**Diagnostic Steps:**
1. Compare old vs new header HTML structure
2. Check if all className props preserved
3. Verify flex/grid layout still intact

**Solutions:**
```bash
# Git diff to see what changed
git diff feature/user-theme-preferences-main-sprint web/app/app-layout.tsx

# Revert to original if needed
git checkout feature/user-theme-preferences-main-sprint -- web/app/app-layout.tsx

# Start over with safer approach
# 1. Copy current app-layout.tsx to app-layout-backup.tsx
# 2. Make changes incrementally
# 3. Test after each change
```

**Recovery Path:**
- Keep original AppLayout intact
- Create parallel AppLayoutV2 for testing
- Switch once verified working

---

### Phase 2 Issues

#### Issue: Migration fails in production database
**Symptoms:**
- `pnpm prisma migrate deploy` fails in CI/CD
- Error: "Permission denied for relation User"

**Diagnostic Steps:**
1. Check database user permissions
2. Verify connection string has correct credentials
3. Check if migration was already applied

**Solutions:**
```bash
# 1. Check migration status
pnpm prisma migrate status

# 2. Test migration on staging database first
DATABASE_URL="postgresql://staging..." pnpm prisma migrate deploy

# 3. If permission error, grant ALTER TABLE permission
psql $DATABASE_URL -c "GRANT ALTER ON TABLE \"User\" TO your_app_user;"

# 4. If migration is stuck, mark as applied manually
pnpm prisma migrate resolve --applied [migration-name]
```

**Recovery Path - NUCLEAR OPTION (dev environment only):**
```bash
# ⚠️ ONLY USE IN DEV - DESTROYS ALL DATA
pnpm prisma migrate reset
pnpm prisma migrate dev
pnpm prisma db seed
```

**Recovery Path - Production (zero downtime):**
```sql
-- Step 1: Add column as nullable (no default)
ALTER TABLE "User" ADD COLUMN "fontSizePreference" TEXT;

-- Step 2: Add constraint in separate transaction
ALTER TABLE "User" ADD CONSTRAINT "User_fontSizePreference_check" 
  CHECK ("fontSizePreference" IN ('14px', '16px', '18px', '20px') OR "fontSizePreference" IS NULL);

-- Step 3: Mark migration as applied
-- Then run: pnpm prisma migrate resolve --applied [migration-name]
```

#### Issue: API returns 500 when updating font size
**Symptoms:**
- PATCH `/users/me/theme` with `fontSizePreference` fails
- Error: "Invalid enum value"

**Diagnostic Steps:**
1. Check API logs for validation errors
2. Verify DTO has `@IsEnum(FontSizePreset)`
3. Check if FontSizePreset enum values match database constraint

**Solutions:**
```typescript
// 1. Verify enum definition matches exactly
export enum FontSizePreset {
  SMALL = '14px',        // ✅ String values
  DEFAULT = '16px',
  LARGE = '18px',
  EXTRA_LARGE = '20px',
}

// ❌ WRONG - Numeric values won't match database
export enum FontSizePreset {
  SMALL = 14,
  DEFAULT = 16,
}

// 2. Check DTO validation
@IsEnum(FontSizePreset, { message: 'Invalid font size preset' })
fontSizePreference?: FontSizePreset;

// 3. Test with curl
curl -X PATCH http://localhost:3001/users/me/theme \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fontSizePreference": "18px"}'
```

**Recovery Path:**
- If enum validation fails, use `@IsIn(['14px', '16px', '18px', '20px'])` instead
- More explicit, less type-safe, but more debuggable

#### Issue: Font size doesn't persist after page reload
**Symptoms:**
- User saves 18px, reloads page, back to 16px
- API returns correct value, but UI doesn't reflect it

**Diagnostic Steps:**
1. Check if inline script in layout.tsx runs
2. Verify `getUserPreferences()` is called
3. Check browser DevTools → Computed styles for `--base-font-size`

**Solutions:**
```javascript
// Debug inline script
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      console.log('🔍 [Font Size] Starting SSR script');
      const fontSize = '${preferences.fontSizePreference}';
      console.log('🔍 [Font Size] Applying:', fontSize);
      
      document.documentElement.style.setProperty('--base-font-size', fontSize);
      
      const applied = getComputedStyle(document.documentElement).getPropertyValue('--base-font-size');
      console.log('🔍 [Font Size] Applied:', applied);
    })();
  `
}} />

// Check in browser console - should see logs
// If logs don't appear, script isn't running
```

**Common Causes:**
1. Template literal escaping wrong: `\`${fontSize}\`` instead of `'${fontSize}'`
2. Script in `<body>` instead of `<head>` (too late)
3. CSP header blocking inline scripts

**Recovery Path:**
```typescript
// Alternative: Use next/script component
import Script from 'next/script';

<Script id="font-size-ssr" strategy="beforeInteractive">
  {`
    document.documentElement.style.setProperty('--base-font-size', '${fontSize}');
  `}
</Script>
```

---

### Phase 3 Issues

#### Issue: Modal preview breaks page layout permanently
**Symptoms:**
- User changes font to 20px in modal
- Clicks cancel
- Page still shows 20px even after modal closed

**Diagnostic Steps:**
1. Check if `handleClose` is called
2. Verify cleanup `useEffect` runs on unmount
3. Check if event listener is properly removed

**Solutions:**
```typescript
// Add defensive programming
const handleClose = () => {
  console.log('🔍 [Modal] Closing, hasChanges:', hasChanges);
  
  // ALWAYS revert, even if no changes tracked
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.documentElement.style.setProperty('--base-font-size', currentFontSize);
  
  console.log('🔍 [Modal] Reverted to:', currentTheme, currentFontSize);
  
  onClose();
};

// Add fail-safe in cleanup
useEffect(() => {
  return () => {
    console.log('🔍 [Modal] Cleanup running');
    // Force revert even if something went wrong
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.style.setProperty('--base-font-size', currentFontSize);
  };
}, []); // Empty deps = only on unmount
```

**Recovery Path:**
- If preview gets stuck, add "Reset to Default" button in modal
- Calls `updateUserPreferences({ fontSizePreference: '16px' })`

#### Issue: Modal save fails silently
**Symptoms:**
- Click "Save Changes"
- Modal closes
- Preferences not saved (back to old values on reload)

**Diagnostic Steps:**
1. Check network tab - is PATCH request sent?
2. Check response status code
3. Check if `updateUserPreferences()` is awaited

**Solutions:**
```typescript
// 1. Ensure async/await is correct
const handleSave = async () => {
  setIsSaving(true);
  setError(null);

  try {
    console.log('🔍 [Modal] Saving:', { draftTheme, draftFontSize });
    
    const response = await updateUserPreferences({
      themePreference: draftTheme,
      fontSizePreference: draftFontSize,
    });
    
    console.log('🔍 [Modal] Saved successfully:', response);
    onClose();
  } catch (err) {
    console.error('🔍 [Modal] Save failed:', err);
    setError(err.message || 'Failed to save preferences');
  } finally {
    setIsSaving(false);
  }
};

// 2. Check server action is marked 'use server'
// File: web/app/actions/theme.ts
'use server'; // MUST be at top

export async function updateUserPreferences(dto: UpdatePreferencesDto): Promise<void> {
  try {
    console.log('🔍 [Server Action] Updating preferences:', dto);
    await apiFetch('/users/me/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  } catch (error) {
    console.error('🔍 [Server Action] Failed:', error);
    throw error; // Re-throw so UI can handle
  }
}
```

**Recovery Path:**
- If server actions fail, use direct `fetch()` as fallback:
```typescript
const response = await fetch('/api/users/me/theme', {
  method: 'PATCH',
  headers: { 
    'Content-Type': 'application/json',
    // Cookie is sent automatically
  },
  body: JSON.stringify({ fontSizePreference: draftFontSize }),
});

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}
```

---

## 🛡️ Pre-Flight Checklist

Before starting each phase, verify:

### Phase 1 Pre-Flight
- [ ] DropdownMenu component exists at `web/components/ui-flowbite/dropdown-menu.tsx`
- [ ] Can import lucide-react icons (Settings, LogOut, ChevronDown)
- [ ] AppLayout currently has a `<header>` element to extract
- [ ] Logout action exists at `web/app/actions` (or know where it is)
- [ ] TypeScript version >= 5.0 (for satisfies operator)

**Verification Commands:**
```bash
# Check if dependencies exist
grep "lucide-react" web/package.json
ls web/components/ui-flowbite/dropdown-menu.tsx
grep -r "logoutAction\|logout" web/app/actions/
```

### Phase 2 Pre-Flight
- [ ] PostgreSQL version >= 12 (for CHECK constraints)
- [ ] Prisma version >= 5.0
- [ ] Have database backup before migration
- [ ] Migration tested on dev database first
- [ ] API tests pass (`pnpm -C api test`)

**Verification Commands:**
```bash
# Check PostgreSQL version
psql $DATABASE_URL -c "SELECT version();"

# Check Prisma version
pnpm -C api prisma --version

# Backup database (dev)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Test API before changes
pnpm -C api test -- users.service
```

### Phase 3 Pre-Flight
- [ ] Phase 1 and 2 complete and tested
- [ ] Current theme system working (ThemeSelector exists)
- [ ] Modal/Dialog components available in design system
- [ ] Browser supports CSS custom properties (all modern browsers)

**Verification Commands:**
```bash
# Check if theme system exists
ls web/components/theme-selector.tsx
grep "data-theme" web/app/globals.css

# Test CSS custom properties in browser console
document.documentElement.style.setProperty('--test', '123');
getComputedStyle(document.documentElement).getPropertyValue('--test');
```

---

## 🔧 Development Tools & Debug Helpers

### VS Code Snippets

Add to `.vscode/user-preferences.code-snippets`:

```json
{
  "React Client Component": {
    "prefix": "rcc",
    "body": [
      "'use client';",
      "",
      "import { ${1:useState} } from 'react';",
      "",
      "interface ${2:Component}Props {",
      "  ${3:// props}",
      "}",
      "",
      "export function ${2:Component}({ ${4:props} }: ${2:Component}Props) {",
      "  ${0}",
      "  return (",
      "    <div>",
      "      {/* content */}",
      "    </div>",
      "  );",
      "}"
    ]
  },
  "Console Debug": {
    "prefix": "cdb",
    "body": [
      "console.log('🔍 [${1:Component}] ${2:message}:', ${3:variable});"
    ]
  }
}
```

### Browser DevTools Helpers

Add to browser console for debugging:

```javascript
// Font size debugger
window.debugFontSize = () => {
  const root = document.documentElement;
  const fontSize = getComputedStyle(root).getPropertyValue('--base-font-size');
  const theme = root.getAttribute('data-theme');
  
  console.table({
    'CSS Variable --base-font-size': fontSize,
    'data-theme attribute': theme,
    'Computed font-size on <html>': getComputedStyle(root).fontSize,
    'Computed font-size on <body>': getComputedStyle(document.body).fontSize,
  });
  
  return { fontSize, theme };
};

// Run with: debugFontSize()
```

### API Testing Script

```bash
# File: scripts/test-preferences-api.sh
#!/bin/bash

API_URL="http://localhost:3001"
TOKEN="demo-admin" # Replace with actual token

echo "Testing Font Size Preferences API"

# Get current preferences
echo "\n1. GET /users/me/theme"
curl -X GET "$API_URL/users/me/theme" \
  -H "Cookie: demo_token=$TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Update to 18px
echo "\n2. PATCH /users/me/theme (set to 18px)"
curl -X PATCH "$API_URL/users/me/theme" \
  -H "Cookie: demo_token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fontSizePreference": "18px"}' \
  -w "\nStatus: %{http_code}\n"

# Verify update
echo "\n3. GET /users/me/theme (verify 18px)"
curl -X GET "$API_URL/users/me/theme" \
  -H "Cookie: demo_token=$TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Test invalid value
echo "\n4. PATCH /users/me/theme (invalid value - should fail)"
curl -X PATCH "$API_URL/users/me/theme" \
  -H "Cookie: demo_token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fontSizePreference": "99px"}' \
  -w "\nStatus: %{http_code}\n"
```

---

## 📋 Implementation Checklist

### Phase 1: Dropdown (3-4 hours)
- [ ] **PRE-FLIGHT:** Run Phase 1 verification commands above
- [ ] Create `web/components/user-menu.tsx` with `'use client'` directive
- [ ] Create `web/app/app-layout-client.tsx` with header content preserved
- [ ] Modify `web/app/app-layout.tsx` (extract to client component)
- [ ] **SMOKE TEST:** Dropdown opens/closes without errors
- [ ] **VISUAL QA:** Compare header layout before/after (screenshot diff)
- [ ] Write unit tests for UserMenu (80%+ coverage)
- [ ] Write E2E tests for dropdown interaction
- [ ] Manual accessibility audit (keyboard nav, screen reader)
- [ ] Mobile responsive testing (375px, 768px, 1024px viewports)
- [ ] **REGRESSION TEST:** Verify logout still works
- [ ] **GIT:** Commit Phase 1 with descriptive message

### Phase 2: Font Size (6-8 hours)
- [ ] **PRE-FLIGHT:** Run Phase 2 verification commands above
- [ ] **BACKUP:** Create database backup (`pg_dump`)
- [ ] Create Prisma migration `add_font_size_preference`
- [ ] **DRY RUN:** Test migration on dev database copy first
- [ ] Run migration: `pnpm prisma migrate dev`
- [ ] **VERIFY:** Check column exists: `psql -c "\d User"`
- [ ] Run `pnpm prisma generate` and restart TS server
- [ ] Update `api/src/domain/entities/User.ts`
- [ ] Rename `theme.types.ts` to `preferences.types.ts` + add FontSizePreset enum
- [ ] Update DTOs: rename `theme.dto.ts` to `preferences.dto.ts` + keep aliases
- [ ] Update `users.service.ts` with fontSize logic
- [ ] Update `users.controller.ts` OpenAPI docs
- [ ] Update mock database service
- [ ] **API TEST:** Run curl script (scripts/test-preferences-api.sh)
- [ ] **API TEST:** Run unit tests (`pnpm -C api test -- users`)
- [ ] Update `web/app/actions/theme.ts` with fontSize
- [ ] Update `web/app/layout.tsx` (SSR font size in inline script)
- [ ] **SSR TEST:** Hard refresh, check console logs for font size application
- [ ] Update `web/app/globals.css` (--base-font-size + rem units)
- [ ] **AUDIT:** Run grep for hardcoded px values, fix all findings
- [ ] Create `web/components/font-size-selector.tsx`
- [ ] **VISUAL TEST:** Test all 4 font sizes (14, 16, 18, 20px)
- [ ] **LAYOUT TEST:** Check for overflow at 20px, unreadable text at 14px
- [ ] Write unit tests for FontSizeSelector
- [ ] Write API tests for font size validation (invalid enum)
- [ ] Typography QA at all 4 sizes on all major pages
- [ ] **BACKWARD COMPAT:** Test with old API clients (curl without fontSizePreference)
- [ ] **GIT:** Commit Phase 2 with descriptive message

### Phase 3: Settings Modal (2-3 hours)
- [ ] **PRE-FLIGHT:** Verify Phase 1 & 2 complete and tested
- [ ] Create `web/components/settings-modal.tsx` with draft state logic
- [ ] Update `AppLayoutClient` to pass current preferences
- [ ] Wire UserMenu to open modal (onSettingsClick)
- [ ] **SMOKE TEST:** Modal opens/closes without errors
- [ ] **PREVIEW TEST:** Change font, verify real-time DOM update
- [ ] **REVERT TEST:** Change font, click Cancel, verify revert
- [ ] **SAVE TEST:** Change font, click Save, reload page, verify persistence
- [ ] **ERROR TEST:** Disconnect network, try save, verify error message shows
- [ ] **ESCAPE TEST:** Press Escape key, verify close with confirmation if unsaved
- [ ] **NAVIGATION TEST:** Change setting, navigate away (client-side), verify revert
- [ ] Test unsaved changes confirmation dialog
- [ ] Write unit tests for SettingsModal (draft state, preview, save, cancel)
- [ ] Write E2E tests for complete workflow (open → change → save → verify)
- [ ] Accessibility audit (focus trap, keyboard nav, screen reader announcements)
- [ ] Mobile testing (modal fits on 375px screen)
- [ ] **PRODUCTION BUILD TEST:** `pnpm -C web build` and test in production mode
- [ ] **GIT:** Commit Phase 3 with descriptive message

### Documentation
- [ ] Update `docs/USER_MANUAL.md` (preferences section)
- [ ] Update `docs/API_DOCUMENTATION.md` (font size field)
- [ ] Update `docs/DATABASE_SCHEMA.md` (User table)
- [ ] Update `docs/DESIGN_SYSTEM.md` (--base-font-size)
- [ ] Update `docs/CODING_STANDARDS.md` (rem units)

---

## 🚨 Critical Architectural Constraints

### MUST FOLLOW

1. **✅ Server Components First**
   - `AppLayout` remains RSC (data fetching)
   - Extract client interactivity to `AppLayoutClient`
   - Props flow server → client only

2. **✅ Single Source of Truth**
   - `/users/me/theme` is THE preferences endpoint
   - DO NOT create `/users/me/preferences`
   - All user settings go through same endpoint

3. **✅ Atomic Updates**
   - Theme + fontSize updated in single transaction
   - No partial updates = data consistency
   - Rollback on any error

4. **✅ Backward Compatibility**
   - `fontSizePreference` nullable
   - Old DTOs aliased to new ones
   - Existing API clients continue working

5. **✅ Design System Compliance**
   - Use existing design tokens
   - Follow component patterns
   - Maintain accessibility standards

### MUST AVOID

1. **❌ Client State Management Libraries**
   - No Zustand, Redux, Jotai
   - React state + server actions sufficient

2. **❌ Multiple API Endpoints**
   - No fragmentation of user preferences
   - Single endpoint = single transaction

3. **❌ Hardcoded Font Sizes**
   - Everything must use `rem` units
   - Test at all 4 font sizes

4. **❌ Auto-Save**
   - Violates UX requirement
   - Preview + explicit save only

---

## 🎓 Knowledge Transfer

### For Backend Developers

**Key Files:**
- `api/src/modules/users/users.service.ts` - Business logic
- `api/src/modules/users/dto/preferences.dto.ts` - Validation
- `api/prisma/tenant-schema.prisma` - Database schema

**Patterns:**
- Enum-based validation in DTOs
- Nullable fields for backward compat
- Type guards for runtime validation

### For Frontend Developers

**Key Files:**
- `web/components/settings-modal.tsx` - Draft state pattern
- `web/app/actions/theme.ts` - Server actions
- `web/app/layout.tsx` - SSR preferences

**Patterns:**
- Controlled components for forms
- Server actions for mutations
- Inline scripts for FOUC prevention

### For QA Engineers

**Critical Test Scenarios:**
1. Save preferences → reload page → verify persistence
2. Change preferences → click Cancel → verify revert
3. Open modal → press Escape → verify close with confirmation
4. Set font to 14px → verify all components readable
5. Set font to 20px → verify no horizontal scroll

**Browser Matrix:**
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android)

---

## ⚡ Quick Recovery Commands

Copy-paste these if you hit a wall:

```bash
# RESET Phase 1 (if layout breaks)
git checkout feature/user-theme-preferences-main-sprint -- web/app/app-layout.tsx
rm -f web/app/app-layout-client.tsx
rm -f web/components/user-menu.tsx

# RESET Phase 2 Migration (dev only - DESTROYS DATA)
pnpm -C api prisma migrate reset
# Then re-run migration from scratch

# ROLLBACK Phase 2 Migration (production-safe)
psql $DATABASE_URL -c 'ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_fontSizePreference_check";'
psql $DATABASE_URL -c 'ALTER TABLE "User" DROP COLUMN IF EXISTS "fontSizePreference";'
pnpm -C api prisma migrate resolve --rolled-back [migration-name]

# FIX Prisma cache issues
rm -rf api/node_modules/.prisma
pnpm -C api prisma generate --force
# Then restart VS Code TypeScript server: CMD+Shift+P → "TypeScript: Restart TS Server"

# TEST API manually
chmod +x scripts/test-preferences-api.sh
./scripts/test-preferences-api.sh

# CHECK current font size in browser console
getComputedStyle(document.documentElement).getPropertyValue('--base-font-size')

# VERIFY migration status
pnpm -C api prisma migrate status

# BUILD production to catch SSR issues early
pnpm -C web build
pnpm -C web start
```

---

## 📞 Support & Questions

**Architecture Questions:** @principal_architect  
**Implementation Guidance:** @principal_engineer  
**UX/Design Questions:** @principal_designer  
**Product Scope:** See `user-preferences-enhancement-PRODUCT-OWNER-REVIEW.md`

**Slack Channels:**
- `#dev-user-preferences` - Implementation discussion
- `#architecture` - Architectural decisions
- `#qa-testing` - Test coordination

---

**Document Version:** 1.0  
**Last Updated:** 7 November 2025  
**Status:** ✅ Ready for Implementation

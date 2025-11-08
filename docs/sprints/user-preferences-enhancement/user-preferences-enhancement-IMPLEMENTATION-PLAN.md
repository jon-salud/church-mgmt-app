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

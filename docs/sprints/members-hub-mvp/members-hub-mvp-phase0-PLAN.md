# Members Hub MVP - Phase 0: UX Primitives & Foundation

**Phase:** 0 of 5  
**Branch:** `feature/members-hub-mvp-phase0-ux-primitives`  
**Duration:** 3-4 days  
**Status:** Ready for Implementation  
**Created:** 9 November 2025  
**Engineer:** Principal Engineer

---

## 🎯 Phase Goal

Build reusable UI components and state management patterns that serve as foundation for all subsequent phases.

**Success Metric:** Other developers can build Phases 1-4 features WITHOUT touching primitive components.

**Critical Path:** This phase blocks all others. Do NOT skip or rush.

---

## 📋 Deliverables

### 1. Core UI Components
- ✅ Drawer component with Flowbite integration
- ✅ FormModal (Dialog extension with dirty state)
- ✅ Toast/Toaster with queue management
- ✅ Loading skeleton patterns
- ✅ Empty state components

### 2. Custom Hooks
- ✅ useMediaQuery (responsive breakpoints)
- ✅ useDrawer (drawer state management)
- ✅ useUrlState (URL synchronization)
- ✅ useConfirm (confirmation dialogs)
- ✅ useToast (toast notifications)

### 3. State Management Utilities
- ✅ URL state parser/serializer
- ✅ Form state management patterns
- ✅ Client-side filtering utilities

### 4. API Service Layer
- ✅ DataStore integration (mock mode)
- ✅ Base API client with error handling
- ✅ Request/response types

---

## 🏗️ Technical Approach

### Architecture Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Drawer over Modal for details** | Better for progressive loading, less intrusive | More complex routing |
| **URL as state source** | Deep-linkable, shareable, browser nav support | URL length limits |
| **DataStore abstraction** | Database-agnostic, enables PostgreSQL migration | Extra indirection layer |
| **Client-side filtering** | Faster UX, fewer API calls | Initial data load larger |

### Existing Patterns to Follow

**Location:** `web/components/ui-flowbite/`

| Component | Status | Action |
|-----------|--------|--------|
| Dialog | ✅ Exists | Extend with dirty state handling |
| Modal | ✅ Exists | Use Dialog component |
| Drawer | ❌ Missing | **BUILD THIS - Priority 1** |
| Toast | ❌ Missing | **BUILD THIS - Priority 2** |
| Button | ✅ Exists | Reuse |
| Input | ✅ Exists | Reuse |

---

## 📁 Files to Create/Modify

### New Files

```
web/
  components/
    ui-flowbite/
      drawer.tsx                    # NEW - Main drawer component
      form-modal.tsx                # NEW - Dialog extension
      toast.tsx                     # NEW - Toast component
      toaster.tsx                   # NEW - Toast container/manager
      skeleton.tsx                  # NEW - Loading skeletons
      empty-state.tsx               # NEW - Empty state patterns
  lib/
    hooks/
      use-media-query.ts            # NEW - Responsive breakpoints
      use-drawer.ts                 # NEW - Drawer state management
      use-url-state.ts              # NEW - URL synchronization
      use-confirm.ts                # NEW - Confirmation dialogs
      use-toast.ts                  # NEW - Toast notifications
    utils/
      url-state.ts                  # NEW - URL parser/serializer
      client-filters.ts             # NEW - Client-side filtering
  services/
    members-api.service.ts          # NEW - Members API client
api/
  src/
    modules/
      members/
        members.module.ts           # NEW - Members module
        members.controller.ts       # NEW - Members controller
        members.service.ts          # NEW - Members service
        dto/
          member-list-query.dto.ts  # NEW - Query validation
```

### Modified Files

```
web/
  app/
    (dashboard)/
      members/
        page.tsx                    # MODIFY - Basic layout for testing
api/
  src/
    datastore/
      data-store.interface.ts       # MODIFY - Add members methods
      mock/
        mock-database.service.ts    # MODIFY - Add members mock data
```

---

## 🧪 Tests

### Unit Tests

```
web/
  components/
    ui-flowbite/
      __tests__/
        drawer.test.tsx             # NEW - Drawer component tests
        form-modal.test.tsx         # NEW - FormModal tests
        toast.test.tsx              # NEW - Toast tests
  lib/
    hooks/
      __tests__/
        use-media-query.test.ts     # NEW - Hook tests
        use-drawer.test.ts          # NEW - Hook tests
        use-url-state.test.ts       # NEW - Hook tests
        use-confirm.test.ts         # NEW - Hook tests
        use-toast.test.ts           # NEW - Hook tests
```

### Integration Tests

```
api/
  test/
    members.spec.ts                 # NEW - Members API tests
```

### Testing Strategy

**Frontend (React Testing Library):**
- Component rendering and interactions
- Hook behavior and state management
- Accessibility (keyboard nav, screen readers)
- Responsive behavior

**Backend (Vitest):**
- API endpoints with mock data
- DataStore integration
- Error handling and validation

**E2E (defer to Phase 1):**
- End-to-end flows deferred until Phase 1 (need full feature)

---

## 🚧 Implementation Steps

### Step 1: Drawer Component (Priority 1) - 6-8 hours

**Why First:** Blocks Phase 1-2 member detail views

**Implementation:**

```typescript
// web/components/ui-flowbite/drawer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: string;
}

export function Drawer({ 
  open, 
  onClose, 
  children, 
  side = 'right', 
  width = '480px' 
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    
    const focusableElements = drawerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  // ESC handler
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed inset-y-0 bg-white dark:bg-gray-800 z-50',
          'shadow-2xl overflow-y-auto',
          'transition-transform duration-300 ease-out',
          side === 'right' ? 'right-0' : 'left-0',
          open ? 'translate-x-0' : (side === 'right' ? 'translate-x-full' : '-translate-x-full')
        )}
        style={{ width }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>

        {children}
      </div>
    </>
  );
}

// Sub-components for consistent structure
export function DrawerHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}

export function DrawerBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-6 border-t border-gray-200 dark:border-gray-700 mt-auto', className)}>
      {children}
    </div>
  );
}
```

**Pitfalls to Avoid:**
- ❌ Using `transition-all` (causes layout thrashing)
- ❌ Forgetting to lock body scroll
- ❌ Not handling mobile viewport (should be 100vw)
- ❌ Z-index conflicts (drawer: z-50, backdrop: z-40)

**Testing Checklist:**
- [ ] Opens/closes smoothly
- [ ] ESC key closes
- [ ] Backdrop click closes
- [ ] Focus trap works (Tab cycles within)
- [ ] Body scroll locked when open
- [ ] Works on mobile (full screen)
- [ ] Dark mode styled correctly
- [ ] Screen reader accessible

---

### Step 2: useDrawer Hook - 2-3 hours

```typescript
// web/lib/hooks/use-drawer.ts
'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface UseDrawerOptions {
  paramName?: string;  // URL param name, default: 'drawer'
}

export function useDrawer(options: UseDrawerOptions = {}) {
  const { paramName = 'drawer' } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get(paramName) !== null;
  const drawerId = searchParams.get(paramName);

  const open = useCallback((id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, id);
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, searchParams, paramName, router]);

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, searchParams, paramName, router]);

  return {
    isOpen,
    drawerId,
    open,
    close,
  };
}
```

**Usage Example:**
```typescript
// In members page
const { isOpen, drawerId, open, close } = useDrawer();

// Open drawer with member ID
<button onClick={() => open('member-123')}>View</button>

// Render drawer
<Drawer open={isOpen} onClose={close}>
  <MemberDetails memberId={drawerId} />
</Drawer>
```

---

### Step 3: Toast System - 4-5 hours

```typescript
// web/lib/hooks/use-toast.ts
'use client';

import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { ...toast, id }], // Max 3 toasts
    }));

    // Auto-dismiss
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);

  return {
    toast: {
      success: (message: string) => addToast({ message, variant: 'success' }),
      error: (message: string) => addToast({ message, variant: 'error' }),
      info: (message: string) => addToast({ message, variant: 'info' }),
      warning: (message: string) => addToast({ message, variant: 'warning' }),
    },
  };
}
```

```typescript
// web/components/ui-flowbite/toaster.tsx
'use client';

import { useToastStore } from '@/lib/hooks/use-toast';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200',
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200',
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200',
  },
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const config = variantConfig[toast.variant];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            role="alert"
            aria-live="polite"
            className={cn(
              'flex items-center gap-3 p-4 rounded-lg border shadow-lg',
              'animate-in slide-in-from-right duration-300',
              config.className
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/10 rounded"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

**Add to layout:**
```typescript
// web/app/layout.tsx
import { Toaster } from '@/components/ui-flowbite/toaster';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

---

### Step 4: useUrlState Hook - 3-4 hours

```typescript
// web/lib/hooks/use-url-state.ts
'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Serializable = string | number | boolean | null | undefined;

export function useUrlState<T extends Record<string, Serializable>>(
  defaults: T
): [T, (updates: Partial<T>) => void, () => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current state from URL
  const state = { ...defaults } as T;
  for (const key in defaults) {
    const value = searchParams.get(key);
    if (value !== null) {
      if (typeof defaults[key] === 'number') {
        state[key] = Number(value) as T[typeof key];
      } else if (typeof defaults[key] === 'boolean') {
        state[key] = (value === 'true') as T[typeof key];
      } else {
        state[key] = value as T[typeof key];
      }
    }
  }

  // Update state in URL
  const setState = useCallback((updates: Partial<T>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    for (const key in updates) {
      const value = updates[key];
      if (value === null || value === undefined || value === defaults[key]) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, searchParams, defaults, router]);

  // Reset to defaults
  const resetState = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return [state, setState, resetState];
}
```

**Usage Example:**
```typescript
// In members page
const [filters, setFilters, resetFilters] = useUrlState({
  search: '',
  status: 'all',
  page: 1,
  sort: 'name:asc',
});

// Update single filter
<input 
  value={filters.search}
  onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
/>

// Reset all filters
<button onClick={resetFilters}>Clear</button>
```

---

### Step 5: Members API Service - 4-5 hours

**Backend:**

```typescript
// api/src/modules/members/members.module.ts
import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { DataStoreModule } from '../../datastore/data-store.module';

@Module({
  imports: [DataStoreModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
```

```typescript
// api/src/modules/members/members.service.ts
import { Injectable } from '@nestjs/common';
import { DataStore } from '../../datastore/data-store.interface';
import { MemberListQueryDto } from './dto/member-list-query.dto';

@Injectable()
export class MembersService {
  constructor(private readonly dataStore: DataStore) {}

  async findAll(churchId: string, query: MemberListQueryDto) {
    // Use DataStore abstraction (works with mock/prisma)
    const { page = 1, limit = 25, search, sort } = query;
    
    const result = await this.dataStore.findMembers({
      churchId,
      search,
      sort,
      page,
      limit,
    });

    return result;
  }

  async findOne(id: string, churchId: string) {
    return this.dataStore.findMemberById(id, churchId);
  }
}
```

```typescript
// api/src/modules/members/members.controller.ts
import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ChurchId } from '../../common/decorators/church-id.decorator';
import { MembersService } from './members.service';
import { MemberListQueryDto } from './dto/member-list-query.dto';

@Controller('members')
@UseGuards(AuthGuard)
@ApiTags('Members')
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll(
    @ChurchId() churchId: string,
    @Query() query: MemberListQueryDto,
  ) {
    return this.membersService.findAll(churchId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ChurchId() churchId: string,
  ) {
    return this.membersService.findOne(id, churchId);
  }
}
```

**DataStore Interface Extension:**

```typescript
// api/src/datastore/data-store.interface.ts
export interface DataStore {
  // ... existing methods
  
  // NEW: Members methods
  findMembers(params: FindMembersParams): Promise<PaginatedMembers>;
  findMemberById(id: string, churchId: string): Promise<Member | null>;
}

export interface FindMembersParams {
  churchId: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMembers {
  data: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Mock Implementation:**

```typescript
// api/src/datastore/mock/mock-database.service.ts
async findMembers(params: FindMembersParams): Promise<PaginatedMembers> {
  const { churchId, search, sort, page = 1, limit = 25 } = params;
  
  // Filter by churchId
  let members = this.mockData.users.filter(u => 
    this.mockData.churchUsers.some(cu => cu.userId === u.id && cu.churchId === churchId)
  );

  // Search
  if (search) {
    const searchLower = search.toLowerCase();
    members = members.filter(m => 
      m.firstName?.toLowerCase().includes(searchLower) ||
      m.lastName?.toLowerCase().includes(searchLower) ||
      m.primaryEmail?.toLowerCase().includes(searchLower)
    );
  }

  // Sort
  if (sort) {
    const [field, direction] = sort.split(':');
    members.sort((a, b) => {
      const aVal = a[field] || '';
      const bVal = b[field] || '';
      return direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }

  // Paginate
  const total = members.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = members.slice(start, start + limit);

  return {
    data,
    pagination: { page, limit, total, totalPages },
  };
}

async findMemberById(id: string, churchId: string): Promise<Member | null> {
  const user = this.mockData.users.find(u => u.id === id);
  if (!user) return null;

  // Verify user belongs to church
  const churchUser = this.mockData.churchUsers.find(
    cu => cu.userId === id && cu.churchId === churchId
  );
  if (!churchUser) return null;

  return user;
}
```

---

### Step 6: Other Utilities - 2-3 hours

**useMediaQuery:**
```typescript
// web/lib/hooks/use-media-query.ts
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Convenience hooks
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}
```

**useConfirm:**
```typescript
// web/lib/hooks/use-confirm.ts
'use client';

import { create } from 'zustand';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmStore {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  options: null,
  resolve: null,
  confirm: (options) => {
    return new Promise((resolve) => {
      set({ isOpen: true, options, resolve });
    });
  },
  handleConfirm: () => {
    const { resolve } = get();
    resolve?.(true);
    set({ isOpen: false, options: null, resolve: null });
  },
  handleCancel: () => {
    const { resolve } = get();
    resolve?.(false);
    set({ isOpen: false, options: null, resolve: null });
  },
}));

export function useConfirm() {
  return useConfirmStore((state) => ({
    confirm: state.confirm,
  }));
}
```

---

## ✅ Acceptance Criteria

### Component Functionality
- [ ] Drawer opens/closes smoothly with animation
- [ ] Drawer handles ESC key and backdrop click
- [ ] Drawer has focus trap working correctly
- [ ] Toast notifications auto-dismiss after 3 seconds
- [ ] Toast queue limits to 3 visible toasts
- [ ] useConfirm prompts user before destructive actions

### URL State Management
- [ ] useUrlState syncs component state with URL
- [ ] Browser back/forward buttons work correctly
- [ ] URL state is shareable (copy/paste works)
- [ ] Default values applied when no URL params

### API Integration
- [ ] Members API returns paginated results
- [ ] DataStore abstraction works in mock mode
- [ ] Search filters members correctly
- [ ] Sort orders results correctly

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader announcements work (aria-live)
- [ ] Semantic HTML used throughout

### Responsive Design
- [ ] Components work on mobile (390px)
- [ ] Components work on tablet (768px)
- [ ] Components work on desktop (1440px+)
- [ ] Drawer becomes full-screen on mobile

### PostgreSQL Compatibility
- [ ] All database operations via DataStore interface
- [ ] No SQLite-specific syntax in queries
- [ ] Mock mode active during development
- [ ] Tests run with DATA_MODE=mock

### Testing
- [ ] Unit tests pass for all components
- [ ] Unit tests pass for all hooks
- [ ] Integration tests pass for API endpoints
- [ ] Test coverage ≥80% for new code

### Code Quality
- [ ] Format check passes: `pnpm format:check`
- [ ] No console errors or warnings
- [ ] No TypeScript errors
- [ ] Code follows existing patterns

---

## ⚠️ Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Drawer animation performance** | Low | Medium | Use `transform` not `all`, test on low-end devices |
| **URL state too complex** | Medium | High | Keep state minimal, use localStorage for complex filters |
| **Toast notification overflow** | Low | Low | Queue management (max 3), auto-dismiss |
| **DataStore mock incomplete** | Medium | High | Start with minimal interface, expand as needed |
| **Accessibility issues** | Medium | High | Test with keyboard, screen reader from start |

---

## 📊 Timeline

**Day 1:**
- Morning: Drawer component + tests
- Afternoon: useDrawer hook + tests

**Day 2:**
- Morning: Toast system + tests
- Afternoon: useUrlState hook + tests

**Day 3:**
- Morning: Members API service + DataStore integration
- Afternoon: useMediaQuery, useConfirm hooks + tests

**Day 4:**
- Morning: Integration testing, bug fixes
- Afternoon: Documentation, code review prep

**Buffer:** Built-in 1 day for unexpected issues

---

## 🔄 Rollback Plan

If Phase 0 encounters blockers:

1. **Drawer Issues:** Use existing Dialog component temporarily
2. **URL State Complexity:** Use React state initially, migrate later
3. **DataStore Problems:** Use direct Prisma calls, refactor in Phase 1
4. **Toast Issues:** Use browser alerts temporarily

**Rollback Trigger:** >2 days over estimate or >3 critical bugs

---

## 📚 Reference Material

### Existing Patterns
- **Dialog Component:** `web/components/ui-flowbite/dialog.tsx`
- **Button Component:** `web/components/ui-flowbite/button.tsx`
- **AuthGuard:** `api/src/common/guards/auth.guard.ts`
- **DataStore:** `api/src/datastore/data-store.interface.ts`

### Design System
- **Flowbite React:** https://flowbite-react.com
- **Design Tokens:** `docs/guides/DESIGN_SYSTEM.md`
- **Component Guidelines:** `docs/guides/FLOWBITE_MIGRATION.md`

### Testing
- **React Testing Library:** https://testing-library.com/react
- **Vitest:** https://vitest.dev
- **Accessibility Testing:** https://github.com/nickcolley/jest-axe

---

## 🚀 Getting Started

```bash
# Verify branch
git status
# Should show: feature/members-hub-mvp-phase0-ux-primitives

# Install dependencies (if needed)
pnpm install

# Start development servers
pnpm dev:api:mock      # API on port 3001
pnpm -C web dev        # Web on port 3000

# Run tests (in watch mode)
pnpm -C api test       # API tests
pnpm -C web test       # Web tests (when added)
```

---

## 📝 PostgreSQL Compatibility Checklist

Phase 0 specific items:

- [x] **DataStore Interface:** All database operations abstracted
- [x] **Mock Mode:** Development uses DATA_MODE=mock
- [x] **No Direct Prisma:** No Prisma imports in components
- [x] **Test Isolation:** Tests use mock data, not real database
- [x] **Query Abstraction:** Search/filter logic in service layer
- [x] **Transaction Patterns:** Documented for future bulk operations
- [x] **Error Handling:** Generic errors, not SQLite-specific
- [x] **Connection Handling:** Abstracted via DataStore

---

## 🎉 Definition of Done

Phase 0 is complete when:

1. ✅ All acceptance criteria met
2. ✅ All tests pass (unit + integration)
3. ✅ Format check passes: `pnpm format:check`
4. ✅ No console errors/warnings
5. ✅ Code review complete
6. ✅ Documentation updated (this file + accomplishments)
7. ✅ Phase PR created: phase0 branch → sprint branch
8. ✅ Principal Engineer moved phase to TASKS_COMPLETED.md

**Next Phase:** Phase 1 (Discoverability & Speed) can begin immediately after Phase 0 complete.

---

**Created:** 9 November 2025  
**Last Updated:** 9 November 2025  
**Status:** Ready for Implementation  
**Estimated Duration:** 3-4 days

---

## Accomplishments

*(This section will be updated upon phase completion)*

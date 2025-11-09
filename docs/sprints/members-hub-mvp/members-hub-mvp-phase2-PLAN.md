# Members Hub MVP - Phase 2: Actionability & Responsive Filters

**Phase:** 2 of 5  
**Branch:** `feature/members-hub-mvp-phase2-actionability-responsive`  
**Date Created:** 9 November 2025  
**Status:** Planning  
**Sprint Branch:** `feature/members-hub-mvp-main-sprint`

---

## 🎯 Phase Goals

### Primary Goal
Fix responsive filter UX and enable member detail viewing, editing, and bulk actions.

### Success Criteria
- ✅ Filters work responsively on mobile (375px+), tablet (768px+), desktop (1024px+)
- ✅ Active filters display as removable chips
- ✅ Filter panel accessible via dropdown/popover (no fixed sidebar)
- ✅ Member drawer loads in <200ms
- ✅ Edit modal validates and saves successfully
- ✅ Bulk actions work on 100+ members

---

## 🚨 Critical Design Issue from Phase 1

**Problem Identified:** Fixed left sidebar filter panel (`w-64` = 256px) creates poor responsive UX:
- Takes up valuable horizontal space on tablets (768-1023px)
- Unusable on mobile (<768px)
- Not following modern data table patterns (Linear, Notion, Airtable)

**User Feedback:**
> "Looking at http://localhost:3000/members the filters on the left side does not seem to be a good implementation for responsive page. what is your opinion?"

**Architectural Decision:** Implement **Filter Chips + Dropdown** pattern (Option 1).

---

## 📐 Responsive Filter Redesign

### Current Implementation (Phase 1 - PROBLEMATIC)
```
Desktop (≥1024px):
┌──────────────┬─────────────────────────┐
│ Fixed        │ Table                   │
│ Sidebar      │ (reduced width)         │
│ (256px)      │                         │
│ - Status     │                         │
│ - Role       │                         │
│ - ...        │                         │
└──────────────┴─────────────────────────┘

Mobile (<768px):
┌──────────────┐
│ Sidebar      │ ← Blocks entire table!
│ (256px)      │
│              │
└──────────────┘
```

### New Design (Phase 2 - RESPONSIVE)
```
All Screen Sizes:
┌─────────────────────────────────────────┐
│ [Search...] [🔽 Filters] [Sort ▼]      │
│ 🔍 Active: Status: Active (×)           │
│            Role: Leader (×)             │
├─────────────────────────────────────────┤
│ Table (full width)                      │
│ ┌──┬──────┬────────┬──────┬──────┐     │
│ │☐ │Name  │Status  │Email │Groups│     │
│ └──┴──────┴────────┴──────┴──────┘     │
└─────────────────────────────────────────┘

[🔽 Filters] Popover:
┌──────────────────────┐
│ Status               │
│ ☐ Member             │
│ ☐ Visitor            │
│ ☐ Inactive           │
├──────────────────────┤
│ Role                 │
│ ☐ Leader             │
│ ☐ Admin              │
├──────────────────────┤
│ Last Attendance      │
│ ○ Last 30 days       │
│ ○ 31-60 days         │
│ ...                  │
├──────────────────────┤
│ [Clear All] [Apply]  │
└──────────────────────┘
```

---

## 🏗️ Technical Approach

### Part 1: Filter Redesign (Priority 1)

#### 1.1 Remove Fixed Sidebar
**Files to Modify:**
- `web/app/members/members-hub-client.tsx`

**Changes:**
```tsx
// REMOVE: Fixed sidebar layout
<div className="flex gap-4">
  <aside className="w-64"> {/* DELETE THIS */}
    <FilterPanel />
  </aside>
  <main className="flex-1">
    <MembersTable />
  </main>
</div>

// REPLACE WITH: Full-width layout
<div className="flex flex-col gap-4">
  <div className="flex items-center gap-2">
    <SearchBar />
    <FilterDropdown />
    <SortDropdown />
  </div>
  {hasActiveFilters && (
    <ActiveFilterChips onRemove={removeFilter} />
  )}
  <MembersTable />
</div>
```

#### 1.2 Create Filter Dropdown Component
**New File:** `web/components/filters/filter-dropdown.tsx`

```tsx
'use client';

import { useState, useMemo } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui-flowbite/popover';
import { Button } from '@/components/ui-flowbite/button';
import { FilterIcon } from 'lucide-react';

// Types used by filter UI
interface FilterState {
  status?: string;
  role?: string;
  lastAttendance?: string;
  hasEmail?: string;
  hasPhone?: string;
  groupsCountMin?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

interface RoleOption { id: string; name: string }

interface FilterDropdownProps {
  filters: FilterState;
  roles: RoleOption[];
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearAll: () => void;
}

export function FilterDropdown({ filters, roles, onFilterChange, onClearAll }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeFilterCount = useMemo(() => {
    const keys: (keyof FilterState)[] = ['status', 'role', 'lastAttendance', 'hasEmail', 'hasPhone', 'groupsCountMin'];
    return keys.reduce((acc, key) => {
      const v = filters[key];
      if (!v) return acc;
      if (v === 'true') return acc + 1;
      if (typeof v === 'string' && v.includes(',')) return acc + v.split(',').filter(Boolean).length;
      return acc + 1;
    }, 0);
  }, [filters]);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="default">
          <FilterIcon className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* Status Section */}
          <FilterSection title="Status">
            <CheckboxGroup
              options={['Member', 'Visitor', 'Inactive']}
              selected={filters.status?.split(',') || []}
              onChange={(values) => onFilterChange({ status: values.join(',') })}
            />
          </FilterSection>

          {/* Role Section */}
          <FilterSection title="Role">
            <CheckboxGroup
              options={roles.map(r => r.name)}
              selected={filters.role?.split(',') || []}
              onChange={(values) => onFilterChange({ role: values.join(',') })}
            />
          </FilterSection>

          {/* Last Attendance Section */}
          <FilterSection title="Last Attendance">
            <RadioGroup
              options={[
                { label: 'Last 30 days', value: '30d' },
                { label: '31-60 days', value: '60d' },
                { label: '61-90 days', value: '90d' },
                { label: '90+ days', value: '90+' },
                { label: 'Never', value: 'never' },
              ]}
              value={filters.lastAttendance}
              onChange={(value) => onFilterChange({ lastAttendance: value })}
            />
          </FilterSection>

            {/* NOTE: CheckboxGroup and RadioGroup are assumed to exist in the design system. */}
            {/* IMPLEMENTATION NOTE:
              - If CheckboxGroup and RadioGroup exist, import them from their actual design system path.
              - If they do NOT exist yet, use native inputs (<input type="checkbox"/>, <input type="radio"/>) or create minimal versions locally.
              - Update this plan with concrete import paths once confirmed to prevent ambiguity.
              - Add tests for keyboard navigation and ARIA compliance whether using primitives or custom components.
            */}

          {/* Contact Info Section */}
          <FilterSection title="Contact Info">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasEmail === 'true'}
                  onChange={(e) => onFilterChange({ hasEmail: e.target.checked ? 'true' : undefined })}
                />
                <span className="text-sm">Has Email</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasPhone === 'true'}
                  onChange={(e) => onFilterChange({ hasPhone: e.target.checked ? 'true' : undefined })}
                />
                <span className="text-sm">Has Phone</span>
              </label>
            </div>
          </FilterSection>

          {/* Groups Section */}
          <FilterSection title="Minimum Groups">
            <input
              type="number"
              min="0"
              value={filters.groupsCountMin || ''}
              onChange={(e) => onFilterChange({ groupsCountMin: e.target.value })}
              className="w-20 px-3 py-2 border rounded-lg"
              placeholder="0"
            />
          </FilterSection>

          {/* Footer */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
      {children}
    </div>
  );
}
```

#### 1.3 Create Active Filter Chips Component
**New File:** `web/components/filters/active-filter-chips.tsx`

```tsx
'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui-flowbite/badge';

interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemoveValue: (key: keyof FilterState, value?: string) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({ filters, onRemoveValue, onClearAll }: ActiveFilterChipsProps) {
  const activeFilters = getActiveFilters(filters);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
      {activeFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          <span className="text-sm">{filter.label}</span>
          <button
            onClick={() => onRemoveValue(filter.key as keyof FilterState, filter.value)}
            className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
      >
        Clear all
      </button>
    </div>
  );
}

function getActiveFilters(filters: FilterState) {
  const active: { id: string; key: keyof FilterState; label: string; value?: string }[] = [];
  if (filters.status) {
    filters.status.split(',').filter(Boolean).forEach(s => active.push({ id: `status:${s}`, key: 'status', value: s, label: `Status: ${s}` }));
  }
  if (filters.role) {
    filters.role.split(',').filter(Boolean).forEach(r => active.push({ id: `role:${r}`, key: 'role', value: r, label: `Role: ${r}` }));
  }
  if (filters.lastAttendance) {
    const labels: Record<string, string> = { '30d': 'Last 30 days', '60d': '31-60 days', '90d': '61-90 days', '90+': '90+ days', 'never': 'Never attended' };
    active.push({ id: `lastAttendance:${filters.lastAttendance}`, key: 'lastAttendance', value: filters.lastAttendance, label: labels[filters.lastAttendance] || filters.lastAttendance });
  }
  if (filters.hasEmail === 'true') active.push({ id: 'hasEmail', key: 'hasEmail', label: 'Has Email' });
  if (filters.hasPhone === 'true') active.push({ id: 'hasPhone', key: 'hasPhone', label: 'Has Phone' });
  if (filters.groupsCountMin) active.push({ id: 'groupsCountMin', key: 'groupsCountMin', value: filters.groupsCountMin, label: `Groups ≥ ${filters.groupsCountMin}` });
  return active;
}
```

#### 1.4 Update Main Client Component
**File:** `web/app/members/members-hub-client.tsx`

```tsx
// Add imports
import { FilterDropdown } from '@/components/filters/filter-dropdown';
import { ActiveFilterChips } from '@/components/filters/active-filter-chips';

// In render:
return (
  <div className="flex flex-col gap-4 p-6">
    {/* Header Controls */}
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search Bar */}
      <div className="flex-1 min-w-[240px]">
        <input
          id="member-search"
          type="search"
          placeholder="Search members..."
          value={queryState.search || ''}
          onChange={(e) => updateQuery({ search: e.target.value, page: 1 })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>

      {/* Filter Dropdown */}
      <FilterDropdown
        filters={queryState}
        roles={roles}
        onFilterChange={(filters) => updateQuery({ ...filters, page: 1 })}
        onClearAll={resetFilters}
      />

      {/* Sort Dropdown (optional, could use table headers) */}
      <select
        value={activeSort}
        onChange={(e) => updateQuery({ sort: e.target.value })}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
      >
        <option value="name:asc">Name (A-Z)</option>
        <option value="name:desc">Name (Z-A)</option>
        <option value="status:asc">Status</option>
        <option value="lastAttendance:desc">Recent Attendance</option>
        <option value="groupsCount:desc">Most Groups</option>
      </select>
    </div>

    {/* Active Filter Chips */}
    <ActiveFilterChips
      filters={queryState}
      onRemoveValue={(key, value) => {
        if (!value) {
          return updateQuery({ [key]: undefined, page: 1 });
        }
        const current = queryState[key];
        if (typeof current === 'string' && current.includes(',')) {
          const remaining = current.split(',').filter(v => v !== value);
          updateQuery({ [key]: remaining.length ? remaining.join(',') : undefined, page: 1 });
        } else {
          updateQuery({ [key]: undefined, page: 1 });
        }
      }}
      onClearAll={resetFilters}
    />

    {/* Table */}
    {/* ... existing table code ... */}
  </div>
);
```
Add above snippet prerequisites:
```tsx
// Helpers
const activeSort = queryState.sort || 'name:asc';
const resetFilters = () => updateQuery({
  status: undefined,
  role: undefined,
  lastAttendance: undefined,
  hasEmail: undefined,
  hasPhone: undefined,
  groupsCountMin: undefined,
  page: 1,
});
```

---

### Part 2: Member Detail Drawer

#### 2.1 Create Member Drawer Component
**New File:** `web/components/members/member-drawer.tsx`

```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from '@/components/ui-flowbite/drawer';
import { fetchMemberById, MemberDetail } from '@/lib/api/members';
import { useToast } from '@/lib/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui-flowbite/button';
import { Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';

interface MemberDrawerProps {
  memberId: string | null;
  onClose: () => void;
  onEdit: (member: MemberDetail) => void;
}

export function MemberDrawer({ memberId, onClose, onEdit }: MemberDrawerProps) {
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchMember = useCallback(async () => {
    if (!memberId) {
      setMember(null);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMemberById(memberId);
      setMember(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load member';
      toast.error(message);
      onClose();
    } finally {
      setLoading(false);
    }
  }, [memberId, toast, onClose]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  if (!memberId) return null;

  return (
    {/* Responsive width ensures drawer never overflows small screens */}
    <Drawer open={!!memberId} onClose={onClose} side="right" width="min(480px, 90vw)">
      <DrawerHeader>
        {loading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <div>
            <h2 className="text-2xl font-bold">
              {member?.firstName} {member?.lastName}
            </h2>
            <div className="flex gap-2 mt-2">
              {/* Status Badge */}
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member?.status)}`}>
                {member?.status}
              </span>
              {/* Role Badges */}
              {member?.roles?.map((role) => (
                <span key={role} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}
      </DrawerHeader>

      <DrawerBody className="space-y-6">
        {loading ? (
          <LoadingSkeleton />
        ) : member ? (
          <>
            {/* Contact Info */}
            <Section title="Contact Information">
              <InfoRow icon={<Mail />} label="Email" value={member.email} href={`mailto:${member.email}`} />
              <InfoRow icon={<Phone />} label="Phone" value={member.phone} href={`tel:${member.phone}`} />
              <InfoRow icon={<MapPin />} label="Address" value={member.address} />
            </Section>

            {/* Member Details */}
            <Section title="Member Details">
              <InfoRow label="Status" value={member.status} />
              <InfoRow label="Campus" value={member.campus} />
              <InfoRow label="Join Date" value={formatDate(member.createdAt)} />
              <InfoRow label="Birthday" value={formatDate(member.birthday)} />
            </Section>

            {/* Groups */}
            <Section title="Groups" icon={<Users />}>
              {member.groups && member.groups.length > 0 ? (
                <ul className="space-y-2">
                  {member.groups.map((group) => (
                    <li key={group.id} className="flex justify-between items-center">
                      <span>{group.name}</span>
                      <span className="text-sm text-gray-500">{group.role}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Not in any groups</p>
              )}
            </Section>

            {/* Recent Activity */}
            <Section title="Recent Activity">
              <InfoRow label="Last Attendance" value={formatDate(member.lastAttendance)} />
              <InfoRow label="Groups Count" value={member.groupsCount?.toString()} />
              <InfoRow 
                label="Giving Status" 
                value={member.givingParticipation?.isActive ? 'Active Donor' : 'Not yet given'} 
              />
            </Section>

            {/* Notes */}
            {member.notes && member.notes.length > 0 && (
              <Section title="Notes">
                <ul className="space-y-3">
                  {member.notes.slice(0, 3).map((note) => (
                    <li key={note.id} className="border-l-2 border-gray-300 pl-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {note.authorName} • {formatDate(note.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500">Member not found</p>
        )}
      </DrawerBody>

      <DrawerFooter className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => member && onEdit(member)}>
          Edit Member
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, href }: { icon?: React.ReactNode; label: string; value?: string | null; href?: string }) {
  if (!value) return null;
  
  const content = (
    <div className="flex items-start gap-3">
      {icon && <span className="text-gray-400 mt-0.5">{icon}</span>}
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 block">
      {content}
    </a>
  ) : (
    <div className="p-2 -m-2">{content}</div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function getStatusColor(status?: string) {
  switch (status?.toLowerCase()) {
    case 'member':
      return 'bg-green-100 text-green-800';
    case 'visitor':
      return 'bg-blue-100 text-blue-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
```

#### 2.2 Backend: Member Detail Endpoint
**File:** `api/src/modules/members/members.controller.ts`

Add endpoint:
```typescript
@Get(':id')
@UseGuards(AuthGuard)
async getMember(
  @Param('id') id: string,
  @GetChurchId() churchId: string,
) {
  return this.membersService.findById(id, churchId);
}
```
Improved with explicit user authorization check:
```typescript
import { Controller, Get, UseGuards, Param, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@/common/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { GetChurchId } from '@/common/decorators/get-church-id.decorator';
import { User } from '@/types';
import { MembersService } from './members.service';
import { AuthService } from '../auth/auth.service';

@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly authService: AuthService,
  ) {}

@Get(':id')
@UseGuards(AuthGuard)
async getMember(
  @Param('id') id: string,
  @GetChurchId() churchId: string,
  @CurrentUser() user: User,
) {
  if (!this.authService.canAccessChurch(user, churchId)) {
    throw new ForbiddenException('You do not have access to this church.');
  }
  return this.membersService.findById(id, churchId);
}
}
```

**File:** `api/src/modules/members/members.service.ts`

```typescript
async findById(memberId: string, churchId: string): Promise<MemberDetail> {
  // Fetch member with related data
  const user = await this.dataStore.findUserById(memberId);
  
  if (!user) {
    throw new NotFoundException('Member not found');
  }

  // Check church association
  const churchUser = await this.dataStore.findChurchUser(churchId, memberId);
  if (!churchUser) {
    throw new ForbiddenException('Member not in this church');
  }

  // Fetch related data in parallel
  const [groups, lastAttendance, givingStatus, notes] = await Promise.all([
    this.dataStore.findUserGroups(memberId, churchId),
    this.dataStore.findLastAttendance(memberId, churchId),
    this.dataStore.findGivingStatus(memberId, churchId),
    this.dataStore.findUserNotes(memberId, churchId, { limit: 5 }),
  ]);

  return {
    id: user.id,
    firstName: user.profile?.firstName,
    lastName: user.profile?.lastName,
    email: user.primaryEmail,
    phone: user.profile?.phone,
    address: user.profile?.address,
    status: churchUser.role,
    roles: [churchUser.role], // TODO(MEMBERS-123): Multi-role support (see TASKS_BACKLOG.md)
    campus: null, // TODO(MEMBERS-124): Campus field integration (see TASKS_BACKLOG.md)
    birthday: user.profile?.birthday,
    groups: groups.map(g => ({
      id: g.group.id,
      name: g.group.name,
      role: g.role || 'Member',
    })),
    lastAttendance: lastAttendance?.recordedAt,
    groupsCount: groups.length,
    givingParticipation: {
      isActive: givingStatus?.hasRecentGift || false,
      lastGiftDate: givingStatus?.lastGiftDate,
    },
    notes: notes.map(n => ({
      id: n.id,
      content: n.content,
      authorName: `${n.author?.profile?.firstName ?? ''} ${n.author?.profile?.lastName ?? ''}`.trim() || 'Unknown',
      createdAt: n.createdAt,
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
```

---

### Part 3: Edit Member Modal

#### 3.1 Create Edit Member Modal Component
**New File:** `web/components/members/edit-member-modal.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '@/components/ui-flowbite/dialog';
import { Button } from '@/components/ui-flowbite/button';
import { useToast } from '@/lib/hooks/use-toast';
import { useConfirm } from '@/lib/hooks/use-confirm';
import { updateMember, MemberDetail } from '@/lib/api/members';

interface EditMemberModalProps {
  member: MemberDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditMemberModal({ member, onClose, onSuccess }: EditMemberModalProps) {
  const [formData, setFormData] = useState<Partial<MemberDetail>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        address: member.address,
        status: member.status,
        birthday: member.birthday,
      });
      setIsDirty(false);
    }
  }, [member]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setLoading(true);
    try {
      await updateMember(member.id, formData);
      toast.success('Member updated successfully');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update member';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const [confirm, confirmState] = useConfirm();
  const handleClose = async () => {
    if (isDirty) {
      const ok = await confirm({
        title: 'Discard changes?',
        message: 'You have unsaved changes. This action cannot be undone.',
        confirmText: 'Discard',
        cancelText: 'Keep Editing',
        variant: 'danger',
      });
      if (!ok) return;
    }
    onClose();
  };

  if (!member) return null;

  return (
    <Dialog open={!!member} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {/* Render the confirm dialog state somewhere inside the tree */}
        {/* <ConfirmDialog {...confirmState} /> */}
        <DialogHeader>
          <h2 className="text-xl font-bold">Edit Member</h2>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName || ''}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName || ''}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Address
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Member">Member</option>
                <option value="Visitor">Visitor</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Birthday
              </label>
              <input
                type="date"
                value={formData.birthday || ''}
                onChange={(e) => handleChange('birthday', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </DialogBody>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isDirty}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Part 4: Bulk Actions

#### 4.1 Update Table with Bulk Selection
**File:** `web/app/members/members-hub-client.tsx`

Add state:
```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

const toggleSelection = (id: string) => {
  setSelectedIds(prev => 
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );
};

const toggleSelectAll = () => {
  if (selectedIds.length === members.length) {
    setSelectedIds([]);
  } else {
    setSelectedIds(members.map(m => m.id));
  }
};
```

Update table header:
```tsx
<th className="px-3 py-2">
  <input
    type="checkbox"
    checked={selectedIds.length === members.length && members.length > 0}
    onChange={toggleSelectAll}
    aria-label="Select all members"
  />
</th>
```

Update table rows:
```tsx
<td className="px-3 py-2">
  <input
    type="checkbox"
    checked={selectedIds.includes(member.id)}
    onChange={() => toggleSelection(member.id)}
    aria-label={`Select ${member.firstName} ${member.lastName}`}
  />
</td>
```

#### 4.2 Create Bulk Action Bar
**New File:** `web/components/members/bulk-action-bar.tsx`

```tsx
'use client';

import { Button } from '@/components/ui-flowbite/button';
import { X, Mail, Download, UserPlus, Archive } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onEmail: () => void;
  onExport: () => void;
  onAddToGroup: () => void;
  onArchive: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  onEmail,
  onExport,
  onAddToGroup,
  onArchive,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg px-4 py-3 flex items-center gap-4 z-50">
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onEmail}>
          <Mail className="w-4 h-4 mr-1" />
          Email
        </Button>
        <Button size="sm" variant="outline" onClick={onAddToGroup}>
          <UserPlus className="w-4 h-4 mr-1" />
          Add to Group
        </Button>
        <Button size="sm" variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        <Button size="sm" variant="outline" onClick={onArchive}>
          <Archive className="w-4 h-4 mr-1" />
          Archive
        </Button>
      </div>

      <button
        onClick={onClear}
        className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        aria-label="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

#### 4.3 Backend: Bulk Actions Endpoint
**File:** `api/src/modules/members/members.controller.ts`

```typescript
@Post('bulk')
@UseGuards(AuthGuard)
async bulkAction(
  @Body() dto: BulkActionDto,
  @GetChurchId() churchId: string,
  @CurrentUser() user: User,
) {
  // Verify user authorization for bulk operations across provided member IDs
  await this.authService.verifyBulkMemberAccess(user, churchId, dto.memberIds, dto.operation);
  return this.membersService.bulkAction(dto, churchId);
}
```

**File:** `api/src/modules/members/dto/bulk-action.dto.ts`

```typescript
export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(500) // Prevent excessively large batches
  memberIds: string[];

  @IsEnum(['email', 'addToGroup', 'setStatus', 'archive', 'export'])
  operation: 'email' | 'addToGroup' | 'setStatus' | 'archive' | 'export';

  @IsObject()
  @IsOptional()
  params?: Record<string, any>;
}
```
Improved validated params structure (with required imports & nested validation):
```typescript
import { IsArray, IsString, ArrayMinSize, ArrayMaxSize, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkActionDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  memberIds!: string[];

  @IsEnum(['email','addToGroup','setStatus','archive','export'])
  operation!: 'email' | 'addToGroup' | 'setStatus' | 'archive' | 'export';

  @ValidateNested()
  @IsOptional()
  @Type(() => BulkActionParamsDto)
  params?: BulkActionParamsDto;
}

class AddToGroupParamsDto { @IsString() groupId!: string; }
class SetStatusParamsDto { @IsString() status!: string; }
class BulkActionParamsDto {
  @ValidateNested() @IsOptional() @Type(() => AddToGroupParamsDto) addToGroup?: AddToGroupParamsDto;
  @ValidateNested() @IsOptional() @Type(() => SetStatusParamsDto) setStatus?: SetStatusParamsDto;
}

// CONDITIONAL VALIDATION NOTE:
// Only the nested params object relevant to the chosen operation should be present.
// Implementation suggestion:
// - Add a custom validator or service-layer guard to ensure that when operation === 'addToGroup', params.addToGroup is defined
//   and params.setStatus is undefined, etc. This prevents ambiguous payloads.
// - Tests should cover: valid addToGroup, valid setStatus, invalid mixed params (both defined), and missing required nested params.
```

**File:** `api/src/modules/members/members.service.ts`

```typescript
async bulkAction(dto: BulkActionDto, churchId: string) {
  const { memberIds, operation, params } = dto;
  let results: { memberId: string; status: 'success' | 'error'; error?: string }[] = [];
  try {
    switch (operation) {
      case 'addToGroup':
        if (!params?.addToGroup?.groupId) throw new BadRequestException('groupId required');
        results = await this.addMembersToGroup(memberIds, params.addToGroup.groupId, churchId);
        break;
      case 'setStatus':
        if (!params?.setStatus?.status) throw new BadRequestException('status required');
        results = await this.updateMembersStatus(memberIds, params.setStatus.status, churchId);
        break;
      case 'archive':
        results = await this.archiveMembers(memberIds, churchId);
        break;
      default:
        results = memberIds.map(memberId => ({ memberId, status: 'error', error: 'Unsupported operation' }));
    }
  } catch (e) {
    // Sanitize error exposed to clients, but log for debugging
    this.logger.error('Bulk action failed', { error: e, operation, memberIds });
    results = memberIds.map(memberId => ({ memberId, status: 'error', error: 'Operation failed. Please try again.' }));
  }
  const success = results.filter(r => r.status === 'success').length;
  const failed = results.length - success;
  return { success, failed, results };
}
```

---

## 📋 Implementation Checklist

### Part 1: Responsive Filters (Days 1-2)
- [ ] Remove fixed sidebar layout from `members-hub-client.tsx`
- [ ] Create `FilterDropdown` component with popover
- [ ] Create `ActiveFilterChips` component
- [ ] Update main client to use new filter components
- [ ] Test responsive behavior (375px, 768px, 1024px, 1440px)
- [ ] Verify filter state persists in URL
- [ ] Add keyboard navigation (Tab, Enter, Esc)

### Part 2: Member Drawer (Day 2-3)
- [ ] Create `member-drawer.tsx` component
- [ ] Implement progressive loading (summary → groups → activity)
- [ ] Backend: Add `GET /api/members/:id` endpoint
- [ ] Backend: Implement `findById` with related data fetch
- [ ] Test drawer open performance (<200ms target)
- [ ] Add skeleton loading states
- [ ] Test deep-link support (`?memberId=uuid`)

### Part 3: Edit Modal (Day 3-4)
- [ ] Create `edit-member-modal.tsx` component
- [ ] Implement form validation (required fields, formats)
- [ ] Add dirty state warning on close
- [ ] Backend: Add `PATCH /api/members/:id` endpoint
- [ ] Backend: Implement validation and update logic
- [ ] Test optimistic UI updates
- [ ] Test error handling and rollback

### Part 4: Bulk Actions (Day 4-5)
- [ ] Add bulk selection state to table
- [ ] Create `bulk-action-bar.tsx` component
- [ ] Implement bulk email action (frontend)
- [ ] Implement bulk add to group action (frontend)
- [ ] Implement bulk export action (frontend)
- [ ] Implement bulk archive action (frontend)
- [ ] Backend: Add `POST /api/members/bulk` endpoint
- [ ] Backend: Implement batch processing with transactions
- [ ] Test with 100+ selected members
- [ ] Add progress indicator for large batches

### Testing
- [ ] Unit tests (filters & chips)
  - Removing a single value from multi-value filters updates only that value (e.g., status: "member,visitor" → remove "member" ⇒ "visitor").
  - Removing the last remaining value deletes the filter key (e.g., role: "leader" → remove ⇒ role undefined).
  - `resetFilters()` clears all filter keys and resets `page` to 1 without touching unrelated query params.
  - `activeFilterCount` counts values correctly (including comma-separated values and boolean flags stored as `'true'`).
- [ ] Component tests (FilterDropdown & ActiveFilterChips)
  - Badge displays active count; hidden when count is zero.
  - Clear All clears all filters and closes popover.
  - Chips render per individual value (not one chip per key); clicking chip X removes only that value.
  - Keyboard: Trigger button is focusable; popover closes on `Esc`; actions operable via `Enter`/`Space`.
- [ ] Component tests (EditMemberModal confirm)
  - With dirty form, closing triggers non-blocking confirm dialog (via `useConfirm`).
  - Confirming proceeds with close; cancel keeps modal open; verify focus returns to trigger.
  - No `window.confirm()` usage; dialog has proper roles/aria and traps focus.
- [ ] Component tests (MemberDrawer)
  - Shows skeleton while loading; renders summary quickly; handles error with friendly message.
  - Ensures required imports (e.g., Button) and safe error handling with unknown errors.
- [ ] E2E tests
  - Chips flow: Apply multi-select status, remove a single chip, verify remaining filter and results, Clear All resets state.
  - Drawer→Edit flow: Open drawer, open edit modal, type changes, attempt close → confirm dialog appears; cancel keeps open; confirm discards changes.
  - Bulk flow: Select all on page, perform batch operation, show progress and summary; no leaked error details in UI.
- [ ] Accessibility audit
  - Popover and dialog semantics: roles, labels, focus management, `Esc` to close.
  - Chips/buttons are keyboard operable and have accessible names.
- [ ] Performance tests
  - Drawer P95 open <200ms on warm path; document progressive loading/caching where needed.
  - Bulk actions avoid N+1; validate batch endpoints under 100+ members.
 - [ ] Responsive drawer width does not overflow at 375px (visual + bounding rect assertion).
 - [ ] Unknown error handling: simulate thrown non-Error (e.g., throw 'fail') and assert fallback message.
 - [ ] Bulk authorization: unauthorized user attempting bulk action receives 403; verify no partial mutations.
 - [ ] Conditional params validation: invalid mixed params rejected; missing required param for operation rejected.
 - [ ] CheckboxGroup/RadioGroup fallback: if design system primitives absent, native inputs still pass a11y tests.
 - [ ] MemberDetail type integrity: API returns shape matching interface (runtime shape test for critical fields).
 - [ ] Confirm dialog tuple usage: `[confirm, confirmState]` pattern used and dialog rendered.
 - [ ] Bulk logger: verify error path logs once per bulk action.
 - [ ] FilterState compile-time coverage: added keys don't break typing.

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Popover/Dropdown library missing** | High | Use existing Flowbite components or build simple popover with Headless UI |
| **Filter chip removal complexity** | Medium | Parse comma-separated values carefully; test edge cases |
| **Drawer performance with many groups** | Medium | Paginate groups list; lazy-load activity section |
| **Bulk action timeout on large datasets** | High | Process in batches of 50; show progress bar; consider job queue |
| **Form validation complexity** | Medium | Use existing validation patterns from other forms |
| **Mobile filter UX still problematic** | Low | Test on real devices; iterate based on feedback |

---

## 🎯 Acceptance Criteria

- ✅ **Responsive Filters:**
  - Filters render as chips + dropdown (no fixed sidebar)
  - Active filters removable via chip X button
  - Layout works on mobile (375px+), tablet (768px+), desktop (1024px+)
  - Filter state persists in URL
  - [Clear All] removes all filters
  
- ✅ **Member Drawer:**
  - Opens in <200ms (P95)
  - Displays contact info, details, groups, activity, notes
  - Supports deep-linking (`?memberId=uuid`)
  - Keyboard accessible (Tab, Esc to close)
  
- ✅ **Edit Modal:**
  - Validates required fields (firstName, lastName)
  - Shows dirty state warning on close
  - Success toast on save
  - Error handling with retry
  
- ✅ **Bulk Actions:**
  - Selection works for 100+ members
  - Bulk action bar shows count and actions
  - Email, add to group, export, archive work
  - Progress indicator for >50 members
  - Success/error summary toast

---

## 📚 Reference Material

- **Flowbite Popover:** https://flowbite.com/docs/components/popover/
- **Headless UI Popover:** https://headlessui.com/react/popover
- **Filter Chip Pattern:** Linear, Notion, Airtable
- **Existing Drawer Pattern:** Check `components/ui-flowbite/dialog.tsx` for similar patterns
- **Existing Form Patterns:** Check other forms in codebase for validation examples

---

## Accomplishments

*(To be filled in after phase completion)*

- Commit hashes:
- Key learnings:
- Performance metrics:
- Known issues/deferred items:
  - MEMBERS-123: Multi-role support (currently single role reflected in array)
  - MEMBERS-124: Campus field integration (currently placeholder null)

---

## 📋 Post-Phase 2: Extraction Roadmap (Phase 2.5)

**IMPORTANT:** After Phase 2 completes successfully, evaluate these components for extraction as generic primitives.

### Extraction Candidates

The following components were built as member-specific but have clear reuse potential across Events, Groups, Households, Announcements, etc.

#### 1. FilterDropdown Shell
**Current:** `web/components/filters/filter-dropdown.tsx` (member-specific)  
**Extract to:** `web/components/ui-flowbite/filter-dropdown.tsx`  
**Reusable parts:**
- Popover wrapper with trigger button
- Active filter count badge
- Footer (Clear All / Apply buttons)
- Open/close state management

**Keep domain-specific (via children prop):**
- Filter sections content (Status, Role, Attendance, etc.)

**New API:**
```tsx
<FilterDropdown
  activeCount={3}
  onClear={clearAll}
  trigger={<Button>Filters</Button>}
>
  {/* Domain-specific filter sections */}
  <FilterSection title="Status">...</FilterSection>
</FilterDropdown>
```

#### 2. ActiveFilterChips
**Current:** `web/components/filters/active-filter-chips.tsx` (member-specific formatting)  
**Extract to:** `web/components/ui-flowbite/active-filter-chips.tsx`  
**Reusable parts:**
- Chip rendering with X button
- Remove individual chip handler
- Clear all button
- Layout (flexbox with wrap)

**Add prop for domain-specific formatting:**
```tsx
<ActiveFilterChips
  filters={{ status: 'active', role: 'leader' }}
  formatLabel={(key, value) => {
    // Domain-specific formatting
    if (key === 'status') return `Status: ${value}`;
    if (key === 'role') return `Role: ${value}`;
    return `${key}: ${value}`;
  }}
  onRemove={onRemove}
  onClearAll={onClearAll}
/>
```

#### 3. DataTable with Bulk Selection
**Current:** Bulk selection logic in `members-hub-client.tsx`  
**Extract to:** `web/components/ui-flowbite/data-table.tsx`  
**Reusable parts:**
- Selection state management
- Select all checkbox
- Row checkboxes
- Bulk selection UI patterns

**New API:**
```tsx
<DataTable
  columns={columns}
  data={data}
  selectable={true}
  onSelectionChange={setSelected}
  onRowClick={(row) => openDrawer(row.id)}
/>
```

#### 4. BulkActionBar
**Current:** `web/components/members/bulk-action-bar.tsx` (member-specific actions)  
**Extract to:** `web/components/ui-flowbite/bulk-action-bar.tsx`  
**Reusable parts:**
- Fixed bottom bar positioning
- Selected count display
- Clear selection button
- Layout and styling

**Add prop for domain-specific actions:**
```tsx
<BulkActionBar
  selectedCount={5}
  actions={[
    { icon: <Mail />, label: 'Email', onClick: emailSelected },
    { icon: <Download />, label: 'Export', onClick: exportSelected },
    { icon: <Archive />, label: 'Archive', onClick: archiveSelected },
  ]}
  onClear={clearSelection}
/>
```

#### 5. DetailPanel Hook Pattern
**Current:** Drawer state management in `members-hub-client.tsx`  
**Extract to:** `web/lib/hooks/use-detail-panel.ts`  
**Pattern:**
```tsx
const { isOpen, itemId, open, close } = useDetailPanel('member');
// Generates URL: ?member=uuid
// Reusable for: ?event=uuid, ?group=uuid, etc.
```

### Extraction Timeline

**Estimated Duration:** 2-3 days

**Approach:**
1. **Day 1:** Extract FilterDropdown shell + ActiveFilterChips
   - Create generic components in `ui-flowbite/`
   - Update members page to use new generic components
   - Verify members functionality unchanged
   
2. **Day 2:** Extract DataTable + BulkActionBar
   - Create generic table component with selection
   - Create generic bulk action bar
   - Update members page to use new components
   
3. **Day 3:** Documentation + validation
   - Create `docs/guides/DATA_TABLE_PATTERN.md`
   - Document component APIs and usage examples
   - Validate extraction with simple test case (e.g., basic Events page)

### Success Criteria

- ✅ Members page still works (no regressions)
- ✅ Generic components accept domain-specific content via props/children
- ✅ At least 70% of code is reusable (30% domain-specific via props)
- ✅ Documentation exists for each extracted primitive
- ✅ All tests pass after extraction

### Defer to Phase 2.5 If:

- Phase 2 discovers patterns don't generalize well
- Member-specific requirements change significantly
- Time pressure to complete MVP features first

**Decision Point:** Review after Phase 2 Accomplishments are documented.

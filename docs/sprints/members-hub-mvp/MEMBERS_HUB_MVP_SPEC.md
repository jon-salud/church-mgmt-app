# Members Hub MVP - Product & UX Specification
**Version:** 1.0.0 (Draft for UX Review)  
**Date:** 8 November 2025  
**Author:** Product Owner  
**Status:** Awaiting UX Designer Review

---

## Executive Summary

The Members Hub is the operational heart of the church management system. Currently implemented as a basic table view, this MVP reimagines the experience to support the daily workflows of church administrators and pastors: finding members quickly, understanding their engagement, taking immediate action, and maintaining accurate records.

**Core Problem:** Church leaders spend 10-15 minutes per day searching for member information, toggling between systems, and manually tracking follow-ups. The current table lacks filtering, search, bulk actions, and contextual member details.

**MVP Goal:** Reduce time-to-action from 3-5 minutes to <30 seconds for common tasks (find member, view profile, send email, assign follow-up).

**Success Metrics:**
- Time-to-member profile: ≤6 seconds (median)
- Search effectiveness: ≥80% searches → profile view within 30s
- Bulk action adoption: ≥30% admins use weekly
- Saved views adoption: ≥40% admins create ≥1 view in first month
- P75 interaction latency: ≤200ms

---

## Architecture Impact Legend

Use these indicators to highlight likely implications for APIs, database, security, performance, and regression risk.

| Indicator | Meaning |
|-----------|--------|
| **[ARCH]** | API surface/contract change or new endpoint required |
| **[DB]** | Database schema/index/migration or data lifecycle impact |
| **[PERF]** | Performance/scalability concern (query, caching, virtualization) |
| **[OBS]** | Observability: logging, tracing, metrics additions |
| **[SEC]** | Security/privacy/consent/RBAC implication |
| **[REG]** | Elevated regression risk; needs usage search + tests |
| **[DATA]** | Import/export transformation or data portability impact |
| **[UX-SYNC]** | URL/state synchronization for deep links/back nav |

Multiple indicators may be combined, e.g., **[ARCH][DB][SEC]**.

---

## 1. User Personas & Use Cases

### Primary: Church Administrator (Linda)
- **Context:** Manages 500+ member database, answers phone/email inquiries, prepares weekly reports
- **Pain Points:** Can't quickly filter by attendance, no bulk email, loses track of follow-ups
- **Key Tasks:** 
  - Find member by partial name/phone ("someone named Sarah")
  - Send welcome email to all visitors from last Sunday
  - Export filtered list for ministry team
  - Mark members needing follow-up

### Secondary: Lead Pastor (David)
- **Context:** Oversees pastoral care, tracks engagement trends, assigns follow-up tasks
- **Pain Points:** No visibility into who's inactive, difficult to assign care tasks in bulk
- **Key Tasks:**
  - View members who haven't attended in 60+ days
  - See member's groups, giving participation, recent activity at a glance
  - Assign pastoral care follow-ups to staff

### Tertiary: Volunteer Coordinator (Maria)
- **Context:** Recruits volunteers, tracks skills/interests, sends targeted invitations
- **Pain Points:** Can't filter by skills/interests, no saved views for volunteer pools
- **Key Tasks:**
  - Find members with specific skills (e.g., "teaching" or "tech")
  - Create saved view for active volunteers
  - Bulk email volunteers for upcoming event

---

## 2. Information Architecture

### 2.1 Page Layout (Desktop 1440px+)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: "Members" | Search Bar (center-left) | [+ Add Member]       │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Filter Panel (collapsible left rail, 280px)                     │ │
│ │ • Status (chips: Member, Visitor, Inactive)                     │ │
│ │ • Campus (dropdown)                                             │ │
│ │ • Gender (chips: Male, Female)                                  │ │
│ │ • Age Range (dual slider)                                       │ │
│ │ • Last Attendance (preset: 30/60/90 days, custom)               │ │
│ │ • Has Email / Has Phone (toggles)                               │ │
│ │ • Groups (multiselect)                                          │ │
│ │ ▼ Custom Fields (accordion, collapsed by default)               │ │
│ │   • Membership Status, Join Method, etc.                        │ │
│ │ [Clear All] [Apply Filters]                                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Toolbar (above table)                                           │ │
│ │ • [Bulk Actions ▼] (disabled until selection)                   │ │
│ │ • [Column Picker ⚙] • [Export CSV ↓]                            │ │
│ │ • Saved Views: [All Members ▼] [+ Save Current View]            │ │
│ │ • Results Count: "Showing 47 of 523 members"                    │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Data Table (responsive, sticky header)                          │ │
│ │ ┌───┬─────────────┬────────┬─────────┬─────────┬───────┬─────┐  │ │
│ │ │☐  │ Name ↑      │ Status │ Email   │ Phone   │ Groups│ ⋮   │  │ │
│ │ ├───┼─────────────┼────────┼─────────┼─────────┼───────┼─────┤  │ │
│ │ │☐  │ Sarah Chen  │ Member │ s@...   │ 555-... │ 3     │ ⋮   │  │ │
│ │ │   │ 🔔 Follow-up│        │         │         │       │     │  │ │
│ │ └───┴─────────────┴────────┴─────────┴─────────┴───────┴─────┘  │ │
│ │ Pagination: [25 per page ▼] [< 1 2 3 ... 21 >]                  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

When row clicked → Drawer slides in from right (480px)
When [+ Add Member] → Modal overlays center (640px max-width)
```

### 2.2 Responsive Breakpoints

- **Desktop (1440px+):** Full filter panel + table + drawer
- **Laptop (1024px–1439px):** Collapsible filter panel (icon-only by default), full table
- **Tablet (768px–1023px):** Filter panel → bottom sheet, table → card list, drawer → full-screen overlay
- **Mobile (375px–767px):** Filter → modal, table → vertical cards, drawer → full-screen

---

## 3. Core Features & User Flows

### Phase 0: UX Framework & Primitives (precedes Phase 1)
Goal: Establish consistent, accessible, performant UI primitives to accelerate all feature work.

Scope (Frontend primitives):
- Drawer (focus trap, ARIA, deep-link support) **[UX-SYNC][REG]**
- Modal / ConfirmDialog (standardized motion, a11y) **[REG]**
- Toast/Toaster (queued, screen reader announcements) **[REG]**
- Table primitives (selection, sort indicators, sticky header) **[REG][PERF]**
- Bulk Action Bar (declarative actions) **[ARCH][REG]**
- Filter Panel + Chips + Accordion + URL sync utilities **[UX-SYNC][REG]**
- Column Picker (drag + persistence abstraction) **[REG]**
- Form Field primitives (validation messaging, dirty tracking) **[REG]**
- Async states: Skeleton, Spinner, EmptyState, ErrorBoundary **[REG]**
- Hooks: `useConfirm()`, `useToast()`, `useDrawerRoute()` **[UX-SYNC][REG]**
- Observability helpers (`emitEvent`, timing wrapper) **[OBS][REG]**

Architecture considerations:
- Event naming convention for instrumentation **[OBS][ARCH]**
- URL pattern for deep-linked drawer: `/members?memberId=<id>` **[ARCH][UX-SYNC]**
- Client-side cache for member summaries (stale-while-revalidate) **[PERF][ARCH][REG]**
- DataStore abstraction for PostgreSQL compatibility (mock mode during development) **[ARCH][REG]**

Acceptance criteria:
- Primitives pass accessibility audit (focus trap, ARIA roles, ESC close, reduced motion) **[REG]**
- Drawer open/close updates URL and supports back/forward nav **[ARCH][UX-SYNC][REG]**
- Shared motion tokens (120/200/300ms) defined and reused **[PERF]**
- Unit tests for primitives (happy path + a11y behaviors) **[REG]**

### 3.1 Search & Discovery

#### Global Search (Priority 1)
- **Trigger:** Type in header search bar (autofocus on `/` key)
- **Behavior:** Debounced 300ms, searches across:
  - First name, last name (partial match, case-insensitive)
  - Email (contains)
  - Phone (digits only, ignores formatting)
- **Results:** Highlights matched term in yellow, sorts by relevance (exact match → partial → contains)
- **Performance:** ≤500ms after debounce, shows loading spinner in search icon
- **Empty State:** "No members found. Try a different search or adjust filters."
 - **Architecture Notes:** Server query must support combined search across indexed columns (firstName, lastName, email, phone) **[ARCH][PERF][REG]**; use PostgreSQL GIN index with tsvector for text search scaling **[DB][PERF]**. Mock mode uses simple LIKE queries during development **[ARCH]**.

#### Filter Panel (Priority 1)
- **Default Filters Visible:**
  - Status (multi-select chips: Member, Visitor, Inactive)
  - Campus (dropdown if >1 campus, hidden if single campus)
  - Last Attendance (quick presets: "Last 30 days", "31-60 days", "61-90 days", "90+ days", "Never")
- **Collapsed by Default:**
  - Gender, Age Range, Has Email/Phone, Groups
  - Custom Fields (accordion)
- **Interaction:**
  - Filters combine with AND logic
  - Active filters show badge count on collapsed sections
  - URL updates to preserve filter state (shareable/bookmarkable)
  - [Clear All] removes all filters except Campus (preserves user's default campus if set)
- **Visual Feedback:** Filtered state shows "🔍 Filtered (5 active)" label above table
 - **Architecture Notes:** Normalize filter parameters in API (e.g., `status=member,visitor`) with validation and safe defaults **[ARCH][REG]**; cache filter metadata per `churchId` **[PERF][ARCH]**. Use DataStore abstraction for PostgreSQL compatibility **[ARCH]**.

#### Saved Views (Priority 2)
- **Location:** Toolbar dropdown, left of Column Picker
- **Default Views:**
  - "All Members" (no filters, default columns)
  - "Recent Visitors" (Status=Visitor, Last Attendance ≤30 days)
  - "Needs Follow-up" (Follow-up flag = true)
  - "Inactive Members" (Last Attendance >90 days)
- **User-Created Views:**
  - Click [+ Save Current View] → Modal: "View Name" + "Make Default" checkbox
  - Saves: active filters, column selection/order, sort
  - Scope: Personal (team/shared views deferred to post-MVP)
  - Max 10 saved views per user
- **Interaction:** Select view → Immediately applies filters/columns/sort, URL updates
 - **Architecture Notes:** LocalStorage persistence in MVP; future server persistence via `GET/POST /api/users/me/saved-views` **[ARCH][REG]**. Gracefully omit missing fields **[REG]**.

### 3.2 Table Interaction

#### Default Columns & Sort
- **Columns (left to right):**
  1. Checkbox (bulk select)
  2. Name (first + last, bold) + Badges (new, follow-up, volunteer)
  3. Status (chip: Member=green, Visitor=blue, Inactive=gray)
  4. Email (truncate@..., tooltip on hover)
  5. Phone (formatted: (555) 123-4567)
  6. Campus (if multi-campus)
  7. Last Attendance (relative: "3 days ago", absolute on hover)
  8. Groups Count (number, clickable → expands inline)
  9. Actions (⋮ menu)
- **Default Sort:** Last Attendance (desc), fallback Created Date (desc)
- **Sortable Columns:** Name, Status, Last Attendance, Created Date
- **Fixed Width:** Checkbox (48px), Actions (48px)
- **Responsive:** Email/Phone hidden on <768px, Name expands full-width
 - **Architecture Notes:** Default sort by lastAttendance; calculate via service layer during mock development, optimize with PostgreSQL materialized view or computed column post-migration **[ARCH][DB][PERF][REG]**.

#### Row Actions (⋮ Menu)
- **Primary Actions:**
  - "View Profile" (opens drawer)
  - "Edit Member" (opens modal)
  - "Send Email" (if email exists, opens email draft or external mailto)
  - "Send SMS" (if phone exists, deferred to Phase 3/4 if no provider)
- **Secondary Actions:**
  - "Add to Group" (inline dropdown → group multiselect)
  - "Assign Follow-up" (inline form: assignee dropdown + due date)
  - "Archive Member" (soft delete, confirmation modal)
- **Visual:** Icon-only on hover (desktop), always visible (mobile)
 - **Architecture Notes:** Requires endpoints (`PATCH /api/members/:id`, `POST /api/members/:id/assign-followup`) **[ARCH][REG]**; follow-up assignment may require new relationship/table **[DB][ARCH][REG]**.

#### Bulk Selection & Actions
- **Trigger:** Check ≥1 row checkbox, or check header "Select All" (selects current page)
- **Toolbar Updates:** 
  - Shows "[N] selected" badge
  - [Bulk Actions ▼] button enabled
- **Bulk Actions Menu:**
  - "Send Email to [N]" → Opens bulk email composer (to/cc/bcc, template dropdown, merge fields)
  - "Send SMS to [N]" → Bulk SMS composer (character count, merge fields)
  - "Add to Group" → Group multiselect → confirmation modal
  - "Set Status" → Status dropdown → confirmation modal
  - "Assign Follow-up" → Assignee + due date → confirmation modal
  - "Export Selected" → CSV download
- **Confirmation Pattern:** 
  - Modal: "Apply action to [N] members?" + list (first 5 + "and X more")
  - Shows progress bar if >50 members
  - Success/error summary: "✓ 47 successful, ✗ 3 failed (no email)"
- **Limits:** Max 500 selections per bulk action (pagination-aware)
 - **Architecture Notes:** Batch on server (`POST /api/members/bulk`) with per-record outcomes **[ARCH][REG]**; consider job queue for very large operations **[PERF][ARCH]**.

#### Column Picker (Priority 2)
- **Trigger:** [⚙ Columns] button in toolbar
- **UI:** Dropdown panel (320px)
  - **Core Fields Section:** (non-removable, reorderable)
    - Name, Status, Email, Phone, Campus, Last Attendance, Groups
  - **Custom Fields Section:** (toggleable, reorderable)
    - All 16 optional fields listed in definition order
    - Checkbox to show/hide
    - Drag handle to reorder
  - **Footer:** [Reset to Default] [Apply]
- **Persistence:** Saved per user in localStorage (API sync deferred)
- **Visual:** Hidden columns show strikethrough in picker
 - **Architecture Notes:** Column configuration may evolve to server-side user preferences **[ARCH][REG]**.

### 3.3 Member Profile Drawer

#### Trigger & Behavior
- **Open:** Click row, or select "View Profile" from ⋮ menu
- **Animation:** Slide-in from right, 120ms ease-out
- **Width:** 480px (desktop), 100vw (mobile)
- **Overlay:** Semi-transparent backdrop (closes on click)
- **Scrollable:** Independent scroll from main table
- **Close:** [X] button (top-right), Esc key, or click backdrop
 - **Architecture Notes:** Update URL with `memberId` and support direct load to drawer **[ARCH][UX-SYNC][REG]**.

#### Content Sections (Top to Bottom)
1. **Header (sticky)**
   - Name (h2, bold)
   - Status chip + badges (volunteer, new, follow-up)
   - [Edit] [⋮ More Actions] buttons (top-right)

2. **Contact Info**
   - Email (clickable → mailto)
   - Phone (clickable → tel)
   - Address (multiline, Google Maps link if complete)

3. **Member Details (2-column grid)**
   - Status, Campus, Join Date, Birthday (age calculated)
   - Gender, Marital Status, Household (link to household page)

4. **Custom Fields (if any visible)**
   - Only shows fields with values OR marked required
   - Grouped by type: Membership Info, Family Info, Background Info, Skills
   - Empty state: "No additional information"

5. **Groups (Priority 1)**
   - List of groups (max 5 visible, "+ N more" link)
   - Each group: Name, role in group (Member/Leader), join date
   - [+ Add to Group] button

6. **Recent Activity**
   - Last 3 attendances (event name, date, check-in time)
   - Giving participation: "Active donor" or "Not yet given" (no amounts)
   - Last note timestamp (clickable → notes panel)

7. **Notes (Priority 2)**
   - Chronological feed, newest first
   - Each note: Author, timestamp, content (max 3 lines, "Read more" expands)
   - [+ Add Note] button → inline form (textarea + Save/Cancel)

8. **Footer Actions**
   - [Send Email] [Send SMS] [Assign Follow-up] [Archive]

Architecture Notes:
- Groups list requires efficient joins or preloaded summary **[ARCH][DB][PERF][REG]**
- Recent attendance & giving participation need aggregated endpoints or denormalized summary **[ARCH][DB][PERF][REG]**
- Notes CRUD endpoints & permission checks (author visibility) **[ARCH][SEC][REG]**
- Archive uses soft delete; implement Undo window (e.g., 10s) with restore endpoint **[ARCH][SEC][REG]**

#### Edit Mode (Deferred to Modal)
- Drawer [Edit] button → Opens modal (same as row edit)
- Drawer closes automatically when modal opens

### 3.4 Add/Edit Member Modal

#### Trigger
- **Add:** [+ Add Member] button (header)
- **Edit:** [Edit] button (drawer or row menu)

#### Modal Layout (640px max-width, centered)
- **Header:** "Add Member" or "Edit Member: [Name]"
- **Form Sections (tabs or accordion):**
  1. **Basic Info (default open)**
     - First Name* (required), Last Name* (required)
     - Email, Phone (at least one required)
     - Status* (dropdown: Member, Visitor, Inactive)
     - Role (multiselect: Member, Admin, Leader, Volunteer)
     - Campus (dropdown if multi-campus)
  2. **Address**
     - Street, City, State/Province, Postal Code, Country
  3. **Groups**
     - Multiselect dropdown with search
     - Shows current groups with [X] remove action
  4. **Optional Details (collapsed by default)**
     - All 16 custom fields in definition order
     - Smart inputs: Date picker, dropdown for predefined options, text/number inputs
     - None required (all optional)
  5. **Notes**
     - Textarea, optional
- **Footer:**
  - [Cancel] (left, secondary) → Confirms if form dirty
  - [Save Member] (right, primary) → Validates, submits, closes modal
- **Validation:**
  - Real-time on blur, inline error messages
  - Required fields: First Name, Last Name, Status, at least one of Email/Phone
  - Email format, phone format (flexible: US/international)
- **Success:** Toast notification "Member added" or "Member updated", drawer refreshes if open
 - **Architecture Notes:** Validation must mirror backend constraints (required fields, phone/email format) **[ARCH][REG][SEC]**; groups multiselect updates join table **[DB][ARCH][REG]**; custom fields stored via extension schema/table **[DB][ARCH][REG]**.

#### Form Behavior
- **Autofocus:** First Name field on mount
- **Keyboard:** Tab navigation, Enter submits (if valid)
- **Dirty State:** Warns before closing if unsaved changes
- **API Errors:** Shows error banner at top of modal with retry button

---

## 4. UX Patterns & Design Language

### 4.1 Visual Hierarchy

#### Typography Scale
- **Page Title:** 2rem (32px), bold, color: text-primary
- **Section Headers:** 1.25rem (20px), semibold, color: text-primary
- **Body Text:** 0.875rem (14px), regular, color: text-secondary
- **Labels:** 0.75rem (12px), medium, uppercase, color: text-tertiary

#### Color Semantics (Aligned with Design System)
- **Status Chips:**
  - Member: `green-500` background, `green-900` text
  - Visitor: `blue-500` background, `blue-900` text
  - Inactive: `gray-400` background, `gray-700` text
- **Badges:**
  - New: `purple-100` background, `purple-700` text, "✨ New"
  - Follow-up: `orange-100` background, `orange-700` text, "🔔 Follow-up"
  - Volunteer: `cyan-100` background, `cyan-700` text, "🤝 Volunteer"
- **Action Buttons:**
  - Primary: `primary-600` (brand color), white text
  - Secondary: `gray-200` background, `gray-700` text
  - Danger: `red-600`, white text

#### Spacing & Layout
- **Filter Panel:** 280px fixed width, 16px padding, 12px gap between controls
- **Table Row Height:** 64px (desktop), 80px (mobile with stacked content)
- **Drawer Padding:** 24px horizontal, 16px vertical
- **Modal Padding:** 24px all sides

### 4.2 Interaction Patterns

#### Loading States
- **Initial Page Load:** Skeleton table (5 shimmer rows)
- **Search/Filter Apply:** Overlay spinner on table, 500ms delay before showing
- **Bulk Action Progress:** Modal with progress bar + "[N] of [M] completed"
- **Drawer Load:** Skeleton content in sections
 - **Architecture Notes:** Progressive fetch (summary first, then groups/attendance/notes) favors endpoint separation or GraphQL field resolvers **[ARCH][PERF][REG]**.

#### Empty States
- **No Members (first-time):**
  - Illustration: People icon
  - Heading: "No members yet"
  - Subtext: "Add your first member to get started"
  - CTA: [+ Add Member] button
- **No Search Results:**
  - Icon: Magnifying glass with X
  - Heading: "No members found"
  - Subtext: "Try adjusting your search or filters"
  - CTA: [Clear Filters]
- **No Saved Views:**
  - In dropdown: "No saved views yet. Apply filters and save your first view."
 - **Architecture Notes:** Future server persistence for portability across devices **[ARCH][REG]**.

#### Error States
- **API Failure:** Red banner at top: "Unable to load members. [Retry]"
- **Form Validation:** Inline red text below field, red border on input
- **Bulk Action Partial Failure:** Warning toast: "3 of 50 actions failed. [View Details]"
 - **Architecture Notes:** Bulk endpoint returns per-item status array **[ARCH][REG]**.

#### Success Feedback
- **Toast Notifications (bottom-right, 3s auto-dismiss):**
  - "Member added successfully"
  - "47 members updated"
  - "View saved"
- **Inline Success:** Green checkmark icon next to field after save
 - **Architecture Notes:** Consider optimistic UI with rollback on failure **[ARCH][REG][PERF]**.

### 4.3 Accessibility

#### Keyboard Navigation
- **Tab Order:** Search → Filters → Table → Drawer/Modal
- **Shortcuts:**
  - `/` Focus search
  - `Esc` Close drawer/modal/dropdown
  - `Space` Toggle checkbox
  - `Enter` Submit form, select dropdown item
  - Planned: `g m` open Add Member (future extensibility) **[ARCH][REG]**
- **Focus Indicators:** 2px solid `primary-500` outline, 2px offset

#### Screen Reader Support
- **ARIA Labels:**
  - Table: `aria-label="Members directory"`
  - Search: `aria-label="Search members by name, email, or phone"`
  - Bulk Actions: `aria-label="Bulk actions for [N] selected members"`
- **Live Regions:**
  - Search results count: `aria-live="polite"` announces "Showing 47 of 523 members"
  - Bulk action progress: `aria-live="assertive"` announces completion

#### Visual Accessibility
- **Contrast Ratios:** ≥4.5:1 for text, ≥3:1 for UI components
- **Focus Visible:** All interactive elements have visible focus state
- **Color Independence:** Status never conveyed by color alone (icons + text labels)

### 4.4 Motion & Transitions

#### Animation Timings
- **Fast (120ms):** Drawer slide, dropdown expand, button hover
- **Medium (200ms):** Modal fade+scale, toast appear/dismiss
- **Slow (300ms):** Filter panel collapse (reserved for intentional page layout shifts)

#### Reduced Motion
- Respects `prefers-reduced-motion: reduce`
- Disables slide/scale animations, instant transitions only
- Maintains layout shifts, removes decorative motion

---

## 5. Data & Schema Considerations

### 5.1 Core Member Fields (Always Present)
- `id` (UUID), `churchId` (tenancy), `firstName`, `lastName`, `email`, `phone`, `address`, `status`, `roles` (array), `campus`, `createdAt`, `updatedAt`

### 5.2 Optional Custom Fields (Church-Configurable)
All optional, rendered dynamically based on church settings:

| Field Name | Type | UI Component | Notes |
|------------|------|--------------|-------|
| Membership Status | single-select | Dropdown | Options: Active, Inactive, Pending |
| Join Method | single-select | Dropdown | Options: Transfer, Baptism, Statement |
| Join Date | date | Date picker | Past dates only |
| Previous Church | text | Text input | Free-form |
| Baptism Date | date | Date picker | Past dates only |
| Spiritual Gifts | text | Textarea | Comma-separated or multiline |
| Courses Attended | text | Textarea | Comma-separated or multiline |
| Marital Status | single-select | Dropdown | Options: Single, Married, Widowed, Divorced |
| Wedding Anniversary | date | Date picker | Future dates allowed (recurring) |
| Occupation | text | Text input | Free-form |
| School | text | Text input | Free-form |
| Grade Level | number | Number input | 1-12, or "College" |
| Graduation Year | number | Number input | YYYY format |
| Skills and Interests | text | Textarea | Comma-separated or multiline |
| Background Check Status | single-select | Dropdown | Options: Pending, Approved, Expired |
| Background Check Date | date | Date picker | Past dates only, alert if >2 years |

Architecture Notes: Background check fields may require audit + restricted role visibility; consider encryption at rest and masking **[SEC][DB][ARCH][REG]**.

### 5.3 Relationships
- **Groups:** Many-to-many via `group_members` join table (includes role, joinedAt)
- **Household:** Many-to-one (optional, multiple members can share household)
- **Attendance:** One-to-many via `attendance` records (linked to events)
- **Notes:** One-to-many via `notes` table (author, content, timestamp)
 - Architecture Notes: Ensure soft delete cascade rules and indexing for foreign keys **[DB][ARCH][PERF][REG]**.

### 5.4 Performance Targets
- **Query Latency:** P50 ≤150ms, P95 ≤500ms for paginated member list
- **Search:** P75 ≤300ms after debounce (indexed columns: firstName, lastName, email, phone)
- **Bulk Actions:** Process 100 members/second, show progress for >50 members
 - Architecture Notes: Background queue/worker for scaling; idempotency keys for retry safety **[ARCH][PERF][REG]**.

---

## 6. Sprint Phasing Proposal

### Phase 1: Discoverability & Speed (3-4 days)
**Goal:** Users can find any member in <10 seconds
- Server-side pagination (25/50/100 per page)
- Sortable columns (Name, Status, Last Attendance)
- Debounced global search (name, email, phone)
- Base filters (Status, Campus, Last Attendance)
- Default columns + loading/empty states
- URL state management (shareable filters)
 - Deep-linkable drawer pattern validated **[ARCH][UX-SYNC][REG]**

**Acceptance Criteria:**
- ✓ Search returns results ≤500ms after debounce
- ✓ Filters combine correctly (AND logic), URL updates
- ✓ Table handles 1000+ members without UI lag
- ✓ Skeleton loaders for initial render
 - ✓ Drawer URL deep-link loads member summary **[ARCH][UX-SYNC][REG]**

---

### Phase 2: Actionability (4-5 days)
**Goal:** Users can view details and take action without leaving page
- Member profile drawer (contact, groups, activity summary)
- Add/Edit member modal (core + custom fields)
- Row quick actions menu (view, edit, email)
- Bulk select + bulk actions (email, add to group, set status)
- Groups multiselect in modal
- Audit logging for create/update/bulk actions
 - Single-member archive uses Undo toast (soft delete + restore endpoint) **[ARCH][SEC][REG]**

**Acceptance Criteria:**
- ✓ Drawer opens ≤200ms, shows complete profile
- ✓ Modal validates required fields, saves successfully
- ✓ Bulk actions confirm, show progress, report failures
- ✓ Groups assignment persists correctly
 - ✓ Audit logs emitted for CRUD + bulk operations **[OBS][ARCH][REG]**
 - ✓ Undo archive restores member within 10s **[ARCH][SEC][REG]**

---

### Phase 3: Personalization & Views (2-3 days)
**Goal:** Users customize table to their workflow
- Column picker (show/hide, reorder core + custom fields)
- Saved views (personal scope, max 10)
- Default views (All Members, Recent Visitors, Needs Follow-up)
- Smart badges (New, Follow-up, Volunteer)
- localStorage persistence for columns + views
 - Deep-link preserves view state **[UX-SYNC][ARCH][REG]**

**Acceptance Criteria:**
- ✓ Column changes persist across sessions
- ✓ Saved views restore filters + columns + sort
- ✓ Badges render based on calculated fields
- ✓ UI updates immediately on view selection
 - ✓ Missing custom field in saved view handled gracefully **[REG]**

---

### Phase 4: Data Portability (2-3 days)
**Goal:** Users can import/export member data
- CSV export (filtered, includes selected custom fields)
- CSV import wizard (guided mapping for core fields)
- Dry-run preview with validation errors
- Bulk import (batch 100 rows, show progress)
- Export rate limiting (email link for >1000 members)
 - Consent checks before including sensitive columns (e.g., background check) **[SEC][ARCH][DB][REG]**

**Acceptance Criteria:**
- ✓ Export includes all visible columns + custom fields
- ✓ Import maps columns, validates, shows preview
- ✓ Import errors clearly indicate row + field + issue
- ✓ Large exports (>1000) send email notification
 - ✓ Import enforces required minimal identity fields & validates uniqueness constraints **[ARCH][DB][SEC][REG]**

---

## 7. Open Design Questions for UX Review

### Critical (Block Sprint Start)
1. **Filter Panel Affordance:** Should the collapsed filter panel show an icon-only rail with tooltips, or a slim button bar with text labels? (Impact: discoverability on <1440px screens)
2. **Bulk Email UX:** Should bulk email open an inline composer (in-page), a modal (overlay), or redirect to a dedicated comms page? (Impact: scope of email template system)
3. **Drawer vs. Full Page:** For complex member profiles (many custom fields, long activity history), should we offer a "View Full Profile" link that navigates to a dedicated page, or keep everything in the drawer with scrolling? (Impact: navigation paradigm)
4. **Custom Field Overload:** If a church enables all 16 optional fields, the Add/Edit modal and profile drawer become very long. Should we implement smart sectioning/tabs in the modal, or collapse sections by default? (Impact: form complexity)
  - Architecture Note: Sectioning may drive how extension field metadata is returned (grouped vs flat) **[ARCH][DB][REG]**.

### Important (Refine During Sprint)
5. **Badge Priority:** Which badge takes precedence if a member qualifies for multiple (e.g., New + Follow-up + Volunteer)? Show all 3, or primary only with tooltip for others?
6. **Empty Custom Fields:** In profile drawer, should we show empty custom fields with "—" placeholder, or hide them entirely unless they have a value?
7. **Groups in Table:** Should the "Groups Count" column be clickable to expand an inline popover with group names, or always open the drawer to see groups?
8. **Mobile Table Alternative:** Should mobile (<768px) render a card list instead of a table, or attempt responsive table with horizontal scroll? (Impact: mobile UX paradigm)

### Nice-to-Have (Post-MVP Consideration)
9. **Keyboard Power Users:** Should we implement advanced keyboard shortcuts (e.g., `G` + `A` for Add Member, `J`/`K` for row navigation) for admins who process many members daily?
10. **Inline Editing:** For simple field updates (e.g., change status), should we support inline editing directly in the table cell, or always require opening the modal?

---

## 8. Success Metrics & Analytics

### Instrumentation Points
- **Page Load:** Time to First Meaningful Paint (table skeleton visible)
- **Search:** Query latency (from debounce end to results render)
- **Filter Apply:** Time from last filter change to table update
- **Drawer Open:** Time from click to content visible
- **Bulk Action:** Success/failure rate, average items per action
- **Saved Views:** Creation rate, usage frequency per user
 - Architecture Notes: Define metric schema (`event`, `duration`, `tenantId`, optional `memberId`) **[OBS][ARCH][REG]**.

### Dashboard Metrics (Weekly Review)
- Median time-to-member (entry → profile view)
- Search effectiveness (% searches → profile within 30s)
- Filter utilization (% users applying ≥1 filter per session)
- Bulk action adoption (% admins using weekly)
- Saved views per active user (mean, median)
- P75 API latency for member list endpoint
 - Architecture Notes: Latency SLO may require index tuning (attendance date, status) **[DB][PERF][ARCH]**.

### Qualitative Feedback
- Post-launch survey (5 questions, 2 weeks after release)
- User interviews (5 admins, 2 pastors) at 30-day mark
- Support ticket themes related to members hub
 - Architecture Notes: Map recurring ticket themes to backlog/ADR updates **[ARCH][REG]**.

---

## 9. Technical Constraints & Dependencies

### Browser Support
- **Tier 1 (Full Support):** Chrome 90+, Safari 15+, Edge 90+, Firefox 88+
- **Tier 2 (Graceful Degradation):** Safari 14, older mobile browsers (no drawer animations, simplified filters)

### API Endpoints Required
- `GET /api/members?page=1&limit=25&sort=lastAttendance:desc&search=sarah&status=member,visitor` (paginated list)
- `GET /api/members/:id` (single member detail)
- `POST /api/members` (create member)
- `PATCH /api/members/:id` (update member)
- `DELETE /api/members/:id` (soft delete)
- `POST /api/members/bulk` (bulk actions: email, addToGroup, setStatus, etc.)
- `GET /api/members/export?filters=...` (CSV export)
- `POST /api/members/import` (CSV import with validation)
 - Potential: `POST /api/members/:id/restore` (Undo archive) **[ARCH][REG][SEC]**
 - Potential: `GET/POST /api/users/me/saved-views` (persist personalized views) **[ARCH][REG]**
 - Potential: `GET /api/members/:id/summary` (optimized lightweight drawer prefetch) **[ARCH][PERF][REG]**

### External Dependencies
- **Email Provider:** Requires SMTP or SendGrid/Mailgun integration (check if configured, disable email actions if not)
- **SMS Provider:** Twilio or similar (deferred to Phase 4 if not configured)
- **Custom Fields Schema:** Church settings API must expose enabled custom fields + types
 - Architecture Notes: Consider schema versioning for custom fields to prevent stale client config **[ARCH][DB][REG]**.

### Performance Budget
- **Bundle Size:** Members page JS ≤150KB gzipped
- **First Load:** ≤2s on 4G connection (LCP metric)
- **Interaction Latency:** P75 ≤200ms (INP metric)
 - Architecture Notes: Introduce performance budgets in CI (e.g., Web Vitals thresholds) **[PERF][ARCH][REG]**.

---

## 10. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Custom fields N+1 queries** | High (slow table render) | Medium | Single metadata query cached per request (churchId) + projection-based member query |
| **Bulk action email rate limits** | Medium (failed sends) | High | Queue emails in batches, respect provider rate limits, show partial success |
| **Search performance at scale (10k+ members)** | High (poor UX) | Medium | Index firstName, lastName, email, phone; limit search to text/number custom fields; consider Elasticsearch for large datasets |
| **Drawer content overflow (many groups/custom fields)** | Low (visual clutter) | High | Collapse sections by default, max 5 items with "+ N more" links |
| **Saved views invalid after custom field removed** | Medium (confusion) | Low | Gracefully omit missing fields, show notice in view selector |
| **Mobile table unusable on small screens** | High (mobile users blocked) | Medium | Switch to card list on <768px, test on real devices |
| **Bulk select across pages** | Medium (unexpected behavior) | Low | Clearly communicate "Select All" only selects current page, add "Select All [N] Members" link |
| **Undo archive race conditions** | Medium (data inconsistency) | Low | Idempotent restore endpoint & short-lived cache entry **[ARCH][SEC][REG]** |
| **Import data integrity issues** | High (corrupted records) | Medium | Pre-validation + transactional batch inserts with rollback **[ARCH][DB][REG][SEC]** |
| **Background check privacy leakage** | High (compliance risk) | Low | Role-gated field exposure + audit logging on access **[SEC][ARCH][DB][REG]** |
| **Bulk email rate limiting** | Medium (failed sends) | High | Queue + provider throttle awareness + retry/backoff **[ARCH][PERF][REG]** |
| **Saved view stale after schema changes** | Low (confusion) | Medium | Schema version tagging + automatic view migration **[ARCH][DB][REG]** |

---

## Appendix A: Wireframe References

*(Note: Placeholder for designer to attach Figma/Sketch mockups)*

- Members table with filter panel (desktop)
- Member profile drawer (expanded sections)
- Add/Edit member modal (all tabs)
- Mobile card list view
- Bulk actions confirmation modal
- Empty states (no members, no search results)

---

## Appendix B: Competitive Analysis

### Benchmark: Planning Center People (Industry Leader)
**Strengths:**
- Lightning-fast search with instant results
- Powerful saved lists (equivalent to our saved views)
- Inline editing for quick updates
- Rich profile pages with tabs (giving, attendance, groups, forms)

**Gaps (Opportunities for Us):**
- Complex filter UI (overwhelming for small churches)
- No bulk SMS (requires separate integration)
- Limited custom fields (rigid schema)

**Our Differentiators:**
- Simpler, more focused filter panel for small-to-medium churches
- Church-configurable custom fields (16 optional fields)
- Unified comms (email + SMS in one interface, if provider configured)
- Free/open-source (if applicable to product strategy)

---

## Document Changelog
- **v1.1.0** (8 Nov 2025): Added Architecture Impact Legend, Phase 0 UX Framework & Primitives, inline Architecture Notes/indicators across sections, expanded acceptance criteria, additional risk entries, and metrics/observability notes.
- **v1.0.0** (8 Nov 2025): Initial draft for UX review, includes full feature scope, interaction patterns, phasing, and open design questions

---

**Next Steps:**
1. UX Designer reviews document, creates wireframes/mockups for critical flows
2. Design review session to resolve open questions (Section 7)
3. Engineer reviews technical feasibility, estimates effort per phase
4. Product Owner finalizes sprint plan with approved scope
5. Architect creates technical architecture document (API design, data flow, performance optimization)

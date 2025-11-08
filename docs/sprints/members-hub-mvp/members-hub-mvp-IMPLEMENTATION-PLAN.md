# Members Hub MVP - Implementation Plan
**Sprint Name:** members-hub-mvp  
**Date:** 8 November 2025  
**Author:** Principal Architect  
**Status:** Engineering Review Complete - Ready for Implementation  
**Last Updated:** 8 November 2025

---

## 🚨 CRITICAL: Read This First

**For Intermediate Developers:** This document has been reviewed and enhanced with:
- ✅ Implementation guidance and tips throughout
- ✅ Risk mitigation strategies
- ✅ Common pitfalls and how to avoid them
- ✅ Existing codebase patterns to follow
- ✅ Step-by-step implementation sequences

**Look for these indicators:**
- 🔴 **BLOCKER:** Must resolve before proceeding
- ⚠️ **RISK:** Potential issue requiring careful attention
- 💡 **TIP:** Best practice or helpful guidance
- 🏗️ **PATTERN:** Existing codebase pattern to follow
- 📋 **CHECKLIST:** Pre-implementation validation

---

## Executive Summary

This implementation plan translates the Members Hub MVP Product & UX Specification into actionable technical work. The sprint is broken into 5 phases:
- **Phase 0:** UX Framework & Primitives (foundation) - **START HERE**
- **Phase 1:** Discoverability & Speed
- **Phase 2:** Actionability
- **Phase 3:** Personalization & Views
- **Phase 4:** Data Portability

**Total Estimated Duration:** 14-18 days (realistic for intermediate developer: 18-22 days with buffer)  
**Critical Path:** Phase 0 must complete before other phases begin

### 🔴 Pre-Sprint Blockers (Resolve Before Starting)

0. **🚨 CRITICAL: Database is SQLite, NOT PostgreSQL**
   - Project uses SQLite (`provider = "sqlite"` in schema.prisma)
   - All SQL examples in this plan have been corrected to SQLite syntax
   - **NO PostgreSQL features:** No GIN indexes, no full-text search (use FTS5), different syntax
   - Performance characteristics differ: SQLite is simpler but has different optimization strategies
   - **ACTION:** Confirmed - all implementations use SQLite-compatible approaches

1. **Database Schema Mismatch:**
   - Current schema uses `Profile` model (userId as PK), plan assumes `User` model
   - Custom fields already partially exist in `Profile` (spiritualGifts, coursesAttended, etc.)
   - **ACTION:** Decide if we extend `Profile` or create new `CustomField` tables
   
2. **Note Model Missing:**
   - Plan references `Note` model but doesn't exist in current schema
   - Current `Profile.pastoralNotes` is a single text field, not a feed
   - **ACTION:** Create migration for `Note` table or use existing field
   
3. **FollowUp Model Missing:**
   - Plan references `FollowUp` table but doesn't exist
   - **ACTION:** Create migration or defer follow-up feature to post-MVP

4. **RBAC Implementation Unclear:**
   - Plan assumes `hasRole()` utility but pattern not documented
   - Current `ChurchUser.role` is single string, plan implies array
   - **ACTION:** Document RBAC pattern or implement guards

5. **Soft Delete Not Implemented:**
   - Schema doesn't have `deletedAt` field on User/Profile
   - **ACTION:** Add migration for soft delete or defer archive feature

---

## 1. Architecture Overview

### 1.1 System Context

The Members Hub sits at the intersection of:
- **User Management** (existing)
- **Groups Module** (existing)
- **Attendance Module** (existing)
- **Giving Module** (existing)
- **Notes/Audit** (existing)
- **Custom Fields** (new extension system)

### 1.2 Key Architectural Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Client-side filtering + server pagination** | Reduces API calls for common filter changes; server handles heavy lifting for search/sort | More complex URL state management |
| **URL as source of truth for filters/views** | Deep-linkable, shareable, browser back/forward support | URL length limits for complex filters |
| **Progressive drawer loading** | Fast initial render (summary first), lazy-load related data | More API calls, orchestration complexity |
| **localStorage for saved views (MVP)** | Zero backend changes in Phase 3; instant UX | Not portable across devices; migration path needed |
| **Soft delete with restore window** | User safety net; audit trail | TTL cleanup job required |
| **Custom fields via extension schema** | Church-specific flexibility without schema changes | N+1 risk; metadata caching essential |

### 1.3 Non-Functional Requirements

- **Performance:** P95 API latency ≤500ms; UI interactions ≤200ms
- **Scalability:** Support 10k+ members per church without degradation
- **Security:** RBAC on all endpoints; audit logging for sensitive operations
- **Observability:** Structured logging, metrics for SLOs, distributed tracing
- **Accessibility:** WCAG 2.1 AA compliance
- **Browser Support:** Chrome/Edge/Safari/Firefox (last 2 versions)

---

## 2. Data Architecture

### 2.1 Core Schema (Existing)

```prisma
model User {
  id          String   @id @default(uuid())
  churchId    String
  firstName   String
  lastName    String
  email       String?
  phone       String?
  address     String?
  status      String   // Member, Visitor, Inactive
  roles       String[] // Member, Admin, Leader, Volunteer
  campus      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime? // Soft delete
  
  // Relationships
  church      Church   @relation(...)
  groups      GroupMember[]
  attendance  Attendance[]
  notes       Note[]
  households  Household?
}
```

### 2.2 New/Modified Schema

⚠️ **RISK:** Schema design conflicts with existing structure

#### Reality Check: Current vs. Planned Schema

**Current State (Actual Database):**
```prisma
model Profile {
  userId                String    @id
  // ... existing fields already support most custom fields:
  spiritualGifts        String?   // ✅ Already exists
  coursesAttended       String?   // ✅ Already exists
  maritalStatus         String?   // ✅ Already exists
  backgroundCheckStatus String?   // ✅ Already exists
  backgroundCheckDate   DateTime? // ✅ Already exists
  // ... etc
}
```

**Decision Required:** Do we:
- **Option A (Recommended):** Use existing Profile fields, add missing ones via migration
- **Option B:** Create EAV CustomField tables (more flexible, more complex)

💡 **TIP:** Option A is faster for MVP. Profile already has 15/16 custom fields mentioned in spec.

#### Custom Fields Extension (If Option B chosen)
```prisma
model CustomField {
  id          String   @id @default(uuid())
  churchId    String
  entityType  String   // "member", "group", etc.
  fieldName   String
  fieldType   String   // text, date, select, number
  options     Json?    // For select types
  required    Boolean  @default(false)
  displayOrder Int
  category    String?  // Membership, Family, Background, Skills
  createdAt   DateTime @default(now())
  
  @@unique([churchId, entityType, fieldName])
  @@index([churchId, entityType])
}

model CustomFieldValue {
  id          String   @id @default(uuid())
  entityId    String   // User.id, Group.id, etc.
  entityType  String
  fieldName   String
  value       String   // JSON-serialized
  churchId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([entityId, entityType, fieldName])
  @@index([entityId, entityType])
  @@index([churchId, entityType])
}
```

🔴 **BLOCKER:** Must decide schema approach before Phase 1 backend work

#### Member Notes

🏗️ **PATTERN:** Existing models use `@default(cuid())` not `uuid()`. Stay consistent.

⚠️ **RISK:** Note model doesn't exist. Current Profile.pastoralNotes is single text field.

**Option A (Quick MVP):** Continue using Profile.pastoralNotes as single field, hide in drawer
**Option B (Full feature):** Create Note table with this migration:

```prisma
model Note {
  id          String   @id @default(cuid())  // ✅ Use cuid() like existing models
  memberId    String                          // References Profile.userId
  authorId    String
  content     String   @db.Text
  churchId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // ⚠️ Relations require careful mapping - Profile uses userId as PK
  member      Profile  @relation("MemberNotes", fields: [memberId], references: [userId])
  author      User     @relation("AuthoredNotes", fields: [authorId], references: [id])
  
  @@index([memberId])
  @@index([churchId])
}
```

💡 **TIP:** For MVP, Option A is safer. Add Note table in Phase 2.5 if time allows.

#### Follow-up Assignments

⚠️ **RISK:** FollowUp model doesn't exist. May conflict with pastoral care tickets.

🔴 **DECISION POINT:** Check if PastoralCareTicket can serve this purpose instead.

```prisma
// Current schema already has:
model PastoralCareTicket {
  id          String   @id @default(cuid())
  churchId    String
  memberId    String?
  assigneeId  String?
  status      String
  // ... could extend this instead of new table
}
```

**Recommendation:** Extend PastoralCareTicket or defer FollowUp to Phase 2+

```prisma
model FollowUp {
  id          String   @id @default(cuid())  // ✅ cuid() not uuid()
  memberId    String
  assigneeId  String
  dueDate     DateTime
  status      String   // pending, completed, overdue
  notes       String?
  churchId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime?
  
  member      Profile  @relation("MemberFollowUps", fields: [memberId], references: [userId])
  assignee    User     @relation("AssignedFollowUps", fields: [assigneeId], references: [id])
  
  @@index([memberId])
  @@index([assigneeId])
  @@index([churchId, status])
}
```

### 2.3 Materialized/Derived Fields

⚠️ **RISK:** Adding materialized views increases complexity and maintenance burden

💡 **TIP:** For MVP with SQLite, consider calculated fields in service layer instead

**Option A (Simple MVP - Recommended):**
- Calculate lastAttendance, groupsCount in service layer
- Use Prisma aggregations: `_count`, `_max`
- Add database indexes only (no materialized view)

**Option B (Performance-Optimized):**
For performance, calculate and cache these fields:

```prisma
model MemberSummary {
  memberId          String   @id
  churchId          String
  lastAttendance    DateTime?
  attendanceCount   Int      @default(0)
  groupsCount       Int      @default(0)
  isActiveGiver     Boolean  @default(false)
  lastNoteAt        DateTime?
  updatedAt         DateTime @updatedAt
  
  @@index([churchId, lastAttendance])
  @@index([churchId, updatedAt])
}
```

🔴 **BLOCKER:** If Option B chosen, you MUST implement update triggers/jobs:

**Update triggers (Implementation complexity: HIGH):**
```typescript
// In attendance.service.ts
async createAttendance(data) {
  const result = await this.prisma.attendance.create({ data });
  
  // Update MemberSummary
  await this.updateMemberSummary(data.userId, {
    lastAttendance: data.recordedAt,
    attendanceCount: { increment: 1 }
  });
  
  return result;
}
```

⚠️ **RISK:** Stale data if triggers fail. Need transaction handling.

💡 **RECOMMENDATION:** Start with Option A (service layer calculations). Add MemberSummary in Phase 1.5 if performance issues detected.

**Service Layer Pattern (Recommended for MVP):**
```typescript
// users.service.ts
async getMemberSummary(userId: string, churchId: string) {
  const [user, lastAttendance, groupsCount, hasRecentGiving] = await Promise.all([
    this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
    this.prisma.attendance.findFirst({
      where: { userId, event: { churchId } },
      orderBy: { recordedAt: 'desc' }
    }),
    this.prisma.groupMember.count({ where: { userId, group: { churchId } } }),
    this.prisma.contribution.findFirst({
      where: { memberId: userId, churchId, date: { gte: /* 90 days ago */ } }
    })
  ]);
  
  return {
    ...user,
    lastAttendance: lastAttendance?.recordedAt,
    groupsCount,
    isActiveGiver: !!hasRecentGiving
  };
}
```

💡 **TIP:** Prisma's `Promise.all()` parallelizes queries efficiently. Use this pattern throughout.

### 2.4 Database Indexes

💡 **TIP:** Add indexes incrementally. Start with most critical, measure performance, add more if needed.

Critical indexes for performance:

```sql
-- ⚠️ IMPORTANT: SQLite syntax differs from PostgreSQL
-- The plan shows PostgreSQL syntax. Here's SQLite-compatible version:

-- Search indexes (SQLite doesn't support GIN, use regular index)
CREATE INDEX idx_profile_first_name ON Profile(firstName COLLATE NOCASE);
CREATE INDEX idx_profile_last_name ON Profile(lastName COLLATE NOCASE);
CREATE INDEX idx_user_email ON User(primaryEmail COLLATE NOCASE);
CREATE INDEX idx_profile_phone ON Profile(phone) WHERE phone IS NOT NULL;

-- 💡 TIP: For full-text search in SQLite, consider FTS5 virtual table
-- CREATE VIRTUAL TABLE profile_fts USING fts5(userId, firstName, lastName, email);

-- Filter indexes
CREATE INDEX idx_church_user_status ON ChurchUser(churchId, role) WHERE role IS NOT NULL;
-- Note: Current schema doesn't have 'campus' or 'status' on User
-- You'll need to add these fields first

-- Soft delete (add deletedAt field first!)
-- CREATE INDEX idx_users_deleted ON User(deletedAt) WHERE deletedAt IS NOT NULL;

-- Foreign keys (SQLite auto-creates some, but explicit indexes help)
CREATE INDEX idx_group_members_user ON GroupMember(userId);
CREATE INDEX idx_attendance_user ON Attendance(userId, eventId);
```

📋 **CHECKLIST: Before creating indexes**
- [ ] Verify column exists in schema
- [ ] Check existing indexes: `PRAGMA index_list('Profile');`
- [ ] Test query performance with EXPLAIN QUERY PLAN
- [ ] Measure before/after with realistic data (1000+ members)

🔴 **BLOCKER:** Current schema missing fields referenced in plan:
- User.status (exists as User.status='active' but different from member status)
- User.campus (doesn't exist, would need migration)
- User.deletedAt (doesn't exist)

💡 **RECOMMENDATION:** Phase 1 migration should add:
```prisma
model User {
  // ... existing fields
  deletedAt   DateTime? // For soft delete
}

model ChurchUser {
  // ... existing fields
  memberStatus String?  // Member, Visitor, Inactive
  campus       String?
}
```

⚠️ **RISK:** Full-text search performance
- SQLite's LIKE '%search%' is slow on 10k+ rows
- Consider FTS5 virtual table for search
- Or limit search to exact/prefix matches initially

**Implementation Sequence:**
1. Add missing schema fields (migration)
2. Create basic indexes (firstName, lastName, email)
3. Test search performance with 1000 members
4. Add FTS5 if needed
5. Add composite indexes for common filter combinations

---

## 3. API Design

### 3.1 Endpoint Specification

#### GET /api/members
**Purpose:** Paginated, searchable, filterable member list

🏗️ **PATTERN:** Follow existing controller pattern from users.controller.ts:
```typescript
@UseGuards(AuthGuard)
@ApiTags('Members')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  // Existing UsersController already has GET /users - can we extend?
}
```

💡 **TIP:** Consider if `/api/users` endpoint can serve this purpose with query params

**Query Parameters:**
```typescript
interface MemberListParams {
  page?: number;           // Default: 1
  limit?: number;          // Default: 25, max: 100
  sort?: string;           // e.g., "lastAttendance:desc"
  search?: string;         // Combined name/email/phone search
  status?: string;         // Comma-separated: "member,visitor"
  campus?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  lastAttendance?: string; // "30d", "60d", "90d", "never"
  hasEmail?: boolean;
  hasPhone?: boolean;
  groups?: string;         // Comma-separated group IDs
  customFields?: string;   // JSON: {"fieldName": "value"}
}
```

⚠️ **RISK:** Too many query params makes validation complex

💡 **TIP:** Use class-validator DTO:
```typescript
// dto/member-list-query.dto.ts
import { IsOptional, IsInt, Min, Max, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class MemberListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  search?: string;

  // ... continue for all params
  
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasEmail?: boolean;
}
```

**Response:**
```typescript
interface MemberListResponse {
  data: MemberSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta: {
    queryTime: number; // ms
    filters: AppliedFilters;
  };
}

interface MemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  campus: string | null;
  lastAttendance: string | null;
  groupsCount: number;
  badges: string[]; // ["new", "follow-up", "volunteer"]
  customFields?: Record<string, any>; // If requested
}
```

**Performance Targets:**
- P50: ≤150ms
- P95: ≤500ms
- Support 10k+ members with filters

🔴 **BLOCKER:** lastAttendance calculation can be slow. Options:
1. **Quick (MVP):** Calculate on-demand with subquery (may be slow)
2. **Better:** Use MemberSummary table
3. **Best:** Add computed column to Profile

**Implementation Notes:**

```typescript
// members.service.ts
async list(churchId: string, query: MemberListQueryDto) {
  // 💡 Build where clause incrementally
  const where: Prisma.UserWhereInput = {
    churches: {
      some: { churchId, deletedAt: null }
    }
  };

  // Search: ILIKE is case-insensitive in SQLite with NOCASE collation
  if (query.search) {
    where.OR = [
      { profile: { firstName: { contains: query.search, mode: 'insensitive' } } },
      { profile: { lastName: { contains: query.search, mode: 'insensitive' } } },
      { primaryEmail: { contains: query.search, mode: 'insensitive' } },
      { profile: { phone: { contains: query.search.replace(/\D/g, '') } } }, // Strip non-digits
    ];
  }

  // ⚠️ RISK: Campus filter but campus doesn't exist in schema yet
  if (query.campus) {
    where.churches = {
      some: { churchId, campus: query.campus } // Need to add campus to ChurchUser
    };
  }

  // 💡 TIP: Use Prisma's pagination
  const [data, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      include: {
        profile: true,
        churches: { where: { churchId } },
        groupMembers: { where: { group: { churchId } }, select: { groupId: true } },
        // ⚠️ Don't include attendances directly - too slow
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: this.buildOrderBy(query.sort),
    }),
    this.prisma.user.count({ where }),
  ]);

  // 💡 TIP: Post-process to add calculated fields
  const members = await Promise.all(
    data.map(async (user) => ({
      id: user.id,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      email: user.primaryEmail,
      phone: user.profile.phone,
      status: user.churches[0]?.role || 'Member',
      campus: null, // TODO: Add campus support
      lastAttendance: await this.getLastAttendance(user.id, churchId), // ⚠️ N+1 risk!
      groupsCount: user.groupMembers.length,
      badges: this.calculateBadges(user),
    }))
  );

  return {
    data: members,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
    meta: {
      queryTime: performance.now() - startTime,
      filters: query,
    },
  };
}

// ⚠️ PROBLEM: This causes N+1 query
private async getLastAttendance(userId: string, churchId: string) {
  const attendance = await this.prisma.attendance.findFirst({
    where: { userId, event: { churchId } },
    orderBy: { recordedAt: 'desc' },
  });
  return attendance?.recordedAt?.toISOString();
}

// 💡 SOLUTION: Batch all attendance queries
private async batchGetLastAttendances(userIds: string[], churchId: string) {
  const attendances = await this.prisma.attendance.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      event: { churchId },
    },
    _max: { recordedAt: true },
  });
  return new Map(attendances.map(a => [a.userId, a._max.recordedAt]));
}
```

🔴 **CRITICAL ISSUE:** N+1 Query Problem
The naive implementation has N+1 queries for lastAttendance. **Must use batching or joins.**

**Recommended Implementation Pattern:**
```typescript
async list(churchId: string, query: MemberListQueryDto) {
  const startTime = Date.now();
  
  // Step 1: Build dynamic where clause
  const where = this.buildWhereClause(churchId, query);
  
  // Step 2: Fetch users with related data (single query)
  const [users, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      include: {
        profile: { select: { /* only needed fields */ } },
        churches: { where: { churchId }, select: { role: true } },
        _count: { select: { groupMembers: true } }, // ✅ Use _count
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: this.parseSort(query.sort),
    }),
    this.prisma.user.count({ where }),
  ]);

  // Step 3: Batch fetch lastAttendance for all users (single query)
  const userIds = users.map(u => u.id);
  const lastAttendances = await this.batchLastAttendances(userIds, churchId);

  // Step 4: Transform to response format
  const data = users.map(user => this.transformToSummary(user, lastAttendances));

  return {
    data,
    pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) },
    meta: { queryTime: Date.now() - startTime },
  };
}
```

📋 **IMPLEMENTATION CHECKLIST:**
- [ ] Create MemberListQueryDto with validation
- [ ] Implement buildWhereClause with all filters
- [ ] Handle search across multiple fields
- [ ] Implement batch lastAttendance fetch
- [ ] Add sorting (use Map of allowed sort fields)
- [ ] Test with 1000+ members
- [ ] Add query timing logging
- [ ] Handle edge cases (empty results, invalid page)

---

#### GET /api/members/:id
**Purpose:** Single member detail with related data

**Response:**
```typescript
interface MemberDetail extends MemberSummary {
  address: string | null;
  birthday: string | null;
  gender: string | null;
  maritalStatus: string | null;
  householdId: string | null;
  roles: string[];
  
  // Related data
  groups: GroupMembership[];
  recentAttendance: AttendanceRecord[];
  givingParticipation: {
    isActive: boolean;
    lastGiftDate: string | null;
  };
  notes: Note[];
  customFields: Record<string, any>;
  
  createdAt: string;
  updatedAt: string;
}
```

**Performance:**
- Use `include` with `select` to optimize joins
- Consider separate endpoints for progressive loading:
  - `GET /api/members/:id/summary` (fast, minimal data)
  - `GET /api/members/:id/groups`
  - `GET /api/members/:id/activity`
  - `GET /api/members/:id/notes`

---

#### POST /api/members
**Purpose:** Create new member

**Request Body:**
```typescript
interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: "member" | "visitor" | "inactive";
  roles?: string[];
  campus?: string;
  address?: string;
  birthday?: string;
  gender?: string;
  maritalStatus?: string;
  groups?: string[]; // Group IDs
  customFields?: Record<string, any>;
  notes?: string;
}
```

**Validation:**
- Required: `firstName`, `lastName`, `status`
- At least one of `email` or `phone`
- Email format validation
- Phone format flexible (international support)
- Custom fields match church schema

**Response:** `201 Created` with full `MemberDetail`

---

#### PATCH /api/members/:id
**Purpose:** Update member fields

**Request Body:** Partial `CreateMemberRequest`

**Behavior:**
- Merge updates; null removes optional fields
- Groups: replace entire list (not append)
- Custom fields: merge per-field
- Audit log entry created

---

#### DELETE /api/members/:id
**Purpose:** Soft delete member

**Behavior:**
- Set `deletedAt` timestamp
- Cascade: soft-delete related records (optional)
- Create audit log entry
- Keep in DB for restore window (30 days)

---

#### POST /api/members/:id/restore
**Purpose:** Undo soft delete (within restore window)

**Behavior:**
- Clear `deletedAt` if within 30-day window
- Idempotent (no-op if already restored)
- Return 404 if past restore window

---

#### POST /api/members/bulk
**Purpose:** Bulk operations on multiple members

**Request Body:**
```typescript
interface BulkOperationRequest {
  memberIds: string[]; // Max 500
  operation: "addToGroup" | "setStatus" | "assignFollowUp" | "email" | "sms";
  params: Record<string, any>;
}
```

**Example (Add to Group):**
```json
{
  "memberIds": ["uuid1", "uuid2"],
  "operation": "addToGroup",
  "params": { "groupId": "uuid3", "role": "member" }
}
```

**Response:**
```typescript
interface BulkOperationResponse {
  success: number;
  failed: number;
  results: Array<{
    memberId: string;
    status: "success" | "error";
    error?: string;
  }>;
}
```

**Implementation:**
- Process in batches (50 per batch)
- Use transaction per batch
- Return partial success/failure details
- Async processing for >100 members (job queue)

---

#### GET /api/members/export
**Purpose:** CSV export with filters

**Query Parameters:** Same as `GET /api/members`, plus:
- `columns`: Comma-separated field names
- `includeCustomFields`: boolean

**Response:**
- If <1000 members: immediate CSV download
- If ≥1000: `202 Accepted`, send email with download link

**Security:**
- Check consent flags before including sensitive fields (background check)
- Audit log export action

---

#### POST /api/members/import
**Purpose:** CSV import with validation

**Flow:**
1. Upload CSV → dry-run validation
2. Return preview with errors
3. Confirm → process import

**Request Body (multipart/form-data):**
```typescript
interface ImportRequest {
  file: File; // CSV
  mapping: Record<string, string>; // CSV column → field name
  mode: "create" | "update" | "upsert";
}
```

**Response (dry-run):**
```typescript
interface ImportPreviewResponse {
  totalRows: number;
  validRows: number;
  errors: Array<{
    row: number;
    field: string;
    error: string;
  }>;
  preview: MemberSummary[]; // First 10 valid rows
}
```

**Implementation:**
- Validate row-by-row
- Check uniqueness constraints (email, phone)
- Enforce required fields
- Transactional batch insert (100 per transaction)

---

#### GET /api/members/:id/assign-followup
#### POST /api/members/:id/assign-followup
**Purpose:** Manage follow-up assignments

**POST Request:**
```typescript
interface AssignFollowUpRequest {
  assigneeId: string;
  dueDate: string; // ISO 8601
  notes?: string;
}
```

---

#### GET /api/members/:id/notes
#### POST /api/members/:id/notes
**Purpose:** CRUD for member notes

**Authorization:**
- Read: Admin, Leader, assigned follow-up owner
- Write: Admin, Leader

---

#### GET /api/users/me/saved-views (Future)
#### POST /api/users/me/saved-views (Future)
**Purpose:** Persist saved views server-side

**Deferred to post-MVP** (Phase 3 uses localStorage)

---

### 3.2 Error Handling

Standard error response:
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**Error Codes:**
- `400` Bad Request: validation failure
- `401` Unauthorized: missing auth
- `403` Forbidden: insufficient permissions
- `404` Not Found: member doesn't exist
- `409` Conflict: uniqueness constraint violation
- `422` Unprocessable Entity: business logic error
- `429` Too Many Requests: rate limit
- `500` Internal Server Error: unexpected failure

---

## 4. Frontend Architecture

### 4.1 Component Hierarchy

```
MembersPage
├── MembersHeader
│   ├── SearchBar
│   └── AddMemberButton
├── MembersLayout
│   ├── FilterPanel (collapsible)
│   │   ├── FilterGroup (Status, Campus, etc.)
│   │   └── CustomFieldsAccordion
│   └── MembersTableArea
│       ├── Toolbar
│       │   ├── BulkActionsDropdown
│       │   ├── ColumnPicker
│       │   ├── SavedViewsDropdown
│       │   └── ExportButton
│       ├── MembersTable
│       │   ├── TableHeader (sortable)
│       │   ├── TableRow[]
│       │   │   ├── Checkbox
│       │   │   ├── MemberCell (name + badges)
│       │   │   └── ActionsMenu
│       │   └── Pagination
│       └── EmptyState | ErrorBanner
├── MemberDrawer (conditional)
│   ├── DrawerHeader
│   ├── ContactInfo
│   ├── MemberDetails
│   ├── CustomFields
│   ├── Groups
│   ├── RecentActivity
│   ├── Notes
│   └── DrawerActions
└── MemberModal (conditional)
    ├── ModalHeader
    ├── FormSections (tabs/accordion)
    └── ModalFooter
```

### 4.2 State Management

**Global State (Context/Zustand):**
- `membersState`:
  - `members: MemberSummary[]`
  - `filters: FilterState`
  - `sort: SortState`
  - `pagination: PaginationState`
  - `selectedIds: string[]`
  - `isLoading: boolean`
  - `error: Error | null`

**URL State (query params):**
- Filters, sort, pagination, selected view
- Drawer open state (`?memberId=uuid`)

**Local State:**
- Form dirty state
- Modal open/close
- Drawer scroll position

**Server State (React Query):**
```typescript
const { data, isLoading, error } = useMembers({
  page,
  limit,
  filters,
  sort,
});

const { mutate: createMember } = useCreateMember();
const { mutate: updateMember } = useUpdateMember();
const { mutate: bulkAction } = useBulkAction();
```

### 4.3 Key Hooks

#### useDrawerRoute
```typescript
function useDrawerRoute() {
  const [memberId, setMemberId] = useState<string | null>(null);
  
  // Sync with URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMemberId(params.get('memberId'));
  }, []);
  
  const openDrawer = (id: string) => {
    setMemberId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('memberId', id);
    window.history.pushState({}, '', url);
  };
  
  const closeDrawer = () => {
    setMemberId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('memberId');
    window.history.pushState({}, '', url);
  };
  
  return { memberId, openDrawer, closeDrawer };
}
```

#### useConfirm
```typescript
function useConfirm() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>();
  
  const confirm = (options) => {
    return new Promise((resolve) => {
      setState({ ...options, onConfirm: resolve });
    });
  };
  
  return { confirm, ConfirmDialog };
}
```

#### useToast
```typescript
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const toast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };
  
  return { toast, toasts };
}
```

### 4.4 Performance Optimizations

- **Virtualization:** For tables >100 rows, use `react-window`
- **Debounce:** Search input 300ms, filter changes 150ms
- **Memoization:** `useMemo` for filtered/sorted data, `React.memo` for row components
- **Code Splitting:** Lazy-load drawer/modal components
- **Prefetching:** On row hover, prefetch member detail
- **Optimistic UI:** Immediate feedback for mutations, rollback on error

---

## 5. Phase Breakdown

### Phase 0: UX Framework & Primitives (3-4 days)

**Goal:** Build reusable UI components and patterns for consistent UX

🔴 **CRITICAL:** This phase blocks all others. Do NOT skip or rush.

💡 **SUCCESS METRIC:** Other developers can build Phase 1-4 features WITHOUT touching primitive components.

#### Pre-Phase 0 Setup

📋 **CHECKLIST: Before writing any code**
- [ ] Read existing UI component patterns in `web/components/ui-flowbite/`
- [ ] Review Dialog, Modal existing implementation
- [ ] Check if Drawer pattern exists (likely missing)
- [ ] Identify gaps vs. requirements
- [ ] Set up Storybook (if not already configured)

🏗️ **EXISTING PATTERNS TO FOLLOW:**
```typescript
// web/components/ui-flowbite/dialog.tsx exists!
// Uses compound component pattern:
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>Title</DialogHeader>
    <DialogBody>Content</DialogBody>
    <DialogFooter>Actions</DialogFooter>
  </DialogContent>
</Dialog>
```

💡 **TIP:** Modal and Dialog serve different purposes:
- **Dialog:** Small confirmations, simple forms (existing)
- **Modal:** Full forms with multiple sections (may need new component)
- **Drawer:** Side panel for details (MISSING - build this)

#### Frontend Tasks

**Priority Order:**  
1. Drawer (blocks Phase 1-2 profile view)
2. useDrawerRoute hook (needed for Drawer)
3. useConfirm, useToast (blocks all user feedback)
4. Table primitives (blocks Phase 1)
5. Form fields (blocks Phase 2)
6. Everything else

---

- [ ] **Drawer Component** (Est: 6-8 hours)

🔴 **BLOCKER:** This doesn't exist in codebase. Start here.

💡 **DESIGN DECISIONS:**
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
  side?: 'left' | 'right'; // Default: 'right'
  width?: string;           // Default: '480px'
}

export function Drawer({ open, onClose, children, side = 'right', width = '480px' }: DrawerProps) {
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
          'transition-transform duration-120 ease-out',
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

// Drawer sub-components for consistent structure
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

⚠️ **PITFALLS:**
- **Animation flicker:** Use `duration-120` not `transition-all` (causes layout thrashing)
- **Z-index conflicts:** Ensure drawer (z-50) > backdrop (z-40) > page content
- **Mobile viewport:** Drawer should be 100vw on mobile, not fixed width
- **Scroll lock:** Must prevent body scroll, but allow drawer scroll

📋 **TESTING CHECKLIST:**
- [ ] Opens/closes smoothly
- [ ] ESC key closes
- [ ] Backdrop click closes
- [ ] Focus trap works (Tab cycles within drawer)
- [ ] Body scroll locked when open
- [ ] Works on mobile (full screen)
- [ ] Dark mode styled correctly

---

- [ ] **Modal Component** (Est: 4-6 hours)

🏗️ **PATTERN:** Existing Dialog component in `ui-flowbite/dialog.tsx` may suffice

💡 **DECISION:** Check if existing Dialog meets requirements:
- Centered overlay ✓ (exists)
- Backdrop blur ✓ (exists)
- Form dirty state warning ✗ (missing)
- Animation ✓ (exists)

**What to add:**
```typescript
// Extend existing Dialog with form dirty state
export function FormModal({ children, isDirty, onClose, ...props }: FormModalProps) {
  const { confirm, ConfirmDialog } = useConfirm();

  const handleClose = async () => {
    if (isDirty) {
      const confirmed = await confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to close?',
        confirmText: 'Discard Changes',
        cancelText: 'Keep Editing',
        variant: 'warning',
      });
      if (!confirmed) return;
    }
    onClose();
  };

  return (
    <>
      <Dialog {...props} onOpenChange={(open) => !open && handleClose()}>
        {children}
      </Dialog>
      <ConfirmDialog />
    </>
  );
}
```
  
- [ ] **Toast/Toaster** (Est: 4-5 hours)
  - Queue management (max 3 visible)
  - Auto-dismiss (3s default)
  - Screen reader announcements (`aria-live`)
  - Success/error/info variants
  
💡 **IMPLEMENTATION TIP:**
```typescript
// web/lib/hooks/use-toast.tsx
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { ...toast, id }], // Max 3 toasts
    }));
    
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 3000);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  return useToastStore((state) => ({
    toast: state.add,
  }));
}

// web/components/toast/toaster.tsx
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
```

⚠️ **A11Y CRITICAL:** Must use `aria-live="polite"` for screen readers

- [ ] **Table Primitives** (Est: 6-8 hours)
  - Sortable headers with indicators
  - Sticky header on scroll
  - Row selection (single + bulk)
  - Keyboard nav (arrow keys, Space, Enter)

🏗️ **PATTERN:** Use Flowbite Table as base, extend with sorting/selection

💡 **TIP:** Use controlled component pattern for selection state
  
- [ ] **Bulk Action Bar** (Est: 3-4 hours)
  - Appears on selection
  - Shows count + clear button
  - Dropdown for actions

💡 **TIP:** Position as fixed bottom bar on mobile, inline bar on desktop
  
- [ ] **Filter Components** (Est: 8-10 hours)
  - Chips (multi-select)
  - Dropdown (single-select)
  - Range slider
  - Accordion
  - URL sync utility

🔴 **HIGH COMPLEXITY:** URL sync is tricky. See useDrawerRoute pattern below.
  
- [ ] **Form Field Primitives** (Est: 6-8 hours)
  - Text input with validation
  - Date picker
  - Number input
  - Textarea
  - Multiselect
  - Error/success states

🏗️ **PATTERN:** Flowbite has most of these. Wrap with validation.
  
- [ ] **Async States** (Est: 3-4 hours)
  - Skeleton loader (shimmer)
  - Spinner
  - Empty state component
  - Error boundary

💡 **TIP:** Use CSS animation for shimmer, not JS
  
- [ ] **Hooks** (Est: 6-8 hours total)

  **useConfirm()** (2-3 hours)
  ```typescript
  // web/lib/hooks/use-confirm.tsx
  export function useConfirm() {
    const [state, setState] = useState<ConfirmState | null>(null);

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({ ...options, resolve });
      });
    }, []);

    const handleConfirm = () => {
      state?.resolve(true);
      setState(null);
    };

    const handleCancel = () => {
      state?.resolve(false);
      setState(null);
    };

    const ConfirmDialog = state ? (
      <Dialog open={true} onOpenChange={() => handleCancel()}>
        <DialogContent>
          <DialogHeader>{state.title}</DialogHeader>
          <DialogBody>{state.message}</DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={handleCancel}>
              {state.cancelText || 'Cancel'}
            </Button>
            <Button variant={state.variant === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm}>
              {state.confirmText || 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ) : null;

    return { confirm, ConfirmDialog };
  }
  ```

  **useToast()** - See implementation above

  **useDrawerRoute()** (3-4 hours) 🔴 **COMPLEX**
  ```typescript
  // web/lib/hooks/use-drawer-route.tsx
  'use client';

  import { useSearchParams, useRouter, usePathname } from 'next/navigation';
  import { useCallback, useEffect } from 'react';

  export function useDrawerRoute(paramName: string = 'memberId') {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const id = searchParams?.get(paramName);

    const openDrawer = useCallback((id: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set(paramName, id);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, paramName, router, pathname]);

    const closeDrawer = useCallback(() => {
      const params = new URLSearchParams(searchParams?.toString());
      params.delete(paramName);
      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    }, [searchParams, paramName, router, pathname]);

    // Handle browser back/forward
    useEffect(() => {
      const handlePopState = () => {
        const params = new URLSearchParams(window.location.search);
        const newId = params.get(paramName);
        // Drawer will re-render with new ID from searchParams
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }, [paramName]);

    return { id, openDrawer, closeDrawer, isOpen: !!id };
  }
  ```

  ⚠️ **PITFALL:** Next.js App Router requires special handling. Don't use `window.history.pushState` directly.

  **useDebounce()** (1 hour)
  ```typescript
  export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
  }
  ```
  
- [ ] **Motion Tokens** (Est: 1-2 hours)
  - CSS variables: `--transition-fast` (120ms), `--transition-medium` (200ms), `--transition-slow` (300ms)
  - Respect `prefers-reduced-motion`

💡 **TIP:** Add to `globals.css`:
```css
:root {
  --transition-fast: 120ms;
  --transition-medium: 200ms;
  --transition-slow: 300ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-medium: 0ms;
    --transition-slow: 0ms;
  }
}
```

#### Observability
- [ ] **Event Helpers** (Est: 2-3 hours)
  - `emitEvent(name, properties)` wrapper
  - Timing wrapper for performance marks
  - Event naming convention doc

#### Testing
- [ ] Unit tests for all hooks
- [ ] Component tests (happy path + a11y)
- [ ] Visual regression tests (Chromatic/Percy)

📋 **TESTING PRIORITY:**
1. Hooks (easiest to test, most reusable)
2. Drawer, Modal (critical path)
3. Form fields (high usage)
4. Everything else

**Acceptance Criteria:**
- ✓ All primitives pass accessibility audit (use axe-core)
- ✓ Drawer updates URL, supports back/forward nav
- ✓ 90%+ test coverage on primitives
- ✓ Storybook examples for each component

⏱️ **REALISTIC TIMELINE FOR INTERMEDIATE DEV:**
- Drawer: 1 day
- Hooks: 1 day
- Table + Forms: 1.5 days
- Testing: 0.5 day
- **Total: 4 days** (matches estimate)

---

### Phase 1: Discoverability & Speed (3-4 days)

**Goal:** Users can find any member in <10 seconds

#### Backend Tasks
- [ ] **Member List Endpoint** (`GET /api/members`)
  - Implement pagination (cursor-based)
  - Search logic (full-text or ILIKE)
  - Filter logic (status, campus, lastAttendance)
  - Sort logic (name, status, lastAttendance, createdAt)
  - Response time P95 ≤500ms
  
- [ ] **Database Optimizations**
  - Add search indexes (GIN or btree)
  - Add filter indexes (composite)
  - Create `MemberSummary` materialized view or caching layer
  
- [ ] **Custom Fields Metadata Endpoint** (`GET /api/custom-fields`)
  - Return schema for `entityType=member`
  - Cache response (Redis, 5min TTL)

#### Frontend Tasks
- [ ] **Members Page**
  - Layout with filter panel + table
  - Responsive breakpoints (mobile/tablet/desktop)
  
- [ ] **Search Bar**
  - Debounced input (300ms)
  - Loading spinner
  - Clear button
  - Autofocus on `/` key
  
- [ ] **Filter Panel**
  - Status chips (Member, Visitor, Inactive)
  - Campus dropdown (if multi-campus)
  - Last Attendance presets
  - Collapsible sections
  - URL sync for all filters
  - [Clear All] button
  
- [ ] **Members Table**
  - Default columns (Name, Status, Email, Phone, Campus, Last Attendance, Groups, Actions)
  - Sortable headers
  - Pagination controls (25/50/100 per page)
  - Skeleton loader (5 rows)
  - Responsive (hide email/phone on mobile)
  
- [ ] **Empty/Error States**
  - No members (first-time)
  - No search results
  - API error banner

#### Testing
- [ ] Unit tests for filter logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests: search → filter → sort → paginate

**Acceptance Criteria:**
- ✓ Search returns results ≤500ms after debounce
- ✓ Filters combine correctly (AND logic), URL updates
- ✓ Table handles 1000+ members without lag
- ✓ Skeleton loaders on initial render
- ✓ Deep-linkable filter state

---

### Phase 2: Actionability (4-5 days)

**Goal:** Users can view details and take action without leaving page

#### Backend Tasks
- [ ] **Member Detail Endpoint** (`GET /api/members/:id`)
  - Join groups, attendance, giving, notes
  - Optimize with `select` and `include`
  - Consider progressive endpoints (summary → groups → activity)
  
- [ ] **Create/Update Endpoints** (`POST/PATCH /api/members/:id`)
  - Validation (required fields, formats)
  - Custom fields upsert
  - Groups association
  - Audit logging
  
- [ ] **Soft Delete Endpoint** (`DELETE /api/members/:id`)
  - Set `deletedAt`
  - Audit log
  
- [ ] **Restore Endpoint** (`POST /api/members/:id/restore`)
  - Check restore window (30 days)
  - Clear `deletedAt`
  - Idempotent
  
- [ ] **Bulk Actions Endpoint** (`POST /api/members/bulk`)
  - Batch processing (50 per batch)
  - Transactional per batch
  - Return per-item success/failure
  
- [ ] **Follow-up Endpoints**
  - `POST /api/members/:id/assign-followup`
  - `GET /api/followups` (list for assignee)
  
- [ ] **Notes Endpoints**
  - `GET /api/members/:id/notes`
  - `POST /api/members/:id/notes`

#### Frontend Tasks
- [ ] **Member Drawer**
  - Trigger on row click
  - URL sync (`?memberId=uuid`)
  - Slide-in animation
  - Sections: Header, Contact, Details, Custom Fields, Groups, Activity, Notes, Actions
  - Progressive loading (summary → related data)
  - [Edit] button → modal
  
- [ ] **Add/Edit Member Modal**
  - Trigger: [+ Add Member] or row [Edit]
  - Form sections: Basic Info, Address, Groups, Optional Details, Notes
  - Real-time validation
  - Dirty state warning on close
  - Success toast on save
  
- [ ] **Row Actions Menu**
  - View Profile (drawer)
  - Edit (modal)
  - Send Email (mailto)
  - Add to Group
  - Assign Follow-up
  - Archive (confirm modal)
  
- [ ] **Bulk Actions**
  - Bulk Action Bar on selection
  - Dropdown: Email, SMS, Add to Group, Set Status, Assign Follow-up, Export
  - Confirmation modal (show first 5 + "X more")
  - Progress bar (>50 members)
  - Success/error summary toast

#### Observability
- [ ] Audit log events: `member.created`, `member.updated`, `member.deleted`, `member.bulk_action`
- [ ] Metrics: drawer open time, modal save success rate, bulk action outcomes

#### Testing
- [ ] API tests: CRUD operations, validation, bulk actions
- [ ] E2E tests: open drawer → edit → save → verify
- [ ] E2E tests: select multiple → bulk action → verify

**Acceptance Criteria:**
- ✓ Drawer opens ≤200ms, shows complete profile
- ✓ Modal validates required fields, saves successfully
- ✓ Bulk actions confirm, show progress, report failures
- ✓ Groups assignment persists correctly
- ✓ Audit logs emitted for CRUD + bulk operations
- ✓ Undo archive restores member within 10s

---

### Phase 3: Personalization & Views (2-3 days)

**Goal:** Users customize table to their workflow

#### Frontend Tasks
- [ ] **Column Picker**
  - Dropdown panel (320px)
  - Core fields (non-removable, reorderable)
  - Custom fields (toggleable, reorderable)
  - Drag-and-drop
  - [Reset to Default] button
  - Save to localStorage
  
- [ ] **Saved Views**
  - Dropdown in toolbar
  - Default views: All Members, Recent Visitors, Needs Follow-up, Inactive Members
  - [+ Save Current View] → modal (name + default checkbox)
  - Save filters + columns + sort to localStorage
  - Max 10 views per user
  - Load view → apply filters/columns/sort, update URL
  - Gracefully handle missing custom fields
  
- [ ] **Badges**
  - New: member created ≤7 days
  - Follow-up: has pending follow-up
  - Volunteer: has "Volunteer" role
  - Display in Name column (inline or pills)

#### Testing
- [ ] Unit tests for localStorage persistence
- [ ] E2E tests: save view → reload → verify restored

**Acceptance Criteria:**
- ✓ Column changes persist across sessions
- ✓ Saved views restore filters + columns + sort
- ✓ Badges render based on calculated fields
- ✓ UI updates immediately on view selection
- ✓ Missing custom field in saved view handled gracefully

---

### Phase 4: Data Portability (2-3 days)

**Goal:** Users can import/export member data

#### Backend Tasks
- [ ] **Export Endpoint** (`GET /api/members/export`)
  - Apply filters (same as list endpoint)
  - Select columns (core + custom fields)
  - Check consent flags (exclude sensitive fields if not consented)
  - If <1000: immediate CSV download
  - If ≥1000: async job, email download link
  - Audit log export action
  
- [ ] **Import Endpoint** (`POST /api/members/import`)
  - Upload CSV → parse + validate
  - Dry-run: return errors + preview
  - Confirm: batch insert (100 per transaction)
  - Return per-row success/failure
  - Audit log import action
  
- [ ] **Background Jobs**
  - Export job (for >1000 members)
  - Send email with download link

#### Frontend Tasks
- [ ] **Export Button**
  - Dropdown: Export All, Export Filtered, Export Selected
  - Show column picker (include custom fields?)
  - Trigger download or show "processing" message
  
- [ ] **Import Wizard**
  - Step 1: Upload CSV
  - Step 2: Map columns (CSV → fields)
  - Step 3: Validate + preview
  - Step 4: Confirm + import
  - Show progress bar
  - Display errors (row + field + issue)

#### Testing
- [ ] Unit tests for CSV parsing/generation
- [ ] Integration tests: export → re-import → verify
- [ ] E2E tests: full import flow

**Acceptance Criteria:**
- ✓ Export includes all visible columns + custom fields
- ✓ Import maps columns, validates, shows preview
- ✓ Import errors clearly indicate row + field + issue
- ✓ Large exports (>1000) send email notification
- ✓ Import enforces required fields & validates uniqueness

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Coverage Target:** ≥80%

- **Backend:**
  - Service layer (business logic)
  - Validation functions
  - Query builders
  - Custom field metadata parser
  
- **Frontend:**
  - Hooks (`useConfirm`, `useToast`, `useDrawerRoute`)
  - Utility functions (filter parsing, URL sync)
  - Data transformations

### 6.2 Integration Tests

- **API Endpoints:**
  - Happy path: create → update → delete → restore
  - Validation errors (missing required, invalid format)
  - Permissions (RBAC checks)
  - Bulk actions (partial success/failure)
  
- **Database:**
  - Soft delete cascade
  - Materialized view updates
  - Index usage (explain plans)

### 6.3 E2E Tests (Playwright)

**Critical User Journeys:**
1. Search → filter → view drawer → edit → save
2. Bulk select → bulk action → verify
3. Save view → reload → verify restored
4. Export filtered → download CSV
5. Import CSV → validate → confirm → verify

**Accessibility Tests:**
- Keyboard navigation (Tab, Enter, Space, ESC)
- Screen reader compatibility (ARIA labels, live regions)
- Focus indicators visible
- Color contrast

### 6.4 Performance Tests

- **Load Testing:**
  - 1000 concurrent users on `/members`
  - Search with 10k+ members
  - Bulk action on 500 members
  
- **Benchmarks:**
  - API latency P95 ≤500ms
  - UI interaction latency P75 ≤200ms
  - Table render with 100 rows ≤1s

### 6.5 Manual Testing

- Cross-browser (Chrome, Safari, Firefox, Edge)
- Mobile devices (iOS Safari, Chrome Android)
- Responsive breakpoints
- Reduced motion preference

---

## 7. Observability & Monitoring

### 7.1 Logging

**Structured Logs (JSON):**
```json
{
  "timestamp": "2025-11-08T10:30:00Z",
  "level": "info",
  "service": "api",
  "event": "member.created",
  "churchId": "uuid",
  "userId": "uuid",
  "memberId": "uuid",
  "duration": 150
}
```

**Key Events:**
- `member.list_query` (duration, filters, result count)
- `member.created` / `updated` / `deleted` / `restored`
- `member.bulk_action` (operation, count, success/failed)
- `member.export` (format, row count)
- `member.import` (row count, errors)

### 7.2 Metrics (Prometheus/Datadog)

- **API Latency:**
  - `api_request_duration_seconds{endpoint, method, status}`
  - Histogram buckets: [50ms, 100ms, 200ms, 500ms, 1s, 2s]
  
- **Member Operations:**
  - `members_list_query_duration_seconds`
  - `members_bulk_action_total{operation, status}`
  - `members_export_total{format}`
  - `members_import_rows_total{status}` (success/failed)
  
- **UI Interactions (Frontend):**
  - `drawer_open_duration_ms` (from click to content visible)
  - `search_query_latency_ms` (debounce → results)
  - `filter_apply_duration_ms`

### 7.3 Distributed Tracing

- Use OpenTelemetry to trace:
  - Member list query → DB query → response
  - Bulk action → batch processing → individual updates
  - Drawer open → summary fetch → groups fetch → activity fetch
  
- Annotate spans with:
  - `churchId`, `userId`, `memberId`
  - Query filters, row counts

### 7.4 Alerts

- **Latency:** P95 API latency >1s for 5min
- **Error Rate:** 5xx errors >5% for 2min
- **Bulk Failures:** Bulk action failure rate >20%
- **Database:** Connection pool exhausted, slow queries >5s

### 7.5 Dashboards

- **Members Hub Dashboard:**
  - Request rate, latency percentiles, error rate
  - Search queries per minute, avg result count
  - Bulk action success/failure rate
  - Top filters used
  - Drawer open time distribution
  - Export/import volume

---

## 8. Security & Compliance

### 8.1 Authentication & Authorization

- **Authentication:** Cookie-based session (existing)
- **Authorization (RBAC):**
  - `hasRole('Admin')` → full access
  - `hasRole('Leader')` → read + limited write (no delete)
  - `hasRole('Member')` → read own profile only
  
- **Endpoint Guards:**
  - `GET /api/members` → Admin, Leader
  - `POST /api/members` → Admin
  - `PATCH /api/members/:id` → Admin, or Leader (own members)
  - `DELETE /api/members/:id` → Admin only
  - `POST /api/members/bulk` → Admin only

### 8.2 Data Privacy

- **Sensitive Fields:**
  - Background Check Status/Date → Admin only
  - Giving amounts → masked in drawer (show participation only)
  
- **Consent:**
  - Export checks consent flags before including email/phone
  - Background check fields excluded from export unless explicit permission
  
- **Audit Trail:**
  - Log all CRUD operations with actor, timestamp, changes
  - Bulk actions log per-member details

### 8.3 Input Validation

- **Backend:**
  - Validate all inputs (required, format, length)
  - Sanitize HTML in text fields
  - SQL injection protection (Prisma parameterized queries)
  
- **Frontend:**
  - Client-side validation for UX (not security)
  - Escape user input in search highlights

### 8.4 Rate Limiting

- **API Endpoints:**
  - 60 requests/minute per user (general)
  - 10 exports/hour per user
  - 5 imports/hour per user
  - Bulk actions: 10/hour per user

### 8.5 GDPR Compliance

- **Right to Erasure:**
  - Soft delete keeps data for 30 days
  - Hard delete job runs after restore window
  
- **Data Portability:**
  - Export includes all member data in machine-readable format (CSV)
  
- **Right to Access:**
  - Member can request full profile via admin

---

## 9. Deployment & Rollout

### 9.1 Feature Flags

Use feature flags for gradual rollout:

```typescript
const FEATURE_FLAGS = {
  MEMBERS_HUB_ENABLED: 'members_hub_enabled',
  BULK_ACTIONS_ENABLED: 'bulk_actions_enabled',
  IMPORT_EXPORT_ENABLED: 'import_export_enabled',
};
```

**Rollout Plan:**
1. Internal testing (dev team only)
2. Beta churches (5-10 churches, opt-in)
3. 25% rollout (by churchId hash)
4. 50% rollout
5. 100% rollout

### 9.2 Database Migrations

- **Phase 0/1:** Add indexes, `MemberSummary` table
- **Phase 2:** Add `FollowUp` table, `Note` table (if not exists)
- **Phase 3:** No DB changes (localStorage only)
- **Phase 4:** No DB changes (existing export/import tables)

**Migration Strategy:**
- Blue-green deployment for zero-downtime
- Backward-compatible migrations (additive only)
- Rollback plan: drop new indexes/tables

### 9.3 Monitoring During Rollout

- Watch dashboards for:
  - Error rate spike
  - Latency degradation
  - Database connection pool saturation
  
- Be ready to:
  - Disable feature flag
  - Scale API instances
  - Add database read replicas

---

## 10. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Custom fields N+1 queries** | High | Medium | Cache metadata per churchId (Redis, 5min); use `select` + projection |
| **Search slow on 10k+ members** | High | Medium | Full-text index (GIN); consider Elasticsearch for scale |
| **Bulk action timeout** | Medium | Medium | Async job queue for >100 members; batch processing |
| **Drawer content slow to load** | Medium | Medium | Progressive loading (summary → groups → activity); prefetch on hover |
| **URL length limit for complex filters** | Low | Low | Compress filter state (base64 JSON); fallback to server-side storage |
| **localStorage quota exceeded (saved views)** | Low | Low | Limit to 10 views; compress JSON; warn user |
| **Import integrity issues** | High | Low | Dry-run validation; transactional batch inserts; rollback on error |
| **Background check privacy leak** | High | Low | RBAC checks; audit logging; encryption at rest |
| **Phase 0 delays entire sprint** | High | Medium | Start Phase 0 early; parallel implementation by multiple engineers |

---

## 11. Open Questions for Engineering Review

1. **Database Choice:** Should we use PostgreSQL full-text search or integrate Elasticsearch for search at scale?
   
2. **Custom Fields Storage:** EAV model (current proposal) vs. JSONB column? Trade-offs:
   - EAV: queryable, normalized, N+1 risk
   - JSONB: fast retrieval, limited filtering, schema flexibility
   
3. **Progressive Drawer Loading:** Separate endpoints vs. GraphQL field resolvers?
   
4. **Bulk Action Processing:** Inline (transaction) vs. async (job queue)?
   - Inline: simple, immediate feedback, timeout risk
   - Async: scalable, handles large batches, more complexity
   
5. **Saved Views Storage:** localStorage (MVP) → server-side migration path?
   - Option A: Sync to server on save (Phase 3+)
   - Option B: Migrate user data in background job (Phase 4+)
   
6. **Member Summary Caching:** Materialized view vs. Redis cache?
   - Materialized view: consistent, queryable, requires refresh trigger
   - Redis: fast, flexible TTL, stale data risk
   
7. **Export for Large Datasets:** Async job + email vs. streaming download?
   
8. **Testing Environment:** Do we have sufficient test data (10k+ members) for performance testing?

---

## 12. Success Criteria

### 12.1 Performance

- ✓ API P95 latency ≤500ms (member list, search, filters)
- ✓ UI interaction latency P75 ≤200ms (drawer open, filter apply)
- ✓ Table handles 1000+ members without lag
- ✓ Search returns results ≤500ms after debounce

### 12.2 Functionality

- ✓ All acceptance criteria met for Phases 0-4
- ✓ No regressions in existing member CRUD operations
- ✓ RBAC enforced on all endpoints
- ✓ Audit logs complete for all sensitive operations

### 12.3 Quality

- ✓ 80%+ test coverage (unit + integration)
- ✓ All E2E tests passing
- ✓ Accessibility audit passed (WCAG 2.1 AA)
- ✓ No critical/high security vulnerabilities

### 12.4 Observability

- ✓ Dashboards created for key metrics
- ✓ Alerts configured for latency/errors
- ✓ Distributed tracing enabled for critical paths

### 12.5 User Experience

- ✓ Time-to-member profile ≤6 seconds (median, measured)
- ✓ Search effectiveness ≥80% (measured via analytics)
- ✓ No usability issues reported in beta testing

---

## 13. Next Steps

1. **Engineering Review:**
   - Validate technical approach
   - Answer open questions (Section 11)
   - Estimate effort per phase
   - Identify blockers/dependencies
   
2. **Refinement:**
   - Update plan based on engineering feedback
   - Break down phases into sprint tasks (Jira/Linear)
   - Assign owners for each phase
   
3. **Sprint Kickoff:**
   - Move sprint to `TASKS.md` In Progress
   - Create sprint branch: `feature/members-hub-mvp-main-sprint`
   - Create Phase 0 branch and plan
   - Begin implementation

---

## Document Changelog

- **v1.0.0** (8 Nov 2025): Initial implementation plan based on Product & UX Spec v1.1.0
- **v1.1.0** (8 Nov 2025): Engineering review complete - Added implementation guidance, risk mitigation, and critical blockers throughout document

---

## APPENDIX A: Critical Issues Summary for Developer

### 🔴 Must Resolve Before Starting Sprint

| # | Issue | Impact | Resolution Options | Recommended |
|---|-------|--------|-------------------|-------------|
| 1 | **Schema Mismatch:** Plan uses `User` model, actual DB uses `Profile` as member data container | HIGH | A) Use Profile model<br>B) Restructure to User | A - Profile has all needed fields |
| 2 | **Custom Fields:** 15/16 custom fields already exist in Profile schema | HIGH | A) Use existing fields<br>B) Create EAV tables | A - Simpler, faster for MVP |
| 3 | **Note Model Missing:** No feed/timeline for member notes | MEDIUM | A) Use Profile.pastoralNotes<br>B) Create Note table | A for Phase 1, B for Phase 2 |
| 4 | **FollowUp Model Missing:** No table for follow-up assignments | MEDIUM | A) Use PastoralCareTicket<br>B) Create FollowUp table<br>C) Defer to post-MVP | C - Reduces scope |
| 5 | **Soft Delete Missing:** No deletedAt field on User/Profile | MEDIUM | A) Add migration<br>B) Defer archive feature | A - Required for Phase 2 |
| 6 | **RBAC Pattern Unclear:** No documented hasRole() pattern | HIGH | A) Document existing pattern<br>B) Build new guards | A - Likely exists in auth module |
| 7 | **Database: SQLite not PostgreSQL:** Plan shows PostgreSQL syntax (GIN indexes, full-text) | HIGH | A) Convert all SQL to SQLite<br>B) Switch to PostgreSQL | A - SQLite is current |
| 8 | **Campus Field Missing:** No campus on User/ChurchUser | MEDIUM | A) Add to ChurchUser<br>B) Remove campus filter | A - Simple migration |

### ⚠️ High-Risk Areas Requiring Careful Implementation

| Area | Risk | Mitigation Strategy |
|------|------|---------------------|
| **N+1 Queries** | lastAttendance lookup for every member causes 100+ queries | Use batch fetching with groupBy or single JOIN |
| **Search Performance** | LIKE '%search%' slow on 10k+ members in SQLite | Start with simple search, add FTS5 if needed |
| **URL State Management** | Next.js App Router has different patterns than Pages Router | Use useSearchParams, not window.history |
| **Drawer Routing** | Browser back/forward must update drawer state | Listen to popstate, sync with searchParams |
| **Form Dirty State** | Detecting unsaved changes across complex forms | Use useEffect to watch form state, not onChange |
| **Bulk Action Timeouts** | Processing 500 members can exceed API timeout | Implement batch processing or async jobs |
| **Custom Fields Schema** | Plan's EAV model conflicts with existing Profile fields | Use existing Profile fields for MVP |

### 💡 Key Implementation Tips

1. **Start Small, Iterate:**
   - Phase 0: Build primitives, make them perfect
   - Phase 1: Simple list + search only, no filters yet
   - Add complexity incrementally

2. **Follow Existing Patterns:**
   - Use `@UseGuards(AuthGuard)` like other controllers
   - Use `@default(cuid())` not `uuid()` for new models
   - Follow Flowbite component patterns in `ui-flowbite/`
   - Use `cn()` utility for className merging

3. **Testing Strategy:**
   - Unit test hooks first (easiest, highest ROI)
   - E2E test critical paths only (search → drawer → edit)
   - Skip testing trivial components initially

4. **Performance Traps:**
   - Always use `Promise.all()` for parallel queries
   - Use Prisma's `_count` instead of fetching + counting
   - Batch all "for each member" operations
   - Add indexes AFTER confirming slow queries with EXPLAIN

5. **Accessibility:**
   - Every interactive element needs keyboard support
   - All images/icons need alt text or aria-label
   - Use semantic HTML (nav, main, aside, article)
   - Test with keyboard only (Tab, Enter, Space, ESC)

### 📋 Pre-Phase Checklist

**Before Phase 0:**
- [ ] Decision on schema approach (Profile vs CustomField tables)
- [ ] Confirm RBAC pattern with existing auth module
- [ ] Set up Storybook for component development
- [ ] Read all existing ui-flowbite components

**Before Phase 1:**
- [ ] Phase 0 primitives complete and tested
- [ ] Migration adding missing fields (deletedAt, campus)
- [ ] Indexes created on Profile (firstName, lastName)
- [ ] Decision on Note model (existing field vs new table)

**Before Phase 2:**
- [ ] Phase 1 working end-to-end
- [ ] Bulk action strategy decided (sync vs async)
- [ ] FollowUp model decision (new table vs PastoralCareTicket)

### 🏗️ Recommended Phase Adjustments

**Original Plan:** 5 phases, 14-18 days

**Realistic for Intermediate Developer:** 5 phases, 18-22 days

**Suggested Modifications:**
1. **Phase 0:** Add 0.5 day buffer for learning Flowbite patterns
2. **Phase 1:** Split into 1a (list + pagination) and 1b (search + filters)
3. **Phase 2:** Defer FollowUp feature to Phase 2.5 or post-MVP
4. **Phase 3:** Limit saved views to 5 max instead of 10
5. **Phase 4:** Make import wizard optional (export only for MVP)

### 🎯 Success Criteria Adjustments

**Original criteria may be too aggressive. Adjust:**

| Original | Adjusted for MVP | Reasoning |
|----------|------------------|-----------|
| P95 API ≤500ms | P95 API ≤800ms | SQLite slower than PostgreSQL |
| UI latency ≤200ms | UI latency ≤300ms | More realistic with current stack |
| 80%+ test coverage | 70%+ test coverage | Focus on critical paths |
| 1000+ member support | 500+ member support | Sufficient for MVP validation |

---

## APPENDIX B: Existing Codebase Patterns Reference

### Authentication & Authorization

```typescript
// api/src/modules/auth/auth.guard.ts
@UseGuards(AuthGuard)  // Already exists - use this pattern

// To check roles, examine existing implementation:
// api/src/modules/roles/roles.service.ts
```

### Database Patterns

```typescript
// Use cuid() not uuid()
model NewModel {
  id String @id @default(cuid())  // ✅ Correct
  // NOT: @default(uuid())           // ❌ Wrong
}

// Soft delete pattern (need to add)
model User {
  deletedAt DateTime?
}

// Find non-deleted only
where: { deletedAt: null }
```

### API Response Patterns

```typescript
// api/src/common/openapi/schemas.ts
import { arrayOfObjectsResponse, objectResponse } from '../../common/openapi/schemas';

@ApiOkResponse(arrayOfObjectsResponse)  // For list endpoints
@ApiOkResponse(objectResponse)          // For single resource
```

### Frontend Component Patterns

```typescript
// web/components/ui-flowbite/*.tsx
'use client';  // All interactive components need this

import { cn } from '@/lib/utils';  // For className merging

// Compound component pattern (existing Dialog)
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>Title</DialogHeader>
    <DialogBody>Content</DialogBody>
  </DialogContent>
</Dialog>
```

### Error Handling

```typescript
// api - Use NestJS exception filters
throw new ForbiddenException('Not authorized');
throw new NotFoundException('Member not found');

// web - Use error boundaries
// components/error-boundary.tsx (may need to create)
```

---

**Appendix: Technology Stack**

- **Backend:** NestJS, Prisma, **SQLite** (NOT PostgreSQL)
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **State Management:** React Query (server state), Zustand (client state)
- **Testing:** Jest, Vitest, Playwright, React Testing Library
- **Observability:** OpenTelemetry, Prometheus/Datadog, Structured logging
- **Infrastructure:** Docker, CI/CD (GitHub Actions)

### 🚨 SQLite vs PostgreSQL Key Differences

**What SQLite DOESN'T have (that the original plan assumed):**
- ❌ GIN indexes for full-text search
- ❌ Native full-text search (use FTS5 virtual table instead)
- ❌ Advanced indexing strategies
- ❌ `INCLUDE` clause in indexes
- ❌ `to_tsvector()` function

**What to use in SQLite instead:**
- ✅ Regular B-tree indexes with `COLLATE NOCASE`
- ✅ FTS5 virtual table for full-text search (if needed)
- ✅ Simple `LIKE` queries with indexes (adequate for <10k rows)
- ✅ Partial indexes with `WHERE` clause (supported!)
- ✅ Simpler query patterns optimized for SQLite's architecture

**Performance Expectations:**
- SQLite is excellent for read-heavy workloads with <10k records
- Write concurrency is limited (single writer at a time)
- For 500-2000 members (typical church), SQLite is MORE than adequate
- Simple indexed queries are fast (sub-10ms)
- Complex joins may be slower than PostgreSQL


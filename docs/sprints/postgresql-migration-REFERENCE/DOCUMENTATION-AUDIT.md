# Documentation Audit: SQLite to PostgreSQL References

**Date:** 9 November 2025  
**Author:** Principal Engineer  
**Purpose:** Catalog all documentation requiring updates after PostgreSQL migration

---

## Executive Summary

**Total Files Found:** 102 markdown files  
**Files with SQLite/PostgreSQL References:** 15 files  
**Critical Updates Required:** 10 files (blocks launch)  
**Important Updates:** 5 files (should update soon)  
**Minor Updates:** Multiple sprint documents (update as needed)

---

## 1. Critical Updates (MUST Update Before Launch)

These documents directly contradict the new PostgreSQL architecture and will confuse developers/users.

### 1.1 Source of Truth Documents

#### **File:** `docs/source-of-truth/DATABASE_SCHEMA.md`
**Current State:** Doesn't mention SQLite or PostgreSQL explicitly in intro, but schema is generic  
**Lines to Update:** 1-50 (Introduction section)  
**Changes Required:**
- Add explicit statement: "Database Provider: PostgreSQL"
- Update index syntax examples to PostgreSQL (GIN indexes)
- Add PostgreSQL-specific features (arrays, JSONB, enums)
- Update connection string examples

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes

---

#### **File:** `docs/source-of-truth/ARCHITECTURE.md`
**Current State:** States "PostgreSQL databases per tenant" but implementation uses SQLite  
**Lines to Update:**
- Line 200: "separate PostgreSQL databases per tenant" (currently aspirational)
- Line 217-218: System metadata and tenant databases description
- Line 265: Architecture diagram showing PostgreSQL
- Line 299: "Production-ready PostgreSQL database integration"
- Line 311: "Physical data segregation" with PostgreSQL

**Changes Required:**
- Clarify current state: "Single PostgreSQL database with multi-tenant via churchId"
- Update from "separate databases per tenant" to "single database, Row-Level Security"
- Add section on connection pooling architecture
- Update diagram to show single DB with tenant isolation

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 1 hour

---

#### **File:** `docs/source-of-truth/API_DOCUMENTATION.md`
**Current State:** Line 28 states `prisma: Uses PostgreSQL database` but ENV shows SQLite  
**Lines to Update:**
- Line 26-28: DATA_MODE environment variable documentation

**Changes Required:**
```diff
- **DATA_MODE:** Controls the data storage backend
  - `mock` (default): Uses in-memory mock data for development and testing
  - `memory`: Uses high-performance in-memory data store for fast testing scenarios
-  - `prisma`: Uses PostgreSQL database with Prisma ORM for production
+  - `prisma`: Uses PostgreSQL database with Prisma ORM (default for production)
```

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 15 minutes

---

### 1.2 Setup & Onboarding Documents

#### **File:** `docs/SETUP.md`
**Current State:** Line 12 says "PostgreSQL: Optional"  
**Lines to Update:**
- Line 12-13: Prerequisites section
- Line 43: Instructions for connecting to PostgreSQL

**Changes Required:**
```diff
- **PostgreSQL**: Optional, as the system is configured to use an in-memory mock datastore for
- development. If you intend to connect to a real PostgreSQL database, you will need to configure...
+ **PostgreSQL**: Required for production deployment. Development can use mock datastore or local PostgreSQL.
+ Installation:
+ - macOS: `brew install postgresql@16`
+ - Linux: `sudo apt-get install postgresql-16`
+ - Windows: Download from https://www.postgresql.org/download/windows/
```

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 30 minutes

---

#### **File:** `README.md` (Root)
**Current State:** Lines 9, 74, 332, 345 reference "no Postgres required" and SQLite  
**Lines to Update:**
- Line 9: Data feature description
- Line 74: Tech stack note about Prisma schema
- Line 332: Changelog entry
- Line 345: Conclusion statement

**Changes Required:**
```diff
- | **Data**  | Members, groups (with resource sharing), events, announcements, giving, seeded sessions, soft delete (no Postgres required) |
+ | **Data**  | Members, groups (with resource sharing), events, announcements, giving, seeded sessions, soft delete (PostgreSQL multi-tenant) |

- > The Prisma schema remains in the repo for future Postgres wiring, but the MVP runs entirely from
+ > The system uses PostgreSQL with Prisma ORM for production. Development mode can use mock datastore.

- - Updated data description to include "soft delete (no Postgres required)"
+ - Updated data description to include "soft delete with PostgreSQL"

- Enjoy the demo, and feel free to swap the mock layer for Prisma + Postgres when you're ready for
+ Enjoy the demo! The system supports both mock datastore (development) and PostgreSQL (production).
```

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 20 minutes

---

### 1.3 Technical Guides

#### **File:** `docs/guides/TECH_STACK.md`
**Current State:** Line 28 says "PostgreSQL - Production database (configurable)"  
**Lines to Update:**
- Line 28: Database & ORM section

**Changes Required:**
```diff
- **PostgreSQL** - Production database (configurable)
+ **PostgreSQL** v16+ - Primary database (required for production)
- **In-Memory Mock Store** - Development/testing (no DB required)
+ **In-Memory Mock Store** - Development/testing alternative (optional)
```

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 15 minutes

---

#### **File:** `docs/guides/README.md`
**Current State:** Line 61 mentions PostgreSQL in tech stack  
**Lines to Update:**
- Line 61: Backend stack listing

**Changes Required:**
```diff
- - Backend stack (NestJS, Fastify, Prisma, PostgreSQL)
+ - Backend stack (NestJS, Fastify, Prisma ORM, PostgreSQL 16)
- - Database and ORM choices
+ - Database architecture and connection management
```

**Priority:** 🔴 CRITICAL  
**Estimated Time:** 10 minutes

---

#### **File:** `docs/PRD.md`
**Current State:** Lines 70, 80 state PostgreSQL as database  
**Lines to Update:**
- Line 70: Architecture description
- Line 80: Technology stack list

**Changes Required:**
- Verify statements are accurate (they already say PostgreSQL)
- Add note about multi-tenant single-database architecture
- Clarify connection pooling strategy

**Priority:** 🔴 CRITICAL (verify accuracy)  
**Estimated Time:** 15 minutes

---

## 2. Important Updates (Should Update Soon)

### 2.1 Paused Sprint Documentation

#### **File:** `docs/sprints/members-hub-mvp-PAUSED/members-hub-mvp-IMPLEMENTATION-PLAN.md`
**Current State:** Entire document written for SQLite with warnings  
**Lines to Update:**
- Line 42-47: Critical blocker about SQLite
- Line 275: Tips for SQLite
- Line 357-377: SQLite-specific SQL examples
- Line 408: SQLite performance warnings
- Line 2240: Database choice decision matrix
- Line 2323: Performance targets adjusted for SQLite
- Line 2402-2430: Technology stack and SQLite differences appendix

**Changes Required:**
- Remove all "🚨 CRITICAL: Database is SQLite" warnings
- Update SQL examples to use PostgreSQL syntax (GIN indexes, tsvector)
- Update performance targets to PostgreSQL baselines (P95 ≤500ms not 800ms)
- Remove SQLite vs PostgreSQL comparison appendix
- Update technology stack to list PostgreSQL

**Priority:** 🟡 HIGH (if unpausing sprint)  
**Estimated Time:** 2 hours (comprehensive rewrite of database sections)

---

#### **File:** `docs/MEMBERS_HUB_MVP_SPEC.md`
**Current State:** No SQLite references found (generic database references)  
**Lines to Update:** None required  
**Changes Required:** None (spec is database-agnostic)

**Priority:** 🟢 LOW  
**Estimated Time:** 0 minutes

---

### 2.2 Reference Documentation

#### **File:** `docs/source-of-truth/API_REFERENCE.md`
**Current State:** Line 244 mentions PostgreSQL for production  
**Lines to Update:**
- Line 244: Production deployment note

**Changes Required:**
```diff
- For production deployment, the app can be configured to use PostgreSQL with Prisma ORM.
+ The application uses PostgreSQL with Prisma ORM. Development mode can optionally use mock datastore.
```

**Priority:** 🟡 MEDIUM  
**Estimated Time:** 5 minutes

---

## 3. Minor Updates (Update as Encountered)

### 3.1 Sprint Documentation

#### **Files Found with Database References:**
- `docs/sprints/user-preferences-enhancement/user-preferences-enhancement-IMPLEMENTATION-PLAN.md` (line 57)
- `docs/sprints/user-theme-preferences/user-theme-preferences-phase5-PLAN.md` (lines 402, 426, 607)
- `docs/sprints/user-theme-preferences/user-theme-preferences-phase5-CONSISTENCY_REVIEW.md` (line 14)
- `docs/sprints/user-preferences-enhancement/user-preferences-enhancement-PLAN.md` (line 288)

**Current State:** Generic "database" references, no SQLite specifics  
**Changes Required:** None (references are database-agnostic)

**Priority:** 🟢 LOW  
**Estimated Time:** 0 minutes

---

#### **File:** `docs/observability/SPAN_TRACING_GUIDE.md`
**Current State:** Line 192 has generic SQL query example  
**Lines to Update:** None (example code only)  
**Changes Required:** None

**Priority:** 🟢 LOW  
**Estimated Time:** 0 minutes

---

### 3.2 Container Documentation

#### **File:** `.devcontainer/README.md`
**Current State:** Not reviewed (may not exist or be relevant)  
**Lines to Update:** TBD after review  
**Changes Required:** Update if it contains database setup instructions

**Priority:** 🟢 LOW  
**Estimated Time:** 15 minutes (if exists)

---

## 4. Files Requiring NO Updates

The following files mention "database" but in generic terms or non-applicable contexts:

- Sprint PR descriptions (historical records, leave as-is)
- Sprint plans for completed sprints (historical, leave as-is)
- Observability guides (database-agnostic monitoring)
- Most sprint documentation (references are generic)

---

## 5. Update Checklist

### Phase 1: Pre-Migration Documentation Updates
These should be updated BEFORE migration to reflect planned changes:

- [ ] Create `POSTGRESQL-MIGRATION-PLAN.md` (✅ Complete)
- [ ] Create `DOCUMENTATION-AUDIT.md` (✅ Complete)
- [ ] Update `docs/TASKS.md` with migration sprint
- [ ] Communicate migration plan to team

**Estimated Time:** 2 hours

---

### Phase 2: Post-Migration Documentation Updates
These MUST be updated IMMEDIATELY after successful migration:

#### Critical (Day 1 - Blocks Launch):
- [ ] `docs/source-of-truth/DATABASE_SCHEMA.md` - Add PostgreSQL provider note
- [ ] `docs/source-of-truth/ARCHITECTURE.md` - Update database architecture section
- [ ] `docs/source-of-truth/API_DOCUMENTATION.md` - Update DATA_MODE docs
- [ ] `docs/SETUP.md` - Change PostgreSQL from optional to required
- [ ] `README.md` - Remove "no Postgres required" references
- [ ] `docs/guides/TECH_STACK.md` - Update database section
- [ ] `docs/guides/README.md` - Update backend stack reference
- [ ] `docs/PRD.md` - Verify PostgreSQL statements accurate

**Estimated Time:** 3-4 hours

#### Important (Week 1):
- [ ] `docs/sprints/members-hub-mvp-PAUSED/members-hub-mvp-IMPLEMENTATION-PLAN.md` - Rewrite for PostgreSQL
- [ ] `docs/source-of-truth/API_REFERENCE.md` - Update production deployment note
- [ ] Update any .devcontainer documentation if exists

**Estimated Time:** 2-3 hours

#### Nice-to-Have (Month 1):
- [ ] Review all sprint documentation for outdated references
- [ ] Create PostgreSQL best practices guide
- [ ] Add PostgreSQL troubleshooting section to docs

**Estimated Time:** 4-6 hours

---

## 6. Documentation Debt After Migration

### New Documentation to Create:

1. **`docs/guides/POSTGRESQL_GUIDE.md`**
   - PostgreSQL-specific features and patterns
   - Connection pooling best practices
   - Query optimization for PostgreSQL
   - Indexing strategies
   - Full-text search with tsvector
   - Row-Level Security implementation

2. **`docs/guides/DATABASE_MIGRATION_HISTORY.md`**
   - Record of SQLite → PostgreSQL migration
   - Lessons learned
   - Performance comparisons
   - Rollback procedures

3. **`docs/runbooks/POSTGRESQL_OPERATIONS.md`**
   - Common PostgreSQL commands
   - Backup and restore procedures
   - Performance monitoring queries
   - Troubleshooting guide
   - Emergency procedures

---

## 7. Search Patterns for Future Audits

To find SQLite/PostgreSQL references in future:

```bash
# Find all markdown files with database references
grep -r "SQLite\|sqlite\|\.db\|PostgreSQL\|postgres\|Postgres" --include="*.md" docs/

# Find Prisma provider references
grep -r "provider.*=.*\"sqlite\"\|provider.*=.*\"postgresql\"" --include="*.prisma" .

# Find DATABASE_URL references
grep -r "DATABASE_URL" --include="*.md" --include="*.ts" --include="*.js" .

# Find raw SQL queries
grep -r "\$executeRaw\|\$queryRaw" --include="*.ts" api/src/
```

---

## 8. Summary Statistics

| Category | Count | Estimated Time |
|----------|-------|----------------|
| **Critical Updates** | 8 files | 3-4 hours |
| **Important Updates** | 2 files | 2-3 hours |
| **Minor Updates** | 0 files | 0 hours |
| **New Documentation** | 3 guides | 4-6 hours |
| **Total Documentation Work** | 13 items | 9-13 hours |

**Recommendation:** Allocate 2 full working days for documentation updates (1 day for critical updates, 1 day for important updates and new guides).

---

## 9. Review Checklist

After completing all updates, verify:

- [ ] No references to "SQLite" in source-of-truth documents
- [ ] No "no Postgres required" statements in README or marketing materials
- [ ] All SQL examples use PostgreSQL syntax (not SQLite)
- [ ] All connection string examples show PostgreSQL format
- [ ] All performance targets reflect PostgreSQL capabilities
- [ ] Setup instructions include PostgreSQL installation
- [ ] Architecture diagrams show PostgreSQL
- [ ] Technology stack lists PostgreSQL as primary database
- [ ] API documentation reflects PostgreSQL-only deployment
- [ ] New developer onboarding docs accurate for PostgreSQL setup

---

## Document Changelog

- **v1.0.0** (9 Nov 2025): Initial documentation audit created by Principal Engineer

---

**Next Steps:**
1. Review audit with team
2. Prioritize updates based on migration timeline
3. Assign documentation updates to team members
4. Track completion in project management tool
5. Schedule documentation review after migration completes

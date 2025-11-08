# SQLite to PostgreSQL Migration Plan

**Sprint Name:** postgresql-migration  
**Date:** 9 November 2025  
**Author:** Principal Engineer  
**Status:** Awaiting Architect Review  
**Priority:** CRITICAL - Blocks Members Hub MVP and Multi-Tenant Scale

---

## Executive Summary

**Current State:** The project uses SQLite for development with a single database serving all tenants (churches) via `churchId` foreign keys.

**Problem:** SQLite's single-writer architecture is fundamentally incompatible with multi-tenant SaaS workloads:
- All tenants share one write lock → Church A's bulk import blocks Church B's check-ins
- No Row-Level Security for tenant isolation → security risks
- All-or-nothing backups → cannot restore single tenant
- Cannot scale horizontally → no read replicas or connection pooling

**Solution:** Migrate to PostgreSQL before launching to multiple production churches.

**Impact:**
- **Migration Time:** 2-3 days (schema + testing + deployment)
- **Breaking Changes:** None for application code (Prisma abstracts database)
- **Risk Level:** Medium (well-established migration path)
- **Blocks:** Members Hub MVP (paused), any multi-tenant production deployment

---

## 1. Migration Justification

### 1.1 Critical Issues with Current SQLite Setup

| Issue | Impact | PostgreSQL Solution |
|-------|--------|---------------------|
| **Single Write Lock** | All tenants blocked during bulk operations (5-10s) | MVCC: Zero cross-tenant blocking |
| **No Tenant Isolation** | Manual `WHERE churchId=?` vulnerable to bugs | Row-Level Security enforced at DB |
| **Corruption Risk** | One bad write corrupts entire database for all churches | Schema-level isolation limits blast radius |
| **Backup/Restore** | Cannot restore single church's data | Point-in-time recovery per tenant |
| **Horizontal Scale** | Impossible to add read replicas | PgBouncer, read replicas, partitioning |
| **Full-Text Search** | FTS5 limited, manual management | Native `tsvector`, GIN indexes, better language support |
| **Monitoring** | File-level stats only | Per-query metrics, slow query log, tenant analytics |

### 1.2 Performance Comparison

**Scenario: 10 Churches, Sunday Morning Peak (500 concurrent operations)**

| Operation | SQLite (Current) | PostgreSQL (Target) |
|-----------|------------------|---------------------|
| Single member lookup | 2-5ms ✅ | 3-8ms ✅ |
| 100 member search | 50-100ms ✅ | 30-60ms ✅ |
| Bulk member import (500) | 5-10s write lock 🔴 | 2-4s, zero blocking ✅ |
| Concurrent check-ins (50/s) | 500ms-2s (queued) 🔴 | 50-100ms ✅ |
| P95 API latency (mixed) | 3-5 seconds 🔴 | 200-500ms ✅ |

### 1.3 Cost Analysis

**PostgreSQL Hosting Options:**
- **Heroku Postgres:** $5/month (1GB, 20 connections) - Good for 5-10 churches
- **Supabase:** $25/month (8GB, 60 connections, backups, monitoring) - Recommended
- **DigitalOcean Managed:** $15/month (1GB, 25 connections)
- **Railway:** $5/month starter
- **Neon (Serverless):** Pay-per-usage, auto-scaling

**Hidden SQLite Costs:**
- Developer time debugging write locks: $$$$
- Customer churn from poor performance: $$$$$
- Data recovery from corruption: $$$$

**Verdict:** PostgreSQL is actually cheaper when factoring in operational costs.

---

## 2. Migration Architecture

### 2.1 Target Architecture

```
BEFORE (Current - SQLite):
┌─────────────────────────────────────────┐
│  Single SQLite File: churchapp.db       │
│  ├─ Church A data (churchId: church-1)  │
│  ├─ Church B data (churchId: church-2)  │
│  └─ Church C data (churchId: church-3)  │
│                                          │
│  ⚠️ Single write lock for ALL churches  │
└─────────────────────────────────────────┘

AFTER (Target - PostgreSQL):
┌─────────────────────────────────────────────────────┐
│  PostgreSQL Database: churchapp_production          │
│  ├─ Schema: public (shared system tables)           │
│  ├─ Church A data (churchId: church-1) + RLS       │
│  ├─ Church B data (churchId: church-2) + RLS       │
│  └─ Church C data (churchId: church-3) + RLS       │
│                                                      │
│  ✅ MVCC: Each church's writes independent          │
│  ✅ Row-Level Security enforced by database         │
│  ✅ Connection pooling via PgBouncer (optional)     │
└─────────────────────────────────────────────────────┘
```

**Note:** We're keeping single-database multi-tenancy (not separate DBs per tenant) to match current architecture. PostgreSQL's MVCC handles concurrency issues.

### 2.2 Schema Changes Required

**Minimal Changes - Prisma Abstracts Most Differences:**

```diff
// api/prisma/schema.prisma

datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ID generation changes (optional but recommended):
model Church {
-  id        String   @id @default(cuid())
+  id        String   @id @default(uuid())  // Or keep cuid()
  // ... rest unchanged
}

// Enum changes (SQLite doesn't support native enums):
// BEFORE (SQLite - string fields):
model User {
  status       String    @default("active")
  // ...
}

// AFTER (PostgreSQL - native enums, optional):
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model User {
  status       UserStatus  @default(ACTIVE)
  // ...
}
```

**Database-Specific Migrations:**
1. Replace `AUTOINCREMENT` with `SERIAL` (handled by Prisma)
2. Update datetime handling (`CURRENT_TIMESTAMP` vs `now()`) - Prisma handles this
3. Add Row-Level Security policies (new feature)
4. Create indexes optimized for PostgreSQL (GIN for full-text search)

---

## 3. Migration Phases

### Phase 0: Pre-Migration Setup (4 hours)

**Goal:** Prepare environment and verify compatibility

#### Tasks:
1. **Install PostgreSQL locally**
   ```bash
   # macOS
   brew install postgresql@16
   brew services start postgresql@16
   
   # Verify
   psql --version  # Should show 16.x
   ```

2. **Create local PostgreSQL database**
   ```bash
   createdb churchapp_dev
   psql churchapp_dev
   
   # In psql:
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  # For UUID generation
   CREATE EXTENSION IF NOT EXISTS pg_trgm;      # For fuzzy search
   \q
   ```

3. **Update environment variables**
   ```bash
   # api/.env.local (create if doesn't exist)
   # SQLite (current):
   DATABASE_URL="file:./prisma/dev.db"
   
   # PostgreSQL (new):
   DATABASE_URL="postgresql://localhost:5432/churchapp_dev?schema=public"
   ```

4. **Backup current SQLite data**
   ```bash
   cd api/prisma
   cp dev.db dev.db.backup-$(date +%Y%m%d)
   
   # Export to SQL for migration
   sqlite3 dev.db .dump > sqlite_backup.sql
   ```

5. **Document current data state**
   ```bash
   # Count records per table
   sqlite3 dev.db "SELECT 'Church', COUNT(*) FROM Church
   UNION SELECT 'User', COUNT(*) FROM User
   UNION SELECT 'Profile', COUNT(*) FROM Profile
   UNION SELECT 'Group', COUNT(*) FROM Group
   UNION SELECT 'Event', COUNT(*) FROM Event;"
   ```

#### Acceptance Criteria:
- [ ] PostgreSQL 16 installed and running
- [ ] Local database created with extensions
- [ ] SQLite backup created with timestamp
- [ ] Data counts documented for verification

---

### Phase 1: Schema Migration (6-8 hours)

**Goal:** Migrate Prisma schema to PostgreSQL and verify

#### Tasks:

1. **Update Prisma schema file**
   ```diff
   // api/prisma/schema.prisma
   
   datasource db {
   -  provider = "sqlite"
   +  provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Handle SQLite-specific patterns**
   ```typescript
   // Check for SQLite-specific code in services
   grep -r "AUTOINCREMENT\|sqlite\|.db\|INTEGER PRIMARY KEY" api/src/
   
   // Common patterns to update:
   // - Replace `INTEGER PRIMARY KEY AUTOINCREMENT` with `SERIAL`
   // - Replace `DATETIME` with `TIMESTAMPTZ`
   // - Update `PRAGMA` statements (remove, PostgreSQL doesn't use)
   ```

3. **Generate fresh PostgreSQL migration**
   ```bash
   cd api
   
   # Reset migrations (creates new baseline)
   rm -rf prisma/migrations/
   pnpm prisma migrate dev --name init-postgresql
   
   # Verify generated SQL
   cat prisma/migrations/*/migration.sql
   ```

4. **Add PostgreSQL-specific indexes**
   ```sql
   -- api/prisma/migrations/<timestamp>_add_postgres_indexes/migration.sql
   
   -- Full-text search indexes (PostgreSQL GIN)
   CREATE INDEX idx_profile_name_gin ON "Profile" 
   USING gin(to_tsvector('english', "firstName" || ' ' || "lastName"));
   
   CREATE INDEX idx_user_email_gin ON "User" 
   USING gin(to_tsvector('english', "primaryEmail"));
   
   -- Partial indexes for soft delete
   CREATE INDEX idx_users_active ON "User"("churchId", "status") 
   WHERE "deletedAt" IS NULL;
   
   CREATE INDEX idx_events_active ON "Event"("churchId", "startTime") 
   WHERE "deletedAt" IS NULL;
   
   -- Composite indexes for common queries
   CREATE INDEX idx_attendance_church_event ON "Attendance"("churchId", "eventId", "userId");
   CREATE INDEX idx_group_members_church ON "GroupMember"("userId", "groupId");
   ```

5. **Test schema generation**
   ```bash
   # Verify Prisma can connect
   pnpm prisma db push --skip-generate
   
   # Generate Prisma Client
   pnpm prisma generate
   
   # Verify all models
   pnpm prisma studio  # Visual inspection
   ```

#### Acceptance Criteria:
- [ ] Prisma schema updated to PostgreSQL provider
- [ ] Fresh migration baseline created
- [ ] PostgreSQL-specific indexes added
- [ ] Prisma Client generates without errors
- [ ] All tables created in PostgreSQL database

---

### Phase 2: Data Migration (4-6 hours)

**Goal:** Transfer existing SQLite data to PostgreSQL

#### Tasks:

1. **Export SQLite data to JSON**
   ```typescript
   // scripts/export-sqlite-data.ts
   import { PrismaClient } from '@prisma/client';
   import * as fs from 'fs';
   
   const sqlite = new PrismaClient({
     datasources: { db: { url: 'file:./prisma/dev.db' } }
   });
   
   async function exportData() {
     const data = {
       churches: await sqlite.church.findMany({ include: { users: true } }),
       users: await sqlite.user.findMany(),
       profiles: await sqlite.profile.findMany(),
       groups: await sqlite.group.findMany(),
       events: await sqlite.event.findMany(),
       // ... all other tables
     };
     
     fs.writeFileSync('sqlite-export.json', JSON.stringify(data, null, 2));
     console.log('Export complete:', Object.keys(data).map(k => `${k}: ${data[k].length}`));
   }
   
   exportData().finally(() => sqlite.$disconnect());
   ```

2. **Import data to PostgreSQL**
   ```typescript
   // scripts/import-postgres-data.ts
   import { PrismaClient } from '@prisma/client';
   import * as fs from 'fs';
   
   const postgres = new PrismaClient({
     datasources: { db: { url: process.env.DATABASE_URL } }
   });
   
   async function importData() {
     const data = JSON.parse(fs.readFileSync('sqlite-export.json', 'utf-8'));
     
     // Import in dependency order
     console.log('Importing churches...');
     for (const church of data.churches) {
       await postgres.church.create({ data: church });
     }
     
     console.log('Importing users...');
     for (const user of data.users) {
       await postgres.user.create({ data: user });
     }
     
     // ... continue for all tables
     
     console.log('Import complete!');
   }
   
   importData().finally(() => postgres.$disconnect());
   ```

3. **Run migration scripts**
   ```bash
   cd api
   
   # Export from SQLite
   DATABASE_URL="file:./prisma/dev.db" tsx scripts/export-sqlite-data.ts
   
   # Import to PostgreSQL
   DATABASE_URL="postgresql://localhost:5432/churchapp_dev" tsx scripts/import-postgres-data.ts
   ```

4. **Verify data integrity**
   ```bash
   # Count records in PostgreSQL
   psql churchapp_dev -c "
   SELECT 'Church' as table, COUNT(*) FROM \"Church\"
   UNION SELECT 'User', COUNT(*) FROM \"User\"
   UNION SELECT 'Profile', COUNT(*) FROM \"Profile\"
   UNION SELECT 'Group', COUNT(*) FROM \"Group\"
   UNION SELECT 'Event', COUNT(*) FROM \"Event\";
   "
   
   # Compare with SQLite counts from Phase 0
   ```

5. **Test foreign key integrity**
   ```sql
   -- Verify all foreign keys resolve
   SELECT COUNT(*) FROM "Profile" p
   LEFT JOIN "User" u ON p."userId" = u."id"
   WHERE u."id" IS NULL;
   -- Should return 0
   
   SELECT COUNT(*) FROM "ChurchUser" cu
   LEFT JOIN "Church" c ON cu."churchId" = c."id"
   WHERE c."id" IS NULL;
   -- Should return 0
   ```

#### Acceptance Criteria:
- [ ] All tables have matching record counts
- [ ] Foreign key relationships intact
- [ ] No orphaned records
- [ ] Date/time fields preserved correctly
- [ ] JSON fields (if any) migrated correctly

---

### Phase 3: Application Updates (4-6 hours)

**Goal:** Update application code for PostgreSQL compatibility

#### Tasks:

1. **Update raw SQL queries**
   ```bash
   # Find raw SQL queries
   grep -r "prisma.\$executeRaw\|prisma.\$queryRaw" api/src/
   
   # Common replacements:
   # SQLite: strftime('%Y-%m-%d', date_field)
   # PostgreSQL: date_field::date
   
   # SQLite: SUBSTR(field, 1, 10)
   # PostgreSQL: SUBSTRING(field, 1, 10)
   
   # SQLite: field LIKE '%search%'
   # PostgreSQL: field ILIKE '%search%' OR use to_tsvector
   ```

2. **Update database-specific features**
   ```typescript
   // BEFORE (SQLite-specific):
   const users = await prisma.user.findMany({
     where: {
       firstName: { contains: search, mode: 'insensitive' }
     }
   });
   
   // AFTER (PostgreSQL full-text search):
   const users = await prisma.$queryRaw`
     SELECT * FROM "User"
     WHERE to_tsvector('english', "firstName" || ' ' || "lastName") 
       @@ plainto_tsquery('english', ${search})
   `;
   ```

3. **Update test fixtures**
   ```typescript
   // test/support/fixtures.ts
   // Update any SQLite-specific test data or queries
   
   // Example: Date comparisons
   // SQLite: date('now')
   // PostgreSQL: CURRENT_DATE
   ```

4. **Update seed scripts**
   ```bash
   cd api/prisma
   
   # Test seed script with PostgreSQL
   pnpm prisma db seed
   
   # Verify seeded data
   pnpm prisma studio
   ```

5. **Update connection handling**
   ```typescript
   // api/src/prisma/prisma.service.ts
   
   @Injectable()
   export class PrismaService extends PrismaClient implements OnModuleInit {
     constructor() {
       super({
         datasources: {
           db: {
             url: process.env.DATABASE_URL,
           },
         },
         log: ['query', 'error', 'warn'],  // Enable query logging
       });
     }
     
     async onModuleInit() {
       await this.$connect();
       
       // PostgreSQL-specific optimizations
       await this.$executeRaw`SET statement_timeout = '30s'`;
       await this.$executeRaw`SET idle_in_transaction_session_timeout = '60s'`;
     }
   }
   ```

#### Acceptance Criteria:
- [ ] All raw SQL queries updated for PostgreSQL syntax
- [ ] Seed script runs successfully
- [ ] No SQLite-specific code remains
- [ ] Connection pooling configured
- [ ] Query timeouts set

---

### Phase 4: Testing & Validation (6-8 hours)

**Goal:** Comprehensive testing to ensure feature parity

#### Tasks:

1. **Run unit tests**
   ```bash
   cd api
   
   # Set PostgreSQL connection
   export DATABASE_URL="postgresql://localhost:5432/churchapp_test"
   
   # Create test database
   createdb churchapp_test
   pnpm prisma migrate deploy
   
   # Run tests
   pnpm test
   
   # Check coverage
   pnpm test:cov
   ```

2. **Run integration tests**
   ```bash
   # Run API integration tests
   cd api
   pnpm test:integration
   
   # Verify all endpoints return expected data
   ```

3. **Run E2E tests**
   ```bash
   # Start API with PostgreSQL
   cd api
   pnpm dev
   
   # Run E2E tests
   cd ../web
   pnpm test:e2e
   ```

4. **Performance testing**
   ```bash
   # Load test critical endpoints
   # Install k6 or use Apache Bench
   
   # Test member list endpoint
   ab -n 1000 -c 10 http://localhost:3001/api/users?churchId=xxx
   
   # Test search endpoint
   ab -n 500 -c 10 "http://localhost:3001/api/users?search=john"
   
   # Compare with SQLite baseline
   ```

5. **Manual QA checklist**
   ```markdown
   - [ ] Login/authentication works
   - [ ] Member list loads with correct data
   - [ ] Search returns accurate results
   - [ ] Member profile shows all details
   - [ ] Groups display correctly
   - [ ] Events calendar loads
   - [ ] Attendance tracking works
   - [ ] Giving contributions display
   - [ ] Announcements show
   - [ ] Soft delete (archive/restore) works
   - [ ] Multi-church isolation (test with 2+ churches)
   - [ ] Concurrent operations (multiple users)
   ```

6. **Rollback test**
   ```bash
   # Verify we can roll back to SQLite if needed
   cd api
   
   # Switch back to SQLite
   export DATABASE_URL="file:./prisma/dev.db"
   
   # Verify app starts
   pnpm dev
   
   # Switch back to PostgreSQL
   export DATABASE_URL="postgresql://localhost:5432/churchapp_dev"
   ```

#### Acceptance Criteria:
- [ ] All unit tests pass (100%)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Performance within acceptable range (P95 <500ms)
- [ ] Manual QA checklist complete
- [ ] Rollback procedure verified

---

### Phase 5: Row-Level Security Setup (4-6 hours)

**Goal:** Implement PostgreSQL RLS for tenant isolation (OPTIONAL but recommended)

#### Tasks:

1. **Enable RLS on tables**
   ```sql
   -- api/prisma/migrations/<timestamp>_enable_rls/migration.sql
   
   -- Enable RLS on all tenant-scoped tables
   ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Group" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
   ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
   -- ... all other churchId tables
   ```

2. **Create RLS policies**
   ```sql
   -- Policy: Users can only access their church's data
   CREATE POLICY tenant_isolation_policy ON "User"
   FOR ALL
   USING ("churchId" = current_setting('app.current_church_id')::text);
   
   CREATE POLICY tenant_isolation_policy ON "Profile"
   FOR ALL
   USING ("churchId" = current_setting('app.current_church_id')::text);
   
   -- Repeat for all tables with churchId
   ```

3. **Set church context in application**
   ```typescript
   // api/src/common/interceptors/tenant-context.interceptor.ts
   
   @Injectable()
   export class TenantContextInterceptor implements NestInterceptor {
     constructor(private prisma: PrismaService) {}
     
     async intercept(context: ExecutionContext, next: CallHandler) {
       const request = context.switchToHttp().getRequest();
       const churchId = request.user?.churchId;
       
       if (churchId) {
         // Set PostgreSQL session variable
         await this.prisma.$executeRaw`
           SELECT set_config('app.current_church_id', ${churchId}, false)
         `;
       }
       
       return next.handle();
     }
   }
   ```

4. **Test RLS policies**
   ```sql
   -- Test isolation between churches
   SET app.current_church_id = 'church-1';
   SELECT COUNT(*) FROM "User";  -- Should only return church-1 users
   
   SET app.current_church_id = 'church-2';
   SELECT COUNT(*) FROM "User";  -- Should only return church-2 users
   
   -- Test without context (should fail or return 0)
   RESET app.current_church_id;
   SELECT COUNT(*) FROM "User";  -- Should fail or return 0
   ```

#### Acceptance Criteria:
- [ ] RLS enabled on all tenant-scoped tables
- [ ] Policies created for all tables
- [ ] Application sets church context correctly
- [ ] Isolation verified between churches
- [ ] No cross-tenant data leakage

---

### Phase 6: Deployment & Monitoring (4-6 hours)

**Goal:** Deploy to staging/production with monitoring

#### Tasks:

1. **Choose hosting provider**
   - **Recommended:** Supabase (PostgreSQL + connection pooling + backups + monitoring)
   - **Alternative:** Heroku Postgres, DigitalOcean, Railway, Neon

2. **Provision production database**
   ```bash
   # Example: Supabase
   # 1. Create project at https://supabase.com
   # 2. Get connection string
   # 3. Update environment variable
   
   # Production connection string format:
   DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
   ```

3. **Run migrations in production**
   ```bash
   # Deploy migrations
   cd api
   pnpm prisma migrate deploy
   
   # Verify migration status
   pnpm prisma migrate status
   ```

4. **Import production data**
   ```bash
   # If migrating existing data:
   # 1. Export from SQLite production
   # 2. Import to PostgreSQL using scripts from Phase 2
   # 3. Verify record counts
   ```

5. **Configure connection pooling**
   ```bash
   # Update DATABASE_URL to use PgBouncer
   # Supabase provides this automatically via ?pgbouncer=true
   
   # Or set up PgBouncer separately:
   # api/.env.production
   DATABASE_URL="postgresql://user:password@pgbouncer:6432/database"
   ```

6. **Set up monitoring**
   ```typescript
   // Add PostgreSQL monitoring to OpenTelemetry
   // api/src/main.ts
   
   import { PrismaInstrumentation } from '@prisma/instrumentation';
   
   const sdk = new NodeSDK({
     traceExporter: new JaegerExporter(),
     instrumentations: [
       new PrismaInstrumentation(),  // Tracks Prisma queries
       // ... other instrumentations
     ],
   });
   ```

7. **Create monitoring dashboards**
   - Query latency (P50, P95, P99)
   - Connection pool utilization
   - Slow queries (>500ms)
   - Error rates
   - Database size growth

8. **Document rollback procedure**
   ```markdown
   # Emergency Rollback to SQLite
   
   1. Stop application
   2. Switch DATABASE_URL back to SQLite
   3. Restore SQLite backup
   4. Restart application
   5. Verify functionality
   
   # Time required: 5-10 minutes
   ```

#### Acceptance Criteria:
- [ ] Production database provisioned
- [ ] Migrations deployed successfully
- [ ] Connection pooling configured
- [ ] Monitoring dashboards created
- [ ] Rollback procedure documented and tested
- [ ] Team trained on new infrastructure

---

## 4. Risk Mitigation

### 4.1 Risks & Mitigation Strategies

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Data loss during migration** | CRITICAL | Low | Full SQLite backup before migration; test migration on staging first; verify record counts at each step |
| **Performance regression** | High | Medium | Benchmark before/after; optimize indexes; add connection pooling; use EXPLAIN ANALYZE for slow queries |
| **Application downtime** | High | Low | Blue-green deployment; run in parallel during transition; feature flags for rollback |
| **Foreign key violations** | Medium | Low | Test data integrity before go-live; fix any orphaned records in SQLite first |
| **Team unfamiliarity with PostgreSQL** | Medium | Medium | Training session; documentation; PostgreSQL cheat sheet; pair programming during transition |
| **Connection pool exhaustion** | Medium | Medium | Configure PgBouncer; monitor connection count; set connection limits; implement connection retry logic |
| **Slow query discovery** | Low | High | Enable slow query log; set up alerts for queries >500ms; create missing indexes proactively |

### 4.2 Rollback Plan

**If migration fails, we can roll back in <10 minutes:**

1. **Stop application**
2. **Switch environment variable**
   ```bash
   # Revert to SQLite
   DATABASE_URL="file:./prisma/dev.db"
   ```
3. **Restore SQLite backup**
   ```bash
   cd api/prisma
   cp dev.db.backup-YYYYMMDD dev.db
   ```
4. **Restart application**
5. **Verify functionality**

**Rollback window:** 48 hours after migration (keep SQLite backup for 48 hours)

---

## 5. Testing Strategy

### 5.1 Test Matrix

| Test Type | Scope | Pass Criteria |
|-----------|-------|---------------|
| **Unit Tests** | All service methods | 100% pass, >80% coverage |
| **Integration Tests** | API endpoints | All endpoints return 200, data matches schema |
| **E2E Tests** | User workflows | All critical paths work end-to-end |
| **Performance Tests** | Query latency | P95 <500ms for all endpoints |
| **Load Tests** | Concurrent users | 50 concurrent users, <1% error rate |
| **Data Integrity** | Record counts | PostgreSQL counts match SQLite export |
| **Isolation Tests** | Multi-tenancy | Church A cannot access Church B data |

### 5.2 Test Environments

1. **Local Development:** PostgreSQL running on localhost
2. **Staging:** Supabase free tier or Heroku Hobby ($5/mo)
3. **Production:** Supabase Pro ($25/mo) or Heroku Standard ($50/mo)

---

## 6. Success Criteria

### 6.1 Technical Metrics

- [ ] All unit tests pass (100%)
- [ ] All integration tests pass (100%)
- [ ] All E2E tests pass (100%)
- [ ] P95 API latency ≤500ms (improvement from SQLite)
- [ ] Zero data loss (all records migrated)
- [ ] Zero foreign key violations
- [ ] Connection pool utilization <80%

### 6.2 Operational Metrics

- [ ] Zero downtime deployment
- [ ] Rollback procedure tested and documented
- [ ] Monitoring dashboards operational
- [ ] Team trained on PostgreSQL operations
- [ ] Documentation updated (all references to SQLite)

### 6.3 Business Metrics

- [ ] Multi-tenant write concurrency works (no blocking)
- [ ] Supports 10+ churches without performance degradation
- [ ] Can onboard new church in <5 minutes
- [ ] Backup/restore procedure tested (single church)

---

## 7. Timeline

### Estimated Duration: 2-3 Days (Full-Time)

| Phase | Duration | Dependencies | Owner |
|-------|----------|--------------|-------|
| Phase 0: Setup | 4 hours | None | Engineer |
| Phase 1: Schema | 6-8 hours | Phase 0 | Engineer |
| Phase 2: Data | 4-6 hours | Phase 1 | Engineer |
| Phase 3: App Code | 4-6 hours | Phase 2 | Engineer |
| Phase 4: Testing | 6-8 hours | Phase 3 | Engineer + QA |
| Phase 5: RLS (optional) | 4-6 hours | Phase 4 | Engineer |
| Phase 6: Deploy | 4-6 hours | Phase 4 or 5 | Engineer + DevOps |

**Total:** 32-44 hours (realistic: 3-4 working days with buffer)

**Critical Path:** Phases 0-4 must complete before deployment. Phase 5 (RLS) can be added post-launch if needed.

---

## 8. Post-Migration Tasks

### 8.1 Immediate (Week 1)

- [ ] Monitor query performance (slow query log)
- [ ] Verify backup schedule running
- [ ] Check connection pool utilization
- [ ] Review error logs for PostgreSQL-specific issues
- [ ] Update all documentation references

### 8.2 Short-Term (Month 1)

- [ ] Optimize slow queries (add indexes)
- [ ] Implement query caching strategy
- [ ] Set up automated performance testing
- [ ] Create PostgreSQL runbook for team
- [ ] Review and optimize connection pool settings

### 8.3 Long-Term (Quarter 1)

- [ ] Evaluate read replica for reporting queries
- [ ] Consider partitioning for large tables (>1M rows)
- [ ] Implement advanced full-text search (if needed)
- [ ] Review database growth, plan capacity
- [ ] Evaluate sharding strategy for massive scale

---

## 9. Documentation Updates Required

After migration completes, the following documents MUST be updated:

### 9.1 Critical Updates (Blocks Launch)

1. **`docs/source-of-truth/DATABASE_SCHEMA.md`**
   - Update provider from SQLite to PostgreSQL
   - Add PostgreSQL-specific features (RLS, JSONB, arrays)
   - Update index definitions (GIN indexes for full-text search)

2. **`docs/source-of-truth/ARCHITECTURE.md`**
   - Update "Database Architecture" section (lines 200-220)
   - Change "SQLite" to "PostgreSQL with multi-tenant architecture"
   - Update connection management section

3. **`docs/source-of-truth/API_DOCUMENTATION.md`**
   - Update DATA_MODE documentation (line 26)
   - Change default from "sqlite" to "postgresql"

4. **`docs/guides/TECH_STACK.md`**
   - Update "Database & ORM" section (line 28)
   - Change "PostgreSQL - Production database (configurable)" to "PostgreSQL - Primary database"

5. **`docs/PRD.md`**
   - Update "Architecture" section (line 70)
   - Confirm PostgreSQL as primary database

6. **`docs/SETUP.md`**
   - Update "Prerequisites" section (line 12)
   - Change PostgreSQL from "Optional" to "Required"
   - Add PostgreSQL installation instructions

### 9.2 Important Updates (Should Update)

7. **`README.md`**
   - Update "Data" feature line (line 9)
   - Remove "no Postgres required"
   - Update "Tech Stack" section (line 74)
   - Remove "Prisma schema remains for future Postgres wiring"

8. **`docs/guides/README.md`**
   - Update backend stack reference (line 61)
   - Confirm PostgreSQL as current database

9. **`docs/sprints/members-hub-mvp-PAUSED/members-hub-mvp-IMPLEMENTATION-PLAN.md`**
   - Remove SQLite warnings and blocker sections
   - Update performance targets to PostgreSQL baselines
   - Update all SQL examples to PostgreSQL syntax (GIN indexes, etc.)

10. **`docs/MEMBERS_HUB_MVP_SPEC.md`** (if unpaused)
    - Update performance targets for PostgreSQL
    - Remove SQLite limitations

### 9.3 Minor Updates (Nice to Have)

11. **`.devcontainer/README.md`** (if exists)
    - Update database setup instructions

12. **Sprint documentation in `docs/sprints/`**
    - Review all sprint plans for SQLite references
    - Update as needed for future sprints

---

## 10. Open Questions for Architect Review

### Critical Decisions Needed:

1. **RLS Implementation:** Should we implement Row-Level Security in Phase 5, or defer to post-launch?
   - **Pro:** Additional security layer, database-enforced isolation
   - **Con:** Adds complexity, requires session management
   - **Recommendation:** Defer to post-launch, implement application-level checks first

2. **Hosting Provider:** Which PostgreSQL hosting should we use?
   - **Supabase:** $25/mo, includes backups, monitoring, connection pooling
   - **Heroku:** $50/mo for production tier, very stable
   - **DigitalOcean:** $15/mo managed, good balance
   - **Railway:** $5/mo, newer platform
   - **Recommendation:** Supabase (best features for price)

3. **Migration Timing:** When should we perform production migration?
   - **Option A:** Before Members Hub MVP (recommended)
   - **Option B:** After Members Hub MVP on SQLite
   - **Recommendation:** Option A - avoid double migration

4. **Enum Strategy:** Use PostgreSQL native enums or keep as strings?
   - **Native Enums:** Type-safe, better performance, harder to modify
   - **String Fields:** Flexible, easier to change, less type-safety
   - **Recommendation:** Keep strings for MVP, evaluate enums later

5. **ID Generation:** Keep `cuid()` or switch to PostgreSQL `uuid()`?
   - **cuid():** Shorter, sortable, current pattern
   - **uuid():** Standard, widely supported, PostgreSQL native
   - **Recommendation:** Keep cuid() for consistency

### Non-Blocking Questions:

6. **Connection Pool Size:** What's appropriate for our scale?
   - **Current:** No pooling (SQLite)
   - **Target:** 20-60 connections (depends on hosting)
   - **Recommendation:** Start with provider default, monitor and adjust

7. **Backup Strategy:** How often should we backup?
   - **Frequency:** Continuous (WAL archiving) + daily snapshots
   - **Retention:** 30 days for daily, 7 days for continuous
   - **Recommendation:** Use provider's automated backup (Supabase/Heroku)

8. **Read Replicas:** Do we need them now?
   - **Current Scale:** No (1-10 churches)
   - **Future:** Yes (100+ churches)
   - **Recommendation:** Defer until >50 churches or performance issues

---

## 11. Appendix A: PostgreSQL Quick Reference

### Common Commands

```bash
# Connect to database
psql churchapp_dev

# List databases
\l

# Connect to database
\c churchapp_dev

# List tables
\dt

# Describe table
\d "User"

# Show running queries
SELECT pid, query, state FROM pg_stat_activity WHERE state = 'active';

# Kill long-running query
SELECT pg_terminate_backend(12345);  -- Replace with actual pid

# Show database size
SELECT pg_size_pretty(pg_database_size('churchapp_dev'));

# Show table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Performance Queries

```sql
-- Find slow queries
SELECT query, calls, total_exec_time, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public';
```

---

## 12. Appendix B: PostgreSQL vs SQLite Feature Comparison

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Concurrency** | Single writer | Multiple writers (MVCC) |
| **Transactions** | Serializable | Multiple isolation levels |
| **Full-Text Search** | FTS5 (manual) | Native tsvector, GIN indexes |
| **JSON** | JSON1 extension | Native JSONB with indexing |
| **Arrays** | No | Native arrays |
| **Enums** | No | Native enums |
| **Row-Level Security** | No | Yes (RLS policies) |
| **Stored Procedures** | No | Yes (PL/pgSQL) |
| **Triggers** | Limited | Full support |
| **Partitioning** | No | Table partitioning |
| **Connection Pooling** | N/A (file-based) | Required (PgBouncer) |
| **Replication** | No | Streaming replication |
| **Backup** | File copy | pg_dump, WAL archiving |
| **Hosting** | Local file | Managed services available |
| **Max Size** | 281 TB (theoretical) | Unlimited (practical) |

---

## Document Changelog

- **v1.0.0** (9 Nov 2025): Initial migration plan created by Principal Engineer, awaiting Architect review

---

**Next Steps:**
1. **Architect:** Review and approve migration plan
2. **Engineer:** Begin Phase 0 (setup) after approval
3. **Team:** Schedule migration window (recommend off-hours)
4. **Stakeholders:** Communicate migration timeline and benefits

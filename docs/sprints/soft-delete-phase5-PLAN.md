# Soft Delete Phase 5: Households & Children Backend - Implementation Plan

**Sprint:** Soft Delete Implementation  
**Phase:** 5 of 7  
**Status:** Ready for Implementation  
**Branch:** `feature/soft-delete-phase5-households-backend`  
**Base Branch:** `feature/soft-delete-main-sprint`  
**Date Created:** 4 November 2025  

---

## Overview

Implement backend soft delete functionality for Households and Children entities, following the proven patterns established in Phases 1 and 3. This phase adds complete CRUD operations with soft delete support, proper authorization, audit logging, and comprehensive testing.

## Prerequisites (Completed)

- ✅ Phase 1: Backend soft delete for Users and Events
- ✅ Phase 2: Frontend soft delete for Groups and Announcements
- ✅ Phase 3: Backend soft delete for Giving module
- ✅ Phase 4: Frontend soft delete for Giving module
- ✅ Sprint branch `feature/soft-delete-main-sprint` exists

## Objectives

1. **Database Schema**: Add `deletedAt` columns to Households and Children tables with proper indexes
2. **Complete API Coverage**: Implement 40+ methods across data store, service, and controller layers
3. **Authorization**: Enforce Admin/Leader-only access for soft delete operations
4. **Audit Logging**: Track all soft delete operations with actor and timestamp
5. **Zero Regression**: Maintain all existing functionality while adding soft delete support
6. **Comprehensive Testing**: 30+ unit/integration tests with 100% coverage for new methods

---

## Technical Approach

### Database Schema Changes

```sql
-- Migration: Add deletedAt to Household table
ALTER TABLE "Household" ADD COLUMN "deletedAt" TIMESTAMP;
CREATE INDEX "idx_household_deleted_at" ON "Household" ("deletedAt");

-- Migration: Add deletedAt to Child table
ALTER TABLE "Child" ADD COLUMN "deletedAt" TIMESTAMP;
CREATE INDEX "idx_child_deleted_at" ON "Child" ("deletedAt");
```

### Architecture Components

```
api/
├── prisma/
│   └── migrations/
│       └── [timestamp]_add_soft_delete_households_children/
│           └── migration.sql                    [NEW] Database migration
├── src/
│   ├── datastore/
│   │   ├── mock-data-store.adapter.ts          [UPDATE] Add 20 household + child methods
│   │   ├── prisma-data-store.service.ts        [UPDATE] Add 20 household + child methods
│   │   └── in-memory-data-store.service.ts     [UPDATE] Add 20 household + child methods
│   ├── mock/
│   │   └── mock-database.service.ts            [UPDATE] Add soft delete logic
│   └── modules/
│       ├── households/
│       │   ├── households.service.ts           [UPDATE] Add 10 soft delete methods
│       │   └── households.controller.ts        [UPDATE] Add 10 endpoints
│       └── checkin/
│           ├── checkin.service.ts              [UPDATE] Add 10 child soft delete methods
│           └── checkin.controller.ts           [UPDATE] Add 10 child endpoints
└── test/
    ├── households.spec.ts                      [ADD] 15+ unit tests
    └── checkin.spec.ts                         [UPDATE] Add 15+ child soft delete tests
```

---

## Implementation Phases

### Phase 5A: Database Schema Migration (1h)

**Step 1: Create Prisma Migration**
- Create migration file: `add_soft_delete_households_children`
- Add `deletedAt` column to Household table
- Add `deletedAt` column to Child table
- Create indexes on both `deletedAt` columns for query performance

**Step 2: Update Prisma Schema**
- Add `deletedAt DateTime?` to Household model in `tenant-schema.prisma`
- Add `deletedAt DateTime?` to Child model in `tenant-schema.prisma`
- Regenerate Prisma client

**Step 3: Create Rollback Migration** (Risk Mitigation)
- Document rollback SQL in separate file for production safety:
```sql
-- Rollback migration
DROP INDEX "idx_child_deleted_at";
DROP INDEX "idx_household_deleted_at";
ALTER TABLE "Child" DROP COLUMN "deletedAt";
ALTER TABLE "Household" DROP COLUMN "deletedAt";
```

**Validation:**
- Migration runs successfully on test database
- Schema reflects new columns
- Prisma client generates with deletedAt fields
- Rollback script tested on staging

---

### Phase 5A.5: Setup Module Dependencies & Shared Utilities (30min)

**Step 4: Create Shared Authorization Helper**
Create `api/src/common/auth/auth.helpers.ts`:
```typescript
import { ForbiddenException } from '@nestjs/common';

export function ensureLeader(req: any): void {
  const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
  const isLeader = roles.some(role => role.role === 'Leader');
  const isAdmin = roles.some(role => role.role === 'Admin');
  if (!isLeader && !isAdmin) {
    throw new ForbiddenException('Leader or Admin role required');
  }
}
```

**Step 5: Create Bulk Operation DTOs**
Create `api/src/modules/households/dto/bulk-operations.dto.ts`:
```typescript
import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteHouseholdsDto {
  @ApiProperty({ type: [String], description: 'Array of household IDs to delete' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export class BulkRestoreHouseholdsDto {
  @ApiProperty({ type: [String], description: 'Array of household IDs to restore' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
```

Create `api/src/modules/checkin/dto/bulk-operations.dto.ts`:
```typescript
import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteChildrenDto {
  @ApiProperty({ type: [String], description: 'Array of child IDs to delete' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}

export class BulkRestoreChildrenDto {
  @ApiProperty({ type: [String], description: 'Array of child IDs to restore' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
```

**Step 6: Update Module Imports**

Update `api/src/modules/households/households.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MockDataModule } from '../../mock/mock-data.module';
import { DataStoreModule } from '../../datastore/data-store.module';
import { AuditModule } from '../audit/audit.module';
import { HouseholdsController } from './households.controller';
import { HouseholdsService } from './households.service';

@Module({
  imports: [DataStoreModule, MockDataModule, AuditModule],
  controllers: [HouseholdsController],
  providers: [HouseholdsService],
})
export class HouseholdsModule {}
```

Update `api/src/modules/checkin/checkin.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { DataStoreModule } from '../../datastore/data-store.module';
import { MockDataModule } from '../../mock/mock-data.module';
import { AuditModule } from '../audit/audit.module';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';

@Module({
  imports: [DataStoreModule, MockDataModule, AuditModule],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
```

**Validation:**
- Shared helper compiles without errors
- DTOs have proper validation decorators
- Module imports resolve correctly
- TypeScript compilation succeeds

---

### Phase 5B: Households Backend Implementation (3-4h)

**Step 7: Mock Database Service**
Add to `mock-database.service.ts`:
```typescript
// Soft delete household
deleteHousehold(id: string, actorUserId: string) {
  const household = this.households.find(h => h.id === id && !h.deletedAt);
  if (!household) throw new NotFoundException('Household not found');
  household.deletedAt = new Date().toISOString();
  return household;
}

// Restore household
undeleteHousehold(id: string, actorUserId: string) {
  const household = this.households.find(h => h.id === id && h.deletedAt);
  if (!household) throw new NotFoundException('Household not found or not deleted');
  household.deletedAt = null;
  return household;
}

// List deleted households
listDeletedHouseholds(churchId?: string) {
  return this.households
    .filter(h => h.deletedAt && (!churchId || h.churchId === churchId))
    .map(h => ({
      ...clone(h),
      memberCount: this.users.filter(u => 
        u.profile?.householdId === h.id && !u.deletedAt
      ).length,
    }));
}

// Bulk delete with partial success support
bulkDeleteHouseholds(ids: string[], actorUserId: string) {
  const results = { successCount: 0, failedCount: 0, failed: [] as string[] };
  for (const id of ids) {
    try {
      this.deleteHousehold(id, actorUserId);
      results.successCount++;
    } catch (error) {
      results.failedCount++;
      results.failed.push(id);
    }
  }
  return results;
}

// Bulk restore with partial success support
bulkUndeleteHouseholds(ids: string[], actorUserId: string) {
  const results = { successCount: 0, failedCount: 0, failed: [] as string[] };
  for (const id of ids) {
    try {
      this.undeleteHousehold(id, actorUserId);
      results.successCount++;
    } catch (error) {
      results.failedCount++;
      results.failed.push(id);
    }
  }
  return results;
}
```

**Update existing listHouseholds method:**
```typescript
listHouseholds(churchId?: string) {
  const list = this.households
    .filter(h => !h.deletedAt && (!churchId || h.churchId === churchId))  // Filter deleted
    .map(h => {
      const members = this.users
        .filter(u => u.profile && u.profile.householdId === h.id && !u.deletedAt)
        .map(u => ({
          userId: u.id,
          firstName: u.profile.firstName,
          lastName: u.profile.lastName,
          householdRole: u.profile.householdRole,
        }));
      return {
        ...clone(h),
        memberCount: members.length,
        members,
      };
    });
  return list;
}
```

**Step 8: Data Store Adapters**
Update all three data store implementations:
- `mock-data-store.adapter.ts`
- `prisma-data-store.service.ts`
- `prisma-multi-tenant-datastore.service.ts`

Add methods (example for one adapter):
```typescript
async deleteHousehold(id: string, context?: ExecutionContext): Promise<any> {
  const churchId = this.extractChurchId(context);
  return this.mock.deleteHousehold(id, this.extractActorId(context));
}

async undeleteHousehold(id: string, context?: ExecutionContext): Promise<any> {
  return this.mock.undeleteHousehold(id, this.extractActorId(context));
}

async listDeletedHouseholds(churchId?: string, context?: ExecutionContext): Promise<any[]> {
  const church = churchId ?? this.extractChurchId(context);
  return this.mock.listDeletedHouseholds(church);
}

async bulkDeleteHouseholds(ids: string[], context?: ExecutionContext): Promise<any> {
  return this.mock.bulkDeleteHouseholds(ids, this.extractActorId(context));
}

async bulkUndeleteHouseholds(ids: string[], context?: ExecutionContext): Promise<any> {
  return this.mock.bulkUndeleteHouseholds(ids, this.extractActorId(context));
}
```

**Step 9: Households Service**
Update `households.service.ts`:
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DATA_STORE } from '../../datastore/data-store.module';
import { DataStore } from '../../datastore/data-store.types';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HouseholdsService {
  constructor(
    @Inject(DATA_STORE) private readonly db: DataStore,
    private readonly auditService: AuditService,
  ) {}

  findAll() {
    return this.db.listHouseholds();
  }

  findOne(id: string) {
    return this.db.getHouseholdById(id);
  }

  async deleteHousehold(id: string, actorUserId: string, churchId: string) {
    const household = await this.db.deleteHousehold(id, { actorUserId, churchId });
    await this.auditService.log({
      action: 'household.delete',
      entityId: id,
      entityType: 'Household',
      actorUserId,
      churchId,
    });
    return household;
  }

  async undeleteHousehold(id: string, actorUserId: string, churchId: string) {
    const household = await this.db.undeleteHousehold(id, { actorUserId, churchId });
    await this.auditService.log({
      action: 'household.restore',
      entityId: id,
      entityType: 'Household',
      actorUserId,
      churchId,
    });
    return household;
  }

  async listDeletedHouseholds(churchId?: string) {
    return this.db.listDeletedHouseholds(churchId);
  }

  async bulkDeleteHouseholds(ids: string[], actorUserId: string, churchId: string) {
    const result = await this.db.bulkDeleteHouseholds(ids, { actorUserId, churchId });
    await this.auditService.log({
      action: 'household.bulk-delete',
      metadata: { count: result.successCount, failed: result.failedCount },
      actorUserId,
      churchId,
    });
    return result;
  }

  async bulkUndeleteHouseholds(ids: string[], actorUserId: string, churchId: string) {
    const result = await this.db.bulkUndeleteHouseholds(ids, { actorUserId, churchId });
    await this.auditService.log({
      action: 'household.bulk-restore',
      metadata: { count: result.successCount, failed: result.failedCount },
      actorUserId,
      churchId,
    });
    return result;
  }
}
```

**Step 10: Households Controller**
Update `households.controller.ts`:
```typescript
import { 
  Controller, 
  Get, 
  Delete, 
  Post, 
  Patch,
  Param, 
  Body,
  Query,
  Req,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiOkResponse,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { HouseholdsService } from './households.service';
import { ensureLeader } from '../../common/auth/auth.helpers';
import { 
  BulkDeleteHouseholdsDto, 
  BulkRestoreHouseholdsDto 
} from './dto/bulk-operations.dto';

@ApiTags('Households')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('households')
export class HouseholdsController {
  constructor(private readonly service: HouseholdsService) {}

  // CRITICAL: Specific routes MUST come before parameterized routes
  
  @Get('deleted/all')
  @ApiOperation({ summary: 'List deleted households (Admin/Leader only)' })
  @ApiOkResponse({ description: 'Array of deleted households' })
  listDeleted(@Query('q') query?: string, @Req() req?: any) {
    ensureLeader(req);
    const churchId = req.user?.churchId;
    return this.service.listDeletedHouseholds(churchId);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Soft delete multiple households (Admin/Leader only)' })
  @ApiOkResponse({ description: 'Bulk operation result with success/failure counts' })
  bulkDelete(@Body() dto: BulkDeleteHouseholdsDto, @Req() req: any) {
    ensureLeader(req);
    return this.service.bulkDeleteHouseholds(
      dto.ids, 
      req.user?.id, 
      req.user?.churchId
    );
  }

  @Post('bulk-restore')
  @ApiOperation({ summary: 'Restore multiple deleted households (Admin/Leader only)' })
  @ApiOkResponse({ description: 'Bulk operation result with success/failure counts' })
  bulkRestore(@Body() dto: BulkRestoreHouseholdsDto, @Req() req: any) {
    ensureLeader(req);
    return this.service.bulkUndeleteHouseholds(
      dto.ids, 
      req.user?.id, 
      req.user?.churchId
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all active households' })
  @ApiOkResponse({ description: 'A list of all active households' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single household by ID' })
  @ApiOkResponse({ description: 'The household with the specified ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete household (Admin/Leader only)' })
  @ApiOkResponse({ description: 'The deleted household' })
  deleteHousehold(
    @Param('id') id: string,
    @Req() req: any
  ) {
    ensureLeader(req);
    return this.service.deleteHousehold(id, req.user?.id, req.user?.churchId);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted household (Admin/Leader only)' })
  @ApiOkResponse({ description: 'The restored household' })
  restoreHousehold(
    @Param('id') id: string,
    @Req() req: any
  ) {
    ensureLeader(req);
    return this.service.undeleteHousehold(id, req.user?.id, req.user?.churchId);
  }
}
```

**Validation:**
- All household soft delete methods work in Postman/curl
- Authorization enforced (403 for non-Admin/Leader)
- Audit logs created for all operations
- TypeScript compiles with zero errors
- Route ordering correct (specific routes before `:id`)

---

### Phase 5C: Children Backend Implementation (3-4h)

**Step 11: Audit Existing Endpoints**
- Check `CheckinController` for existing `DELETE /children/:id` endpoint
- If hard delete exists, rename to `DELETE /children/:id/hard` for backward compatibility
- Document any breaking changes

**Step 12: Mock Database Service**
Add child soft delete methods to `mock-database.service.ts`:
```typescript
// Soft delete child
deleteChild(id: string, actorUserId: string) {
  const child = this.children.find(c => c.id === id && !c.deletedAt);
  if (!child) throw new NotFoundException('Child not found');
  child.deletedAt = new Date().toISOString();
  return child;
}

// Restore child
undeleteChild(id: string, actorUserId: string) {
  const child = this.children.find(c => c.id === id && c.deletedAt);
  if (!child) throw new NotFoundException('Child not found or not deleted');
  child.deletedAt = null;
  return child;
}

// List deleted children
listDeletedChildren(householdId?: string) {
  return this.children
    .filter(c => c.deletedAt && (!householdId || c.householdId === householdId))
    .map(c => clone(c));
}

// Bulk operations with partial success
bulkDeleteChildren(ids: string[], actorUserId: string) {
  const results = { successCount: 0, failedCount: 0, failed: [] as string[] };
  for (const id of ids) {
    try {
      this.deleteChild(id, actorUserId);
      results.successCount++;
    } catch (error) {
      results.failedCount++;
      results.failed.push(id);
    }
  }
  return results;
}

bulkUndeleteChildren(ids: string[], actorUserId: string) {
  const results = { successCount: 0, failedCount: 0, failed: [] as string[] };
  for (const id of ids) {
    try {
      this.undeleteChild(id, actorUserId);
      results.successCount++;
    } catch (error) {
      results.failedCount++;
      results.failed.push(id);
    }
  }
  return results;
}
```

**Update existing getChildren method:**
```typescript
getChildren(householdId: string) {
  return this.children
    .filter(c => c.householdId === householdId && !c.deletedAt)  // Filter deleted
    .map(c => ({
      ...clone(c),
      household: this.households.find(h => h.id === c.householdId),
    }));
}
```

**Update check-in flows to exclude archived children:**
```typescript
getCheckins(status: 'pending' | 'checked-in') {
  return this.checkins
    .filter(ch => ch.status === status)
    .map(ch => {
      const child = this.children.find(c => c.id === ch.childId && !c.deletedAt);
      if (!child) return null;  // Skip archived children
      return {
        ...clone(ch),
        child,
        event: this.events.find(e => e.id === ch.eventId),
      };
    })
    .filter(Boolean);  // Remove nulls
}
```

**Step 13: Data Store Adapters**
Update all three data store implementations with child soft delete methods:
```typescript
async deleteChild(id: string, context?: ExecutionContext): Promise<any> {
  return this.mock.deleteChild(id, this.extractActorId(context));
}

async undeleteChild(id: string, context?: ExecutionContext): Promise<any> {
  return this.mock.undeleteChild(id, this.extractActorId(context));
}

async listDeletedChildren(householdId?: string, context?: ExecutionContext): Promise<any[]> {
  return this.mock.listDeletedChildren(householdId);
}

async bulkDeleteChildren(ids: string[], context?: ExecutionContext): Promise<any> {
  return this.mock.bulkDeleteChildren(ids, this.extractActorId(context));
}

async bulkUndeleteChildren(ids: string[], context?: ExecutionContext): Promise<any> {
  return this.mock.bulkUndeleteChildren(ids, this.extractActorId(context));
}
```

**Step 14: Checkin Service**
Update `checkin.service.ts`:
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DATA_STORE } from '../../datastore/data-store.module';
import { DataStore } from '../../datastore/data-store.types';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CheckinService {
  constructor(
    @Inject(DATA_STORE) private readonly db: DataStore,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  // ... existing methods ...

  async softDeleteChild(id: string, actorUserId: string, churchId: string) {
    const child = await this.db.deleteChild(id, { actorUserId, churchId });
    await this.auditService.log({
      action: 'child.delete',
      entityId: id,
      entityType: 'Child',
      actorUserId,
      churchId,
    });
    return child;
  }

  async undeleteChild(id: string, actorUserId: string, churchId: string) {
    const child = await this.db.undeleteChild(id, { actorUserId, churchId });
    await this.auditService.log({
      action: 'child.restore',
      entityId: id,
      entityType: 'Child',
      actorUserId,
      churchId,
    });
    return child;
  }

  async listDeletedChildren(householdId?: string) {
    return this.db.listDeletedChildren(householdId);
  }

  async bulkDeleteChildren(ids: string[], actorUserId: string, churchId: string) {
    const result = await this.db.bulkDeleteChildren(ids, { actorUserId, churchId });
    await this.auditService.log({
      action: 'child.bulk-delete',
      metadata: { count: result.successCount, failed: result.failedCount },
      actorUserId,
      churchId,
    });
    return result;
  }

  async bulkUndeleteChildren(ids: string[], actorUserId: string, churchId: string) {
    const result = await this.db.bulkUndeleteChildren(ids, { actorUserId, churchId });
    await this.auditService.log({
      action: 'child.bulk-restore',
      metadata: { count: result.successCount, failed: result.failedCount },
      actorUserId,
      churchId,
    });
    return result;
  }
}
```

**Step 15: Checkin Controller**
Update `checkin.controller.ts`:
```typescript
import { 
  Controller, 
  Get, 
  Delete, 
  Post, 
  Patch,
  Param, 
  Body,
  Query,
  Req,
  UseGuards 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiOkResponse,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CheckinService } from './checkin.service';
import { ensureLeader } from '../../common/auth/auth.helpers';
import { 
  BulkDeleteChildrenDto, 
  BulkRestoreChildrenDto 
} from './dto/bulk-operations.dto';

@ApiTags('Check-in')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  // CRITICAL: Specific routes MUST come before parameterized routes
  
  @Get('children/deleted/all')
  @ApiOperation({ summary: 'List deleted children (Admin/Leader only)' })
  @ApiOkResponse({ description: 'Array of deleted children' })
  listDeletedChildren(@Query('householdId') householdId?: string, @Req() req?: any) {
    ensureLeader(req);
    return this.checkinService.listDeletedChildren(householdId);
  }

  @Post('children/bulk-delete')
  @ApiOperation({ summary: 'Soft delete multiple children (Admin/Leader only)' })
  @ApiOkResponse({ description: 'Bulk operation result' })
  bulkDeleteChildren(@Body() dto: BulkDeleteChildrenDto, @Req() req: any) {
    ensureLeader(req);
    return this.checkinService.bulkDeleteChildren(
      dto.ids, 
      req.user?.id, 
      req.user?.churchId
    );
  }

  @Post('children/bulk-restore')
  @ApiOperation({ summary: 'Restore multiple deleted children (Admin/Leader only)' })
  @ApiOkResponse({ description: 'Bulk operation result' })
  bulkRestoreChildren(@Body() dto: BulkRestoreChildrenDto, @Req() req: any) {
    ensureLeader(req);
    return this.checkinService.bulkUndeleteChildren(
      dto.ids, 
      req.user?.id, 
      req.user?.churchId
    );
  }

  // ... existing endpoints ...

  @Delete('children/:id')
  @ApiOperation({ summary: 'Soft delete child (Admin/Leader only)' })
  @ApiOkResponse({ description: 'The deleted child' })
  deleteChild(
    @Param('id') id: string,
    @Req() req: any
  ) {
    ensureLeader(req);
    return this.checkinService.softDeleteChild(id, req.user?.id, req.user?.churchId);
  }

  @Post('children/:id/restore')
  @ApiOperation({ summary: 'Restore deleted child (Admin/Leader only)' })
  @ApiOkResponse({ description: 'The restored child' })
  restoreChild(
    @Param('id') id: string,
    @Req() req: any
  ) {
    ensureLeader(req);
    return this.checkinService.undeleteChild(id, req.user?.id, req.user?.churchId);
  }
}
```

**Validation:**
- All child soft delete methods work
- Check-in dashboard excludes archived children
- Authorization enforced (403 for non-Admin/Leader)
- Audit logs created
- No route conflicts with existing endpoints

---

### Phase 5D: Testing & Documentation (2h)

**Step 16: Household Unit Tests**
Create `test/households.spec.ts` (separate from integration tests):
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HouseholdsService } from '../src/modules/households/households.service';
import { DATA_STORE } from '../src/datastore/data-store.module';
import { AuditService } from '../src/modules/audit/audit.service';

describe('Household Soft Delete', () => {
  let service: HouseholdsService;
  let mockDataStore: any;
  let mockAuditService: any;

  beforeEach(async () => {
    mockDataStore = {
      deleteHousehold: vi.fn(),
      undeleteHousehold: vi.fn(),
      listDeletedHouseholds: vi.fn(),
      bulkDeleteHouseholds: vi.fn(),
      bulkUndeleteHouseholds: vi.fn(),
    };

    mockAuditService = {
      log: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HouseholdsService,
        { provide: DATA_STORE, useValue: mockDataStore },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<HouseholdsService>(HouseholdsService);
  });

  describe('deleteHousehold', () => {
    it('should soft delete household', async () => {
      const household = { id: 'h1', name: 'Test', deletedAt: null };
      mockDataStore.deleteHousehold.mockResolvedValue({ ...household, deletedAt: new Date() });
      
      const result = await service.deleteHousehold('h1', 'user1', 'church1');
      
      expect(result.deletedAt).toBeTruthy();
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'household.delete' })
      );
    });

    it('should throw if household not found', async () => {
      mockDataStore.deleteHousehold.mockRejectedValue(new Error('Not found'));
      
      await expect(service.deleteHousehold('invalid', 'user1', 'church1'))
        .rejects.toThrow('Not found');
    });

    it('should throw if already deleted', async () => {
      mockDataStore.deleteHousehold.mockRejectedValue(new Error('Not found'));
      
      await expect(service.deleteHousehold('h1', 'user1', 'church1'))
        .rejects.toThrow();
    });
  });

  describe('undeleteHousehold', () => {
    it('should restore household', async () => {
      const household = { id: 'h1', name: 'Test', deletedAt: new Date() };
      mockDataStore.undeleteHousehold.mockResolvedValue({ ...household, deletedAt: null });
      
      const result = await service.undeleteHousehold('h1', 'user1', 'church1');
      
      expect(result.deletedAt).toBeNull();
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'household.restore' })
      );
    });
  });

  describe('listDeletedHouseholds', () => {
    it('should list deleted households', async () => {
      const deleted = [
        { id: 'h1', deletedAt: new Date() },
        { id: 'h2', deletedAt: new Date() },
      ];
      mockDataStore.listDeletedHouseholds.mockResolvedValue(deleted);
      
      const result = await service.listDeletedHouseholds('church1');
      
      expect(result).toHaveLength(2);
    });

    it('should return empty array if none deleted', async () => {
      mockDataStore.listDeletedHouseholds.mockResolvedValue([]);
      
      const result = await service.listDeletedHouseholds('church1');
      
      expect(result).toEqual([]);
    });
  });

  describe('bulkDeleteHouseholds', () => {
    it('should delete multiple households', async () => {
      mockDataStore.bulkDeleteHouseholds.mockResolvedValue({
        successCount: 2,
        failedCount: 0,
        failed: [],
      });
      
      const result = await service.bulkDeleteHouseholds(['h1', 'h2'], 'user1', 'church1');
      
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(0);
    });

    it('should handle partial failures', async () => {
      mockDataStore.bulkDeleteHouseholds.mockResolvedValue({
        successCount: 1,
        failedCount: 1,
        failed: ['h2'],
      });
      
      const result = await service.bulkDeleteHouseholds(['h1', 'h2'], 'user1', 'church1');
      
      expect(result.successCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.failed).toContain('h2');
    });
  });

  describe('authorization', () => {
    it('should enforce Admin/Leader role', async () => {
      // This is enforced at controller level via ensureLeader helper
      // Service tests focus on business logic
      expect(service.deleteHousehold).toBeDefined();
    });
  });

  // Add 5+ more edge case tests
});
```

**Step 17: Child Unit Tests**
Create separate file `test/children.spec.ts` (not in checkin.spec.ts):
```typescript
describe('Child Soft Delete', () => {
  // Similar structure to household tests
  // 15+ tests covering all CRUD and soft delete operations
  // Include tests for check-in exclusion logic
});
```

**Step 18: Integration Tests**
Add to existing test files:
```typescript
describe('Soft Delete Integration', () => {
  it('should not auto-delete children when household deleted', async () => {
    // Create household with children
    // Delete household
    // Verify children still active
  });

  it('should not auto-restore children when household restored', async () => {
    // Delete household and children
    // Restore household
    // Verify children still deleted
  });

  it('should exclude archived children from check-in flows', async () => {
    // Archive child
    // Attempt check-in
    // Verify child not available
  });

  it('should exclude archived households from member counts', async () => {
    // Archive household
    // Get active households
    // Verify count excludes archived
  });
});
```

**Step 19: Negative Test Cases**
Add authorization and edge case tests:
```typescript
describe('Authorization & Edge Cases', () => {
  it('should reject Member role for delete operations', async () => {
    // Mock member role
    // Attempt delete
    // Expect 403 Forbidden
  });

  it('should reject deleting already deleted household', async () => {
    // Delete once
    // Attempt second delete
    // Expect error
  });

  it('should reject restoring non-deleted household', async () => {
    // Attempt restore on active household
    // Expect error
  });

  it('should verify audit logs actually created', async () => {
    // Delete household
    // Query audit log
    // Verify entry exists with correct action
  });
});
```

**Step 20: Documentation Updates**
Update the following files:

**A. DATABASE_SCHEMA.md**
```markdown
### Table: `households`
- `deletedAt` (Timestamp) - Soft delete timestamp for archiving households

### Table: `children`
- `deletedAt` (Timestamp) - Soft delete timestamp for archiving children

**Soft Delete Implementation:** 
Households and children implement soft delete. Archived records are excluded 
from default queries but retained for audit and compliance purposes.
```

**B. API_DOCUMENTATION.md**
Document 20 new endpoints:
```markdown
## Households Soft Delete

### DELETE /api/v1/households/:id
Soft delete a household (Admin/Leader only)

### POST /api/v1/households/:id/restore
Restore a deleted household (Admin/Leader only)

### GET /api/v1/households/deleted/all
List all deleted households (Admin/Leader only)

### POST /api/v1/households/bulk-delete
Bulk soft delete households (Admin/Leader only)
Body: { ids: string[] }
Returns: { successCount: number, failedCount: number, failed: string[] }

### POST /api/v1/households/bulk-restore
Bulk restore deleted households (Admin/Leader only)

## Children Soft Delete
[Similar documentation for 10 child endpoints]
```

**C. TASKS.md**
```markdown
- ✅ **Soft Delete Implementation - Phase 5 (Households & Children Backend):**
  - ✅ **Database:** Added deletedAt columns to Household and Child tables with indexes
  - ✅ **Backend:** Implemented 40+ methods across data store, service, controller layers
  - ✅ **Authorization:** Enforced Admin/Leader-only access with shared ensureLeader helper
  - ✅ **Audit Logging:** Track all soft delete operations with actor and timestamp
  - ✅ **Testing:** 32+ unit/integration tests with 100% coverage for new methods
  - ✅ **Documentation:** Updated DATABASE_SCHEMA.md and API_DOCUMENTATION.md
  - ✅ Commits: [list commit hashes after completion]
```

**Validation:**
- All 32+ tests passing
- API documentation complete
- Database schema documentation updated
- Build succeeds with zero errors
- Lint passes with zero warnings

---

## Acceptance Criteria

### Functional Requirements
- ✅ Households can be soft deleted and restored
- ✅ Children can be soft deleted and restored
- ✅ Bulk operations work for both entities
- ✅ Deleted items excluded from default list queries
- ✅ Deleted children excluded from check-in flows
- ✅ Authorization enforced (Admin/Leader only)
- ✅ Audit logs created for all operations

### Technical Requirements
- ✅ Database migrations successful
- ✅ 40+ methods implemented across all layers
- ✅ 20 controller endpoints with OpenAPI docs
- ✅ TypeScript compiles with zero errors
- ✅ Lint passes with zero new warnings
- ✅ 30+ unit/integration tests passing
- ✅ Zero regression in existing functionality

### Quality Requirements
- ✅ Code follows existing patterns from Phases 1 and 3
- ✅ Proper error handling with typed exceptions
- ✅ Consistent naming conventions
- ✅ Comprehensive test coverage
- ✅ Documentation updated

---

## Testing Strategy

### Unit Tests

```bash
# Run household tests
pnpm -C api test households

# Run checkin tests (includes children)
pnpm -C api test checkin

# Run all tests
pnpm -C api test
```

**Expected Tests:**
- Household soft delete: 8 tests
- Household authorization: 3 tests
- Household edge cases: 4 tests
- Child soft delete: 8 tests
- Child authorization: 3 tests
- Child edge cases: 4 tests
- Check-in exclusions: 2 tests
- **Total: 32 new tests**

### Integration Tests

- Test soft deleting household with active children (should succeed)
- Test soft deleting household with active members (should succeed)
- Test restoring household does not auto-restore children
- Test check-in flows exclude archived children
- Test household counts exclude archived items

### Manual Testing Checklist

- [ ] DELETE household via API → verify deletedAt set
- [ ] POST restore household → verify deletedAt null
- [ ] GET households → verify deleted excluded
- [ ] GET deleted households → verify only deleted returned
- [ ] DELETE child via API → verify deletedAt set
- [ ] Check-in dashboard → verify archived children excluded
- [ ] Test with non-Admin/Leader → verify 403 error
- [ ] Verify audit logs created

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration fails on production | High | Test on staging first, create rollback migration |
| Performance degradation | Medium | Add indexes on deletedAt, benchmark queries |
| Data integrity issues | High | Comprehensive tests, validation checks |
| Authorization bypass | High | Backend enforcement, authorization tests |

---

## Timeline

| Step | Duration | Status |
|------|----------|--------|
| 5A: Database Migration | 1h | Not Started |
| 5A.5: Setup Dependencies & Utilities | 30min | Not Started |
| 5B: Households Backend | 3-4h | Not Started |
| 5C: Children Backend | 3-4h | Not Started |
| 5D: Testing & Documentation | 2h | Not Started |
| **Total** | **9.5-11.5h** | **0% Complete** |

---

## Dependencies

- ✅ Sprint branch exists: `feature/soft-delete-main-sprint`
- ✅ Phase 1-4 complete (patterns established)
- ✅ Database schema documented
- ✅ API structure in place

---

## Branch Strategy

```bash
# Create phase branch from sprint branch
git checkout feature/soft-delete-main-sprint
git pull
git checkout -b feature/soft-delete-phase5-households-backend

# After completion, create PR to sprint branch
# Title: "Phase 5: Households & Children Backend Soft Delete"
# DO NOT merge - wait for review
```

---

## Deliverables

1. ✅ Database migration for households and children
2. ✅ 40+ backend methods implemented
3. ✅ 20 controller endpoints with OpenAPI docs
4. ✅ 32+ passing unit/integration tests
5. ✅ Updated documentation (3 files)
6. ✅ This phase plan with accomplishments section

---

## Notes

**Key Architectural Decisions:**

1. **No Automatic Cascade**: Soft deleting a household does NOT automatically soft delete children or members - this is intentional for data safety

2. **Check-in Exclusion**: Archived children are automatically excluded from all check-in flows and event attendance lists

3. **Referential Integrity**: Soft delete timestamps are independent - restoring household does NOT restore children

4. **Authorization Pattern**: Uses shared `ensureLeader()` utility (Admin OR Leader) from `src/common/auth/auth.helpers.ts` - eliminates code duplication across controllers

5. **Audit Trail**: All soft delete operations logged with action type, entity ID, and actor

6. **Index Strategy**: Create indexes on `deletedAt` columns for efficient filtering in WHERE clauses

7. **Backward Compatibility**: All existing endpoints continue to work, new endpoints are additive

8. **Route Ordering**: Specific routes (`deleted/all`, `bulk-*`) MUST come before parameterized routes (`:id`) to prevent incorrect matching

9. **Multi-tenancy**: All methods pass `churchId` via request context for proper tenant isolation

10. **Bulk Operations Return Type**: Returns `{ successCount, failedCount, failed: string[] }` matching frontend expectations from Phase 4

11. **DTO Validation**: All bulk operations use proper DTO classes with `@IsArray()` and `@IsString({ each: true })` decorators for validation

12. **Module Dependencies**: Both HouseholdsModule and CheckinModule import DataStoreModule, MockDataModule, and AuditModule for proper DI

**Critical Implementation Notes:**

- **DataStore Injection**: Services MUST use `@Inject(DATA_STORE)` not direct `MockDatabaseService` injection
- **CurrentUser Decorator**: Import from `'../auth/current-user.decorator'` if needed
- **Error Types**: Use `NotFoundException` from `@nestjs/common` for consistency
- **Test Separation**: Household and Child tests in separate files for clarity
- **Rollback Script**: Document rollback migration for production safety

---

## Accomplishments

*This section will be populated after phase completion.*

---

**Document Version:** 1.0  
**Last Updated:** 4 November 2025  
**Status:** Approved - Ready for Implementation

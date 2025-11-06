# User Theme Preferences - Phase 1: Database Schema & API Foundation

**Phase:** 1 of 5  
**Timeline:** 2.5-3.5 hours  
**Branch:** `feature/user-theme-preferences-phase1-database-api`  
**Sprint Branch:** `feature/user-theme-preferences-main-sprint`  
**Sprint:** User Theme Preferences  
**Principal Engineer:** @principal_engineer  
**Date:** 2024

---

## Phase Overview

Phase 1 establishes the foundational data layer and API endpoints for theme preferences. This phase delivers:
- Database schema extensions to User model
- Type-safe theme preset enumeration
- RESTful API endpoints for retrieving and updating theme preferences
- Comprehensive validation and error handling
- Unit tests with >80% coverage

This is the critical foundation that all subsequent phases depend on.

---

## Technical Approach

### 1. Database Schema Changes

**Location:** `api/prisma/tenant-schema.prisma`

Add two optional fields to the `User` model:

```prisma
model User {
  // ... existing fields ...
  
  // Theme Preferences (Phase 1)
  themePreference String?   @default("original")  // Maps to ThemePreset enum
  themeDarkMode   Boolean?  @default(false)       // Dark mode toggle
}
```

**Design Decisions:**
- **Optional fields:** Allows existing users to continue without preferences (defaults apply)
- **String storage:** Prisma doesn't support TypeScript enums directly; validate at application layer
- **Defaults:** "original" theme + light mode for consistency with existing UI
- **Tenant isolation:** User model is tenant-specific, ensuring data isolation by `churchId`

**Migration Strategy:**
1. Run `cd api && pnpm prisma migrate dev --name add_user_theme_preferences`
2. Verify migration creates fields correctly
3. Test with existing users (null values should be handled gracefully)

### 2. TypeScript Type System

**Location:** `api/src/modules/users/types/theme.types.ts` (new file)

```typescript
/**
 * Supported theme presets for the application.
 * Maps to CSS custom property overrides in web layer.
 */
export enum ThemePreset {
  ORIGINAL = 'original',
  VIBRANT_BLUE = 'vibrant-blue',
  TEAL_ACCENT = 'teal-accent',
  WARM_ACCENT = 'warm-accent',
}

/**
 * User's complete theme configuration
 */
export interface ThemePreferences {
  themePreference: ThemePreset;
  themeDarkMode: boolean;
}

/**
 * Type guard to validate theme preset strings
 */
export function isValidThemePreset(value: string): value is ThemePreset {
  return Object.values(ThemePreset).includes(value as ThemePreset);
}
```

**Type Safety Approach:**
- Enum provides compile-time safety for theme values
- Type guard enables runtime validation without dependencies
- Interface defines contract between API and web layers
- Explicit mapping prevents typos/invalid values

### 3. Data Transfer Objects (DTOs)

**Location:** `api/src/modules/users/dto/theme.dto.ts` (new file)

```typescript
import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ThemePreset } from '../types/theme.types';

/**
 * DTO for updating user theme preferences
 */
export class UpdateThemeDto {
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
}

/**
 * DTO for theme response
 */
export class ThemeResponseDto {
  @ApiProperty({
    enum: ThemePreset,
    description: 'Current theme preset',
    example: ThemePreset.ORIGINAL,
  })
  themePreference: ThemePreset;

  @ApiProperty({
    description: 'Dark mode enabled',
    example: false,
  })
  themeDarkMode: boolean;
}
```

**Validation Strategy:**
- `class-validator` provides automatic request validation
- OpenAPI decorators auto-generate Swagger documentation
- Optional fields allow partial updates (PATCH semantics)
- Descriptive error messages for validation failures

### 4. API Endpoints

**Location:** `api/src/modules/users/users.controller.ts` (modifications)

#### Endpoint 1: Get Current User's Theme

```typescript
@Get('me/theme')
@ApiOperation({ summary: 'Get current user theme preferences' })
@ApiResponse({
  status: 200,
  description: 'Theme preferences retrieved successfully',
  type: ThemeResponseDto,
})
@ApiResponse({ status: 401, description: 'Unauthorized' })
async getMyTheme(@Request() req): Promise<ThemeResponseDto> {
  const userId = req.user.sub;
  const churchId = req.user.churchId;
  
  const theme = await this.usersService.getUserTheme(userId, churchId);
  
  return {
    themePreference: theme.themePreference || ThemePreset.ORIGINAL,
    themeDarkMode: theme.themeDarkMode ?? false,
  };
}
```

**Design Decisions:**
- Uses existing authentication middleware (JWT)
- Leverages `req.user` for tenant isolation (`churchId`)
- Returns defaults for users without preferences
- OpenAPI documentation auto-generated from decorators

#### Endpoint 2: Update Current User's Theme

```typescript
@Patch('me/theme')
@ApiOperation({ summary: 'Update current user theme preferences' })
@ApiBody({ type: UpdateThemeDto })
@ApiResponse({
  status: 200,
  description: 'Theme updated successfully',
  type: ThemeResponseDto,
})
@ApiResponse({ status: 400, description: 'Invalid theme data' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async updateMyTheme(
  @Request() req,
  @Body() updateThemeDto: UpdateThemeDto,
): Promise<ThemeResponseDto> {
  const userId = req.user.sub;
  const churchId = req.user.churchId;
  
  const updatedTheme = await this.usersService.updateUserTheme(
    userId,
    churchId,
    updateThemeDto,
  );
  
  return {
    themePreference: updatedTheme.themePreference as ThemePreset,
    themeDarkMode: updatedTheme.themeDarkMode,
  };
}
```

**PATCH Semantics:**
- Accepts partial updates (only changed fields)
- Returns full theme state after update
- Automatic validation via `UpdateThemeDto`
- Tenant-scoped update (prevents cross-church modifications)

### 5. Service Layer Implementation

**Location:** `api/src/modules/users/users.service.ts` (modifications)

```typescript
/**
 * Get user's theme preferences
 * @param userId User ID
 * @param churchId Church ID (tenant isolation)
 * @returns Theme preferences or defaults
 */
async getUserTheme(userId: string, churchId: string) {
  const user = await this.prisma.user.findUnique({
    where: {
      id_churchId: {
        id: userId,
        churchId: churchId,
      },
    },
    select: {
      themePreference: true,
      themeDarkMode: true,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return {
    themePreference: user.themePreference || ThemePreset.ORIGINAL,
    themeDarkMode: user.themeDarkMode ?? false,
  };
}

/**
 * Update user's theme preferences
 * @param userId User ID
 * @param churchId Church ID (tenant isolation)
 * @param updateThemeDto Theme updates
 * @returns Updated theme preferences
 */
async updateUserTheme(
  userId: string,
  churchId: string,
  updateThemeDto: UpdateThemeDto,
) {
  // Validate theme preset if provided
  if (updateThemeDto.themePreference && 
      !isValidThemePreset(updateThemeDto.themePreference)) {
    throw new BadRequestException('Invalid theme preset');
  }

  const updatedUser = await this.prisma.user.update({
    where: {
      id_churchId: {
        id: userId,
        churchId: churchId,
      },
    },
    data: {
      ...(updateThemeDto.themePreference !== undefined && {
        themePreference: updateThemeDto.themePreference,
      }),
      ...(updateThemeDto.themeDarkMode !== undefined && {
        themeDarkMode: updateThemeDto.themeDarkMode,
      }),
    },
    select: {
      themePreference: true,
      themeDarkMode: true,
    },
  });

  return updatedUser;
}
```

**Service Layer Responsibilities:**
- Tenant isolation via composite key (`id_churchId`)
- Default value handling for nullable fields
- Additional validation beyond DTOs
- Prisma transaction management
- Proper error handling (NotFoundException, BadRequestException)

---

## Files to Create

1. **`api/src/modules/users/types/theme.types.ts`**
   - ThemePreset enum
   - ThemePreferences interface
   - Type guard: isValidThemePreset

2. **`api/src/modules/users/dto/theme.dto.ts`**
   - UpdateThemeDto class
   - ThemeResponseDto class

---

## Files to Modify

1. **`api/prisma/tenant-schema.prisma`**
   - Add `themePreference` and `themeDarkMode` to User model
   - Run migration

2. **`api/src/modules/users/users.controller.ts`**
   - Add `GET /api/users/me/theme` endpoint
   - Add `PATCH /api/users/me/theme` endpoint
   - Import DTOs and decorators

3. **`api/src/modules/users/users.service.ts`**
   - Add `getUserTheme()` method
   - Add `updateUserTheme()` method
   - Import types and validation

---

## Testing Strategy

### Unit Tests

**Location:** `api/test/unit/users/theme.spec.ts` (new file)

**Test Cases:**

```typescript
describe('User Theme Preferences API', () => {
  describe('GET /api/users/me/theme', () => {
    it('should return user theme preferences when they exist', async () => {
      // Mock user with preferences
      // Verify correct response DTO
    });

    it('should return defaults when user has no preferences', async () => {
      // Mock user with null preferences
      // Verify ORIGINAL theme + light mode defaults
    });

    it('should require authentication', async () => {
      // Request without JWT token
      // Verify 401 Unauthorized
    });

    it('should enforce tenant isolation', async () => {
      // Request with different churchId in JWT
      // Verify user not found or isolated
    });
  });

  describe('PATCH /api/users/me/theme', () => {
    it('should update theme preference only', async () => {
      // PATCH { themePreference: 'vibrant-blue' }
      // Verify themePreference updated, themeDarkMode unchanged
    });

    it('should update dark mode only', async () => {
      // PATCH { themeDarkMode: true }
      // Verify themeDarkMode updated, themePreference unchanged
    });

    it('should update both fields simultaneously', async () => {
      // PATCH both fields
      // Verify both updated
    });

    it('should reject invalid theme preset', async () => {
      // PATCH { themePreference: 'invalid-theme' }
      // Verify 400 Bad Request with validation error
    });

    it('should reject non-boolean dark mode value', async () => {
      // PATCH { themeDarkMode: 'true' }
      // Verify 400 Bad Request
    });

    it('should handle empty PATCH body gracefully', async () => {
      // PATCH {}
      // Verify no changes, returns current state
    });

    it('should require authentication', async () => {
      // Request without JWT
      // Verify 401 Unauthorized
    });

    it('should enforce tenant isolation', async () => {
      // Request with different churchId
      // Verify user not found or isolated
    });
  });

  describe('UsersService.getUserTheme()', () => {
    it('should return theme with defaults for null values', async () => {
      // Test service layer default handling
    });

    it('should throw NotFoundException for invalid user', async () => {
      // Test with non-existent userId
    });
  });

  describe('UsersService.updateUserTheme()', () => {
    it('should perform partial updates correctly', async () => {
      // Test PATCH semantics in service
    });

    it('should validate theme preset at service level', async () => {
      // Test isValidThemePreset() integration
    });
  });
});
```

**Coverage Target:** >80% for:
- `users.controller.ts` (theme endpoints)
- `users.service.ts` (theme methods)
- `theme.types.ts` (type guard)

**Testing Tools:**
- Jest with Supertest for endpoint testing
- Prisma mock for database isolation
- JWT mock for authentication

---

## Acceptance Criteria

### Database Schema
- [ ] `themePreference` field added to User model (String, optional, default "original")
- [ ] `themeDarkMode` field added to User model (Boolean, optional, default false)
- [ ] Migration runs successfully on test database
- [ ] Existing users unaffected (null values handled)

### TypeScript Types
- [ ] `ThemePreset` enum created with 4 values (ORIGINAL, VIBRANT_BLUE, TEAL_ACCENT, WARM_ACCENT)
- [ ] `ThemePreferences` interface defined
- [ ] `isValidThemePreset()` type guard implemented
- [ ] Zero TypeScript compilation errors

### DTOs
- [ ] `UpdateThemeDto` created with validation decorators
- [ ] `ThemeResponseDto` created with OpenAPI decorators
- [ ] DTOs auto-generate Swagger documentation
- [ ] Validation rejects invalid enum values
- [ ] Validation rejects non-boolean dark mode values

### API Endpoints
- [ ] `GET /api/users/me/theme` returns 200 with theme data
- [ ] `GET /api/users/me/theme` requires authentication (401 if no JWT)
- [ ] `GET /api/users/me/theme` returns defaults for users without preferences
- [ ] `PATCH /api/users/me/theme` accepts partial updates
- [ ] `PATCH /api/users/me/theme` returns 200 with updated theme
- [ ] `PATCH /api/users/me/theme` returns 400 for invalid data
- [ ] `PATCH /api/users/me/theme` requires authentication
- [ ] Both endpoints enforce tenant isolation (churchId)

### Service Layer
- [ ] `getUserTheme()` handles null values with defaults
- [ ] `getUserTheme()` throws NotFoundException for invalid users
- [ ] `updateUserTheme()` performs partial updates correctly
- [ ] `updateUserTheme()` validates theme preset
- [ ] `updateUserTheme()` enforces tenant isolation

### Testing
- [ ] Unit tests created for all endpoints
- [ ] Tests cover happy path, edge cases, errors
- [ ] Tests verify authentication requirements
- [ ] Tests verify tenant isolation
- [ ] Coverage >80% for affected files
- [ ] All tests pass (`pnpm -C api test`)

### Integration
- [ ] API server starts without errors
- [ ] Swagger UI displays theme endpoints correctly
- [ ] Manual testing with Postman/curl successful
- [ ] No breaking changes to existing endpoints

---

## Risks & Rollback Plan

### Identified Risks

**1. Database Migration Failures**
- **Risk:** Migration might fail on production-like data
- **Mitigation:** Test migration on copy of production data first
- **Rollback:** `pnpm prisma migrate rollback` removes new fields

**2. Tenant Isolation Bugs**
- **Risk:** Incorrect `churchId` handling could leak data
- **Mitigation:** Comprehensive tests for tenant isolation
- **Validation:** Use `id_churchId` composite key (existing pattern)

**3. Default Value Handling**
- **Risk:** Null vs. undefined vs. default string confusion
- **Mitigation:** Explicit default handling in service layer
- **Testing:** Dedicated tests for null preference users

**4. Type Safety Gaps**
- **Risk:** Database string values might not match enum
- **Mitigation:** Runtime validation with `isValidThemePreset()`
- **Testing:** Test invalid string values from database

### Rollback Plan

**If Phase 1 needs to be reverted:**

1. **Revert API Changes:**
   ```bash
   git checkout feature/user-theme-preferences-main-sprint
   git branch -D feature/user-theme-preferences-phase1-database-api
   ```

2. **Rollback Database Migration:**
   ```bash
   cd api
   pnpm prisma migrate rollback
   ```

3. **Verify System Stability:**
   - Run full test suite: `pnpm -C api test`
   - Start dev servers: `pnpm dev:api:mock`
   - Verify existing functionality unchanged

4. **Document Issues:**
   - Add findings to Phase 1 plan under "Issues Encountered"
   - Update sprint timeline if needed

**Rollback Impact:**
- No user-facing features affected (Phase 1 is backend-only)
- No data loss (optional fields, no existing data deleted)
- Subsequent phases blocked until Phase 1 resolves

---

## Dependencies

### Required Before Phase 1
- ✅ Sprint plan approved and merged to main
- ✅ Sprint branch created from main
- ✅ Phase 1 branch created from sprint branch
- ✅ Development environment set up (`pnpm install`)

### Blocking Subsequent Phases
- **Phase 2 (CSS Themes):** Requires `ThemePreset` enum values
- **Phase 3 (Settings UI):** Requires API endpoints functional
- **Phase 4 (Theme Application):** Requires API endpoints + CSS
- **Phase 5 (Testing/Docs):** Requires all previous phases

### External Dependencies
- None (uses existing packages: Prisma, class-validator, @nestjs/swagger)

---

## Implementation Checklist

### Setup
- [ ] Confirm on Phase 1 branch: `git branch` shows `feature/user-theme-preferences-phase1-database-api`
- [ ] Pull latest from sprint branch: `git pull origin feature/user-theme-preferences-main-sprint`
- [ ] Verify dependencies installed: `cd api && pnpm install`

### Database Schema (30-45 min)
- [ ] Modify `api/prisma/tenant-schema.prisma` (User model)
- [ ] Run migration: `pnpm prisma migrate dev --name add_user_theme_preferences`
- [ ] Verify migration in `api/prisma/migrations/` directory
- [ ] Test with existing database (ensure no breakage)

### TypeScript Types (15-20 min)
- [ ] Create `api/src/modules/users/types/theme.types.ts`
- [ ] Define `ThemePreset` enum
- [ ] Define `ThemePreferences` interface
- [ ] Implement `isValidThemePreset()` type guard
- [ ] Verify no TypeScript errors: `cd api && pnpm build`

### DTOs (20-30 min)
- [ ] Create `api/src/modules/users/dto/theme.dto.ts`
- [ ] Define `UpdateThemeDto` with validation decorators
- [ ] Define `ThemeResponseDto` with OpenAPI decorators
- [ ] Import in controller and verify auto-complete works

### Service Layer (30-45 min)
- [ ] Modify `api/src/modules/users/users.service.ts`
- [ ] Implement `getUserTheme()` method
- [ ] Implement `updateUserTheme()` method
- [ ] Add imports and error handling
- [ ] Verify TypeScript compilation: `pnpm build`

### Controller (30-45 min)
- [ ] Modify `api/src/modules/users/users.controller.ts`
- [ ] Add `GET /api/users/me/theme` endpoint
- [ ] Add `PATCH /api/users/me/theme` endpoint
- [ ] Add OpenAPI decorators
- [ ] Verify TypeScript compilation

### Testing (45-60 min)
- [ ] Create `api/test/unit/users/theme.spec.ts`
- [ ] Write tests for GET endpoint (4 scenarios)
- [ ] Write tests for PATCH endpoint (8 scenarios)
- [ ] Write tests for service methods (4 scenarios)
- [ ] Run tests: `pnpm -C api test`
- [ ] Verify coverage: `pnpm -C api test:cov` (target >80%)

### Integration Testing (15-20 min)
- [ ] Start API server: `pnpm dev:api:mock`
- [ ] Test GET endpoint with curl/Postman
- [ ] Test PATCH endpoint with valid data
- [ ] Test PATCH endpoint with invalid data
- [ ] Verify Swagger UI displays endpoints: `http://localhost:3001/api`

### Code Quality (10-15 min)
- [ ] Run linter: `pnpm lint`
- [ ] Run formatter: `pnpm format`
- [ ] Fix any linting issues
- [ ] Verify no TypeScript errors: `pnpm -C api build`

### Documentation (10-15 min)
- [ ] Verify Swagger documentation complete
- [ ] Add JSDoc comments to service methods
- [ ] Verify type definitions exported correctly

---

## Timeline Breakdown

**Total: 2.5-3.5 hours**

| Task | Estimated Time |
|------|---------------|
| Database schema + migration | 30-45 min |
| TypeScript types | 15-20 min |
| DTOs | 20-30 min |
| Service layer implementation | 30-45 min |
| Controller endpoints | 30-45 min |
| Unit tests | 45-60 min |
| Integration testing | 15-20 min |
| Code quality & cleanup | 10-15 min |
| Documentation | 10-15 min |

**Buffer:** 30 min for unexpected issues

---

## Success Metrics

### Quantitative
- [ ] 100% of acceptance criteria met
- [ ] >80% test coverage for affected files
- [ ] 0 TypeScript compilation errors
- [ ] 0 linting errors
- [ ] All tests passing (`pnpm -C api test`)

### Qualitative
- [ ] Code follows existing patterns in `api/src/modules/users/`
- [ ] Swagger documentation clear and accurate
- [ ] Service methods reusable for future features
- [ ] Error messages descriptive and helpful
- [ ] No regressions to existing user endpoints

---

## Next Phase Preview

**Phase 2: CSS Theme System (2-3 hours)**
- Depends on `ThemePreset` enum values from Phase 1
- Will consume Phase 1 API endpoints to apply themes
- Creates CSS custom property overrides for 4 themes
- No user-facing UI changes yet (internal infrastructure)

**Phase 1 Deliverables Needed by Phase 2:**
- Working `GET /api/users/me/theme` endpoint
- ThemePreset enum accessible from web layer
- API endpoint returns correct defaults

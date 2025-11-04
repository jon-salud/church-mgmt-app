-- Rollback script for soft delete columns on Household and Child
-- Run this to undo the migration if needed

-- Drop indexes
DROP INDEX IF EXISTS "Household_deletedAt_idx";
DROP INDEX IF EXISTS "Child_deletedAt_idx";

-- Drop deletedAt columns
ALTER TABLE "Household" DROP COLUMN IF EXISTS "deletedAt";
ALTER TABLE "Child" DROP COLUMN IF EXISTS "deletedAt";

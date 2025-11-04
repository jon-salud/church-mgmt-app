-- Add deletedAt column to Household table
ALTER TABLE "Household" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add deletedAt column to Child table
ALTER TABLE "Child" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Create indexes on deletedAt columns for query performance
CREATE INDEX "Household_deletedAt_idx" ON "Household"("deletedAt");
CREATE INDEX "Child_deletedAt_idx" ON "Child"("deletedAt");

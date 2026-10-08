-- Step 1: Copy existing data from publishStatus to status
UPDATE "BlogPost" SET "status" = "publishStatus";

-- Step 2: Drop the redundant publishStatus column
ALTER TABLE "BlogPost" DROP COLUMN "publishStatus";

-- Step 3: Change AuditLog.userId type to TEXT to support email addresses
ALTER TABLE "AuditLog" ALTER COLUMN "userId" TYPE TEXT;

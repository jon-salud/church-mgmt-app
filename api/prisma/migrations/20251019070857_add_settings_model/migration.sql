-- CreateTable
CREATE TABLE "Settings" (
    "churchId" TEXT NOT NULL PRIMARY KEY,
    "optionalFields" TEXT,
    CONSTRAINT "Settings_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

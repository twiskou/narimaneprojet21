/*
  Warnings:

  - You are about to drop the column `analyzedAt` on the `AIAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `AIAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `AIAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `targetProfileId` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MissionActivity` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TargetProfile` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `TargetProfile` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingCompleted` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `AIAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `missionId` to the `TargetProfile` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summary" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "crisisRisk" REAL NOT NULL,
    "mentionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIAnalysis_mentionId_fkey" FOREIGN KEY ("mentionId") REFERENCES "Mention" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AIAnalysis" ("crisisRisk", "id", "mentionId", "score", "sentiment", "summary") SELECT "crisisRisk", "id", "mentionId", "score", "sentiment", "summary" FROM "AIAnalysis";
DROP TABLE "AIAnalysis";
ALTER TABLE "new_AIAnalysis" RENAME TO "AIAnalysis";
CREATE UNIQUE INDEX "AIAnalysis_mentionId_key" ON "AIAnalysis"("mentionId");
CREATE TABLE "new_Mission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "authorNote" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mission_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mission" ("authorId", "authorNote", "createdAt", "description", "id", "status", "title") SELECT "authorId", "authorNote", "createdAt", "description", "id", "status", "title" FROM "Mission";
DROP TABLE "Mission";
ALTER TABLE "new_Mission" RENAME TO "Mission";
CREATE TABLE "new_MissionActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "missionId" TEXT NOT NULL,
    CONSTRAINT "MissionActivity_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MissionActivity" ("description", "id", "label", "missionId", "type") SELECT "description", "id", "label", "missionId", "type" FROM "MissionActivity";
DROP TABLE "MissionActivity";
ALTER TABLE "new_MissionActivity" RENAME TO "MissionActivity";
CREATE TABLE "new_TargetProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "role" TEXT,
    "organization" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "notes" TEXT,
    "missionId" TEXT NOT NULL,
    CONSTRAINT "TargetProfile_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TargetProfile" ("fileType", "fileUrl", "fullName", "id", "notes", "organization", "role") SELECT "fileType", "fileUrl", "fullName", "id", "notes", "organization", "role" FROM "TargetProfile";
DROP TABLE "TargetProfile";
ALTER TABLE "new_TargetProfile" RENAME TO "TargetProfile";
CREATE UNIQUE INDEX "TargetProfile_missionId_key" ON "TargetProfile"("missionId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ANALYST',
    "orgName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "orgName", "passwordHash", "role") SELECT "createdAt", "email", "id", "name", "orgName", "passwordHash", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

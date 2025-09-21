/*
  Warnings:

  - Made the column `description` on table `Achievement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `date` on table `Achievement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fileUrl` on table `Achievement` required. This step will fail if there are existing NULL values in that column.
  - Made the column `abstract` on table `ResearchPublication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publicationYear` on table `ResearchPublication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `journalConference` on table `ResearchPublication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `doi` on table `ResearchPublication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fileUrl` on table `ResearchPublication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publishedAt` on table `ResearchPublication` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Achievement" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "fileUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."ResearchPublication" ALTER COLUMN "abstract" SET NOT NULL,
ALTER COLUMN "publicationYear" SET NOT NULL,
ALTER COLUMN "journalConference" SET NOT NULL,
ALTER COLUMN "doi" SET NOT NULL,
ALTER COLUMN "fileUrl" SET NOT NULL,
ALTER COLUMN "publishedAt" SET NOT NULL;

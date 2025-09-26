/*
  Warnings:

  - You are about to drop the `Form` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormSubmission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Form" DROP CONSTRAINT "Form_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormSubmission" DROP CONSTRAINT "FormSubmission_formId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "profileImage" TEXT;

-- DropTable
DROP TABLE "public"."Form";

-- DropTable
DROP TABLE "public"."FormSubmission";

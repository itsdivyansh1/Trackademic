/*
  Warnings:

  - A unique constraint covering the columns `[formId,userId]` on the table `FormSubmission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FormSubmission_formId_userId_key" ON "public"."FormSubmission"("formId", "userId");

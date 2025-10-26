-- CreateEnum
CREATE TYPE "public"."CvTemplate" AS ENUM ('MODERN', 'CLASSIC', 'MINIMAL', 'CREATIVE');

-- CreateTable
CREATE TABLE "public"."CvData" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "education" JSONB,
    "experience" JSONB,
    "skills" JSONB,
    "languages" JSONB,
    "certifications" JSONB,
    "template" "public"."CvTemplate" NOT NULL DEFAULT 'MODERN',
    "includePhoto" BOOLEAN NOT NULL DEFAULT true,
    "includeAddress" BOOLEAN NOT NULL DEFAULT true,
    "includeSummary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CvData_userId_key" ON "public"."CvData"("userId");

-- AddForeignKey
ALTER TABLE "public"."CvData" ADD CONSTRAINT "CvData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

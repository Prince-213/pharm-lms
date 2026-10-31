-- CreateEnum
CREATE TYPE "JobOnboardingStatus" AS ENUM ('PENDING', 'SKIPPED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "JobWorkStyle" AS ENUM ('REMOTE', 'COUNTRY', 'RELOCATE');

-- CreateEnum
CREATE TYPE "JobCareerLevel" AS ENUM ('STUDENT', 'EARLY', 'EXPERIENCED');

-- CreateEnum
CREATE TYPE "JobSourceHealthStatus" AS ENUM ('HEALTHY', 'DOWN', 'UNCONFIGURED');

-- CreateTable
CREATE TABLE "JobPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workStyle" "JobWorkStyle",
    "level" "JobCareerLevel",
    "jobAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "onboardingStatus" "JobOnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapedJob" (
    "id" TEXT NOT NULL,
    "applyUrl" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "salaryText" TEXT,
    "snippet" TEXT,
    "postedAt" TIMESTAMP(3),
    "rawJson" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSourceHealth" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" "JobSourceHealthStatus" NOT NULL DEFAULT 'UNCONFIGURED',
    "lastStatus" INTEGER,
    "lastMs" INTEGER,
    "jobsKept" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastRunAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSourceHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAlertSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cadenceDays" INTEGER NOT NULL DEFAULT 7,
    "maxEmailJobs" INTEGER NOT NULL DEFAULT 5,
    "defaultKeywords" TEXT[] DEFAULT ARRAY['pharmacist', 'pharmacovigilance', 'clinical data', 'health informatics']::TEXT[],
    "lastSuccessAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAlertSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAlertRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "ok" BOOLEAN NOT NULL DEFAULT false,
    "jobsStored" INTEGER NOT NULL DEFAULT 0,
    "emailsSent" INTEGER NOT NULL DEFAULT 0,
    "emailsSkip" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "JobAlertRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAlertDelivery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobAlertDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobPreference_userId_key" ON "JobPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapedJob_applyUrl_key" ON "ScrapedJob"("applyUrl");

-- CreateIndex
CREATE INDEX "ScrapedJob_expiresAt_idx" ON "ScrapedJob"("expiresAt");

-- CreateIndex
CREATE INDEX "ScrapedJob_source_idx" ON "ScrapedJob"("source");

-- CreateIndex
CREATE UNIQUE INDEX "JobSourceHealth_source_key" ON "JobSourceHealth"("source");

-- CreateIndex
CREATE UNIQUE INDEX "JobAlertDelivery_userId_jobId_key" ON "JobAlertDelivery"("userId", "jobId");

-- CreateIndex
CREATE INDEX "JobAlertDelivery_runId_idx" ON "JobAlertDelivery"("runId");

-- AddForeignKey
ALTER TABLE "JobPreference" ADD CONSTRAINT "JobPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAlertDelivery" ADD CONSTRAINT "JobAlertDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAlertDelivery" ADD CONSTRAINT "JobAlertDelivery_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScrapedJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAlertDelivery" ADD CONSTRAINT "JobAlertDelivery_runId_fkey" FOREIGN KEY ("runId") REFERENCES "JobAlertRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

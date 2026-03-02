-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('HEALTH', 'CAREER', 'DISCIPLINE', 'COMMUNICATION', 'LIFE');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('BOOLEAN', 'NUMBER', 'DURATION', 'TIME', 'SCALE', 'TEXT');

-- CreateEnum
CREATE TYPE "JournalType" AS ENUM ('DIARY', 'JOURNAL', 'BLOG');

-- CreateTable
CREATE TABLE "MetricTemplate" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" "Domain" NOT NULL,
    "type" "MetricType" NOT NULL,
    "unit" TEXT,
    "target" DOUBLE PRECISION,
    "direction" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "quickLink" TEXT,
    "colorTag" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "score" DOUBLE PRECISION,
    "completionPercent" DOUBLE PRECISION,
    "domainScores" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMetricValue" (
    "id" TEXT NOT NULL,
    "dailyLogId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "valueNumber" DOUBLE PRECISION,
    "valueBool" BOOLEAN,
    "valueText" TEXT,
    "valueTime" TIMESTAMP(3),
    "valueJson" JSONB,

    CONSTRAINT "DailyMetricValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "JournalType" NOT NULL DEFAULT 'JOURNAL',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mood" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickLink" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MetricTemplate_key_key" ON "MetricTemplate"("key");

-- CreateIndex
CREATE INDEX "MetricTemplate_domain_idx" ON "MetricTemplate"("domain");

-- CreateIndex
CREATE INDEX "MetricTemplate_active_idx" ON "MetricTemplate"("active");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLog_date_key" ON "DailyLog"("date");

-- CreateIndex
CREATE INDEX "DailyLog_date_idx" ON "DailyLog"("date");

-- CreateIndex
CREATE INDEX "DailyMetricValue_metricId_idx" ON "DailyMetricValue"("metricId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMetricValue_dailyLogId_metricId_key" ON "DailyMetricValue"("dailyLogId", "metricId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_slug_key" ON "JournalEntry"("slug");

-- CreateIndex
CREATE INDEX "JournalEntry_type_idx" ON "JournalEntry"("type");

-- CreateIndex
CREATE INDEX "JournalEntry_date_idx" ON "JournalEntry"("date");

-- AddForeignKey
ALTER TABLE "DailyMetricValue" ADD CONSTRAINT "DailyMetricValue_dailyLogId_fkey" FOREIGN KEY ("dailyLogId") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMetricValue" ADD CONSTRAINT "DailyMetricValue_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "MetricTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

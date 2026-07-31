-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('VIDEO', 'ARTICLE');

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN "contentType" "LessonContentType" NOT NULL DEFAULT 'ARTICLE';

-- Backfill: lessons with a video URL are VIDEO content units
UPDATE "Lesson"
SET "contentType" = 'VIDEO'
WHERE "videoUrl" IS NOT NULL AND TRIM("videoUrl") <> '';

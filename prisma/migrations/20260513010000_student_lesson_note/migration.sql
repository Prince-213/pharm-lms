-- CreateTable
CREATE TABLE "StudentLessonNote" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "videoOffsetSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentLessonNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentLessonNote_studentId_lessonId_idx" ON "StudentLessonNote"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "StudentLessonNote_lessonId_idx" ON "StudentLessonNote"("lessonId");

-- AddForeignKey
ALTER TABLE "StudentLessonNote" ADD CONSTRAINT "StudentLessonNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonNote" ADD CONSTRAINT "StudentLessonNote_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

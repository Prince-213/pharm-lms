-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tutorProfileCompletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "User_tutorProfileCompletedAt_idx" ON "User"("tutorProfileCompletedAt");

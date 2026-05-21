-- CreateTable
CREATE TABLE IF NOT EXISTS "CourseCertificate" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseCertificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CourseCertificate_enrollmentId_key" ON "CourseCertificate"("enrollmentId");
CREATE UNIQUE INDEX IF NOT EXISTS "CourseCertificate_certificateNumber_key" ON "CourseCertificate"("certificateNumber");
CREATE INDEX IF NOT EXISTS "CourseCertificate_certificateNumber_idx" ON "CourseCertificate"("certificateNumber");

ALTER TABLE "CourseCertificate" ADD CONSTRAINT "CourseCertificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

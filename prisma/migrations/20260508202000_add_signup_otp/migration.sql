-- CreateTable
CREATE TABLE "SignupOtp" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SignupOtp_email_expiresAt_idx" ON "SignupOtp"("email", "expiresAt");

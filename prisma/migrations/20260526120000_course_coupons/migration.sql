-- AlterTable
ALTER TABLE "CoursePurchase" ADD COLUMN IF NOT EXISTS "couponId" TEXT;
ALTER TABLE "CoursePurchase" ADD COLUMN IF NOT EXISTS "discountMinorUnits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percentOff" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "maxRedemptions" INTEGER,
    "maxRedemptionsPerStudent" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponCourse" (
    "couponId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CouponCourse_pkey" PRIMARY KEY ("couponId", "courseId")
);

-- CreateTable
CREATE TABLE "CouponRedemption" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "coursePurchaseId" TEXT NOT NULL,
    "discountMinorUnits" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE INDEX "Coupon_code_isActive_idx" ON "Coupon"("code", "isActive");

-- CreateIndex
CREATE INDEX "CouponCourse_courseId_idx" ON "CouponCourse"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CouponRedemption_coursePurchaseId_key" ON "CouponRedemption"("coursePurchaseId");

-- CreateIndex
CREATE INDEX "CouponRedemption_couponId_studentId_idx" ON "CouponRedemption"("couponId", "studentId");

-- CreateIndex
CREATE INDEX "CoursePurchase_couponId_idx" ON "CoursePurchase"("couponId");

-- AddForeignKey
ALTER TABLE "CoursePurchase" ADD CONSTRAINT "CoursePurchase_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponCourse" ADD CONSTRAINT "CouponCourse_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponCourse" ADD CONSTRAINT "CouponCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_coursePurchaseId_fkey" FOREIGN KEY ("coursePurchaseId") REFERENCES "CoursePurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

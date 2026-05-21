-- AlterTable
ALTER TABLE "CoursePurchase" ADD COLUMN IF NOT EXISTS "displayCurrency" TEXT;
ALTER TABLE "CoursePurchase" ADD COLUMN IF NOT EXISTS "displayAmountMinorUnits" INTEGER;
ALTER TABLE "CoursePurchase" ADD COLUMN IF NOT EXISTS "fxRateNgnPerUsd" DECIMAL(12,4);

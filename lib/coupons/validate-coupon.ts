import { CoursePurchaseStatus, CourseStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { computeDiscount } from "./apply-discount";

export type CouponValidationOk = {
  ok: true;
  coupon: {
    id: string;
    code: string;
    percentOff: number;
  };
  basePriceMinorUnits: number;
  discountMinorUnits: number;
  finalAmountMinorUnits: number;
};

export type CouponValidationResult =
  | CouponValidationOk
  | { ok: false; message: string };

export type ValidateCouponInput = {
  code: string;
  courseId: string;
  studentId: string;
};

/**
 * Single source of truth for whether a coupon may be applied to a course
 * purchase. Used by:
 *  - `/api/payments/coupon/validate` (preview only)
 *  - `/api/payments/paystack/initialize` (authoritative, before charging)
 *
 * NOTE: this is a read-only check; the actual `CouponRedemption` row is
 * created only after the Paystack transaction succeeds (see
 * `lib/payments/complete-course-purchase.ts`).
 */
export async function validateCouponForCheckout(
  input: ValidateCouponInput,
): Promise<CouponValidationResult> {
  const code = input.code.trim().toUpperCase();
  if (!code) {
    return { ok: false, message: "Enter a coupon code." };
  }

  const course = await db.course.findUnique({
    where: { id: input.courseId },
    select: {
      id: true,
      status: true,
      priceMinorUnits: true,
    },
  });
  if (!course || course.status !== CourseStatus.PUBLISHED) {
    return { ok: false, message: "Course not available." };
  }
  const basePrice = course.priceMinorUnits ?? 0;
  if (basePrice <= 0) {
    return { ok: false, message: "Coupons only apply to paid courses." };
  }

  const coupon = await db.coupon.findUnique({
    where: { code },
    include: {
      targets: { select: { courseId: true } },
      _count: { select: { redemptions: true } },
    },
  });

  if (!coupon || !coupon.isActive) {
    return { ok: false, message: "Coupon code is invalid." };
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() <= Date.now()) {
    return { ok: false, message: "Coupon has expired." };
  }

  const targetsCourse = coupon.targets.some(
    (t) => t.courseId === input.courseId,
  );
  if (!targetsCourse) {
    return {
      ok: false,
      message: "Coupon does not apply to this course.",
    };
  }

  if (
    coupon.maxRedemptions != null &&
    coupon._count.redemptions >= coupon.maxRedemptions
  ) {
    return { ok: false, message: "Coupon redemption limit reached." };
  }

  const perStudent = coupon.maxRedemptionsPerStudent ?? 1;
  if (perStudent > 0) {
    const studentRedemptions = await db.couponRedemption.count({
      where: { couponId: coupon.id, studentId: input.studentId },
    });
    if (studentRedemptions >= perStudent) {
      return {
        ok: false,
        message: "You have already used this coupon.",
      };
    }
  }

  const existingSuccess = await db.coursePurchase.findFirst({
    where: {
      courseId: input.courseId,
      studentId: input.studentId,
      status: CoursePurchaseStatus.SUCCESS,
    },
    select: { id: true },
  });
  if (existingSuccess) {
    return {
      ok: false,
      message: "You already own this course.",
    };
  }

  const { discountMinorUnits, finalAmountMinorUnits } = computeDiscount(
    basePrice,
    coupon.percentOff,
  );
  if (finalAmountMinorUnits <= 0) {
    return {
      ok: false,
      message: "Coupon would make this course free \u2014 not supported.",
    };
  }

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      percentOff: coupon.percentOff,
    },
    basePriceMinorUnits: basePrice,
    discountMinorUnits,
    finalAmountMinorUnits,
  };
}

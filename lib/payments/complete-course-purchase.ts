import { revalidatePath } from "next/cache";
import { CoursePurchaseStatus, CourseStatus } from "@/generated/prisma/enums";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import { db } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack/client";
import { getOrCreatePlatformSettings, computeFeeSplit } from "./platform-settings";

type CompleteResult =
  | { ok: true; courseId: string; enrollmentId: string }
  | { ok: false; message: string };

/**
 * Marks purchase SUCCESS, creates enrollment if needed, links purchase.enrollmentId.
 * Idempotent if already SUCCESS for this purchase row.
 */
export async function completeCoursePurchaseFromReference(
  reference: string,
  options?: { paystackTransactionId?: string },
): Promise<CompleteResult> {
  const purchase = await db.coursePurchase.findUnique({
    where: { paystackReference: reference },
    include: { course: { select: { status: true, mentorId: true } } },
  });

  if (!purchase) {
    return { ok: false, message: "Unknown payment reference." };
  }

  if (purchase.status === CoursePurchaseStatus.SUCCESS) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: purchase.courseId,
          studentId: purchase.studentId,
        },
      },
    });
    if (enrollment) {
      if (!purchase.enrollmentId) {
        await db.coursePurchase.update({
          where: { id: purchase.id },
          data: { enrollmentId: enrollment.id },
        });
      }
      return { ok: true, courseId: purchase.courseId, enrollmentId: enrollment.id };
    }

    const restored = await db.$transaction(async (tx) => {
      const en = await tx.enrollment.create({
        data: {
          courseId: purchase.courseId,
          studentId: purchase.studentId,
        },
      });
      await tx.coursePurchase.update({
        where: { id: purchase.id },
        data: { enrollmentId: en.id },
      });
      return en;
    });
    await evaluateStudentBadges(purchase.studentId);
    revalidatePath("/student/courses");
    revalidatePath("/student/browse");
    revalidatePath(`/student/course/${purchase.courseId}`);
    return {
      ok: true,
      courseId: purchase.courseId,
      enrollmentId: restored.id,
    };
  }

  let paystackTxId = options?.paystackTransactionId;

  try {
    const data = await verifyTransaction(reference);

    if (String(data.status).toLowerCase() !== "success") {
      await db.coursePurchase.update({
        where: { id: purchase.id },
        data: { status: CoursePurchaseStatus.FAILED },
      });
      return { ok: false, message: "Payment was not successful." };
    }

    if (Number(data.amount) !== purchase.amountMinorUnits) {
      return { ok: false, message: "Payment amount mismatch." };
    }

    const paidCurrency = (data.currency ?? "NGN").toUpperCase();
    if (paidCurrency !== purchase.currency.toUpperCase()) {
      return { ok: false, message: "Payment currency mismatch." };
    }

    paystackTxId = paystackTxId ?? String(data.id ?? "");
  } catch {
    return { ok: false, message: "Could not verify payment with Paystack." };
  }

  if (purchase.course.status !== CourseStatus.PUBLISHED) {
    return { ok: false, message: "Course is not available for enrollment." };
  }

  const settings = await getOrCreatePlatformSettings();
  const { platformFeeMinorUnits, netToMentorMinorUnits } = computeFeeSplit(
    purchase.amountMinorUnits,
    settings.platformFeePercent,
  );

  try {
    const result = await db.$transaction(async (tx) => {
      const fresh = await tx.coursePurchase.findUnique({
        where: { id: purchase.id },
      });
      if (!fresh) throw new Error("Purchase missing");
      if (fresh.status === CoursePurchaseStatus.SUCCESS) {
        const en = await tx.enrollment.findUnique({
          where: {
            courseId_studentId: {
              courseId: fresh.courseId,
              studentId: fresh.studentId,
            },
          },
        });
        if (en) {
          return { courseId: fresh.courseId, enrollmentId: en.id };
        }
      }

      const updated = await tx.coursePurchase.update({
        where: { id: purchase.id },
        data: {
          status: CoursePurchaseStatus.SUCCESS,
          platformFeeMinorUnits,
          netToMentorMinorUnits,
          paidAt: new Date(),
          paystackTransactionId: paystackTxId || null,
        },
      });

      const enrollment = await tx.enrollment.upsert({
        where: {
          courseId_studentId: {
            courseId: updated.courseId,
            studentId: updated.studentId,
          },
        },
        create: {
          courseId: updated.courseId,
          studentId: updated.studentId,
        },
        update: {},
      });

      await tx.coursePurchase.update({
        where: { id: updated.id },
        data: { enrollmentId: enrollment.id },
      });

      // Record the coupon redemption only after the purchase is SUCCESS so
      // pending/failed payments don't burn the student's per-student quota or
      // the coupon's total cap. Unique on coursePurchaseId makes this safe to
      // re-run from the webhook.
      if (updated.couponId && updated.discountMinorUnits > 0) {
        await tx.couponRedemption.upsert({
          where: { coursePurchaseId: updated.id },
          create: {
            couponId: updated.couponId,
            studentId: updated.studentId,
            coursePurchaseId: updated.id,
            discountMinorUnits: updated.discountMinorUnits,
          },
          update: {},
        });
      }

      return { courseId: updated.courseId, enrollmentId: enrollment.id };
    });

    await evaluateStudentBadges(purchase.studentId);

    revalidatePath("/student/courses");
    revalidatePath("/student/browse");
    revalidatePath("/student/dashboard");
    revalidatePath("/student/achievements");
    revalidatePath(`/student/browse/${purchase.courseId}`);
    revalidatePath(`/student/course/${purchase.courseId}`);

    return {
      ok: true,
      courseId: result.courseId,
      enrollmentId: result.enrollmentId,
    };
  } catch (e) {
    console.error("completeCoursePurchaseFromReference transaction failed", e);
    return { ok: false, message: "Could not finalize enrollment." };
  }
}

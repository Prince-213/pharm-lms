import { randomBytes } from "node:crypto";
import { CoursePurchaseStatus, CourseStatus, UserRole } from "@/generated/prisma/enums";
import { auth } from "@/auth";
import { buildPurchasePricing } from "@/lib/currency/build-purchase-pricing";
import { resolveDisplayCurrency } from "@/lib/currency/resolve-display-currency";
import { db } from "@/lib/db";
import { reEnrollFromSuccessfulPurchase } from "@/lib/payments/re-enroll-purchased-course";
import { getPaystackPublicKey } from "@/lib/paystack/client";
import { NextResponse } from "next/server";

function generateReference(): string {
  return `pharm_${Date.now().toString(36)}_${randomBytes(6).toString("hex")}`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== UserRole.STUDENT) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as { courseId?: string };
    const courseId = body?.courseId;
    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json({ error: "courseId required" }, { status: 400 });
    }

    const [course, student] = await Promise.all([
      db.course.findUnique({
        where: { id: courseId },
        select: {
          id: true,
          status: true,
          priceMinorUnits: true,
          mentorId: true,
        },
      }),
      db.user.findUnique({
        where: { id: session.user.id },
        select: { country: true },
      }),
    ]);

    if (!course || course.status !== CourseStatus.PUBLISHED) {
      return NextResponse.json({ error: "Course not available" }, { status: 404 });
    }

    const price = course.priceMinorUnits;
    if (price == null || price <= 0) {
      return NextResponse.json(
        { error: "This course is free — enroll without payment." },
        { status: 400 },
      );
    }

    const existingSuccess = await db.coursePurchase.findFirst({
      where: {
        courseId,
        studentId: session.user.id,
        status: CoursePurchaseStatus.SUCCESS,
      },
      select: { id: true },
    });
    if (existingSuccess) {
      const reEnrolled = await reEnrollFromSuccessfulPurchase(
        session.user.id,
        courseId,
      );
      if (!reEnrolled.ok) {
        return NextResponse.json({ error: reEnrolled.message }, { status: 400 });
      }
      return NextResponse.json({
        reEnrolled: true,
        courseId: reEnrolled.courseId,
        enrollmentId: reEnrolled.enrollmentId,
      });
    }

    const displayCurrency = await resolveDisplayCurrency({
      profileCountry: student?.country,
    });
    const pricing = await buildPurchasePricing(price, displayCurrency);

    const reference = generateReference();

    await db.coursePurchase.create({
      data: {
        courseId: course.id,
        studentId: session.user.id,
        mentorId: course.mentorId,
        amountMinorUnits: pricing.chargeMinorUnits,
        currency: pricing.chargeCurrency,
        displayCurrency: pricing.displayCurrency,
        displayAmountMinorUnits: pricing.displayAmountMinorUnits,
        fxRateNgnPerUsd: pricing.fxRateNgnPerUsd,
        paystackReference: reference,
        status: CoursePurchaseStatus.PENDING,
      },
    });

    const publicKey = getPaystackPublicKey();
    return NextResponse.json({
      reference,
      amount: pricing.chargeMinorUnits,
      email: session.user.email,
      publicKey,
      currency: pricing.chargeCurrency,
      displayAmount: pricing.displayAmountMinorUnits,
      displayCurrency: pricing.displayCurrency,
    });
  } catch (e) {
    console.error("paystack initialize", e);
    const message =
      e instanceof Error && e.message.includes("PAYSTACK")
        ? "Payment configuration error."
        : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

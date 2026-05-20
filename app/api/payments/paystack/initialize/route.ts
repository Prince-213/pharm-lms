import { randomBytes } from "node:crypto";
import { CoursePurchaseStatus, CourseStatus, UserRole } from "@/generated/prisma/enums";
import { auth } from "@/auth";
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

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        status: true,
        priceMinorUnits: true,
        priceCurrency: true,
        mentorId: true,
      },
    });

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

    const reference = generateReference();

    await db.coursePurchase.create({
      data: {
        courseId: course.id,
        studentId: session.user.id,
        mentorId: course.mentorId,
        amountMinorUnits: price,
        currency: course.priceCurrency || "NGN",
        paystackReference: reference,
        status: CoursePurchaseStatus.PENDING,
      },
    });

    const publicKey = getPaystackPublicKey();
    return NextResponse.json({
      reference,
      amount: price,
      email: session.user.email,
      publicKey,
      currency: course.priceCurrency || "NGN",
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

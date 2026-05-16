import { UserRole } from "@/generated/prisma/enums";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { completeCoursePurchaseFromReference } from "@/lib/payments/complete-course-purchase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { reference?: string };
  const reference = body?.reference?.trim();
  if (!reference) {
    return NextResponse.json({ error: "reference required" }, { status: 400 });
  }

  const purchase = await db.coursePurchase.findUnique({
    where: { paystackReference: reference },
    select: { studentId: true },
  });
  if (!purchase) {
    return NextResponse.json({ error: "Invalid reference" }, { status: 404 });
  }
  if (purchase.studentId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await completeCoursePurchaseFromReference(reference);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    courseId: result.courseId,
    enrollmentId: result.enrollmentId,
  });
}

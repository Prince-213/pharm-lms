import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CoursePurchaseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

function maskEmail(email: string) {
  const [u, d] = email.split("@");
  if (!d) return "***";
  return `${u.slice(0, 2)}***@${d}`;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const take = Math.min(
    100,
    Math.max(5, Number(searchParams.get("take")) || 30),
  );
  const status = searchParams.get("status") as CoursePurchaseStatus | null;
  const mentorId = searchParams.get("mentorId")?.trim() || undefined;
  const courseId = searchParams.get("courseId")?.trim() || undefined;
  const fromIso = searchParams.get("from")?.trim();
  const toIso = searchParams.get("to")?.trim();
  const from = fromIso ? new Date(fromIso) : undefined;
  const to = toIso ? new Date(toIso) : undefined;

  const where = {
    ...(status && Object.values(CoursePurchaseStatus).includes(status)
      ? { status }
      : {}),
    ...(mentorId ? { mentorId } : {}),
    ...(courseId ? { courseId } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from && !Number.isNaN(from.getTime()) ? { gte: from } : {}),
            ...(to && !Number.isNaN(to.getTime()) ? { lte: to } : {}),
          },
        }
      : {}),
  };

  const rows = await db.coursePurchase.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      courseId: true,
      amountMinorUnits: true,
      currency: true,
      platformFeeMinorUnits: true,
      netToMentorMinorUnits: true,
      status: true,
      paystackReference: true,
      paidAt: true,
      createdAt: true,
      course: { select: { title: true } },
      mentor: { select: { id: true, fullName: true } },
      student: { select: { email: true } },
    },
  });

  return NextResponse.json({
    transactions: rows.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      amountMinorUnits: r.amountMinorUnits,
      currency: r.currency,
      platformFeeMinorUnits: r.platformFeeMinorUnits,
      netToMentorMinorUnits: r.netToMentorMinorUnits,
      status: r.status,
      paystackReference: r.paystackReference,
      paidAt: r.paidAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      course: r.course,
      mentor: r.mentor,
      studentEmailMasked: maskEmail(r.student.email),
    })),
  });
}

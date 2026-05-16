import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { studentHasPaidCourseAccess } from "@/lib/payments/student-course-access";
import { getR2SignedGetUrl, isR2Configured } from "@/lib/storage/r2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId },
    include: {
      section: {
        include: {
          course: { select: { id: true, status: true, priceMinorUnits: true } },
        },
      },
    },
  });
  if (!lesson?.videoUrl) {
    return NextResponse.json({ error: "No video for this lesson" }, { status: 404 });
  }
  if (lesson.section.course.status !== CourseStatus.PUBLISHED) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: lesson.section.course.id,
        studentId: session.user.id,
      },
    },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Enroll to access lessons" }, { status: 403 });
  }

  const paidOk = await studentHasPaidCourseAccess(session.user.id, {
    id: lesson.section.course.id,
    priceMinorUnits: lesson.section.course.priceMinorUnits,
  });
  if (!paidOk) {
    return NextResponse.json(
      { error: "Complete payment to access lessons" },
      { status: 403 },
    );
  }

  const url = lesson.videoUrl;
  if (url.startsWith("r2://")) {
    if (!isR2Configured()) {
      return NextResponse.json({ error: "Video storage is not configured" }, { status: 503 });
    }
    const key = url.slice("r2://".length);
    const signed = await getR2SignedGetUrl(key, 3600);
    return NextResponse.redirect(signed);
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return NextResponse.redirect(url);
  }
  if (url.startsWith("/")) {
    return NextResponse.redirect(new URL(url, new URL(request.url).origin));
  }

  return NextResponse.json({ error: "Unsupported video URL" }, { status: 400 });
}

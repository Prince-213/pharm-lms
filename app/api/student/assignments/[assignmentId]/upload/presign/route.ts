import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { AssignmentStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { studentMayAccessCourseContent } from "@/lib/payments/student-course-access";
import {
  ensureR2UploadCors,
  getR2SignedPutUrl,
  isR2Configured,
  R2_MAX_UPLOAD_BYTES,
} from "@/lib/storage/r2";
import { resolveUploadContentType } from "@/lib/upload/course-upload-purpose";

const submissionMimes = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ assignmentId: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "Direct storage upload is not configured.", code: "R2_UNAVAILABLE" },
      { status: 503 },
    );
  }

  const { assignmentId } = await params;
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, courseId: true, status: true },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }
  if (assignment.status !== AssignmentStatus.SENT) {
    return NextResponse.json(
      { error: "This assignment is not open for submissions." },
      { status: 403 },
    );
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: assignment.courseId,
        studentId: session.user.id,
      },
    },
    select: { id: true },
  });
  if (!enrollment) {
    return NextResponse.json(
      { error: "Enroll in the course before uploading a submission file." },
      { status: 403 },
    );
  }

  if (
    !(await studentMayAccessCourseContent(session.user.id, assignment.courseId))
  ) {
    return NextResponse.json(
      { error: "Complete payment before uploading a submission file." },
      { status: 403 },
    );
  }

  let body: {
    fileName?: string;
    contentType?: string;
    contentLength?: number;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const fileName = String(body.fileName ?? "").trim();
  const contentType = resolveUploadContentType(
    fileName,
    String(body.contentType ?? ""),
  );
  const contentLength = Number(body.contentLength ?? 0);

  if (!fileName || !Number.isFinite(contentLength) || contentLength <= 0) {
    return NextResponse.json(
      { error: "fileName and contentLength are required." },
      { status: 400 },
    );
  }

  if (contentLength > R2_MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `File exceeds the maximum upload size of ${Math.floor(R2_MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
      },
      { status: 413 },
    );
  }

  if (!submissionMimes.includes(contentType)) {
    return NextResponse.json(
      { error: "Unsupported file type for submission." },
      { status: 400 },
    );
  }

  const ext = fileName.includes(".") ? fileName.split(".").pop() : "bin";
  const courseId = assignment.courseId;
  const key = `courses/${courseId}/assignment-submissions/${assignmentId}/${session.user.id}/${crypto.randomUUID()}.${ext}`;

  try {
    await ensureR2UploadCors().catch((err) => {
      console.warn("[assignment/upload/presign] Could not ensure R2 CORS:", err);
    });

    const uploadUrl = await getR2SignedPutUrl(
      key,
      contentType,
      contentLength,
      60 * 60,
    );
    return NextResponse.json({
      key,
      uploadUrl,
      contentType,
      url: `r2://${key}`,
    });
  } catch (err) {
    console.error("[assignment/upload/presign] failed:", err);
    return NextResponse.json(
      { error: "Could not start submission upload. Try again." },
      { status: 502 },
    );
  }
}

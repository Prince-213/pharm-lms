import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { AssignmentStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { studentMayAccessCourseContent } from "@/lib/payments/student-course-access";
import { isR2Configured, uploadToR2 } from "@/lib/storage/r2";

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

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 50MB." },
      { status: 413 },
    );
  }

  if (!submissionMimes.includes(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type for submission." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const courseId = assignment.courseId;
  const key = `courses/${courseId}/assignment-submissions/${assignmentId}/${session.user.id}/${crypto.randomUUID()}.${ext}`;

  if (!isR2Configured()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "File storage is not configured." },
        { status: 503 },
      );
    }
    const publicRoot = path.join(process.cwd(), "public");
    const diskPath = path.join(publicRoot, ...key.split("/"));
    await mkdir(path.dirname(diskPath), { recursive: true });
    await writeFile(diskPath, buffer);
    return NextResponse.json({ key, url: `/${key}` }, { status: 201 });
  }

  await uploadToR2({
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });
  return NextResponse.json({ key, url: `r2://${key}` }, { status: 201 });
}

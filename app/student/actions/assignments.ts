"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import {
  AssignmentStatus,
  SubmissionStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const submitSchema = z.object({
  assignmentId: z.string().min(1),
  content: z.string().min(1).max(8000),
});

export type SubmitAssignmentInput = z.infer<typeof submitSchema>;
export type SubmitAssignmentResult =
  | { ok: true; submissionId: string }
  | { ok: false; message: string };

export async function submitAssignmentAction(
  input: SubmitAssignmentInput,
): Promise<SubmitAssignmentResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false, message: "Sign in as a student to submit." };
  }

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const assignment = await db.assignment.findUnique({
    where: { id: parsed.data.assignmentId },
    select: { id: true, status: true, courseId: true, dueDate: true },
  });
  if (!assignment) return { ok: false, message: "Assignment not found." };
  if (assignment.status !== AssignmentStatus.SENT) {
    return {
      ok: false,
      message: "This assignment is not open for submissions.",
    };
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
  if (!enrollment)
    return { ok: false, message: "Enroll in the course before submitting." };

  const isLate = assignment.dueDate
    ? assignment.dueDate.getTime() < Date.now()
    : false;

  const submission = await db.assignmentSubmission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: assignment.id,
        studentId: session.user.id,
      },
    },
    update: {
      content: parsed.data.content.trim(),
      submittedAt: new Date(),
      status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
    },
    create: {
      assignmentId: assignment.id,
      studentId: session.user.id,
      content: parsed.data.content.trim(),
      submittedAt: new Date(),
      status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
    },
    select: { id: true },
  });

  revalidatePath("/student/assignments");
  return { ok: true, submissionId: submission.id };
}

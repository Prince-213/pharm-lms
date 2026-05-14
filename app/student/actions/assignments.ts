"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { emailTutorAssignmentSubmitted } from "@/lib/assignment-emails";
import { evaluateStudentBadges } from "@/lib/badges/evaluate-student-badges";
import {
  AssignmentStatus,
  SubmissionStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const submitSchema = z
  .object({
    assignmentId: z.string().min(1),
    content: z.string().max(8000).optional(),
    attachmentUrl: z.string().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    const text = data.content?.trim() ?? "";
    const file = data.attachmentUrl?.trim() ?? "";
    if (!text && !file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Write a response or attach a file (or both).",
      });
    }
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
    select: {
      id: true,
      status: true,
      courseId: true,
      dueDate: true,
      title: true,
      course: {
        select: {
          title: true,
          mentorId: true,
          mentor: { select: { email: true, fullName: true } },
        },
      },
    },
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

  const contentTrimmed = parsed.data.content?.trim() ?? "";
  const attachmentTrimmed = parsed.data.attachmentUrl?.trim() ?? "";

  const submission = await db.assignmentSubmission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: assignment.id,
        studentId: session.user.id,
      },
    },
    update: {
      content: contentTrimmed || null,
      attachmentUrl: attachmentTrimmed || null,
      submittedAt: new Date(),
      status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
    },
    create: {
      assignmentId: assignment.id,
      studentId: session.user.id,
      content: contentTrimmed || null,
      attachmentUrl: attachmentTrimmed || null,
      submittedAt: new Date(),
      status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
    },
    select: { id: true },
  });

  const student = await db.user.findUnique({
    where: { id: session.user.id },
    select: { fullName: true },
  });

  const href = `/tutor/assignments/${assignment.id}`;
  await db.notification.create({
    data: {
      userId: assignment.course.mentorId,
      kind: "ASSIGNMENT_SUBMITTED",
      title: `New submission: ${assignment.title}`,
      body: `${student?.fullName ?? "A student"} submitted work for ${assignment.course.title}.`,
      href,
      assignmentId: assignment.id,
    },
  });

  void emailTutorAssignmentSubmitted({
    mentorEmail: assignment.course.mentor.email,
    mentorName: assignment.course.mentor.fullName,
    studentName: student?.fullName ?? "Student",
    courseTitle: assignment.course.title,
    assignmentTitle: assignment.title,
    assignmentId: assignment.id,
  });

  revalidatePath("/student/assignments");
  revalidatePath("/tutor/assignments");
  revalidatePath(href);
  void evaluateStudentBadges(session.user.id);
  return { ok: true, submissionId: submission.id };
}

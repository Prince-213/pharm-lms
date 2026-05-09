"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { AssignmentStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

const createSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(4000),
  dueAt: z.string().optional(),
  publish: z.boolean().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createSchema>;
export type CreateAssignmentResult =
  | { ok: true; assignmentId: string }
  | { ok: false; message: string };

async function requireMentor() {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) return null;
  return session.user;
}

export async function createAssignmentAction(
  input: CreateAssignmentInput,
): Promise<CreateAssignmentResult> {
  const user = await requireMentor();
  if (!user) return { ok: false, message: "Tutors only." };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const course = await db.course.findFirst({
    where: { id: parsed.data.courseId, mentorId: user.id },
    select: { id: true },
  });
  if (!course) return { ok: false, message: "Course not found." };

  const dueDate = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) {
    return { ok: false, message: "Invalid due date." };
  }

  const assignment = await db.assignment.create({
    data: {
      courseId: course.id,
      createdById: user.id,
      title: parsed.data.title.trim(),
      description: parsed.data.description.trim(),
      dueDate,
      status: parsed.data.publish
        ? AssignmentStatus.SENT
        : AssignmentStatus.DRAFT,
    },
    select: { id: true },
  });

  revalidatePath("/mentor/assignments");
  return { ok: true, assignmentId: assignment.id };
}

const statusSchema = z.object({
  assignmentId: z.string().min(1),
  status: z.nativeEnum(AssignmentStatus),
});

export async function updateAssignmentStatusAction(
  input: z.infer<typeof statusSchema>,
) {
  const user = await requireMentor();
  if (!user) return { ok: false as const, message: "Mentors only." };

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Invalid input" };

  const assignment = await db.assignment.findFirst({
    where: { id: parsed.data.assignmentId, course: { mentorId: user.id } },
    select: { id: true },
  });
  if (!assignment)
    return { ok: false as const, message: "Assignment not found." };

  await db.assignment.update({
    where: { id: assignment.id },
    data: { status: parsed.data.status },
  });
  revalidatePath("/mentor/assignments");
  return { ok: true as const };
}

const gradeSchema = z.object({
  submissionId: z.string().min(1),
  grade: z.number().min(0).max(100),
  feedback: z.string().max(2000).optional(),
});

export async function gradeSubmissionAction(
  input: z.infer<typeof gradeSchema>,
) {
  const user = await requireMentor();
  if (!user) return { ok: false as const, message: "Mentors only." };

  const parsed = gradeSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Invalid input" };

  const submission = await db.assignmentSubmission.findFirst({
    where: {
      id: parsed.data.submissionId,
      assignment: { course: { mentorId: user.id } },
    },
    select: { id: true },
  });
  if (!submission)
    return { ok: false as const, message: "Submission not found." };

  await db.assignmentSubmission.update({
    where: { id: submission.id },
    data: {
      grade: parsed.data.grade,
      feedback: parsed.data.feedback ?? null,
      status: "GRADED",
    },
  });
  revalidatePath("/mentor/assignments");
  return { ok: true as const };
}

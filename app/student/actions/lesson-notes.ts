"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

async function assertStudentOwnsLessonNote(studentId: string, noteId: string) {
  const row = await db.studentLessonNote.findFirst({
    where: { id: noteId, studentId },
    select: {
      id: true,
      lesson: { select: { section: { select: { courseId: true } } } },
    },
  });
  return row;
}

export async function createLessonNoteAction(input: {
  courseId: string;
  lessonId: string;
  body: string;
  videoOffsetSec?: number | null;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false as const, message: "Unauthorized." };
  }
  const body = input.body.trim();
  if (body.length < 1) {
    return { ok: false as const, message: "Note cannot be empty." };
  }
  if (body.length > 20_000) {
    return { ok: false as const, message: "Note is too long." };
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: input.courseId,
        studentId: session.user.id,
      },
    },
    select: { id: true },
  });
  if (!enrollment) {
    return { ok: false as const, message: "Not enrolled in this course." };
  }

  const lesson = await db.lesson.findFirst({
    where: {
      id: input.lessonId,
      section: { courseId: input.courseId },
    },
    select: { id: true },
  });
  if (!lesson) {
    return { ok: false as const, message: "Lesson not found." };
  }

  await db.studentLessonNote.create({
    data: {
      studentId: session.user.id,
      lessonId: input.lessonId,
      body,
      videoOffsetSec: input.videoOffsetSec ?? null,
    },
  });

  revalidatePath(`/student/course/${input.courseId}`);
  return { ok: true as const };
}

export async function updateLessonNoteAction(input: {
  courseId: string;
  noteId: string;
  body: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false as const, message: "Unauthorized." };
  }
  const body = input.body.trim();
  if (body.length < 1) {
    return { ok: false as const, message: "Note cannot be empty." };
  }
  if (body.length > 20_000) {
    return { ok: false as const, message: "Note is too long." };
  }

  const row = await assertStudentOwnsLessonNote(session.user.id, input.noteId);
  if (!row || row.lesson.section.courseId !== input.courseId) {
    return { ok: false as const, message: "Note not found." };
  }

  await db.studentLessonNote.update({
    where: { id: input.noteId },
    data: { body },
  });

  revalidatePath(`/student/course/${input.courseId}`);
  return { ok: true as const };
}

export async function deleteLessonNoteAction(input: {
  courseId: string;
  noteId: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.STUDENT) {
    return { ok: false as const, message: "Unauthorized." };
  }

  const row = await assertStudentOwnsLessonNote(session.user.id, input.noteId);
  if (!row || row.lesson.section.courseId !== input.courseId) {
    return { ok: false as const, message: "Note not found." };
  }

  await db.studentLessonNote.delete({ where: { id: input.noteId } });
  revalidatePath(`/student/course/${input.courseId}`);
  return { ok: true as const };
}

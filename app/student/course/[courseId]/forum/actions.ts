"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { COURSE_GENERAL_FORUM_THREAD_TITLE } from "@/lib/course-discussions";
import { db } from "@/lib/db";

export async function createForumPostAction(courseId: string, body: string) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, message: "Please sign in to post." };
  }

  const text = body.trim();
  if (text.length < 2) {
    return { ok: false as const, message: "Message is too short." };
  }
  if (text.length > 2000) {
    return { ok: false as const, message: "Message is too long." };
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, mentorId: true },
  });
  if (!course) {
    return { ok: false as const, message: "Course not found." };
  }

  const role = session.user.role;
  if (role === UserRole.STUDENT) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: session.user.id,
        },
      },
      select: { id: true },
    });
    if (!enrollment) {
      return {
        ok: false as const,
        message: "Only enrolled students can post here.",
      };
    }
  } else if (role === UserRole.MENTOR) {
    if (course.mentorId !== session.user.id) {
      return {
        ok: false as const,
        message: "Only the assigned mentor can post here.",
      };
    }
  } else if (role !== UserRole.ADMIN) {
    return {
      ok: false as const,
      message: "You do not have access to this forum.",
    };
  }

  const thread = await db.forumThread.findFirst({
    where: { courseId, title: COURSE_GENERAL_FORUM_THREAD_TITLE },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const threadId =
    thread?.id ??
    (
      await db.forumThread.create({
        data: {
          courseId,
          title: COURSE_GENERAL_FORUM_THREAD_TITLE,
          createdById: session.user.id,
        },
        select: { id: true },
      })
    ).id;

  await db.forumPost.create({
    data: {
      threadId,
      authorId: session.user.id,
      body: text,
    },
  });

  revalidatePath(`/student/course/${courseId}/forum`);
  return { ok: true as const };
}

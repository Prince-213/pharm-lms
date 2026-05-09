"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import {
  COURSE_ANNOUNCEMENTS_THREAD_TITLE,
  COURSE_GENERAL_FORUM_THREAD_TITLE,
} from "@/lib/course-discussions";
import { db } from "@/lib/db";

async function requireMentorOwner(courseId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== UserRole.TUTOR) {
    return { ok: false as const, message: "Unauthorized" };
  }

  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    select: { id: true },
  });
  if (!course) return { ok: false as const, message: "Course not found." };

  return { ok: true as const, userId: session.user.id };
}

export async function postCourseAnnouncementAction(courseId: string, body: string) {
  const authz = await requireMentorOwner(courseId);
  if (!authz.ok) return authz;

  const text = body.trim();
  if (text.length < 2) return { ok: false as const, message: "Announcement is too short." };
  if (text.length > 2000) return { ok: false as const, message: "Announcement is too long." };

  const thread =
    (await db.forumThread.findFirst({
      where: { courseId, title: COURSE_ANNOUNCEMENTS_THREAD_TITLE },
      select: { id: true },
    })) ??
    (await db.forumThread.create({
      data: {
        courseId,
        title: COURSE_ANNOUNCEMENTS_THREAD_TITLE,
        createdById: authz.userId,
      },
      select: { id: true },
    }));

  await db.forumPost.create({
    data: {
      threadId: thread.id,
      authorId: authz.userId,
      body: text,
    },
  });

  revalidatePath(`/tutor/courses/${courseId}/overview`);
  revalidatePath(`/student/course/${courseId}`);
  return { ok: true as const };
}

export async function postMentorForumMessageAction(courseId: string, body: string) {
  const authz = await requireMentorOwner(courseId);
  if (!authz.ok) return authz;

  const text = body.trim();
  if (text.length < 2) return { ok: false as const, message: "Message is too short." };
  if (text.length > 2000) return { ok: false as const, message: "Message is too long." };

  const thread =
    (await db.forumThread.findFirst({
      where: { courseId, title: COURSE_GENERAL_FORUM_THREAD_TITLE },
      select: { id: true },
    })) ??
    (await db.forumThread.create({
      data: {
        courseId,
        title: COURSE_GENERAL_FORUM_THREAD_TITLE,
        createdById: authz.userId,
      },
      select: { id: true },
    }));

  await db.forumPost.create({
    data: {
      threadId: thread.id,
      authorId: authz.userId,
      body: text,
    },
  });

  revalidatePath(`/tutor/courses/${courseId}/overview`);
  revalidatePath(`/student/course/${courseId}/forum`);
  return { ok: true as const };
}

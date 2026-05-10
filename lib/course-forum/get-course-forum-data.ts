import { UserRole } from "@/generated/prisma/enums";
import { COURSE_GENERAL_FORUM_THREAD_TITLE } from "@/lib/course-discussions";
import { db } from "@/lib/db";

export async function getCourseForumData(courseId: string) {
  const thread = await db.forumThread.findFirst({
    where: { courseId, title: COURSE_GENERAL_FORUM_THREAD_TITLE },
    orderBy: { createdAt: "asc" },
    include: {
      posts: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      },
    },
  });

  const studentAuthorIds = [
    ...new Set(
      (thread?.posts ?? [])
        .filter((p) => p.author.role === UserRole.STUDENT)
        .map((p) => p.author.id),
    ),
  ];
  const badgeCounts = studentAuthorIds.length
    ? await db.studentBadge.groupBy({
        by: ["studentId"],
        where: { studentId: { in: studentAuthorIds } },
        _count: { studentId: true },
      })
    : [];
  const badgeCountByStudent = new Map(
    badgeCounts.map((row) => [row.studentId, row._count.studentId]),
  );

  return { thread, badgeCountByStudent };
}

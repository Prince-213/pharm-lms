import { CoursePurchaseStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";

export async function getTutorRevenueSummary(
  mentorId: string,
  since?: Date,
) {
  const purchaseWhere = {
    mentorId,
    status: CoursePurchaseStatus.SUCCESS,
    ...(since ? { paidAt: { gte: since } } : {}),
  };

  const [gross, net, count] = await Promise.all([
    db.coursePurchase.aggregate({
      where: purchaseWhere,
      _sum: { amountMinorUnits: true },
    }),
    db.coursePurchase.aggregate({
      where: purchaseWhere,
      _sum: { netToMentorMinorUnits: true },
    }),
    db.coursePurchase.count({ where: purchaseWhere }),
  ]);

  return {
    grossMinor: gross._sum.amountMinorUnits ?? 0,
    netMinor: net._sum.netToMentorMinorUnits ?? 0,
    purchaseCount: count,
  };
}

export async function getTutorRevenueByCourse(mentorId: string) {
  const rows = await db.coursePurchase.groupBy({
    by: ["courseId"],
    where: { mentorId, status: CoursePurchaseStatus.SUCCESS },
    _sum: {
      amountMinorUnits: true,
      netToMentorMinorUnits: true,
    },
    _count: { _all: true },
  });

  const courseIds = rows.map((r) => r.courseId);
  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, title: true },
  });
  const titleById = Object.fromEntries(courses.map((c) => [c.id, c.title]));

  return rows.map((r) => ({
    courseId: r.courseId,
    title: titleById[r.courseId] ?? "Course",
    unitsSold: r._count._all,
    grossMinor: r._sum.amountMinorUnits ?? 0,
    netMinor: r._sum.netToMentorMinorUnits ?? 0,
  }));
}

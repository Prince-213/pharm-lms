import { Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

type SearchParams = {
  courseId?: string;
};

export default async function MentorStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");
  if (session.user.role !== UserRole.TUTOR) {
    redirect(roleHomePath(session.user.role));
  }

  const params = (await searchParams) ?? {};
  const courseFilter = params.courseId?.trim() ?? "";

  const courses = await db.course.findMany({
    where: { mentorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true },
  });
  const courseIds = courses.map((c) => c.id);
  const validFilter = courseIds.includes(courseFilter) ? courseFilter : "";

  const enrollments = courseIds.length
    ? await db.enrollment.findMany({
        where: validFilter
          ? { courseId: validFilter }
          : { courseId: { in: courseIds } },
        orderBy: { enrolledAt: "desc" },
        include: {
          student: { select: { id: true, fullName: true, email: true } },
          course: { select: { id: true, title: true } },
        },
      })
    : [];

  const totalLearners = new Set(enrollments.map((e) => e.studentId)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1d1f]">
            Enrolled students
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[#6a6f73]">
            Every student currently enrolled in your courses. Filter by course
            to focus your outreach.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#e3e5e8] bg-white px-3 py-2 text-xs font-semibold text-[#1c1d1f]">
          <Users className="h-4 w-4 text-[var(--primary)]" />
          {enrollments.length.toLocaleString()} enrollments ·{" "}
          {totalLearners.toLocaleString()} learners
        </div>
      </div>

      <form
        action="/tutor/students"
        method="get"
        className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e3e5e8] bg-white p-3"
      >
        <label
          htmlFor="courseId"
          className="text-xs font-semibold uppercase tracking-wide text-[#6a6f73]"
        >
          Course
        </label>
        <select
          id="courseId"
          name="courseId"
          defaultValue={validFilter}
          className="h-9 min-w-[220px] rounded-md border border-[#e3e5e8] bg-white px-2 text-sm"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-[var(--primary)] px-3 text-xs font-semibold text-white hover:bg-[var(--primary-strong)]"
        >
          Apply
        </button>
        {validFilter ? (
          <Link
            href="/tutor/students"
            className="text-xs font-semibold text-[#6a6f73] hover:text-[#1c1d1f]"
          >
            Clear filter
          </Link>
        ) : null}
      </form>

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e3e5e8] bg-white p-10 text-center text-sm text-[#6a6f73]">
          No students yet. Publish a course and share its catalog page to start
          enrolling learners.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#e3e5e8] bg-white shadow-sm">
          <table className="min-w-full divide-y divide-[#e3e5e8] text-sm">
            <thead className="bg-[#fafbfb] text-left text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f5]">
              {enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-[#fafbfb]">
                  <td className="px-4 py-3 font-semibold text-[#1c1d1f]">
                    {e.student.fullName}
                  </td>
                  <td className="px-4 py-3 text-[#6a6f73]">
                    {e.student.email}
                  </td>
                  <td className="px-4 py-3 text-[#1c1d1f]">
                    <Link
                      href={`/tutor/courses/${e.course.id}/manage/curriculum`}
                      className="font-medium text-[var(--primary)] hover:underline"
                    >
                      {e.course.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#6a6f73]">
                    {e.status.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-[#6a6f73]">
                    {e.enrolledAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

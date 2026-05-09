import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Inbox,
  Library,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { CourseStatusChart } from "@/components/admin/charts/course-status-chart";
import { EnrollmentTrendChart } from "@/components/admin/charts/enrollment-trend-chart";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const NEXT_ACTIONS = [
  {
    href: "/admin/course-approvals",
    label: "Process review queue",
    Icon: ClipboardList,
  },
  {
    href: "/admin/students",
    label: "Manage students CRM",
    Icon: GraduationCap,
  },
  { href: "/admin/tutors", label: "Manage tutors CRM", Icon: Library },
  { href: "/admin/mentors", label: "Manage mentors CRM", Icon: Users },
  { href: "/admin/users", label: "All users", Icon: ShieldCheck },
  { href: "/admin/badges", label: "Badges & rules reference", Icon: Award },
  { href: "/admin/messages", label: "Communications inbox", Icon: Inbox },
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
};

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    pendingReview,
    publishedCourses,
    totalCourses,
    mentorCount,
    tutorCount,
    studentCount,
    totalEnrollments,
    activeLearnerRows,
    badgesAwarded,
    recentEnrollments,
    topCourses,
    recentWorkflow,
    enrollmentTrendRaw,
    courseStatusGroups,
  ] = await Promise.all([
    db.course.count({ where: { status: CourseStatus.SUBMITTED } }),
    db.course.count({ where: { status: CourseStatus.PUBLISHED } }),
    db.course.count(),
    db.user.count({ where: { role: UserRole.MENTOR } }),
    db.user.count({ where: { role: UserRole.TUTOR } }),
    db.user.count({ where: { role: UserRole.STUDENT } }),
    db.enrollment.count(),
    db.lessonProgress.findMany({
      where: { completed: true, completedAt: { gte: fourteenDaysAgo } },
      distinct: ["studentId"],
      select: { studentId: true },
    }),
    db.studentBadge.count(),
    db.enrollment.findMany({
      orderBy: { enrolledAt: "desc" },
      take: 8,
      include: {
        student: { select: { fullName: true, email: true } },
        course: { select: { title: true } },
      },
    }),
    db.enrollment.groupBy({
      by: ["courseId"],
      _count: { courseId: true },
      orderBy: { _count: { courseId: "desc" } },
      take: 5,
    }),
    db.courseApprovalWorkflow.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { course: { select: { title: true } } },
    }),
    db.enrollment.findMany({
      where: { enrolledAt: { gte: sixMonthsAgo } },
      select: { enrolledAt: true },
    }),
    db.course.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  // ── Enrollment trend: 6-month monthly buckets ──────────────────────────────
  const now = new Date();
  type MonthBucket = { x: string; y: number; key: string };
  const enrollmentBuckets: MonthBucket[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      x: MONTH_SHORT[d.getMonth()] as string,
      y: 0,
      key: `${d.getFullYear()}-${d.getMonth()}`,
    };
  });
  for (const e of enrollmentTrendRaw) {
    const k = `${e.enrolledAt.getFullYear()}-${e.enrolledAt.getMonth()}`;
    const bucket = enrollmentBuckets.find((b) => b.key === k);
    if (bucket) bucket.y++;
  }
  const enrollmentTrendData = enrollmentBuckets.map(({ x, y }) => ({ x, y }));

  // ── Course status breakdown ─────────────────────────────────────────────────
  const statusCountMap = new Map(courseStatusGroups.map((g) => [g.status, g._count.status]));
  const courseStatusData = (["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "PUBLISHED"] as const)
    .map((s) => ({ label: STATUS_LABELS[s] ?? s, count: statusCountMap.get(s) ?? 0 }))
    .filter((d) => d.count > 0);

  // ── Top courses detail ──────────────────────────────────────────────────────
  const topCourseDetails = topCourses.length
    ? await db.course.findMany({
        where: { id: { in: topCourses.map((c) => c.courseId) } },
        select: {
          id: true,
          title: true,
          mentor: { select: { fullName: true } },
        },
      })
    : [];
  const topCourseMap = new Map(topCourseDetails.map((c) => [c.id, c]));

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Operational snapshot of the pharmacy LMS: catalog pipeline, people, learning activity, and the latest catalog decisions."
      />

      {/* Stat cards row */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 md:mb-6 md:gap-6 2xl:mb-9 2xl:gap-7.5">
        <AdminStatCard
          label="Pending review"
          value={pendingReview}
          hint="Courses awaiting publish decision"
          icon={ClipboardList}
          href="/admin/course-approvals"
        />
        <AdminStatCard
          label="Total Enrollments"
          value={totalEnrollments}
          hint="All-time student-course pairs"
          icon={TrendingUp}
        />
        <AdminStatCard
          label="Tutors"
          value={tutorCount}
          hint="Course creator accounts"
          icon={Library}
          href="/admin/tutors"
        />
        <AdminStatCard
          label="Mentors"
          value={mentorCount}
          hint="Community mentor accounts"
          icon={Users}
          href="/admin/mentors"
        />
        <AdminStatCard
          label="Students"
          value={studentCount}
          hint="Learner accounts"
          icon={GraduationCap}
          href="/admin/students"
        />
      </div>

      {/* Charts row */}
      <div className="mb-4 grid grid-cols-12 gap-4 md:mb-6 md:gap-6 2xl:mb-9 2xl:gap-7.5">
        <AdminPanel
          title="Enrollment Trend"
          description="New enrollments over the last 6 months"
          className="col-span-12 xl:col-span-7"
        >
          {enrollmentTrendData.every((d) => d.y === 0) ? (
            <div className="flex min-h-[310px] items-center justify-center">
              <p className="text-sm text-[var(--muted)]">
                No enrollments in the last 6 months.
              </p>
            </div>
          ) : (
            <EnrollmentTrendChart data={enrollmentTrendData} />
          )}
        </AdminPanel>

        <AdminPanel
          title="Course Status"
          description="Distribution across pipeline stages"
          className="col-span-12 xl:col-span-5"
        >
          {courseStatusData.length === 0 ? (
            <div className="flex min-h-[310px] items-center justify-center">
              <p className="text-sm text-[var(--muted)]">No courses yet.</p>
            </div>
          ) : (
            <CourseStatusChart data={courseStatusData} />
          )}
        </AdminPanel>
      </div>

      <div className="mb-4 grid grid-cols-12 gap-4 md:mb-6 md:gap-6 2xl:mb-9 2xl:gap-7.5">
        {/* Next actions */}
        <AdminPanel title="Next Actions" description="Common admin workflows" className="col-span-12 xl:col-span-4">
          <ul className="space-y-3">
            {NEXT_ACTIONS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center justify-between rounded-lg border border-(--border) bg-(--surface-muted) px-4 py-3 text-sm font-medium text-foreground transition-all hover:border-(--primary)/40 hover:bg-white hover:shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-(--primary)" />
                    {label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-(--muted-soft)" />
                </Link>
              </li>
            ))}
          </ul>
        </AdminPanel>

        {/* Recent enrollments */}
        <AdminPanel
          title="Recent Enrollments"
          description="Latest learners joining courses"
          className="col-span-12 xl:col-span-8"
        >
          {recentEnrollments.length === 0 ? (
            <p className="text-sm text-(--muted)">No enrollments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEnrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium text-foreground">{e.student.fullName}</TableCell>
                      <TableCell className="text-(--muted)">{e.course.title}</TableCell>
                      <TableCell className="text-right text-xs text-(--muted-soft)">
                        {e.enrolledAt.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AdminPanel>
      </div>

      {/* Top courses table */}
      <AdminPanel
        title="Top courses by enrollment"
        description="The five most-enrolled courses across the catalog"
        className="mb-6"
      >
        {topCourses.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No enrollment data yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead className="text-right">Enrollments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCourses.map((row, idx) => {
                const course = topCourseMap.get(row.courseId);
                return (
                  <TableRow key={row.courseId}>
                    <TableCell>
                      <span className="inline-flex items-center justify-center rounded-md bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-bold text-[var(--primary)]">
                        #{idx + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {course?.title ?? "Course removed"}
                    </TableCell>
                    <TableCell className="text-[var(--muted)]">
                      {course?.mentor.fullName ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-end gap-1.5 text-xs font-semibold text-[var(--foreground)]">
                        <TrendingUp className="h-3.5 w-3.5 text-[var(--primary)]" />
                        {row._count.courseId}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </AdminPanel>

      {/* Recent catalog activity */}
      <AdminPanel
        title="Recent catalog activity"
        description="Latest approval workflow events"
        className="mb-6"
      >
        {recentWorkflow.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No workflow history yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] text-sm">
            {recentWorkflow.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {w.course.title}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    {w.previousStatus} → {w.newStatus}
                    {w.note
                      ? ` · ${w.note.slice(0, 80)}${w.note.length > 80 ? "…" : ""}`
                      : ""}
                  </p>
                </div>
                <time
                  className="shrink-0 text-xs text-[var(--muted)]"
                  dateTime={w.createdAt.toISOString()}
                >
                  {w.createdAt.toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="flex justify-center">
        <Link
          href="/admin/messages"
          className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Open messages inbox
        </Link>
      </div>
    </>
  );
}

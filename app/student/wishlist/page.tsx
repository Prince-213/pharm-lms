import { Heart } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CatalogCourseCard } from "@/components/student/catalog-course-card";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { CourseStatus, UserRole } from "@/generated/prisma/enums";
import {
  getStudentPricingContext,
  mapCoursesWithDisplayPrices,
} from "@/lib/currency/student-pricing-context";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentWishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/wishlist");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const items = await db.wishlist.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        include: {
          mentor: { select: { fullName: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
  });

  const visible = items.filter(
    (i) => i.course.status === CourseStatus.PUBLISHED,
  );
  const { displayCurrency } = await getStudentPricingContext(session.user.id);
  const visibleCourses = await mapCoursesWithDisplayPrices(
    visible.map((i) => i.course),
    displayCurrency,
  );
  const resolvedThumbnails = await Promise.all(
    visibleCourses.map((c) => resolveMediaUrl(c.thumbnailUrl)),
  );

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      {/* <StudentSecondaryNav /> */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Wishlist
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Courses you have saved for later. Tap the heart to remove or open
            one to enroll.
          </p>
        </div>
        <Link
          href="/student/browse"
          className="rounded-full border border-[var(--foreground)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
        >
          Browse catalog
        </Link>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-sm)]">
          <Heart
            className="h-12 w-12 text-[var(--border)]"
            strokeWidth={1.25}
          />
          <p className="mt-4 text-sm font-semibold">Your wishlist is empty</p>
          <p className="mt-2 max-w-sm text-xs text-[var(--muted)]">
            Tap the heart on a course card or open a course detail page to save
            it for later.
          </p>
          <Link
            href="/student/browse"
            className="mt-6 rounded-full bg-[var(--foreground)] px-6 py-2.5 text-sm font-bold text-[var(--surface)] transition hover:bg-[var(--ink-mid)]"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item, i) => {
            const course = visibleCourses[i];
            return (
            <li key={item.id}>
              <CatalogCourseCard
                href={`/student/browse/${course.id}`}
                course={{
                  id: course.id,
                  title: course.title,
                  subtitle: course.subtitle,
                  thumbnailUrl: resolvedThumbnails[i] ?? null,
                  mentorName: course.mentor.fullName,
                  learnerCount: course._count.enrollments,
                  priceMinorUnits: course.priceMinorUnits,
                  priceCurrency: course.priceCurrency,
                }}
                wishlist={{ saved: true }}
              />
            </li>
          );
          })}
        </ul>
      )}
    </div>
  );
}

import { BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TutorCoursesDrawer } from "@/components/student/tutor-courses-drawer";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import type { TutorCourseCard } from "@/lib/student/load-instructor-profile";

type TutorEnrolledCoursesSectionProps = {
  tutorName: string;
  enrolledCourses: TutorCourseCard[];
  publishedCourses: TutorCourseCard[];
};

function MiniCourseCard({ course }: { course: TutorCourseCard }) {
  const thumb = course.thumbnailUrl?.trim();
  const price = formatMinorUnitsToCurrency(
    course.priceMinorUnits,
    course.priceCurrency,
    { zeroAsFree: true },
  );

  return (
    <Link
      href={`/student/browse/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-[var(--surface-muted)]">
        {thumb ? (
          <Image
            src={thumb}
            alt={course.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width:640px) 100vw, 280px"
            unoptimized={thumb.startsWith("http")}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <BookOpen className="h-8 w-8 opacity-40" strokeWidth={1.25} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--ink-deep)] group-hover:text-[var(--primary)]">
          {course.title}
        </h3>
        <p className="mt-auto pt-3 text-sm font-bold text-[var(--primary)]">
          {price}
        </p>
      </div>
    </Link>
  );
}

export function TutorEnrolledCoursesSection({
  tutorName,
  enrolledCourses,
  publishedCourses,
}: TutorEnrolledCoursesSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--ink-deep)]">
            Your courses with {tutorName.split(" ")[0]}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Courses you&apos;re enrolled in — open the overview or continue
            learning.
          </p>
        </div>
        {publishedCourses.length > enrolledCourses.length ? (
          <TutorCoursesDrawer
            tutorName={tutorName}
            courses={publishedCourses}
            triggerLabel="All courses"
            triggerClassName="inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-1.5 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
          />
        ) : null}
      </div>

      {enrolledCourses.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => (
            <li key={course.id}>
              <MiniCourseCard course={course} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/30 px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;re not enrolled in any of this tutor&apos;s courses yet.
          </p>
          {publishedCourses.length > 0 ? (
            <div className="mt-4 flex justify-center">
              <TutorCoursesDrawer
                tutorName={tutorName}
                courses={publishedCourses}
                triggerLabel="Browse this tutor's courses"
              />
            </div>
          ) : (
            <Link
              href="/student/browse"
              className="mt-4 inline-block text-sm font-bold text-[var(--primary)] hover:underline"
            >
              Explore the catalog
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

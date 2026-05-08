import { Star } from "lucide-react";
import Link from "next/link";
import { EnrolledCourseMenu } from "@/components/student/enrolled-course-menu";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";

export function EnrolledCourseCard({
  courseId,
  title,
  mentorName,
  thumbnailUrl,
  priceMinorUnits,
  priceCurrency,
  progressPct,
  hasStarted,
}: {
  courseId: string;
  title: string;
  mentorName: string;
  thumbnailUrl: string | null;
  priceMinorUnits: number | null;
  priceCurrency: string;
  progressPct: number;
  hasStarted: boolean;
}) {
  const thumb = thumbnailUrl?.trim();
  const boundedProgress = Math.min(100, Math.max(0, progressPct));

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)]">
      <div className="relative h-44 w-full bg-[var(--ink-deep)] sm:h-40 lg:h-44">
        {thumb ? (
          <img src={thumb} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs font-medium text-[var(--surface-muted)]">
            {title}
          </div>
        )}
        <EnrolledCourseMenu courseId={courseId} courseTitle={title} />
      </div>

      <div className="flex min-h-[220px] flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-bold leading-snug text-[var(--foreground)]">{title}</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">{mentorName}</p>

        <div className="mt-3 min-h-[52px]">
          {hasStarted ? (
            <>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${boundedProgress}%` }} />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-[var(--foreground)]">{boundedProgress}% complete</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--muted)]">
                <Star className="h-3.5 w-3.5 fill-[var(--star-fill)] text-[var(--star-fill)]" strokeWidth={0} />
                <span>Rate when ready</span>
              </div>
            </>
          ) : (
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--muted)]">
              You have not started this course yet.
            </div>
          )}
        </div>

        <div className="mt-auto space-y-2 border-t border-[var(--border)]/60 pt-3">
          <Link
            href={`/student/course/${courseId}`}
            className="flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-3 text-sm font-bold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)]"
          >
            {hasStarted ? "Continue learning" : "Start course"}
          </Link>
          <Link
            href={`/student/browse/${courseId}`}
            className="flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--primary)]/35 hover:text-[var(--primary)]"
          >
            View overview
          </Link>
        </div>

        <p className="mt-2 text-[11px] text-[var(--muted)]">Purchased {formatMinorUnitsToCurrency(priceMinorUnits, priceCurrency)}</p>
      </div>
    </article>
  );
}

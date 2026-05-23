import { Star } from "lucide-react";
import Link from "next/link";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import type { PublishedCourseListItem } from "@/lib/courses/public-catalog";

function StarRow({
  rating,
  reviewCount,
}: {
  rating: number | null;
  reviewCount: number;
}) {
  if (reviewCount === 0 || rating == null) {
    return (
      <span className="text-xs text-slate-400">No reviews yet</span>
    );
  }

  const filled = Math.round(rating);
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="flex text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3.5 w-3.5"
            fill={i < filled ? "currentColor" : "none"}
            color={i < filled ? "#ca8a04" : "#cbd5e1"}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-slate-500">
        ({reviewCount.toLocaleString()})
      </span>
    </span>
  );
}

type PublicCourseCardProps = {
  course: PublishedCourseListItem;
  /** Fixed width for horizontal scroll rows on small screens */
  layout?: "grid" | "scroll";
};

export function PublicCourseCard({
  course,
  layout = "grid",
}: PublicCourseCardProps) {
  const thumb = course.thumbnailUrl?.trim();
  const price = formatMinorUnitsToCurrency(
    course.priceMinorUnits,
    course.priceCurrency,
    { zeroAsFree: true },
  );

  return (
    <Link
      href={`/courses/${course.id}`}
      className={[
        "group flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:border-[var(--emerald)]/30 sm:hover:shadow-md",
        layout === "scroll"
          ? "w-[min(85vw,280px)] shrink-0 snap-start sm:w-auto"
          : "w-full",
      ].join(" ")}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 sm:aspect-[4/3]">
        {thumb ? (
          <img
            src={thumb}
            alt={course.title}
            className="h-full w-full object-cover transition duration-300 sm:group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-slate-400">
            {course.title}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--ink-deep)] sm:min-h-[2.75rem] sm:group-hover:text-[var(--emerald)]">
          {course.title}
        </h3>

        <div className="mt-2">
          <StarRow rating={course.ratingAverage} reviewCount={course.reviewCount} />
        </div>

        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 border-t border-slate-100 pt-3">
          <span className="text-base font-bold text-[var(--ink-deep)]">{price}</span>
          <span className="text-xs text-slate-400">
            {course.learnerCount.toLocaleString()} learners
          </span>
        </div>
      </div>
    </Link>
  );
}

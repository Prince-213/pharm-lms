import { Star } from "lucide-react";
import Link from "next/link";
import { WishlistHeartButton } from "@/components/student/wishlist-heart-button";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";

export type CatalogCourseCardData = {
  id: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  mentorName: string;
  learnerCount: number;
  priceMinorUnits: number | null;
  priceCurrency: string;
};

export function CatalogCourseCard({
  course,
  href,
  badge,
  wishlist,
}: {
  course: CatalogCourseCardData;
  href: string;
  badge?: string;
  wishlist?: { saved: boolean } | null;
}) {
  const thumb = course.thumbnailUrl?.trim();

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]/35 hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative h-44 w-full bg-[var(--ink-deep)] sm:h-40 lg:h-44">
        {wishlist ? (
          <WishlistHeartButton
            courseId={course.id}
            initialSaved={wishlist.saved}
          />
        ) : null}
        {thumb ? (
          <img
            src={thumb}
            alt={course.title}
            className="h-full w-full object-cover transition group-hover:scale-[1.01] group-hover:opacity-95"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm font-medium text-[var(--surface-muted)]">
            {course.title}
          </div>
        )}
        {badge ? (
          <span className="absolute left-2 top-2 rounded-[var(--radius-sm)] bg-[var(--star-fill)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--ink-deep)]">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="flex min-h-[220px] flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-[var(--muted)]">
          {course.mentorName} - {course.learnerCount.toLocaleString()} learners
        </p>

        <div className="mt-2 flex items-center gap-1 text-xs">
          <span className="font-bold text-[var(--foreground)]">4.5</span>
          <div className="flex text-[var(--star-fill)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={`star-${i}`}
                className="h-3 w-3 fill-current"
                strokeWidth={0}
              />
            ))}
          </div>
          <span className="text-[var(--muted)]">(placeholder)</span>
        </div>

        <p className="mt-2 line-clamp-2 min-h-[2.4rem] text-xs leading-relaxed text-[var(--muted)]">
          {course.subtitle?.trim() ||
            "Open the overview to see curriculum, outcomes, and enrollment details."}
        </p>

        <div className="mt-auto border-t border-[var(--border)]/60 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--foreground)]">
              {formatMinorUnitsToCurrency(
                course.priceMinorUnits,
                course.priceCurrency,
                { zeroAsFree: true },
              )}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] group-hover:text-[var(--primary)]">
              Details
            </span>
          </div>
          <span className="flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] text-xs font-semibold text-[var(--muted)] transition group-hover:border-[var(--primary)]/35 group-hover:text-[var(--primary)]">
            View course overview
          </span>
        </div>
      </div>
    </Link>
  );
}

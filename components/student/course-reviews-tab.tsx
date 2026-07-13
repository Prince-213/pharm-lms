import { Star } from "lucide-react";
import { CourseReviewPanel } from "@/components/student/course-review-panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function nameInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const w = parts[0];
    if (!w) return "?";
    return w.length >= 2 ? w.slice(0, 2).toUpperCase() : w[0].toUpperCase();
  }
  const first = parts[0]?.[0];
  const last = parts[parts.length - 1]?.[0];
  const out = `${first ?? ""}${last ?? ""}`.toUpperCase();
  return out || "?";
}

function ReviewStars({ rating }: { rating: number }) {
  const clamped = Math.min(5, Math.max(0, rating));
  return (
    <span
      role="img"
      className="flex gap-0.5"
      aria-label={`${clamped} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= clamped
              ? "fill-amber-400 text-amber-400"
              : "text-[#e3e5e8]",
          )}
          strokeWidth={star <= clamped ? 0 : 1}
          aria-hidden
        />
      ))}
    </span>
  );
}

export type CourseReviewsTabRow = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  student: { fullName: string };
};

export function CourseReviewsTab({
  courseId,
  canLeaveReview,
  initialRating,
  initialComment,
  ratingAverage,
  reviewCount,
  distribution,
  reviews,
}: {
  courseId: string;
  canLeaveReview: boolean;
  initialRating: number | null;
  initialComment: string | null;
  ratingAverage: number | null;
  reviewCount: number;
  distribution: { rating: number; count: number }[];
  reviews: CourseReviewsTabRow[];
}) {
  const countByStar = new Map(distribution.map((d) => [d.rating, d.count]));
  const maxBar = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 border-b border-[#ececec] pb-8 lg:flex-row lg:items-start lg:gap-10">
        <div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">
            Student feedback
          </h3>
          {ratingAverage != null && reviewCount > 0 ? (
            <div className="mt-4 flex flex-col items-start gap-1">
              <span className="text-4xl font-bold tabular-nums text-amber-500 sm:text-5xl">
                {ratingAverage.toFixed(1)}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <ReviewStars rating={Math.round(ratingAverage)} />
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Course rating · {reviewCount.toLocaleString()}{" "}
                {reviewCount === 1 ? "rating" : "ratings"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No ratings yet. Be the first to leave feedback when you are
              eligible.
            </p>
          )}
        </div>

        {reviewCount > 0 ? (
          <div className="min-w-0 flex-1 space-y-2 lg:max-w-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rating distribution
            </p>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = countByStar.get(stars) ?? 0;
              const pct =
                reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
              const w = maxBar > 0 ? Math.round((count / maxBar) * 100) : 0;
              return (
                <div
                  key={stars}
                  className="flex items-center gap-3 text-xs sm:text-sm"
                >
                  <div className="flex w-16 shrink-0 items-center gap-0.5 text-amber-500">
                    <ReviewStars rating={stars} />
                  </div>
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-sm bg-[#ececec]">
                    <div
                      className="h-full rounded-sm bg-[var(--muted)]"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div>
        <h3 className="text-base font-bold text-[var(--foreground)]">
          Reviews
        </h3>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No written reviews yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[#ececec] rounded-md border border-[#d1d7dc] bg-white">
            {reviews.map((r) => (
              <li key={r.id} className="flex gap-4 px-4 py-4 sm:px-5">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>
                    {nameInitials(r.student.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      {r.student.fullName}
                    </span>
                    <time
                      dateTime={r.createdAt.toISOString()}
                      className="text-[11px] tabular-nums text-muted-foreground"
                    >
                      {r.createdAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <ReviewStars rating={r.rating} />
                  {r.comment?.trim() ? (
                    <p className="pt-1 text-sm leading-relaxed text-muted-foreground">
                      {r.comment.trim()}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-base font-bold text-[var(--foreground)]">
          Your review
        </h3>
        <div className="mt-3">
          <CourseReviewPanel
            courseId={courseId}
            canReview={canLeaveReview}
            initialRating={initialRating}
            initialComment={initialComment}
          />
        </div>
      </div>
    </div>
  );
}

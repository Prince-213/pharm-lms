"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  type UpsertCourseReviewResult,
  upsertCourseReviewAction,
} from "@/app/student/actions/course-review";

export function CourseReviewPanel({
  courseId,
  canReview,
  initialRating,
  initialComment,
}: {
  courseId: string;
  canReview: boolean;
  initialRating: number | null;
  initialComment: string | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [comment, setComment] = useState(initialComment ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setRating(initialRating ?? 0);
    setComment(initialComment ?? "");
  }, [initialRating, initialComment]);

  const hasExisting = initialRating != null && initialRating > 0;

  const handleSubmit = () => {
    if (!canReview) return;
    if (rating < 1 || rating > 5) {
      toast.error("Choose a rating from 1 to 5 stars.");
      return;
    }
    startTransition(async () => {
      const res: UpsertCourseReviewResult = await upsertCourseReviewAction({
        courseId,
        rating,
        comment: comment.trim() || undefined,
      });
      if (res.ok) {
        toast.success(
          hasExisting ? "Your review was updated." : "Thanks for your review!",
        );
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  if (!canReview) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40 p-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Course feedback
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete every lesson in at least one section to leave a review for
          this course.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm">
      <p className="text-sm font-semibold text-[var(--foreground)]">
        Rate this course
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {hasExisting
          ? "Update your rating or comment anytime."
          : "Share how this course worked for you."}
      </p>
      <fieldset className="mt-3 border-0 p-0">
        <legend className="sr-only">Rating</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={isPending}
            onClick={() => setRating(n)}
            className="rounded p-0.5 transition hover:opacity-90 disabled:opacity-60"
            aria-label={`${n} stars`}
          >
            <Star
              className={`h-8 w-8 sm:h-9 sm:w-9 ${
                n <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/35"
              }`}
              strokeWidth={n <= rating ? 0 : 1.25}
            />
          </button>
        ))}
      </fieldset>
      <label className="mt-4 block">
        <span className="text-xs font-medium text-muted-foreground">
          Comment (optional)
        </span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isPending}
          rows={3}
          maxLength={4000}
          placeholder="What helped most? What could improve?"
          className="mt-1.5 w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-muted-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </label>
      <button
        type="button"
        disabled={isPending || rating < 1}
        onClick={handleSubmit}
        className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-5 text-sm font-bold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? "Saving…"
          : hasExisting
            ? "Update review"
            : "Submit review"}
      </button>
    </div>
  );
}

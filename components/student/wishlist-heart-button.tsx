"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleWishlistAction } from "@/app/student/actions/wishlist";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";

type Variant = "icon" | "labeled" | "toolbar";

export function WishlistHeartButton({
  courseId,
  initialSaved,
  variant = "icon",
  className,
}: {
  courseId: string;
  initialSaved: boolean;
  /** toolbar: square outline next to primary CTA (catalog sidebar) */
  variant?: Variant;
  className?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onToggle(e: React.MouseEvent | React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setError(null);
    const optimistic = !saved;
    setSaved(optimistic);
    startTransition(async () => {
      const result = await toggleWishlistAction(courseId);
      if (!result.ok) {
        setSaved(!optimistic);
        setError(result.message);
        return;
      }
      setSaved(result.saved);
      refreshPortalAfterMutation(router);
    });
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={saved}
        className={`flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)] disabled:opacity-60${className ? ` ${className}` : ""}`}
      >
        <Heart
          className="h-4 w-4"
          strokeWidth={2}
          fill={saved ? "currentColor" : "none"}
        />
        {saved ? "Saved to wishlist" : "Add to wishlist"}
        {error ? <span className="sr-only">{error}</span> : null}
      </button>
    );
  }

  if (variant === "toolbar") {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
        className={`inline-flex h-12 w-full shrink-0 items-center justify-center rounded-[2px] border-2 border-[var(--foreground)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] disabled:opacity-60${className ? ` ${className}` : ""}`}
      >
        <Heart
          className={
            saved
              ? "h-5 w-5 text-[var(--primary)]"
              : "h-5 w-5 text-[var(--foreground)]"
          }
          strokeWidth={1.75}
          fill={saved ? "currentColor" : "none"}
        />
        {error ? <span className="sr-only">{error}</span> : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      className={`absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface)]/90 text-[var(--foreground)] shadow-[var(--shadow-sm)] backdrop-blur transition hover:bg-[var(--surface)] disabled:opacity-60${className ? ` ${className}` : ""}`}
    >
      <Heart
        className={
          saved
            ? "h-4 w-4 text-rose-500"
            : "h-4 w-4 text-muted-foreground hover:text-rose-500"
        }
        strokeWidth={2}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}

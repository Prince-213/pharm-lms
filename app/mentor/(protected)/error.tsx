"use client";

export default function MentorProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-4 px-6 py-16 text-[var(--foreground)]">
      <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || "Could not load this page."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
      >
        Try again
      </button>
    </div>
  );
}

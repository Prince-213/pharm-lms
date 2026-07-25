"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type SegmentErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref: string;
  homeLabel: string;
};

export function SegmentError({
  error,
  reset,
  homeHref,
  homeLabel,
}: SegmentErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center text-[var(--foreground)]">
      <h1 className="font-display text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-sm text-muted-foreground">
        {error.message || "Could not load this page. Please try again."}
      </p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

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
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <p className="font-mono text-[11px] tracking-[0.08em] text-muted-soft uppercase">
        Error
      </p>
      <h1 className="font-display text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
        Something went wrong
      </h1>
      <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
        {error.message || "Could not load this page. Please try again."}
      </p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          type="button"
          className="h-11 rounded-md bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90"
          onClick={() => reset()}
        >
          Try again
        </Button>
        <Button type="button" variant="outline" className="h-11 rounded-md px-6" asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

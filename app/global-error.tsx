"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { fontVariables, montserrat } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className={cn("h-full antialiased", fontVariables)}>
      <body
        className={cn(
          "flex min-h-full flex-col items-center justify-center bg-[#fafafb] px-6 py-20 text-center font-sans text-[#0a0a14]",
          montserrat.className,
        )}
      >
        <p
          className="text-[11px] tracking-[0.08em] text-[#5f5f73] uppercase"
          style={{ fontFamily: "ui-monospace, monospace" }}
        >
          Error
        </p>
        <h1 className="mt-3 max-w-lg text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#4a4a5a]">
          The page could not be loaded. Try again, or go back to the PharmEdge
          home page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-11 items-center rounded-md bg-[#00bfff] px-6 text-sm font-semibold text-[#00005c]"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center rounded-md border border-[rgba(10,10,30,0.1)] px-6 text-sm font-medium"
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  );
}

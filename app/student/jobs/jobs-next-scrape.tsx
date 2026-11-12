"use client";

import { Hourglass } from "lucide-react";
import { useEffect, useState } from "react";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "due soon";
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function JobsNextScrape({
  nextScrapeAt,
  lastSuccessAt,
  cadenceDays,
}: {
  nextScrapeAt: string | null;
  lastSuccessAt: string | null;
  cadenceDays: number;
}) {
  const target = nextScrapeAt ? new Date(nextScrapeAt).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (target == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [target]);

  const remaining = target != null ? target - now : null;
  const lastLabel = lastSuccessAt
    ? new Date(lastSuccessAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
      <Hourglass
        className="size-4 shrink-0 text-primary motion-safe:animate-pulse"
        aria-hidden
      />
      <p>
        {remaining != null ? (
          <>
            Next job search in{" "}
            <span className="font-medium text-foreground">
              {formatCountdown(remaining)}
            </span>
            <span className="text-muted-foreground">
              {" "}
              · every {cadenceDays} day{cadenceDays === 1 ? "" : "s"}
            </span>
          </>
        ) : (
          <>
            Weekly search cadence: every {cadenceDays} day
            {cadenceDays === 1 ? "" : "s"}
          </>
        )}
        {lastLabel ? (
          <span className="text-muted-foreground"> · last run {lastLabel}</span>
        ) : null}
      </p>
    </div>
  );
}

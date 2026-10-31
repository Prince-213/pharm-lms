"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  JOB_SOURCE_HOME,
  JOB_SOURCE_LABELS,
  JOB_SOURCES,
  type JobSourceId,
} from "@/lib/jobs/constants";

export type BoardJob = {
  id: string;
  title: string;
  snippet: string | null;
  location: string | null;
  remote: boolean;
  company: string | null;
  source: string;
  type: string | null;
  salaryText: string | null;
  applyUrl: string;
};

type Filter = "all" | "remote" | "full-time" | JobSourceId;

const CHIPS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "remote", label: "Remote" },
  { id: "full-time", label: "Full-time" },
  ...JOB_SOURCES.map((source) => ({
    id: source,
    label: source === "apify" ? "Other boards" : JOB_SOURCE_LABELS[source],
  })),
];

function sourceLabel(source: string) {
  return JOB_SOURCE_LABELS[source as JobSourceId] ?? source;
}

function sourceHome(source: string, applyUrl: string) {
  return JOB_SOURCE_HOME[source as JobSourceId] ?? applyUrl;
}

export function JobsBoard({
  jobs,
  emailedJobIds,
  onRefine,
}: {
  jobs: BoardJob[];
  emailedJobIds: string[];
  onRefine: () => void;
}) {
  const emailed = useMemo(() => new Set(emailedJobIds), [emailedJobIds]);
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    return jobs.filter((job) => {
      if (filter === "all") return true;
      if (filter === "remote") return job.remote;
      if (filter === "full-time") {
        return (job.type ?? "").toLowerCase().includes("full");
      }
      return job.source === filter;
    });
  }, [jobs, filter]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Pathway matches
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Roles that match your pathway
        </h1>
        <Button type="button" variant="outline" size="sm" onClick={onRefine}>
          Refine matches
        </Button>
      </div>
      <div className="mt-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        Ranked from the stored weekly scrape using your roles, location, and
        courses. Cards marked Emailed were sent to your inbox.{" "}
        <button
          type="button"
          onClick={onRefine}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Refine matches
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
              filter === chip.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No matches this week</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Refine your roles or check back after the next Monday ingest.
          </p>
          <Button type="button" className="mt-6" onClick={onRefine}>
            Refine matches
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {visible.map((job) => (
            <li
              key={job.id}
              className="flex flex-col rounded-md border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-fit rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {sourceLabel(job.source)}
                </span>
                {emailed.has(job.id) ? (
                  <span className="w-fit rounded-md bg-accent/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
                    Emailed
                  </span>
                ) : null}
              </div>
              <h2 className="mt-3 font-display text-lg font-bold leading-snug">
                {job.title}
              </h2>
              {job.snippet ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {job.snippet}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                {[job.type, job.location, job.salaryText]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <a
                  href={sourceHome(job.source, job.applyUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  via {sourceLabel(job.source)}
                </a>
                <Button
                  asChild
                  size="sm"
                  className="bg-accent text-accent-foreground"
                >
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View job
                  </a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

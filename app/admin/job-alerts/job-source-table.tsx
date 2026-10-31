"use client";

import { type KeyboardEvent, useState } from "react";
import {
  type AdminSourceJob,
  listScrapedJobsForSourceAction,
} from "@/app/admin/job-alerts/actions";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JOB_SOURCE_LABELS, type JobSourceId } from "@/lib/jobs/constants";

type SourceRow = {
  id: string;
  source: string;
  enabled: boolean;
  statusLabel: string;
  lastMs: number | null;
  jobsKept: number;
  lastError: string | null;
};

function formatPosted(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { dateStyle: "medium" });
}

export function JobSourceTable({ rows }: { rows: SourceRow[] }) {
  const [open, setOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [jobs, setJobs] = useState<AdminSourceJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceLabel = activeSource
    ? (JOB_SOURCE_LABELS[activeSource as JobSourceId] ?? activeSource)
    : "";

  async function openSource(source: string) {
    setActiveSource(source);
    setOpen(true);
    setLoading(true);
    setError(null);
    setJobs([]);
    const result = await listScrapedJobsForSourceAction(source);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setJobs(result.jobs);
  }

  function onRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    source: string,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void openSource(source);
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Enabled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Kept</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              tabIndex={0}
              className="cursor-pointer"
              aria-label={`View cached jobs for ${JOB_SOURCE_LABELS[row.source as JobSourceId] ?? row.source}`}
              onClick={() => void openSource(row.source)}
              onKeyDown={(event) => onRowKeyDown(event, row.source)}
            >
              <TableCell className="font-medium">
                {JOB_SOURCE_LABELS[row.source as JobSourceId] ?? row.source}
              </TableCell>
              <TableCell>{row.enabled ? "Yes" : "No"}</TableCell>
              <TableCell className="capitalize">{row.statusLabel}</TableCell>
              <TableCell>
                {row.lastMs != null ? `${row.lastMs} ms` : "—"}
              </TableCell>
              <TableCell>{row.jobsKept}</TableCell>
              <TableCell className="max-w-[220px] truncate text-muted-foreground">
                {row.lastError ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-xl"
        >
          <SheetHeader>
            <SheetTitle>{sourceLabel} jobs</SheetTitle>
            <SheetDescription>
              Unexpired cached listings from the last weekly ingest. Newest
              first, up to 50.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading jobs…</p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {!loading && !error && jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No cached jobs for this source yet. Run a weekly ingest or wait
                for the next scrape.
              </p>
            ) : null}
            {!loading &&
              jobs.map((job) => (
                <article
                  key={job.id}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug">
                      {job.title}
                    </h3>
                    {job.remote ? (
                      <Badge variant="secondary" className="shrink-0">
                        Remote
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {job.company ?? "Company not listed"}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Posted {formatPosted(job.postedAt)}
                  </p>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Apply
                  </a>
                </article>
              ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

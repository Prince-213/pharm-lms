"use client";

import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  Filter,
  Mail,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { JobsNextScrape } from "@/app/student/jobs/jobs-next-scrape";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_SOURCE_HOME,
  JOB_SOURCE_LABELS,
  JOB_SOURCES,
  type JobSourceId,
} from "@/lib/jobs/constants";
import { cn } from "@/lib/utils";

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
  postedAt: string | null;
  createdAt: string;
  rankIndex: number;
  emailedAt: string | null;
};

type Scope = "week" | "all";
type SortMode = "match" | "newest" | "oldest";

const SCOPE_STORAGE_KEY = "pharm-jobs-board-scope";

function sourceLabel(source: string) {
  return JOB_SOURCE_LABELS[source as JobSourceId] ?? source;
}

function sourceHome(source: string, applyUrl: string) {
  return JOB_SOURCE_HOME[source as JobSourceId] ?? applyUrl;
}

function jobDateMs(job: BoardJob): number {
  const raw = job.postedAt ?? job.createdAt;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function monthKey(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatPosted(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { dateStyle: "medium" });
}

function isInWeek(job: BoardJob, cadenceDays: number, now: number) {
  const windowMs = Math.max(1, cadenceDays) * 24 * 60 * 60 * 1000;
  return jobDateMs(job) >= now - windowMs;
}

export function JobsBoard({
  jobs,
  onRefine,
  cadenceDays,
  lastSuccessAt,
  nextScrapeAt,
}: {
  jobs: BoardJob[];
  onRefine: () => void;
  cadenceDays: number;
  lastSuccessAt: string | null;
  nextScrapeAt: string | null;
}) {
  const [scope, setScope] = useState<Scope>("week");
  const [sort, setSort] = useState<SortMode>("match");
  const [month, setMonth] = useState<string>("any");
  const [fromMonth, setFromMonth] = useState<string>("any");
  const [toMonth, setToMonth] = useState<string>("any");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [emailedOnly, setEmailedOnly] = useState(false);
  const [source, setSource] = useState<string>("all");
  const [sourceOpen, setSourceOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SCOPE_STORAGE_KEY);
      if (stored === "week" || stored === "all") setScope(stored);
    } catch {
      /* ignore */
    }
  }, []);

  function updateScope(next: Scope) {
    setScope(next);
    try {
      sessionStorage.setItem(SCOPE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const months = useMemo(() => {
    const keys = new Set<string>();
    for (const job of jobs) {
      const key = monthKey(job.postedAt ?? job.createdAt);
      if (key) keys.add(key);
    }
    return [...keys].sort((a, b) => b.localeCompare(a));
  }, [jobs]);

  const filtered = useMemo(() => {
    const now = Date.now();
    let list = jobs.filter((job) => {
      if (scope === "week" && !isInWeek(job, cadenceDays, now)) return false;
      if (remoteOnly && !job.remote) return false;
      if (emailedOnly && !job.emailedAt) return false;
      if (source !== "all" && job.source !== source) return false;

      if (scope === "all") {
        const key = monthKey(job.postedAt ?? job.createdAt);
        if (month !== "any" && key !== month) return false;
        if (fromMonth !== "any" && key && key < fromMonth) return false;
        if (toMonth !== "any" && key && key > toMonth) return false;
      }
      return true;
    });

    if (sort === "newest") {
      list = [...list].sort((a, b) => jobDateMs(b) - jobDateMs(a));
    } else if (sort === "oldest") {
      list = [...list].sort((a, b) => jobDateMs(a) - jobDateMs(b));
    } else {
      list = [...list].sort((a, b) => a.rankIndex - b.rankIndex);
    }
    return list;
  }, [
    jobs,
    scope,
    cadenceDays,
    remoteOnly,
    emailedOnly,
    source,
    month,
    fromMonth,
    toMonth,
    sort,
  ]);

  const weekEmpty = scope === "week" && filtered.length === 0;

  const sourceTriggerLabel =
    source === "all"
      ? "All sources"
      : source === "apify"
        ? "Other boards"
        : sourceLabel(source);

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

      <JobsNextScrape
        nextScrapeAt={nextScrapeAt}
        lastSuccessAt={lastSuccessAt}
        cadenceDays={cadenceDays}
      />

      <div className="mt-4 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        This week leads by default — roles from the latest cadence window. Cards
        marked Emailed were sent to your inbox.{" "}
        <button
          type="button"
          onClick={onRefine}
          className="font-semibold text-primary underline-offset-2 hover:underline"
        >
          Refine matches
        </button>
      </div>

      <div className="mt-6 space-y-3 rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Filters
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ButtonGroup aria-label="Result scope">
            <Button
              type="button"
              size="sm"
              variant={scope === "week" ? "default" : "outline"}
              onClick={() => updateScope("week")}
            >
              This week
            </Button>
            <Button
              type="button"
              size="sm"
              variant={scope === "all" ? "default" : "outline"}
              onClick={() => updateScope("all")}
            >
              All results
            </Button>
          </ButtonGroup>

          <Select value={sort} onValueChange={(v) => setSort(v as SortMode)}>
            <SelectTrigger size="sm" className="w-[160px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best match</SelectItem>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={sourceOpen} onOpenChange={setSourceOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-[160px] justify-between font-normal"
              >
                {sourceTriggerLabel}
                <ChevronsUpDown className="size-3.5 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search sources…" />
                <CommandList>
                  <CommandEmpty>No source found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        setSource("all");
                        setSourceOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          source === "all" ? "opacity-100" : "opacity-0",
                        )}
                      />
                      All sources
                    </CommandItem>
                    {JOB_SOURCES.map((id) => (
                      <CommandItem
                        key={id}
                        value={id}
                        onSelect={() => {
                          setSource(id);
                          setSourceOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            source === id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {id === "apify"
                          ? "Other boards"
                          : JOB_SOURCE_LABELS[id]}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-3",
            scope === "week" && "opacity-60",
          )}
        >
          <Select
            value={month}
            onValueChange={setMonth}
            disabled={scope === "week"}
          >
            <SelectTrigger size="sm" className="w-[170px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any month</SelectItem>
              {months.map((key) => (
                <SelectItem key={key} value={key}>
                  {formatMonthLabel(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={fromMonth}
            onValueChange={setFromMonth}
            disabled={scope === "week"}
          >
            <SelectTrigger size="sm" className="w-[160px]">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">From (any)</SelectItem>
              {months.map((key) => (
                <SelectItem key={`from-${key}`} value={key}>
                  {formatMonthLabel(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={toMonth}
            onValueChange={setToMonth}
            disabled={scope === "week"}
          >
            <SelectTrigger size="sm" className="w-[160px]">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">To (any)</SelectItem>
              {months.map((key) => (
                <SelectItem key={`to-${key}`} value={key}>
                  {formatMonthLabel(key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {scope === "week" ? (
            <p className="text-xs text-muted-foreground">
              Month range unlocks on All results
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="jobs-remote-only"
              checked={remoteOnly}
              onCheckedChange={(v) => setRemoteOnly(v === true)}
            />
            <Label
              htmlFor="jobs-remote-only"
              className="font-normal text-muted-foreground"
            >
              Remote only
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="jobs-emailed-only"
              checked={emailedOnly}
              onCheckedChange={(v) => setEmailedOnly(v === true)}
            />
            <Label
              htmlFor="jobs-emailed-only"
              className="font-normal text-muted-foreground"
            >
              Emailed only
            </Label>
          </div>
        </div>
      </div>

      {weekEmpty ? (
        <div className="mt-10 rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No matches in this week&apos;s window</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Roles may still be available in the full cache, or after the next
            search.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => updateScope("all")}>
              View all results
            </Button>
            <Button type="button" variant="outline" onClick={onRefine}>
              Refine matches
            </Button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No roles match these filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Clear a filter or refine your pathway preferences.
          </p>
          <Button type="button" className="mt-6" onClick={onRefine}>
            Refine matches
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((job) => {
            const posted = formatPosted(job.postedAt ?? job.createdAt);
            return (
              <li
                key={job.id}
                className="flex flex-col rounded-md border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{sourceLabel(job.source)}</Badge>
                  {job.emailedAt ? (
                    <Badge variant="outline" className="gap-1">
                      <Mail className="size-3" aria-hidden />
                      Emailed
                    </Badge>
                  ) : null}
                  {job.remote ? (
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="size-3" aria-hidden />
                      Remote
                    </Badge>
                  ) : null}
                </div>
                <h2 className="mt-3 font-display text-lg font-bold leading-snug">
                  {job.title}
                </h2>
                {job.company ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company}
                  </p>
                ) : null}
                {job.snippet ? (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {job.snippet}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  {[job.type, job.location, job.salaryText, posted]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <a
                    href={sourceHome(job.source, job.applyUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    via {sourceLabel(job.source)}
                    <ExternalLink className="size-3" aria-hidden />
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
            );
          })}
        </ul>
      )}
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function hostInitials(fullName: string): string {
  return (
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

export type MeetingHostCardRow = {
  icon: LucideIcon;
  text: string;
};

type MeetingHostCardProps = {
  href: string;
  fullName: string;
  bio: string | null;
  fallbackBio: string;
  avatarUrl?: string | null;
  rows: MeetingHostCardRow[];
  ctaLabel: string;
};

export function MeetingHostCard({
  href,
  fullName,
  bio,
  fallbackBio,
  avatarUrl,
  rows,
  ctaLabel,
}: MeetingHostCardProps) {
  const trimmed = typeof avatarUrl === "string" ? avatarUrl.trim() : "";
  const showImage =
    trimmed.length > 0 &&
    (trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("/"));
  const displayBio = bio?.trim() || fallbackBio;

  return (
    <li
      className={cn(
        "flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4 shadow-[var(--shadow-sm)] transition-colors",
        "hover:border-[var(--primary)]/25 hover:bg-[var(--surface)]/60",
      )}
    >
      <div className="flex gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--primary-soft)] ring-1 ring-[var(--border)]">
          {showImage ? (
            // biome-ignore lint/performance/noImgElement: Host avatars use arbitrary OAuth/CDN or relative URLs.
            <img
              src={trimmed}
              alt={fullName}
              width={48}
              height={48}
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center text-sm font-bold text-[var(--primary-strong)]"
              aria-hidden
            >
              {hostInitials(fullName)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-[var(--foreground)]">
            {fullName}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
            {displayBio}
          </p>
        </div>
      </div>

      {rows.length > 0 ? (
        <ul className="mt-3 space-y-1.5 border-t border-[var(--border)] pt-3">
          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <li
                key={`${row.text}-${i}`}
                className="flex items-start gap-2 text-xs text-[var(--muted)]"
              >
                <Icon
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--muted-soft)]"
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="leading-snug">{row.text}</span>
              </li>
            );
          })}
        </ul>
      ) : null}

      <Link
        href={href}
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)]",
          "bg-[var(--surface)] py-2 text-xs font-semibold text-[var(--foreground)] transition-colors",
          "hover:border-[var(--primary)]/35 hover:bg-[var(--primary-soft)]/25 hover:text-[var(--primary-strong)]",
        )}
      >
        {ctaLabel}
        <ChevronRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </Link>
    </li>
  );
}

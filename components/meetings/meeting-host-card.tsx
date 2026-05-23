import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";

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
  const displayBio = bio?.trim() || fallbackBio;

  return (
    <li
      className={cn(
        "flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4 shadow-[var(--shadow-sm)] transition-colors",
        "hover:border-[var(--primary)]/25 hover:bg-[var(--surface)]/60",
      )}
    >
      <div className="flex flex-1 flex-col">
        <div className="flex gap-3">
          <UserAvatar
            src={avatarUrl}
            name={fullName}
            className="h-12 w-12 rounded-full ring-1 ring-[var(--border)]"
          />
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
      </div>

      <Link
        href={href}
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] sm:mt-auto",
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

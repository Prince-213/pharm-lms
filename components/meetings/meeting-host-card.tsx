import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
    <li className="h-full list-none">
      <Card className="flex h-full flex-col shadow-none transition-colors hover:border-primary/25">
        <CardContent className="flex flex-1 flex-col p-4">
          <div className="flex gap-3">
            <UserAvatar
              src={avatarUrl}
              name={fullName}
              className="h-12 w-12 rounded-full ring-1 ring-border"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-foreground">
                {fullName}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {displayBio}
              </p>
            </div>
          </div>

          {rows.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
              {rows.map((row, i) => {
                const Icon = row.icon;
                return (
                  <li
                    key={`${row.text}-${i}`}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <Icon
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span className="leading-snug">{row.text}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <Button variant="outline" size="sm" className="mt-4 w-full sm:mt-auto" asChild>
            <Link href={href}>
              {ctaLabel}
              <ChevronRight className="h-3.5 w-3.5 opacity-70" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </li>
  );
}

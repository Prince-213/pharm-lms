import { BookOpen, Globe, Languages } from "lucide-react";
import { UserAvatar } from "@/components/user/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type InstructorProfileHeaderProps = {
  badge: string;
  fullName: string;
  headline: string | null;
  bioPreview: string;
  avatarSrc: string | null;
  initials: string;
  teachesLabel?: string;
  speaksLabel?: string;
  stats: { label: string; value: string }[];
};

export function InstructorProfileHeader({
  badge,
  fullName,
  headline,
  bioPreview,
  avatarSrc,
  initials: _initials,
  teachesLabel,
  speaksLabel,
  stats,
}: InstructorProfileHeaderProps) {
  return (
    <Card className="overflow-hidden shadow-none">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <UserAvatar
              src={avatarSrc}
              name={fullName}
              className="h-28 w-28 rounded-xl ring-1 ring-border sm:h-32 sm:w-32"
              fallbackClassName="rounded-xl bg-primary/10 font-display text-2xl font-bold text-primary"
            />
            <div className="min-w-0 flex-1">
              <Badge variant="secondary" className="font-semibold uppercase tracking-wider">
                {badge}
              </Badge>
              <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {fullName}
              </h1>
              {headline ? (
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                  {headline}
                </p>
              ) : null}
              <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {bioPreview}
              </p>

              <dl className="mt-5 space-y-2.5 text-sm">
                {teachesLabel ? (
                  <div className="flex gap-2">
                    <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-foreground">
                      <BookOpen className="h-4 w-4 text-primary" strokeWidth={1.75} />
                      Teaches
                    </dt>
                    <dd className="text-muted-foreground">{teachesLabel}</dd>
                  </div>
                ) : null}
                {speaksLabel ? (
                  <div className="flex gap-2">
                    <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-foreground">
                      <Languages className="h-4 w-4 text-primary" strokeWidth={1.75} />
                      Focus
                    </dt>
                    <dd className="text-muted-foreground">{speaksLabel}</dd>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-foreground">
                    <Globe className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    Platform
                  </dt>
                  <dd className="text-muted-foreground">PharmLMS · Live sessions</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="font-display text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                {s.value}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

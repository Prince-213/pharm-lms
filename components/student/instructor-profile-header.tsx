import { BookOpen, Globe, Languages } from "lucide-react";
import Image from "next/image";

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
  initials,
  teachesLabel,
  speaksLabel,
  stats,
}: InstructorProfileHeaderProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] shadow-sm sm:h-32 sm:w-32">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={fullName}
                  fill
                  className="object-cover"
                  sizes="8rem"
                  priority
                  unoptimized={avatarSrc.startsWith("http")}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-[var(--primary)]">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-soft-text)]">
                {badge}
              </p>
              <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-[var(--ink-deep)] sm:text-3xl">
                {fullName}
              </h1>
              {headline ? (
                <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                  {headline}
                </p>
              ) : null}
              <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                {bioPreview}
              </p>

              <dl className="mt-5 space-y-2.5 text-sm">
                {teachesLabel ? (
                  <div className="flex gap-2">
                    <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-[var(--ink-deep)]">
                      <BookOpen
                        className="h-4 w-4 text-[var(--primary)]"
                        strokeWidth={1.75}
                      />
                      Teaches
                    </dt>
                    <dd className="text-[var(--muted)]">{teachesLabel}</dd>
                  </div>
                ) : null}
                {speaksLabel ? (
                  <div className="flex gap-2">
                    <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-[var(--ink-deep)]">
                      <Languages
                        className="h-4 w-4 text-[var(--primary)]"
                        strokeWidth={1.75}
                      />
                      Focus
                    </dt>
                    <dd className="text-[var(--muted)]">{speaksLabel}</dd>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <dt className="flex shrink-0 items-center gap-1.5 font-semibold text-[var(--ink-deep)]">
                    <Globe
                      className="h-4 w-4 text-[var(--primary)]"
                      strokeWidth={1.75}
                    />
                    Platform
                  </dt>
                  <dd className="text-[var(--muted)]">PharmLMS · Live sessions</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-8 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="font-display text-xl font-bold tabular-nums text-[var(--ink-deep)] sm:text-2xl">
                {s.value}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

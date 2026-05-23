import { Sparkles, Target, Users } from "lucide-react";

type MentorCoachingSectionProps = {
  mentorName: string;
  specialties: string[];
  headline: string | null;
};

export function MentorCoachingSection({
  mentorName,
  specialties,
  headline,
}: MentorCoachingSectionProps) {
  const firstName = mentorName.split(" ")[0] ?? mentorName;
  const topics =
    specialties.length > 0
      ? specialties
      : headline?.trim()
        ? [headline.trim()]
        : ["Career guidance", "Exam preparation", "Clinical skills"];

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-[var(--ink-deep)]">
            Coaching with {firstName}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            One-on-one sessions — no course enrollment required.
          </p>
        </div>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topics.slice(0, 6).map((topic) => (
          <li
            key={topic}
            className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 px-4 py-3.5"
          >
            <Target
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
              strokeWidth={1.75}
            />
            <span className="text-sm font-semibold leading-snug text-[var(--ink-deep)]">
              {topic}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
        <Users className="h-3.5 w-3.5 shrink-0" />
        Book a slot from the sidebar when you are ready to meet.
      </p>
    </section>
  );
}

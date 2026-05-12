export default async function MentorCourseAccessibilityPage() {
  return (
    <section className="mx-auto max-w-[900px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Accessibility (optional)
        </h1>
      </div>
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-[var(--muted)]">
          Improve accessibility by adding subtitles, clear contrast, and
          transcripts.
        </p>
        <div className="space-y-2">
          {[
            "Subtitles included",
            "Color contrast checked",
            "Transcript available",
          ].map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> {label}
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

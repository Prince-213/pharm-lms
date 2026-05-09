export default async function MentorCourseAccessibilityPage() {
  return (
    <section className="mx-auto max-w-[900px] border border-[#d1d7dc] bg-white">
      <div className="border-b border-[#d1d7dc] px-6 py-4">
        <h1 className="text-2xl font-bold text-[#1c1d1f]">
          Accessibility (optional)
        </h1>
      </div>
      <div className="space-y-4 px-6 py-5">
        <p className="text-sm text-[#6a6f73]">
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

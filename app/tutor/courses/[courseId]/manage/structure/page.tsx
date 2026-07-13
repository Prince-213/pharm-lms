export default async function MentorCourseStructurePage() {
  return (
    <section className="mx-auto max-w-[900px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Course structure</h1>
      </div>
      <div className="space-y-5 px-6 py-5">
        <h2 className="text-xl font-semibold">
          There&apos;s a course in you. Plan it out.
        </h2>
        <p className="text-sm text-muted-foreground">
          Planning your course carefully will create a clear learning path.
        </p>
        <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <h3 className="mb-2 text-lg font-semibold">Tips</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Gather your goals and break content into modules.</li>
            <li>Introduce yourself and create momentum.</li>
            <li>Sections have a clear objective.</li>
            <li>Lessons cover one concept.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

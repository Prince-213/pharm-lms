import Link from "next/link";

type InstructorShellProps = {
  courseId?: string;
  courseTitle?: string;
  statusLabel?: string;
  readOnly?: boolean;
  showReview?: boolean;
  topMeta?: string;
  settingsHref?: string;
  children: React.ReactNode;
};

export function InstructorShell({
  courseId,
  courseTitle = "Course",
  statusLabel = "DRAFT",
  readOnly = false,
  showReview = true,
  topMeta = "0min of video content uploaded",
  settingsHref,
  children,
}: InstructorShellProps) {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)] text-[var(--foreground)]">
      <header className="h-12 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-center justify-between px-4">
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/tutor/courses"
              className="font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              {"<"} Back to courses
            </Link>
            <span className="text-sm font-semibold">{courseTitle}</span>
            <span className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
              {statusLabel}
            </span>
            <span className="text-[var(--muted)]">{topMeta}</span>
            {readOnly ? (
              <span className="font-medium text-amber-600">
                Editing is locked for this course.
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {showReview && courseId ? (
              <Link
                href={`/student/browse/${courseId}`}
                target="_blank"
                className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
              >
                Review
              </Link>
            ) : null}
            {settingsHref ? (
              <Link
                href={settingsHref}
                className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-sm text-[var(--muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                aria-label="Course settings"
                title="Course settings"
              >
                ⚙
              </Link>
            ) : (
              <span className="text-sm text-[var(--muted)]">⚙</span>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export function InstructorFooter() {
  return (
    <footer className="mt-10 bg-[var(--surface)] text-[var(--foreground)]">
      <div className="border-b border-[var(--border)] px-6 py-6 text-sm">
        Top institutions choose PharmLms to build in-demand clinical skills.
      </div>
      <div className="grid grid-cols-2 gap-6 px-6 py-8 text-xs md:grid-cols-4">
        <div>
          <h4 className="mb-2 font-semibold">In-demand Careers</h4>
          <ul className="space-y-1 text-[var(--muted)]">
            <li>Data Scientist</li>
            <li>Cloud Engineer</li>
            <li>Project Manager</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Web Development</h4>
          <ul className="space-y-1 text-[var(--muted)]">
            <li>Web Development</li>
            <li>JavaScript</li>
            <li>React JS</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Data Science</h4>
          <ul className="space-y-1 text-[var(--muted)]">
            <li>Data Science</li>
            <li>Python</li>
            <li>Machine Learning</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Leadership</h4>
          <ul className="space-y-1 text-[var(--muted)]">
            <li>Leadership</li>
            <li>Management Skills</li>
            <li>Communication</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-6 py-4 text-xs text-[var(--muted)]">
        PharmLms © 2026 PharmLms.
      </div>
    </footer>
  );
}

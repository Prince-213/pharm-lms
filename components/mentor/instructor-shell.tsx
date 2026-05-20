import { InstructorCourseHeader } from "@/components/mentor/instructor-course-header";

type InstructorShellProps = {
  courseId?: string;
  courseTitle?: string;
  statusLabel?: string;
  readOnly?: boolean;
  showReview?: boolean;
  topMeta?: string;
  settingsHref?: string;
  /** When set, renders compact header with menu button (use CourseManageFrame instead for manage routes). */
  onMenuClick?: () => void;
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
  onMenuClick,
  children,
}: InstructorShellProps) {
  return (
    <div className="min-h-screen bg-[var(--surface-muted)] text-[var(--foreground)]">
      <InstructorCourseHeader
        courseId={courseId}
        courseTitle={courseTitle}
        statusLabel={statusLabel}
        readOnly={readOnly}
        showReview={showReview}
        topMeta={topMeta}
        settingsHref={settingsHref}
        onMenuClick={onMenuClick}
      />
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

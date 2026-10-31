import Link from "next/link";
import { LegalLinks } from "@/components/brand/legal-links";
import { PharmLogo } from "@/components/brand/pharm-logo";
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
    <footer className="mt-10 border-t border-border bg-background px-6 py-6 text-[var(--foreground)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/tutor/courses" className="w-fit">
          <PharmLogo
            markClassName="h-7 w-7"
            wordmarkClassName="text-base text-foreground"
          />
        </Link>
        <div className="flex flex-col gap-1 sm:items-end">
          <LegalLinks
            className="text-xs"
            linkClassName="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          />
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} PharmEdge
          </p>
        </div>
      </div>
    </footer>
  );
}

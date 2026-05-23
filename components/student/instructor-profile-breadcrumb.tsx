import { ChevronRight } from "lucide-react";
import Link from "next/link";

type InstructorProfileBreadcrumbProps = {
  listHref: string;
  listLabel: string;
  name: string;
};

export function InstructorProfileBreadcrumb({
  listHref,
  listLabel,
  name,
}: InstructorProfileBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]"
    >
      <Link
        href={listHref}
        className="font-semibold text-[var(--primary)] hover:underline"
      >
        {listLabel}
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
      <span className="truncate font-medium text-[var(--foreground)]">
        {name}
      </span>
    </nav>
  );
}

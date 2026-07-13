"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import { Button } from "@/components/ui/button";
import { CourseStatus } from "@/generated/prisma/enums";
import {
  COURSE_PLANNER_SECTIONS,
  activePlannerSegment,
} from "@/lib/course-planner-steps";
import { cn } from "@/lib/utils";

export function CourseManageSidebar({
  courseId,
  courseStatus,
  onNavigate,
  className,
}: {
  courseId: string;
  courseStatus: CourseStatus;
  /** Close mobile drawer after choosing a nav item. */
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const segment = activePlannerSegment(pathname);
  const [submitting, setSubmitting] = useState(false);

  const locked =
    courseStatus !== CourseStatus.DRAFT &&
    courseStatus !== CourseStatus.REJECTED;

  const activeLabel = useMemo(() => {
    for (const section of COURSE_PLANNER_SECTIONS) {
      for (const item of section.items) {
        if (item.segment === segment) return item.label;
      }
    }
    return "";
  }, [segment]);

  async function submitForReview() {
    setSubmitting(true);
    const toastId = toast.loading("Submitting your course for review...");

    try {
      const response = await fetch(`/api/tutor/courses/${courseId}/submit`, {
        method: "POST",
      });
      setSubmitting(false);

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
          details?: string[];
        } | null;
        const detailText = body?.details?.length
          ? ` ${body.details.join(" ")}`
          : "";

        toast.error(body?.error ?? "Submission failed", {
          id: toastId,
          description: detailText || "Please check all required fields.",
        });
        return;
      }

      toast.success("Submitted for review!", {
        id: toastId,
        description:
          "Your course is now pending review. You'll be notified once it's processed.",
      });
      onNavigate?.();
      refreshPortalAfterMutation(router);
    } catch (_error) {
      setSubmitting(false);
      toast.error("An unexpected error occurred", { id: toastId });
    }
  }

  return (
    <nav
      className={cn("flex min-h-0 flex-1 flex-col bg-[#f7f9fa]", className)}
      aria-label="Course planner"
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto">
        {COURSE_PLANNER_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h3>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href(courseId)}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-r-md border-l-[3px] py-2 pl-3 pr-2 text-[13px] transition-colors",
                      activeLabel === item.label
                        ? "border-[var(--primary)] bg-white font-semibold text-[var(--foreground)] shadow-sm"
                        : "border-transparent text-muted-foreground hover:border-[var(--border)] hover:bg-white/80 hover:text-[var(--foreground)]",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="default"
        size="sm"
        disabled={locked || submitting}
        onClick={() => void submitForReview()}
        className="mt-6 w-full shrink-0 text-xs font-semibold"
      >
        {locked
          ? "Pending review"
          : submitting
            ? "Submitting…"
            : courseStatus === CourseStatus.REJECTED
              ? "Resubmit for review"
              : "Submit for Review"}
      </Button>
    </nav>
  );
}

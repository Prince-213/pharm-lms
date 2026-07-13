"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { enrollInCourseAction } from "@/app/student/actions/enrollment";
import { LoadingButton } from "@/components/ui/loading-button";
import { refreshPortalAfterMutation } from "@/lib/client/refresh-portal-data";
import { toUserFacingError } from "@/lib/user-facing-error";

export function EnrollCourseButton({
  courseId,
  disabled,
  label = "Enroll now",
  variant = "theme",
  className,
}: {
  courseId: string;
  disabled?: boolean;
  label?: string;
  variant?: "theme" | "catalog";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-stretch gap-1">
      <LoadingButton
        type="button"
        disabled={disabled}
        loading={pending}
        loadingLabel="Enrolling…"
        onClick={() => {
          const toastId = toast.loading("Enrolling you in the course…");
          startTransition(async () => {
            const result = await enrollInCourseAction(courseId);
            if (!result.ok) {
              toast.error(
                toUserFacingError(result.message, "Could not enroll."),
                { id: toastId },
              );
              return;
            }
            toast.success("Enrolled — opening your course.", { id: toastId });
            router.push(`/student/course/${result.courseId}`);
            refreshPortalAfterMutation(router);
          });
        }}
        className={`${
          variant === "catalog"
            ? "w-full rounded-[var(--radius-md)] py-3 text-sm font-bold shadow-[var(--shadow-sm)]"
            : "rounded-[var(--radius-md)] px-4 py-2 text-sm font-semibold"
        }${className ? ` ${className}` : ""}`}
        size={variant === "catalog" ? "lg" : "default"}
      >
        {label}
      </LoadingButton>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { enrollInCourseAction } from "@/app/student/actions/enrollment";

const btnCatalog =
  "w-full rounded-[var(--radius-md)] bg-[var(--primary)] py-3 text-sm font-bold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--primary-strong)] disabled:opacity-50";

const btnTheme =
  "rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)] disabled:opacity-50";

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
  /** Both variants use Pharm brand primary — catalog uses full-width emphasis */
  variant?: "theme" | "catalog";
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-stretch gap-1">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await enrollInCourseAction(courseId);
            if (!result.ok) {
              setMessage(result.message);
              return;
            }
            router.push(`/student/course/${result.courseId}`);
            router.refresh();
          });
        }}
        className={`${variant === "catalog" ? btnCatalog : btnTheme}${className ? ` ${className}` : ""}`}
      >
        {pending ? "Enrolling…" : label}
      </button>
      {message ? <p className="text-xs text-rose-700">{message}</p> : null}
    </div>
  );
}

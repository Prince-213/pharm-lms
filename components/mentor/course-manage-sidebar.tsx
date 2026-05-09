"use client";

import { CourseStatus } from "@/generated/prisma/enums";
import { toast } from "sonner";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Item = {
  label: string;
  href: (courseId: string) => string;
  segment: string;
};

const sections: { title: string; items: Item[] }[] = [
  {
    title: "Plan your course",
    items: [
      {
        label: "Course structure",
        href: (courseId) => `/tutor/courses/${courseId}/manage/structure`,
        segment: "structure",
      },
      {
        label: "Setup & test video",
        href: (courseId) => `/tutor/courses/${courseId}/manage/video`,
        segment: "video",
      },
    ],
  },
  {
    title: "Create your content",
    items: [
      {
        label: "Film & edit",
        href: (courseId) => `/tutor/courses/${courseId}/manage/film`,
        segment: "film",
      },
      {
        label: "Curriculum",
        href: (courseId) => `/tutor/courses/${courseId}/manage/curriculum`,
        segment: "curriculum",
      },
    ],
  },
  {
    title: "Publish your course",
    items: [
      {
        label: "Course landing page",
        href: (courseId) => `/tutor/courses/${courseId}/manage/basics`,
        segment: "basics",
      },
      {
        label: "Pricing",
        href: (courseId) => `/tutor/courses/${courseId}/manage/pricing`,
        segment: "pricing",
      },
      {
        label: "Promotions",
        href: (courseId) => `/tutor/courses/${courseId}/manage/promotions`,
        segment: "promotions",
      },
      {
        label: "Course messages",
        href: (courseId) => `/tutor/courses/${courseId}/manage/messages`,
        segment: "messages",
      },
    ],
  },
];

function activeSegment(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function CourseManageSidebar({
  courseId,
  courseStatus,
}: {
  courseId: string;
  courseStatus: CourseStatus;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const segment = activeSegment(pathname);
  const [submitting, setSubmitting] = useState(false);

  const locked =
    courseStatus !== CourseStatus.DRAFT &&
    courseStatus !== CourseStatus.REJECTED;

  const activeLabel = useMemo(() => {
    for (const section of sections) {
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
        description: "Your course is now pending review. You'll be notified once it's processed.",
      });
      router.refresh();
    } catch (error) {
      setSubmitting(false);
      toast.error("An unexpected error occurred", { id: toastId });
    }
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[230px] flex-col border-r border-[#d1d7dc] bg-white p-6 overflow-y-auto">
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 text-base font-bold text-[#1c1d1f]">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href(courseId)}
                    className={clsx(
                      "block border-l-2 pl-2 text-sm",
                      activeLabel === item.label
                        ? "border-[var(--primary)] font-semibold text-[#1c1d1f]"
                        : "border-transparent text-[#6a6f73]",
                    )}
                  >
                    ○ {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={locked || submitting}
        onClick={() => void submitForReview()}
        className="mt-6 w-full rounded-sm bg-[var(--primary)] py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {locked
          ? "Pending review"
          : submitting
            ? "Submitting…"
            : courseStatus === CourseStatus.REJECTED
              ? "Resubmit for review"
              : "Submit for Review"}
      </button>
    </aside>
  );
}

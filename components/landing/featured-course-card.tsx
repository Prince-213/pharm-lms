"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { BookIcon } from "@phosphor-icons/react";

/** Signed R2 URLs must not go through `/_next/image` — the optimizer fetch times out. */
function isRemoteSignedMediaUrl(src: string): boolean {
  return (
    src.includes("X-Amz-") ||
    src.includes("r2.cloudflarestorage.com") ||
    src.startsWith("http")
  );
}

export type FeaturedCourseCardView = {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  instructor: { name: string };
  lessons: string;
  duration: string;
  image: string;
  imageAlt?: string;
};

type FeaturedCourseCardProps = {
  course: FeaturedCourseCardView;
  ctaLabel?: string;
  className?: string;
};

export function FeaturedCourseCard({
  course,
  ctaLabel = "View course",
  className,
}: FeaturedCourseCardProps) {
  return (
    <article
      className={`group flex h-full flex-col rounded-[14px] bg-white p-5 shadow-sm transition-all duration-300 sm:p-6 sm:hover:-translate-y-1 sm:hover:shadow-md ${className ?? ""}`}
    >
      <div className="relative aspect-[412/248] w-full overflow-hidden rounded-[10px]">
        {isRemoteSignedMediaUrl(course.image) ? (
          <img
            src={course.image}
            alt={course.imageAlt ?? course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Image
            src={course.image}
            alt={course.imageAlt ?? course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-bold leading-[1.35] text-black sm:text-[18px]">
          {course.title}
        </h3>
        <p className="shrink-0 text-[16px] font-bold text-[var(--accent)] sm:text-[18px]">
          {course.priceLabel}
        </p>
      </div>

      <p className="mt-2 text-[13px] font-medium text-[#555555] sm:text-[14px]">
        by {course.instructor.name}
      </p>

      <div className="mt-5 flex overflow-hidden rounded-[10px] bg-[#F3F4F6]">
        <div className="flex flex-1 items-center gap-3 px-4 py-4">
          <BookIcon
            className="h-6 w-6 shrink-0 text-[var(--accent)] sm:h-7 sm:w-7"
            strokeWidth={1.75}
          />
          <div>
            <p className="text-[11px] font-medium text-[#777777] sm:text-[12px]">
              Lessons
            </p>
            <p className="text-[13px] font-bold text-black sm:text-[14px]">
              {course.lessons}
            </p>
          </div>
        </div>

        <div className="w-px self-stretch bg-[#E5E7EB]" aria-hidden />

        <div className="flex flex-1 items-center gap-3 px-4 py-4">
          <Clock3
            className="h-6 w-6 shrink-0 text-[var(--accent)] sm:h-7 sm:w-7"
            strokeWidth={1.75}
          />
          <div>
            <p className="text-[11px] font-medium text-[#777777] sm:text-[12px]">
              Duration
            </p>
            <p className="text-[13px] font-bold text-black sm:text-[14px]">
              {course.duration}
            </p>
          </div>
        </div>
      </div>

      <Link
        href={course.href}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-5 py-3.5 text-[14px] font-semibold text-black transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:-translate-y-0.5 active:scale-[0.98] sm:text-[15px]"
      >
        {ctaLabel}
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

export function toFeaturedCourseCardView(course: {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  instructor: { name: string };
  duration: string;
  image: string;
  imageAlt?: string;
  lessonCount?: number;
}): FeaturedCourseCardView {
  const count = course.lessonCount ?? 0;
  const lessons =
    count > 0
      ? `${count} ${count === 1 ? "Lesson" : "Lessons"}`
      : "Lessons";

  return {
    id: course.id,
    href: course.href,
    title: course.title,
    priceLabel: course.priceLabel,
    instructor: course.instructor,
    lessons,
    duration: course.duration,
    image: course.image,
    imageAlt: course.imageAlt,
  };
}

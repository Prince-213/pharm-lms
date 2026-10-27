"use client";

import { BookOpen, Clock } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card",
        className,
      )}
    >
      <Link
        href={course.href}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        {isRemoteSignedMediaUrl(course.image) ? (
          // biome-ignore lint/performance/noImgElement: signed R2 URLs
          <img
            src={course.image}
            alt={course.imageAlt ?? course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={course.image}
            alt={course.imageAlt ?? course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <Link href={course.href}>
          <h3 className="font-display text-[17px] leading-snug font-bold text-foreground sm:text-lg">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm font-medium text-primary">
          {course.instructor.name}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-4 text-primary" weight="duotone" />
            {course.lessons}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-primary" weight="duotone" />
            {course.duration}
          </span>
        </div>

        <p className="mt-auto pt-2 font-display text-lg font-bold text-foreground">
          {course.priceLabel}
        </p>

        <Link
          href={course.href}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {ctaLabel}
        </Link>
      </div>
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
    count > 0 ? `${count} ${count === 1 ? "Lesson" : "Lessons"}` : "Lessons";

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

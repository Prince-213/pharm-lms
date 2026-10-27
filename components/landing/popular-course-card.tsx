"use client";

import { Clock, Star } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type PopularCourseCardView = {
  id: string;
  href: string;
  image: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  rating: number;
  reviewCount: number;
  instructor: { name: string; avatar: string; enrolled: number };
  priceLabel: string;
  duration: string;
  lessonCount?: number;
};

function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  if (rating <= 0) {
    return (
      <span className="text-xs text-muted-foreground">No reviews yet</span>
    );
  }

  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-sm font-bold tabular-nums text-primary">
        {rating.toFixed(1)}
      </span>
      <span className="flex text-accent" aria-hidden>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className="size-3.5"
            weight={s <= filled ? "fill" : "regular"}
          />
        ))}
      </span>
      {reviewCount > 0 ? (
        <span className="text-xs text-muted-foreground">
          ({reviewCount.toLocaleString()})
        </span>
      ) : null}
    </span>
  );
}

type Props = {
  course: PopularCourseCardView;
  layout?: "grid" | "list";
};

export function PopularCourseCard({ course, layout = "grid" }: Props) {
  if (layout === "list") {
    return (
      <article className="group flex flex-col gap-4 border-b border-border py-5 sm:flex-row sm:items-stretch">
        <Link
          href={course.href}
          className="relative shrink-0 overflow-hidden rounded-md sm:w-56"
        >
          {/* biome-ignore lint/performance/noImgElement: catalog images may be signed R2 URLs */}
          <img
            src={course.image}
            alt={course.imageAlt}
            className="h-40 w-full object-cover sm:h-full sm:min-h-[140px]"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">
            {course.category}
          </p>
          <Link href={course.href}>
            <h3 className="mt-1 font-display text-lg font-bold text-foreground">
              {course.title}
            </h3>
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            {course.instructor.name}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StarRating
              rating={course.rating}
              reviewCount={course.reviewCount}
            />
            <span className="text-xs text-muted-foreground">
              {course.duration}
            </span>
            <span className="font-display text-lg font-bold">
              {course.priceLabel}
            </span>
          </div>
          <Link
            href={course.href}
            className="mt-4 inline-flex h-10 w-fit items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View course
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card",
      )}
    >
      <Link href={course.href} className="relative block overflow-hidden">
        {/* biome-ignore lint/performance/noImgElement: catalog images may be signed R2 URLs */}
        <img
          src={course.image}
          alt={course.imageAlt}
          className="h-48 w-full object-cover"
        />
        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground">
          <Clock className="size-3.5 text-primary" weight="duotone" />
          {course.duration}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <p className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
          {course.category}
        </p>
        <Link href={course.href}>
          <h3 className="font-display line-clamp-2 text-lg leading-snug font-bold text-foreground">
            {course.title}
          </h3>
        </Link>
        <p className="text-sm font-medium text-primary">
          {course.instructor.name}
        </p>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {course.description}
        </p>
        <StarRating rating={course.rating} reviewCount={course.reviewCount} />
        <p className="mt-auto pt-2 font-display text-lg font-bold">
          {course.priceLabel}
        </p>
        <Link
          href={course.href}
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          View course
        </Link>
      </div>
    </article>
  );
}

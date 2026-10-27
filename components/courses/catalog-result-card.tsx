import { Star } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

function isRemoteSignedMediaUrl(src: string): boolean {
  return (
    src.includes("X-Amz-") ||
    src.includes("r2.cloudflarestorage.com") ||
    src.startsWith("http")
  );
}

export type CatalogResultCardView = {
  id: string;
  href: string;
  title: string;
  priceLabel: string;
  instructor: { name: string };
  image: string;
  imageAlt?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  duration?: string;
};

function StarRow({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  if (reviewCount <= 0 || rating <= 0) {
    return (
      <span className="text-xs text-muted-foreground">No reviews yet</span>
    );
  }

  const filled = Math.round(rating);
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="text-sm font-bold tabular-nums text-primary">
        {rating.toFixed(1)}
      </span>
      <span className="flex text-accent" aria-hidden>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="size-3.5"
            weight={star <= filled ? "fill" : "regular"}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">
        ({reviewCount.toLocaleString()})
      </span>
    </span>
  );
}

export function CatalogResultCard({
  course,
  className,
}: {
  course: CatalogResultCardView;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-md border border-border bg-card",
        className,
      )}
    >
      <Link
        href={course.href}
        className="relative block aspect-video overflow-hidden bg-primary-soft"
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

      <div className="flex flex-1 flex-col gap-2 p-5">
        {course.category ? (
          <p className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
            {course.category}
          </p>
        ) : null}

        <Link href={course.href}>
          <h3 className="line-clamp-2 font-display text-[16px] leading-snug font-bold text-foreground">
            {course.title}
          </h3>
        </Link>

        <p className="truncate text-sm font-medium text-primary">
          {course.instructor.name}
        </p>

        <StarRow
          rating={course.rating ?? 0}
          reviewCount={course.reviewCount ?? 0}
        />

        <p className="mt-auto pt-2 font-display text-lg font-bold tabular-nums">
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

export function toCatalogResultCardView(course: {
  id: string;
  href?: string;
  title: string;
  priceLabel: string;
  instructor: { name: string };
  image?: string | null;
  imageAlt?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  lessons?: string;
  duration?: string | null;
  lessonCount?: number;
}): CatalogResultCardView {
  return {
    id: course.id,
    href: course.href ?? `/courses/${course.id}`,
    title: course.title,
    priceLabel: course.priceLabel,
    instructor: course.instructor,
    image: course.image || "/assets/featured-courses/course-1.jpg",
    imageAlt: course.imageAlt,
    rating: course.rating,
    reviewCount: course.reviewCount,
    category: course.category,
    duration: course.duration ?? undefined,
  };
}

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  udemyBorderClass,
  udemyCardShadow,
} from "@/lib/ui/udemy-surface";
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
      <span className="text-sm font-bold tabular-nums text-[#b4690e]">
        {rating.toFixed(1)}
      </span>
      <span className="flex text-[#b4690e]" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3 w-3"
            fill={i < filled ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">
        ({reviewCount.toLocaleString()})
      </span>
    </span>
  );
}

/** Udemy-style catalog card — image, title, instructor, rating, price. Whole card is the link. */
export function CatalogResultCard({
  course,
  className,
}: {
  course: CatalogResultCardView;
  className?: string;
}) {
  return (
    <Link
      href={course.href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-md border bg-white transition duration-200",
        "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
        udemyBorderClass,
        udemyCardShadow,
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#f7f9fa]">
        {isRemoteSignedMediaUrl(course.image) ? (
          // biome-ignore lint/performance/noImgElement: signed R2 URLs
          <img
            src={course.image}
            alt={course.imageAlt ?? course.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <Image
            src={course.image}
            alt={course.imageAlt ?? course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        {course.category ? (
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {course.category}
          </p>
        ) : null}

        <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
          {course.title}
        </h3>

        <p className="truncate text-xs text-muted-foreground">
          {course.instructor.name}
        </p>

        <div className="mt-0.5">
          <StarRow
            rating={course.rating ?? 0}
            reviewCount={course.reviewCount ?? 0}
          />
        </div>

        <p className="mt-auto pt-2 text-base font-bold tabular-nums text-foreground">
          {course.priceLabel}
        </p>
      </div>
    </Link>
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
  };
}

import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { BookIcon } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  lessons: string;
  duration: string;
  image: string;
  imageAlt?: string;
};

export function CatalogResultCard({
  course,
  className,
}: {
  course: CatalogResultCardView;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden shadow-none transition-colors hover:border-primary/30",
        className,
      )}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {isRemoteSignedMediaUrl(course.image) ? (
            // biome-ignore lint/performance/noImgElement: signed R2 URLs
            <img
              src={course.image}
              alt={course.imageAlt ?? course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <Image
              src={course.image}
              alt={course.imageAlt ?? course.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground">
            {course.title}
          </h3>
          <Badge variant="secondary" className="shrink-0 font-semibold">
            {course.priceLabel}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          by {course.instructor.name}
        </p>

        <div className="mt-auto flex divide-x divide-border overflow-hidden rounded-md bg-muted/60">
          <div className="flex flex-1 items-center gap-2 px-3 py-2.5">
            <BookIcon className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground">
                Lessons
              </p>
              <p className="truncate text-xs font-semibold">{course.lessons}</p>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2 px-3 py-2.5">
            <Clock3 className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground">
                Duration
              </p>
              <p className="truncate text-xs font-semibold">{course.duration}</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link href={course.href}>View course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function toCatalogResultCardView(course: {
  id: string;
  href?: string;
  title: string;
  priceLabel: string;
  instructor: { name: string };
  lessons?: string;
  duration?: string | null;
  image?: string | null;
}): CatalogResultCardView {
  return {
    id: course.id,
    href: course.href ?? `/courses/${course.id}`,
    title: course.title,
    priceLabel: course.priceLabel,
    instructor: course.instructor,
    lessons: course.lessons ?? "Lessons",
    duration: course.duration ?? "—",
    image: course.image || "/assets/featured-courses/course-1.jpg",
  };
}

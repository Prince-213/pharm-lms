import { Star } from "lucide-react";
import Link from "next/link";
import { EnrolledCourseMenu } from "@/components/student/enrolled-course-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";

export function EnrolledCourseCard({
  courseId,
  title,
  mentorName,
  thumbnailUrl,
  priceMinorUnits,
  priceCurrency,
  progressPct,
  hasStarted,
}: {
  courseId: string;
  title: string;
  mentorName: string;
  thumbnailUrl: string | null;
  priceMinorUnits: number | null;
  priceCurrency: string;
  progressPct: number;
  hasStarted: boolean;
}) {
  const thumb = thumbnailUrl?.trim();
  const boundedProgress = Math.min(100, Math.max(0, progressPct));

  return (
    <Card className="flex h-full flex-col overflow-hidden pt-0 transition-shadow hover:shadow-md">
      <div className="relative h-44 w-full bg-primary sm:h-40 lg:h-44">
        {thumb ? (
          <img src={thumb} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs font-medium text-primary-foreground/80">
            {title}
          </div>
        )}
        <EnrolledCourseMenu courseId={courseId} courseTitle={title} />
      </div>

      <CardHeader className="gap-1 pb-2">
        <CardTitle className="line-clamp-2 min-h-[2.6rem] text-sm leading-snug">
          {title}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{mentorName}</p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pb-2">
        <div className="min-h-[52px]">
          {hasStarted ? (
            <>
              <Progress value={boundedProgress} className="h-1.5" />
              <p className="mt-1.5 text-xs font-semibold text-foreground">
                {boundedProgress}% complete
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                <span>Rate when ready</span>
              </div>
            </>
          ) : (
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              You have not started this course yet.
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex-col gap-2 border-t pt-3">
        <Button asChild className="w-full">
          <Link href={`/student/course/${courseId}`}>
            {hasStarted ? "Continue learning" : "Start course"}
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full" size="sm">
          <Link href={`/student/browse/${courseId}`}>View overview</Link>
        </Button>
        <p className="w-full text-center text-[11px] text-muted-foreground">
          Purchased {formatMinorUnitsToCurrency(priceMinorUnits, priceCurrency)}
        </p>
      </CardFooter>
    </Card>
  );
}

import { CoursePlayerSkeleton } from "@/components/ui/route-loading-skeleton";

export default function StudentCourseLoading() {
  return (
    <div className="min-h-[50vh] bg-[var(--background)] p-4 sm:p-6">
      <CoursePlayerSkeleton />
    </div>
  );
}

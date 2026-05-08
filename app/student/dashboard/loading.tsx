import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10 animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-48 rounded-md" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

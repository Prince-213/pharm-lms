import { Skeleton } from "@/components/ui/skeleton";

export default function StudentJobsLoading() {
  return (
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-8 w-72" />
      <div className="mt-6 flex gap-2">
        {["a", "b", "c", "d", "e"].map((id) => (
          <Skeleton key={id} className="h-8 w-20 rounded-md" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {["one", "two", "three", "four", "five", "six"].map((id) => (
          <div key={id} className="rounded-md border border-border bg-card p-5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="mt-3 h-6 w-4/5" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-5 h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

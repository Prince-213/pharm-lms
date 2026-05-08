import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/route-loading-skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-[40vh] bg-[var(--background)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHeaderSkeleton />
        <CardGridSkeleton cards={3} className="sm:grid-cols-3" />
      </div>
    </div>
  );
}

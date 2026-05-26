import { PageHeaderSkeleton } from "@/components/ui/route-loading-skeleton";

/** Generic fallback for routes outside the marketing homepage group */
export default function RootLoading() {
  return (
    <div className="min-h-[40vh] bg-[var(--background)] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <PageHeaderSkeleton />
      </div>
    </div>
  );
}

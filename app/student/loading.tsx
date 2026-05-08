import {
  CardGridSkeleton,
  ListBlockSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/route-loading-skeleton";

export default function StudentSegmentLoading() {
  return (
    <div className="space-y-8 px-1 py-2 sm:px-0">
      <PageHeaderSkeleton />
      <CardGridSkeleton cards={4} />
      <div className="h-10 max-w-md rounded-[var(--radius-md)] bg-[var(--surface-muted)] animate-pulse" />
      <ListBlockSkeleton items={4} />
    </div>
  );
}

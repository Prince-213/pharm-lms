import {
  CardGridSkeleton,
  PageHeaderSkeleton,
  TableRowsSkeleton,
} from "@/components/ui/route-loading-skeleton";

export default function AdminSegmentLoading() {
  return (
    <div className="space-y-8 px-1 py-2 sm:px-0">
      <PageHeaderSkeleton />
      <CardGridSkeleton cards={4} />
      <TableRowsSkeleton rows={5} cols={4} />
    </div>
  );
}

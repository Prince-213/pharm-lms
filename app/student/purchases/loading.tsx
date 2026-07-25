import {
  PageHeaderSkeleton,
  TableRowsSkeleton,
} from "@/components/ui/route-loading-skeleton";

export default function StudentPurchasesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableRowsSkeleton rows={6} cols={5} />
    </div>
  );
}

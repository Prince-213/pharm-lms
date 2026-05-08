import {
  CardGridSkeleton,
  ListBlockSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/route-loading-skeleton";

export default function MentorSegmentLoading() {
  return (
    <div className="space-y-8 px-1 py-2 sm:px-0">
      <PageHeaderSkeleton />
      <CardGridSkeleton cards={3} className="lg:grid-cols-3" />
      <ListBlockSkeleton items={5} />
    </div>
  );
}

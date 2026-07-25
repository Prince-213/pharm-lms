import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/route-loading-skeleton";

export default function MentorProtectedLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton cards={3} />
    </div>
  );
}

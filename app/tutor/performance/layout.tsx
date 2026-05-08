import { PerformanceNav } from "@/components/mentor/performance/performance-nav";

export default function MentorPerformanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <PerformanceNav />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:max-w-[1180px] lg:px-8">{children}</div>
      </div>
    </div>
  );
}

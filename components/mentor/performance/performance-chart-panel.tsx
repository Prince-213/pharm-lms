import { ChevronRight } from "lucide-react";
import Link from "next/link";

type PerformanceChartPanelProps = {
  children?: React.ReactNode;
  emptyMessage?: string;
  footerLink?: { href: string; label: string };
};

export function PerformanceChartPanel({
  children,
  emptyMessage = "No data to display yet. When learners enroll and engage, trends will appear here.",
  footerLink,
}: PerformanceChartPanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e3e5e8] bg-white shadow-sm">
      <div className="min-h-[280px] bg-gradient-to-b from-[#fafbfb] to-white px-6 py-16 text-center sm:min-h-[320px]">
        {children ?? (
          <div className="mx-auto max-w-md">
            <p className="text-sm font-medium text-[#6a6f73]">{emptyMessage}</p>
            <p className="mt-2 text-xs text-[#8b9199]">
              Sample dashboards use placeholder metrics until analytics are
              connected.
            </p>
          </div>
        )}
      </div>
      {footerLink ? (
        <div className="flex justify-end border-t border-[#ececec] bg-[#fcfcfd] px-4 py-3">
          <Link
            href={footerLink.href}
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            {footerLink.label}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}

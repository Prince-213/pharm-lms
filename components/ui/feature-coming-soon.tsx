import Link from "next/link";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeatureComingSoon({
  title,
  description,
  backHref = "/tutor/courses",
  backLabel = "Back to courses",
}: {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-muted)] text-muted-foreground">
        <Construction className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-amber-700">
        Coming soon
      </p>
      <Button asChild className="mt-8" variant="outline">
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  );
}

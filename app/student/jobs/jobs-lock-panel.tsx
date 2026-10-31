import Link from "next/link";
import { Button } from "@/components/ui/button";

export function JobsLockPanel() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Jobs
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
        Finish your profile to unlock matches
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We need your name, country, and city before we can rank roles or send a
        weekly digest.
      </p>
      <Button asChild className="mt-8 bg-accent text-accent-foreground">
        <Link href="/student/profile">Complete profile</Link>
      </Button>
    </div>
  );
}

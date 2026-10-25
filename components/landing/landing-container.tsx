import { cn } from "@/lib/utils";

export function LandingContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[96rem] px-5 sm:px-8 lg:px-12 xl:px-16",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LandingEyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] tracking-[0.14em] text-muted-soft uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function LandingHeading({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={cn(
        "font-display text-balance text-[1.85rem] leading-[1.12] font-semibold tracking-[-0.02em] text-foreground sm:text-[2.15rem] lg:text-[2.45rem] xl:text-[2.75rem]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

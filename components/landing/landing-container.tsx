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
        "mx-auto w-full max-w-[90rem] px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20",
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
        "font-mono text-[11px] tracking-[0.08em] text-muted-soft uppercase",
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
        "font-display text-balance text-[1.55rem] leading-[1.15] font-semibold tracking-[-0.02em] text-foreground sm:text-[1.85rem] md:text-[2.1rem] lg:text-[2.35rem] xl:text-[2.6rem]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export const landingDisplayTitleClass =
  "font-display text-balance text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[2.15rem] md:text-[2.45rem] lg:text-[2.85rem] xl:text-[3.15rem]";

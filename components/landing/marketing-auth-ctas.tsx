import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MarketingAuthCta } from "@/lib/audience-landing-content";

type MarketingAuthCtasProps = MarketingAuthCta & {
  variant?: "default" | "onDark" | "onPrimary";
  className?: string;
};

const variantClasses = {
  default: {
    login:
      "inline-flex items-center justify-center rounded-full border border-accent bg-white px-7 py-3.5 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-accent-foreground",
    signup:
      "inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-[var(--primary-strong)]",
  },
  onDark: {
    login:
      "inline-flex items-center justify-center rounded-xl border border-white/80 bg-transparent px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10",
    signup:
      "inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-white/90",
  },
  onPrimary: {
    login:
      "inline-flex min-w-[200px] items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-primary transition-all hover:bg-white/90",
    signup:
      "inline-flex min-w-[200px] items-center justify-center rounded-full border border-white bg-transparent px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10",
  },
} as const;

export function MarketingAuthCtas({
  loginHref,
  loginLabel,
  signupHref,
  signupLabel,
  variant = "default",
  className,
}: MarketingAuthCtasProps) {
  const styles = variantClasses[variant];

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Link href={loginHref} className={styles.login}>
        {loginLabel}
      </Link>
      <Link href={signupHref} className={styles.signup}>
        {signupLabel}
      </Link>
    </div>
  );
}

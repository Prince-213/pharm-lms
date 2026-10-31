import Link from "next/link";
import { cn } from "@/lib/utils";

export const LEGAL_NAV = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/cookies", label: "Cookies" },
] as const;

export function LegalLinks({
  className,
  linkClassName,
}: {
  className?: string;
  linkClassName?: string;
}) {
  return (
    <nav
      aria-label="Legal"
      className={cn("flex flex-wrap gap-x-3 gap-y-1", className)}
    >
      {LEGAL_NAV.map((item) => (
        <Link key={item.href} href={item.href} className={linkClassName}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

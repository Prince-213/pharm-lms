"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/payments/transactions", label: "Transactions" },
  { href: "/admin/payments/withdrawals", label: "Withdrawals" },
  { href: "/admin/payments/settings", label: "Settings" },
] as const;

export function AdminPaymentsSubnav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/35 p-1">
      {links.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                : "text-muted-foreground hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

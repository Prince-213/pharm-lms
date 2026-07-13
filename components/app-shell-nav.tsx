"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type AppShellNavItem = {
  href: string;
  label: string;
};

export function AppShellNav({
  items,
  layout = "horizontal",
  tone = "light",
}: {
  items: AppShellNavItem[];
  layout?: "horizontal" | "vertical";
  tone?: "light" | "dark";
}) {
  const pathname = usePathname();

  if (layout === "vertical") {
    return (
      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "block rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--primary-soft)] text-[var(--primary-strong)] ring-1 ring-[var(--border)]"
                  : "text-[var(--foreground)] hover:bg-[var(--primary-soft)]/50 hover:text-[var(--primary)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  if (tone === "dark") {
    return (
      <nav className="flex min-w-0 items-center gap-1 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "shrink-0 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors sm:px-3.5",
                active
                  ? "bg-white/12 text-[var(--header-fg)] ring-1 ring-white/20"
                  : "text-[var(--header-fg-muted)] hover:bg-white/8 hover:text-[var(--header-fg)]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex min-w-0 items-center gap-1 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4",
              active
                ? "bg-[var(--primary-soft)] text-[var(--primary-strong)] ring-1 ring-[var(--border)]"
                : "text-muted-foreground hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

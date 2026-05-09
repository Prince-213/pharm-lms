"use client";

import { clsx } from "clsx";
import { Megaphone, MessageSquare, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const WORKSPACE = "/tutor";

const subNav = [
  {
    href: `${WORKSPACE}/communication/messages`,
    label: "Messages",
    icon: MessageSquare,
    badge: 3,
  },
  {
    href: `${WORKSPACE}/communication/announcements`,
    label: "Announcements",
    icon: Megaphone,
  },
  {
    href: `${WORKSPACE}/communication/meetings`,
    label: "Meetings",
    icon: Video,
  },
] as const;

export function CommunicationShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-col bg-[#f8fafb] text-[#191c1d]">
      <header className="flex h-14 shrink-0 items-center border-b border-[#e2e8f0] bg-white px-4 sm:px-8">
        <h1 className="font-display text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl">
          Communication
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          className="w-full shrink-0 border-b border-[#e2e8f0] bg-white px-2 py-3 md:w-[220px] md:border-b-0 md:border-r md:py-5"
          aria-label="Communication sections"
        >
          <nav className="flex flex-row gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-col md:space-y-0.5 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
            {subNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors md:w-full md:shrink",
                    active
                      ? "bg-[#ecfdf5] text-[#0f172a] shadow-[inset_3px_0_0_0_#10b981] md:shadow-[inset_3px_0_0_0_#10b981]"
                      : "text-[#475569] hover:bg-slate-100",
                  )}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0 opacity-80"
                    strokeWidth={1.75}
                  />
                  <span className="flex-1">{item.label}</span>
                  {"badge" in item && item.badge != null ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[11px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-auto bg-white shadow-inner">
          {children}
        </main>
      </div>
    </div>
  );
}

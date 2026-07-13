"use client";

import { Megaphone, MessageSquare, MessagesSquare, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const WORKSPACE = "/tutor";

export function CommunicationShell({
  children,
  messageBadge = 0,
  meetingBadge = 0,
}: {
  children: React.ReactNode;
  messageBadge?: number;
  meetingBadge?: number;
}) {
  const pathname = usePathname();

  const subNav = [
    {
      href: `${WORKSPACE}/communication/messages`,
      label: "Messages",
      icon: MessageSquare,
      badge: messageBadge > 0 ? messageBadge : undefined,
    },
    {
      href: `${WORKSPACE}/communication/announcements`,
      label: "Announcements",
      icon: Megaphone,
    },
    {
      href: `${WORKSPACE}/communication/forums`,
      label: "Forums",
      icon: MessagesSquare,
    },
    {
      href: `${WORKSPACE}/communication/meetings`,
      label: "Meetings",
      icon: Video,
      badge: meetingBadge > 0 ? meetingBadge : undefined,
    },
  ] as const;

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="flex h-14 shrink-0 items-center border-b border-[#d1d7dc] bg-white px-4 sm:px-8">
        <h1 className="font-display text-lg font-bold tracking-tight text-[var(--foreground)] sm:text-xl">
          Communication
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          className="w-full shrink-0 border-b border-[#d1d7dc] bg-white px-2 py-3 md:w-[220px] md:border-b-0 md:border-r md:py-5"
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
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors md:w-full md:shrink",
                    active
                      ? "bg-[var(--primary-soft)]/35 text-[var(--foreground)] shadow-[inset_3px_0_0_0_var(--primary)] md:shadow-[inset_3px_0_0_0_var(--primary)]"
                      : "text-muted-foreground hover:bg-[#f7f9fa]",
                  )}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0 opacity-80"
                    strokeWidth={1.75}
                  />
                  <span className="flex-1">{item.label}</span>
                  {"badge" in item && item.badge != null ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[11px] font-bold text-[var(--primary-foreground)]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-h-0 flex-1 bg-[#f7f9fa] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";

export type AdminMessagesTab = "inbox" | "broadcast" | "forum";

export function AdminMessagesNav({ tab }: { tab: AdminMessagesTab }) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors";
  const active =
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm";
  const idle =
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]/80";

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4"
      aria-label="Messages sections"
    >
      <Link
        href="/admin/messages"
        className={cn(base, tab === "inbox" ? active : idle)}
        aria-current={tab === "inbox" ? "page" : undefined}
      >
        Inbox
      </Link>
      <Link
        href="/admin/messages?tab=broadcast"
        className={cn(base, tab === "broadcast" ? active : idle)}
        aria-current={tab === "broadcast" ? "page" : undefined}
      >
        Broadcast
      </Link>
      <Link
        href="/admin/messages?tab=forum"
        className={cn(base, tab === "forum" ? active : idle)}
        aria-current={tab === "forum" ? "page" : undefined}
      >
        Forum
      </Link>
    </nav>
  );
}

"use client";

import { Bell, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  assignmentId: string | null;
  readAt: string | null;
  createdAt: string;
};

type ApiResponse = {
  items: NotificationItem[];
  unreadCount: number;
};

export function HeaderNotificationBell({
  className,
  bellButtonClassName,
}: {
  className?: string;
  bellButtonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [patching, setPatching] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as ApiResponse;
      setData(json);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  const unreadCount = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  async function markAllRead() {
    setPatching(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      await load();
    } finally {
      setPatching(false);
    }
  }

  async function markOneRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      await load();
    } catch {
      /* ignore */
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("relative", bellButtonClassName, className)}
          aria-label="Notifications"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin opacity-50" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold text-white ring-2 ring-background">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(100vw-2rem,22rem)] p-0"
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Notifications
          </span>
          {unreadCount > 0 ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={patching}
              onClick={() => void markAllRead()}
              className="h-auto gap-1 px-0 text-[11px]"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </Button>
          ) : null}
        </div>
        <ScrollArea className="max-h-[min(60vh,320px)]">
          <ul>
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </li>
            ) : (
              items.map((n) => {
                const inner = (
                  <>
                    <p className="text-sm font-semibold leading-snug text-foreground">
                      {n.title}
                    </p>
                    {n.body ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </>
                );

                return (
                  <li
                    key={n.id}
                    className={cn(
                      "border-b last:border-0",
                      !n.readAt && "bg-primary/5",
                    )}
                  >
                    {n.href ? (
                      <Link
                        href={n.href}
                        className="block px-3 py-2.5 transition hover:bg-muted"
                        onClick={() => {
                          if (!n.readAt) void markOneRead(n.id);
                          setOpen(false);
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full px-3 py-2.5 text-left transition hover:bg-muted"
                        onClick={() => {
                          if (!n.readAt) void markOneRead(n.id);
                        }}
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

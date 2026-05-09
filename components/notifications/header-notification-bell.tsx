"use client";

import { Bell, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
  /** e.g. mentor shell uses rounded-full */
  bellButtonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [patching, setPatching] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }
  }, [open]);

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
    <div className={cn("relative", className)} ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative p-2.5 text-[var(--muted)] transition-all hover:scale-105 hover:bg-[var(--surface-muted)] active:scale-95 rounded-xl",
          bellButtonClassName,
        )}
        aria-label="Notifications"
        aria-expanded={open}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin opacity-50" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
              Notifications
            </span>
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={patching}
                onClick={() => void markAllRead()}
                className="flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] hover:underline disabled:opacity-50"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            ) : null}
          </div>
          <ul className="max-h-[min(60vh,320px)] overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                No notifications yet.
              </li>
            ) : (
              items.map((n) => {
                const inner = (
                  <>
                    <p
                      className={cn(
                        "text-sm font-semibold leading-snug text-[var(--foreground)]",
                        !n.readAt && "text-[var(--foreground)]",
                      )}
                    >
                      {n.title}
                    </p>
                    {n.body ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">
                        {n.body}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-[var(--muted)]">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </>
                );

                return (
                  <li
                    key={n.id}
                    className={cn(
                      "border-b border-[var(--border-subtle)] last:border-0",
                      !n.readAt && "bg-[var(--primary-soft)]/30",
                    )}
                  >
                    {n.href ? (
                      <Link
                        href={n.href}
                        className="block px-3 py-2.5 transition hover:bg-[var(--surface-muted)]"
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
                        className="w-full px-3 py-2.5 text-left transition hover:bg-[var(--surface-muted)]"
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
        </div>
      ) : null}
    </div>
  );
}

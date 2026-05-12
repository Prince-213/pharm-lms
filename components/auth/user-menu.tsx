"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { userRoleLabel } from "@/lib/user-role-label";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="chrome"
        onClick={() => setIsOpen(!isOpen)}
        className="group h-auto gap-2 rounded-xl border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <div className="h-10 w-10 rounded-full border-2 border-[var(--primary-soft)] bg-[var(--surface)] p-0.5 shadow-sm transition-transform active:scale-95 group-hover:border-[var(--primary)]/40">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold uppercase text-[var(--primary-foreground)] group-hover:bg-[var(--primary-strong)]">
            {initials}
          </div>
        </div>
        <div className="hidden text-left sm:block">
          <p className="leading-none text-sm font-bold text-[var(--foreground)]">
            {user.name || "User"}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {userRoleLabel(user.role)}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--muted)] transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </Button>

      {isOpen ? (
        <Card
          className="absolute right-0 z-50 mt-2 w-64 origin-top-right animate-in rounded-xl border-[var(--border)] bg-[var(--surface)] p-0 shadow-xl fade-in zoom-in duration-200"
          role="menu"
        >
          <CardContent className="p-2">
            <div className="mb-1 border-b border-[var(--border)] px-3 py-2">
              <p className="truncate text-sm font-bold text-[var(--foreground)]">
                {user.name}
              </p>
              <p className="truncate text-xs text-[var(--muted)]">
                {user.email}
              </p>
            </div>

            <div className="space-y-0.5">
              <Link
                href={`/${user.role?.toLowerCase()}/dashboard`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                role="menuitem"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                role="menuitem"
              >
                <User className="h-4 w-4 shrink-0" />
                My Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                role="menuitem"
              >
                <Settings className="h-4 w-4 shrink-0" />
                Settings
              </Link>
            </div>

            <div className="my-1 h-px bg-[var(--border)]" />

            <Button
              type="button"
              variant="destructive"
              className="w-full justify-start gap-3 rounded-lg px-3 py-2 font-bold"
              onClick={() => signOut({ callbackUrl: "/" })}
              role="menuitem"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Logout
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { userRoleLabel } from "@/lib/user-role-label";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  // Close when clicking outside
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group focus:outline-none"
      >
        <div className="h-10 w-10 rounded-full border-2 border-(--primary-soft) bg-white p-0.5 shadow-sm transition-transform active:scale-95 group-hover:border-(--primary)/40">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-(--primary) text-xs font-bold text-white uppercase group-hover:bg-(--primary-strong)">
            {initials}
          </div>
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-bold text-foreground leading-none">
            {user.name || "User"}
          </p>
          <p className="text-xs text-(--muted) mt-1">
            {userRoleLabel(user.role)}
          </p>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-(--muted) transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-(--border) bg-white p-2 shadow-xl animate-in fade-in zoom-in duration-200">
          <div className="px-3 py-2 border-b border-(--border) mb-1">
            <p className="text-sm font-bold text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-(--muted) truncate">
              {user.email}
            </p>
          </div>

          <div className="space-y-0.5">
            <Link
              href={`/${user.role?.toLowerCase()}/dashboard`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-(--surface-muted) hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-(--surface-muted) hover:text-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              My Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-(--surface-muted) hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>

          <div className="my-1 h-px bg-(--border)" />

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

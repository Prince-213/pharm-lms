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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user/user-avatar";
import type { UserRole } from "@/generated/prisma/enums";
import { profilePathForRole, roleHomePath } from "@/lib/rbac";
import { userRoleLabel } from "@/lib/user-role-label";

export function UserMenu() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = user?.role as UserRole | undefined;
  const profileHref = role ? profilePathForRole(role) : "/student/profile";
  const dashboardHref = role ? roleHomePath(role) : "/student/dashboard";
  const displayName = user?.name?.trim() || "User";

  if (status === "loading") {
    return (
      <div
        className="flex h-10 items-center gap-2"
        aria-busy="true"
        aria-label="Loading user menu"
      >
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <div className="hidden space-y-1.5 sm:block">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="chrome"
          className="group h-auto gap-2 rounded-xl border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
          aria-haspopup="dialog"
          aria-label="User menu"
        >
          <div className="h-10 w-10 rounded-full border-2 border-[var(--primary-soft)] bg-[var(--surface)] p-0.5 shadow-sm transition-transform active:scale-95 group-hover:border-[var(--primary)]/40">
            <UserAvatar
              src={user?.image}
              name={displayName}
              className="h-full w-full rounded-full bg-[var(--primary)]"
              fallbackClassName="text-xs font-bold uppercase text-[var(--primary-foreground)]"
            />
          </div>
          <div className="hidden text-left sm:block">
            <p className="leading-none text-sm font-bold text-[var(--foreground)]">
              {displayName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {user?.role ? userRoleLabel(user.role) : "Account"}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-64 gap-0 rounded-xl p-2"
        role="menu"
      >
        <div className="mb-1 border-b border-border px-3 py-2">
          <p className="truncate text-sm font-bold text-foreground">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email || "Signed in"}
          </p>
        </div>

        <div className="space-y-0.5">
          <Link
            href={dashboardHref}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            role="menuitem"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </Link>
          <Link
            href={profileHref}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            role="menuitem"
          >
            <User className="h-4 w-4 shrink-0" />
            My Profile
          </Link>
          <Link
            href={profileHref}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            role="menuitem"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
        </div>

        <div className="my-1 h-px bg-border" />

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
      </PopoverContent>
    </Popover>
  );
}

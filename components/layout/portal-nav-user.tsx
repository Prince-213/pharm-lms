"use client";

import { ChevronsUpDown, LogOut, User } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user/user-avatar";
import type { UserRole } from "@/generated/prisma/enums";
import { profilePathForRole } from "@/lib/rbac";
import { userRoleLabel } from "@/lib/user-role-label";

export function PortalNavUser() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const role = user?.role as UserRole | undefined;
  const profileHref = role ? profilePathForRole(role) : "/student/profile";
  const displayName = user?.name?.trim() || "User";

  if (status === "loading") {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="pointer-events-none" disabled>
            <div className="h-8 w-8 animate-pulse rounded-lg bg-sidebar-accent" />
            <div className="grid flex-1 gap-1.5 group-data-[collapsible=icon]:hidden">
              <div className="h-3 w-24 animate-pulse rounded bg-sidebar-accent" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-sidebar-accent" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={displayName}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="Account menu"
            >
              <UserAvatar
                src={user?.image}
                name={displayName}
                className="h-8 w-8 rounded-lg bg-sidebar-primary"
                fallbackClassName="text-xs font-semibold text-sidebar-primary-foreground"
              />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {user?.email ||
                    (user?.role ? userRoleLabel(user.role) : "Account")}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-56 gap-0 rounded-xl p-2"
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

            <Link
              href={profileHref}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              role="menuitem"
            >
              <User className="h-4 w-4 shrink-0" />
              My Profile
            </Link>

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/" })}
              role="menuitem"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Logout
            </button>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

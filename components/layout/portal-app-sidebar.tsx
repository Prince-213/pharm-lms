"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "@/lib/icons/client";
import {
  isNavItemActive,
  type PortalNavConfig,
} from "@/components/layout/nav/portal-nav-config";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

type PortalAppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  config: PortalNavConfig;
};

export function PortalAppSidebar({
  config,
  ...props
}: PortalAppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          href={config.homeHref}
          className="font-display text-lg font-bold uppercase tracking-wider text-sidebar-foreground group-data-[collapsible=icon]:hidden"
        >
          PharmLMS
        </Link>
        <Link
          href={config.homeHref}
          className="hidden font-display text-sm font-bold text-sidebar-foreground group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
          aria-label="PharmLMS home"
        >
          P
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {config.groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isNavItemActive(pathname, item);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          {Icon ? <Icon /> : null}
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {config.footerLabel ? (
        <SidebarFooter className="p-2">
          <Card className="border-sidebar-border bg-sidebar-accent/40 shadow-none group-data-[collapsible=icon]:hidden">
            <CardContent className="flex flex-col items-center p-4 text-center">
              <GraduationCap className="mb-2 h-5 w-5 text-sidebar-primary" />
              <p className="text-xs font-medium text-sidebar-foreground/80">
                {config.footerLabel}
              </p>
            </CardContent>
          </Card>
        </SidebarFooter>
      ) : null}

      <SidebarRail />
    </Sidebar>
  );
}

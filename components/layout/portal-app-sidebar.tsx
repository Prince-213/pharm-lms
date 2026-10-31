"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LegalLinks } from "@/components/brand/legal-links";
import { PharmLogo } from "@/components/brand/pharm-logo";
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

export function PortalAppSidebar({ config, ...props }: PortalAppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link
          href={config.homeHref}
          className="group-data-[collapsible=icon]:hidden"
        >
          <PharmLogo
            inverted
            markClassName="h-7 w-7"
            wordmarkClassName="text-base"
          />
        </Link>
        <Link
          href={config.homeHref}
          className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
          aria-label="PharmEdge home"
        >
          <PharmLogo inverted wordmark={false} markClassName="h-7 w-7" />
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

      <SidebarFooter className="p-2">
        <Card className="border-sidebar-border bg-sidebar-accent/40 shadow-none group-data-[collapsible=icon]:hidden">
          <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
            <PharmLogo
              inverted
              markClassName="h-7 w-7"
              wordmarkClassName="text-sm"
            />
            {config.footerLabel ? (
              <p className="text-xs font-medium text-sidebar-foreground/80">
                {config.footerLabel}
              </p>
            ) : null}
            <LegalLinks
              className="justify-center text-[11px]"
              linkClassName="text-sidebar-foreground/70 underline-offset-4 hover:text-sidebar-foreground hover:underline"
            />
          </CardContent>
        </Card>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

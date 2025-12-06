"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/core/components/ui/sidebar";
import { RepoSwitcher } from "@/core/components/shared/repo-switcher";
import { SidebarHeaderLogo } from "@/core/layouts/dashboard/nav/sidebar-header-logo";
import { NavItems } from "@/core/layouts/dashboard/nav/items";
import {
  getBottomSidebarRoutes,
  getSidebarRoutes,
} from "../../utils/objects/sidebar-routes";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const sidebarRoutes = getSidebarRoutes(pathname);
  const bottomSidebarRoutes = getBottomSidebarRoutes(pathname);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
        <RepoSwitcher />
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full justify-between">
        <NavItems sidebar={sidebarRoutes} />
        <NavItems sidebar={bottomSidebarRoutes} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

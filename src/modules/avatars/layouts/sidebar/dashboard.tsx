"use client";

import { RepoSwitcher } from "@/core/components/shared/repo-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/core/components/ui/sidebar";
import { SidebarHeaderLogo } from "@/core/layouts/dashboard/nav/sidebar-header-logo";
import { NavItems } from "@/modules/chat/layouts/dashboard/nav/items";
import { usePathname } from "next/navigation";
import * as React from "react";
import { getSidebarRoutes } from "../../utils/objects/sidebar-routes";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const sidebarRoutes = getSidebarRoutes(pathname);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
        <RepoSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavItems sidebar={sidebarRoutes} /> */}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

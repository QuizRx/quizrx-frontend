"use client";

import { RepoSwitcher } from "@/core/components/shared/repo-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/core/components/ui/sidebar";
import { NavItems } from "@/modules/chat/layouts/dashboard/nav/items";
import { SidebarHeaderLogo } from "@/core/layouts/dashboard/nav/sidebar-header-logo";
import { getSidebarRoutes } from "@/modules/chat/utils/objects/sidebar-routes";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useUser } from "@/core/providers/user";
import { UserRole } from "@/modules/graph/types/api/enum";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  
  // Memoize sidebar routes to avoid recalculation on every render
  const sidebarRoutes = React.useMemo(
    () => getSidebarRoutes(pathname),
    [pathname]
  );
  
  const { user } = useUser();
  
  // Memoize permission check
  const hasPermission = React.useMemo(
    () => user?.role === UserRole.OWNER || user?.role === UserRole.EDITOR,
    [user?.role]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
        {hasPermission && <RepoSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <NavItems sidebar={sidebarRoutes} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

import {
  BookText,
  Boxes,
  Database,
  FileStack,
  History,
  Home,
  Key,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { SidebarGroups } from "@/core/types/ui/sidebar";
const baseRoute = "/configuration";

const getSidebarRoutes = (routeName: string): SidebarGroups => {
  return [
    // {
    //   title: "Home",
    //   url: `${baseRoute}`,
    //   icon: Home,
    //   isActive: routeName === `${baseRoute}`,
    // },
    // {
    //   title: "Dashboard",
    //   url: `${baseRoute}/dashboard`,
    //   icon: LayoutDashboard,
    //   isActive: routeName === `${baseRoute}/dashboard`,
    // },
    // {
    //   title: "Graph Processing",
    //   url: `${baseRoute}/graph-processing`,
    //   icon: Database,
    //   isActive: routeName === `${baseRoute}/graph-processing`,
    // },
    // {
    //   title: "Collections",
    //   url: `${baseRoute}/collections`,
    //   icon: Boxes,
    //   isActive: routeName === `${baseRoute}/collections`,
    // },
    // {
    //   title: "File Management",
    //   url: `${baseRoute}/file-management`,
    //   icon: FileStack,
    //   isActive: routeName === `${baseRoute}/file-management`,
    // },
    // {
    //   title: "Role Management",
    //   url: `${baseRoute}/role-management`,
    //   icon: Key,
    //   isActive: routeName === `${baseRoute}/role-management`,
    // },
    // {
    //   title: "History",
    //   url: `${baseRoute}/history`,
    //   icon: History,
    //   isActive: routeName === `${baseRoute}/history`,
    // },
  ];
};

const getBottomSidebarRoutes = (routeName: string): SidebarGroups => {
  return [
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookText,
    //   isActive: routeName === "#",
    // },
    // {
    //   title: "Settings",
    //   url: `${baseRoute}/settings`,
    //   icon: Settings,
    //   isActive: routeName === `${baseRoute}/settings`,
    // },
  ];
};

export { getBottomSidebarRoutes, getSidebarRoutes };

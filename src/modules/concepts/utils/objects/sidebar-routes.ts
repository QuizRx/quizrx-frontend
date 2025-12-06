import { SidebarGroups } from "@/core/types/ui/sidebar";
import { BookText, FolderKanban, Home, Route, Settings } from "lucide-react";

const baseRoute = "/agents";

const getSidebarRoutes = (routeName: string): SidebarGroups => {
  return [
    // {
    //   title: "Pipelines",
    //   url: baseRoute,
    //   icon: Route,
    //   isActive: routeName === baseRoute,
    //   items: [
    //     {
    //       title: "Home",
    //       url: baseRoute,
    //       icon: Home,
    //       isActive: routeName === baseRoute,
    //     },
    //     {
    //       title: "My Pipelines",
    //       url: `${baseRoute}/my-pipelines`,
    //       icon: FolderKanban,
    //       isActive: routeName === `${baseRoute}/pipelines`,
    //     },
    //   ],
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

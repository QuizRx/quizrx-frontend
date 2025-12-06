import { SidebarGroups } from "@/core/types/ui/sidebar";
import { Database, HelpCircle, Home, Settings, User } from "lucide-react";
const baseRoute = "/avatars";

const getSidebarRoutes = (routeName: string): SidebarGroups => {
  return [
    // {
    //   title: "Avatars",
    //   url: `${baseRoute}`,
    //   icon: Home,
    //   isActive: routeName === `${baseRoute}`,
    // },
    // {
    //   title: "My Projects",
    //   url: `${baseRoute}/graph-processing`,
    //   icon: Database,
    //   isActive: routeName === `${baseRoute}/graph-processing`,
    // },
    // {
    //   title: "Settings & Help",
    //   url: `${baseRoute}/settings`,
    //   icon: Settings,
    //   isActive:
    //     routeName.includes(`${baseRoute}/settings`) ||
    //     routeName.includes(`${baseRoute}/help`),
    //   items: [
    //     {
    //       title: "Account Setting",
    //       url: `${baseRoute}/settings`,
    //       icon: User,
    //       isActive: routeName === `${baseRoute}/settings`,
    //     },
    //   ],
    // },
  ];
};

export { getSidebarRoutes };

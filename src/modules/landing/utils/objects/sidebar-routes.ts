import {
  Home
} from "lucide-react";
import { SidebarGroups } from "@/core/types/ui/sidebar";

export const getSidebarRoutes = (routeName: string): SidebarGroups => {
  return [
    {
      title: "Overview",
      url: "/",
      icon: Home,
      isActive: routeName === "/",
    },
  ];
};

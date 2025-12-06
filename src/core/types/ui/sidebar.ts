import { LucideIcon } from "lucide-react";

export type SidebarItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
};

export type SidebarGroupItems = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: SidebarItem[];
  isSubItem?: boolean
};
export type SidebarGroups = SidebarGroupItems[];

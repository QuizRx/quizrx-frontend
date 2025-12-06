"use client";

import { type LucideIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/core/components/ui/sidebar";

export function NavItems({
  sidebar,
}: {
  sidebar: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    isSubItem?: boolean;
    items?: {
      title: string;
      url: string;
      icon?: LucideIcon;
      isActive?: boolean;
    }[];
  }[];
}) {
  const { state } = useSidebar(); // Get the sidebar state
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Local state to track clicked URL for instant visual feedback
  const [clickedUrl, setClickedUrl] = useState<string | null>(null);

  // Reset clickedUrl when pathname actually changes
  useEffect(() => {
    setClickedUrl(null);
  }, [pathname]);

  const handleNavigation = useCallback(
    (url: string) => {
      // Set clicked state immediately for instant visual feedback
      setClickedUrl(url);

      startTransition(() => {
        router.push(url);
      });
    },
    [router]
  );

  // Prefetch on hover for faster navigation
  const handleMouseEnter = useCallback(
    (url: string) => {
      router.prefetch(url);
    },
    [router]
  );

  // Helper to determine if item should be shown as active
  const isItemActive = useCallback(
    (itemUrl: string, itemIsActive?: boolean) => {
      // If a URL was clicked, only that URL should be active
      if (clickedUrl) {
        return clickedUrl === itemUrl;
      }
      // Otherwise, use the normal isActive state
      return itemIsActive || false;
    },
    [clickedUrl]
  );

  // Split sidebar items into groups
  const mainItems = sidebar.filter(
    (item) => !item.title.includes("Settings & Help")
  );
  const settingsHelpItem = sidebar.find(
    (item) => item.title === "Settings & Help"
  );

  const isCollapsed = state === "collapsed"; // Determine if sidebar is collapsed

  return (
    <>
      {/* Main Group */}
      <SidebarGroup>
        {isCollapsed ? (
          <div className="px-2 py-2 text-xl"></div>
        ) : (
          <div className="px-2 py-2 text-xs">Main Menu</div>
        )}
        <SidebarMenu>
          {mainItems.map((item) => {
            const active = isItemActive(item.url, item.isActive);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className={`${item.isSubItem ? "pl-6" : ""} cursor-pointer ${
                    active
                      ? ""
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  } transition-colors`}
                  tooltip={isCollapsed ? item.title : undefined}
                  variant={active ? "selected" : "default"}
                  onClick={() => handleNavigation(item.url)}
                  onMouseEnter={() => handleMouseEnter(item.url)}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {!isCollapsed && <span>{item.title}</span>}
                  {isCollapsed && !item.icon && (
                    <span className="text-xl">⋯</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      {/* Settings & Help Group */}
      {settingsHelpItem && (
        <SidebarGroup>
          {isCollapsed ? (
            <div className="px-2 py-2 text-xl">⋯</div>
          ) : (
            <div className="px-2 py-2 text-xs">Settings & Help</div>
          )}
          <SidebarMenu>
            {settingsHelpItem.items?.map((subItem) => {
              const active = isItemActive(subItem.url, subItem.isActive);
              return (
                <SidebarMenuItem key={subItem.title}>
                  <SidebarMenuButton
                    className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    tooltip={isCollapsed ? subItem.title : undefined}
                    variant={active ? "selected" : "default"}
                    onClick={() => handleNavigation(subItem.url)}
                    onMouseEnter={() => handleMouseEnter(subItem.url)}
                  >
                    {subItem.icon && <subItem.icon className="w-4 h-4" />}
                    {!isCollapsed && <span>{subItem.title}</span>}
                    {isCollapsed && !subItem.icon && (
                      <span className="text-xl">⋯</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  );
}

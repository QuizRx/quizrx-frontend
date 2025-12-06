"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import React, { useCallback, useTransition, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/core/components/ui/sidebar";

export function NavItems({
  sidebar,
}: {
  sidebar: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
    }[];
  }[];
}) {
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

  return (
    <SidebarGroup>
      <SidebarMenu>
        {sidebar.map((item) => {
          const hasItems = item.items && item.items.length > 0;
          const active = isItemActive(item.url, item.isActive);

          return hasItems ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={active}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const subActive = isItemActive(
                        subItem.url,
                        subItem.isActive
                      );
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuButton
                            variant={subActive ? "selected" : "default"}
                            onClick={() => handleNavigation(subItem.url)}
                            onMouseEnter={() => handleMouseEnter(subItem.url)}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                variant={active ? "selected" : "default"}
                onClick={() => handleNavigation(item.url)}
                onMouseEnter={() => handleMouseEnter(item.url)}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

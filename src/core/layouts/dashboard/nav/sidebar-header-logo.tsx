"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { ProjectLogo } from "@/core/components/ui/logo";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/core/components/ui/sidebar";
export function SidebarHeaderLogo() {
  const { push } = useRouter();
  return (
    <SidebarMenu onClick={() => push("/")} className="cursor-pointer">
      <SidebarMenuItem className="flex flex-row gap-2 items-center ">
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <ProjectLogo size={24} includeText />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

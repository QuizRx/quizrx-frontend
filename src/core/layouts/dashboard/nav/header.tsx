"use client";
import { SidebarTrigger } from "@/core/components/ui/sidebar";
import { NotificationIndicator } from "./notification";
import NavBreadCrumbs from "@/core/components/shared/nav/navigation-bread-crumbs";
import React from "react";
import { NavUser } from "./user";
import { useAuth } from "@/core/providers/auth";

const NavHeader = () => {
  const { user } = useAuth();
  return (
    <header className="flex flex-row h-20 w-full max-md:px-2 pr-6 shrink-0 items-center justify-between border-b">
      <section className="flex flex-row gap-2 max-md:gap-1 items-center">
        <SidebarTrigger className="" />
        <NavBreadCrumbs />
      </section>
      <section className="flex flex-row gap-4 max-md:gap-1 items-center">
        <NotificationIndicator />
        <NavUser
          user={{
            name: user?.name || "",
            avatar: user?.picture || "",
            email: user?.email || "",
          }}
        />
      </section>
    </header>
  );
};

export default NavHeader;

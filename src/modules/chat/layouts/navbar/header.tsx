"use client";
import NavBreadCrumbs from "@/core/components/shared/nav/navigation-bread-crumbs";
import { SidebarTrigger } from "@/core/components/ui/sidebar";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import { Map } from "lucide-react";
import { usePathname } from "next/navigation";
import { NotificationIndicator } from "@/core/layouts/dashboard/nav/notification";
import { NavUser } from "@/core/layouts/dashboard/nav/user";
import { useAuth } from "@/core/providers/auth";
import { Button } from "@/core/components/ui/button";

const ChatNavHeader = () => {
  const { user } = useAuth();
  const { toggleChatSidebar } = useChatSidebar();
  const pathname = usePathname();

  return (
    <header className="flex flex-row h-14 w-full bg-white/10  max-md:px-2 pr-6 items-center justify-between border-b  border-zinc-200 backdrop-blur-2xl sticky top-0 z-49 ">
      <section className="flex flex-row gap-2 max-md:gap-1 items-center">
        <SidebarTrigger className="" />
        <NavBreadCrumbs />
      </section>
      <section className="flex flex-row gap-4 max-md:gap-1 items-center">
        {/* Chat History Trigger Button */}
        {pathname === "/dashboard" && (
          <Button
            variant={"link"}
            onClick={toggleChatSidebar}
            className="text-black"
            size={"icon"}
          >
            <Map />
          </Button>
        )}
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

export default ChatNavHeader;

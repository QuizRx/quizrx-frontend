"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useIsLgScreen } from "@/core/hooks/use-is-lg-screen";

type ChatSidebarContextType = {
  isChatSidebarOpen: boolean;
  toggleChatSidebar: () => void;
  openChatSidebar: () => void;
  closeChatSidebar: () => void;
};

const ChatSidebarContext = createContext<ChatSidebarContextType | undefined>(
  undefined
);

export function ChatSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLgScreen = useIsLgScreen();
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);

  useEffect(() => {
    // In xl screens (1280px+): open sidebar by default on /dashboard route
    // In smaller screens: keep sidebar closed by default
    if (!isLgScreen) {
      setIsChatSidebarOpen(false);
    } else {
      setIsChatSidebarOpen(pathname === "/dashboard");
    }
  }, [pathname, isLgScreen]);

  const toggleChatSidebar = () => setIsChatSidebarOpen((prev) => !prev);
  const openChatSidebar = () => setIsChatSidebarOpen(true);
  const closeChatSidebar = () => setIsChatSidebarOpen(false);

  return (
    <ChatSidebarContext.Provider
      value={{
        isChatSidebarOpen,
        toggleChatSidebar,
        openChatSidebar,
        closeChatSidebar,
      }}
    >
      {children}
    </ChatSidebarContext.Provider>
  );
}

export function useChatSidebar() {
  const context = useContext(ChatSidebarContext);
  if (context === undefined) {
    throw new Error("useChatSidebar must be used within a ChatSidebarProvider");
  }
  return context;
}
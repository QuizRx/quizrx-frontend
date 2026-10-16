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

  // History starts collapsed on every screen size; the header's History
  // button reopens it.
  useEffect(() => {
    setIsChatSidebarOpen(false);
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
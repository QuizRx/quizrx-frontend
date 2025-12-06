"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface NotificationSidebarContextType {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const NotificationSidebarContext = createContext<NotificationSidebarContextType | undefined>(undefined);

export function NotificationSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <NotificationSidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar }}>
      {children}
    </NotificationSidebarContext.Provider>
  );
}

export function useNotificationSidebar() {
  const ctx = useContext(NotificationSidebarContext);
  if (!ctx) throw new Error("useNotificationSidebar must be used within a NotificationSidebarProvider");
  return ctx;
}
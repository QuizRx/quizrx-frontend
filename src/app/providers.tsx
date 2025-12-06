"use client";

import { Toaster } from "@/core/components/ui/toaster";
import { ApolloWrapper } from "@/core/providers/apollo-wrapper";
import { ThemeProvider } from "@/core/providers/theme-provider";
import { AuthProvider } from "@/core/providers/auth";
import { UserProvider } from "@/core/providers/user";
import { NotificationSideDrawer } from "@/core/components/ui/notification-side-drawer";
import { NotificationSidebarProvider } from "@/core/providers/notification-sidebar-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ApolloWrapper>
        <UserProvider>
          <Toaster />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <NotificationSidebarProvider>
              <section>{children}</section>
              <NotificationSideDrawer />
            </NotificationSidebarProvider>
          </ThemeProvider>
        </UserProvider>
      </ApolloWrapper>
    </AuthProvider>
  );
}

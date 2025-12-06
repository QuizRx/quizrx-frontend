import { Background } from "@/core/components/ui/background";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { SidebarProvider, SidebarInset } from "@/core/components/ui/sidebar";
import ChatNavHeader from "@/modules/chat/layouts/navbar/header";
import { ChatHistorySidebar } from "@/modules/chat/layouts/sidebar/chat-history";
import { AppSidebar } from "@/modules/chat/layouts/sidebar/dashboard";
import { ChatSidebarProvider } from "@/modules/chat/providers/chat-sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="m-0 flex flex-col flex-1 min-h-0">
          <ChatSidebarProvider>
            <ChatNavHeader />
            <ChatHistorySidebar />
            <div className="relative flex-1 min-h-0 overflow-hidden">
              {/* Optimized: Removed backdrop-blur and reduced opacity for better performance */}
              <Background
                className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center pointer-events-none opacity-30"
                image="/background/bg.svg"
              />
              <div className="relative z-10 h-full w-full bg-white/70">
                {children}
              </div>
            </div>
          </ChatSidebarProvider>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

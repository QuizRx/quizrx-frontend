import { Background } from "@/core/components/ui/background";
import ChatNavHeader from "@/modules/chat/layouts/navbar/header";
import { ChatHistorySidebar } from "@/modules/chat/layouts/sidebar/chat-history";
import { ChatSidebarProvider } from "@/modules/chat/providers/chat-sidebar";
import { FeedbackPrompt } from "@/modules/feedback/components/feedback-prompt";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[var(--background)]">
      <ChatSidebarProvider>
        <ChatNavHeader />
        <ChatHistorySidebar />
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <Background
            className="absolute inset-0 z-0 bg-no-repeat bg-cover bg-center pointer-events-none opacity-30"
            image="/background/bg.svg"
          />
          <div className="relative z-10 h-full w-full">{children}</div>
        </div>
        <FeedbackPrompt />
      </ChatSidebarProvider>
    </div>
  );
}

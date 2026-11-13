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
        <div className="relative flex-1 min-h-0 overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.75),transparent_65%)]">
          {children}
        </div>
        <FeedbackPrompt />
      </ChatSidebarProvider>
    </div>
  );
}

"use client";

import { ChatInput } from "@/modules/chat/layouts/chat/chat-input";
import { WelcomeHeader } from "@/modules/chat/layouts/chat/welcome-header";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import { useEffect, useRef } from "react";
import { useChat } from "@/modules/chat/store/chat-store";
import { useSplitView } from "@/modules/chat/store/split-view-store";
import { ChatLayout } from "@/modules/chat/layouts/chat/chat";
import { useSearchParams } from "next/navigation";
import AvatarChat from "@/modules/chat/layouts/chat/avatar-chat";
import { useAvatarStore } from "@/modules/chat/store/avatar-store";

export default function ChatPage() {
  const { isChatSidebarOpen } = useChatSidebar();
  const { isChatStarted, messages, loadThread } = useChat();
  const { isReviewMode } = useSplitView();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { isAvatarVisible, hideAvatar } = useAvatarStore();
  // Check for thread parameter and load thread if present
  useEffect(() => {
    const threadId = searchParams.get("thread");
    if (threadId) {
      loadThread(threadId);
      // Clean up the URL by removing the query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("thread");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, loadThread]);

  // Auto-scroll to bottom when new messages are added (only when not in review mode)
  useEffect(() => {
    if (messages.length > 0 && !isReviewMode) {
      // Only auto-scroll when not in review mode to avoid interfering with split view
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }

      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages.length, isReviewMode]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Main content wrapper with adjusted padding */}
      <div
        className={`flex flex-col flex-1 min-h-0 transition-all duration-500 ${
          isChatSidebarOpen ? "lg:pr-[300px]" : ""
        }`}
      >
        {/* Scrollable content area - with bottom padding for input */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-hidden px-2 pt-2 min-h-0 ${
            isReviewMode ? "overflow-hidden" : "overflow-y-auto"
          }`}
          style={{
            // Add padding bottom to account for input height + spacing
            // Mobile: ~100px, Desktop: ~80px
            paddingBottom:
              "max(100px, calc(80px + env(safe-area-inset-bottom, 0px)))",
          }}
        >
          <div className="flex flex-col items-center overflow-x-hidden">
            {isChatStarted ? (
              <div
                className={`w-full ${
                  isReviewMode ? "h-full" : "max-w-5xl"
                } mx-auto pb-4`}
              >
                {/* Chat messages will go here */}
                <AvatarChat isOpen={isAvatarVisible} onClose={hideAvatar} />
                <ChatLayout />
                {/* Invisible div to mark the end of messages - only when not in review mode */}
                {!isReviewMode && <div ref={messagesEndRef} />}
              </div>
            ) : (
              <WelcomeHeader />
            )}
          </div>
        </div>
      </div>

      {/* Chat Input - absolute positioned at bottom, outside flex container */}
      <div
        className={`absolute bottom-0 left-0 right-0 backdrop-blur-sm px-2 md:px-10 pb-2 pt-2 z-50 transition-all duration-500 ${
          isChatSidebarOpen ? "lg:right-[300px]" : ""
        }`}
        style={{
          // Handle mobile keyboard on Android
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0.5rem))",
        }}
      >
        <div className="w-full max-w-5xl mx-auto">
          <ChatInput className="w-full" />
        </div>
      </div>
    </div>
  );
}

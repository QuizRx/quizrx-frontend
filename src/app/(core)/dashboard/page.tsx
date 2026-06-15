"use client";

import { ChatPageShell } from "@/modules/chat/layouts/chat/chat-page-shell";
import { useChatStore } from "@/modules/chat/store/chat-store";
import { useEffect } from "react";

export default function DashboardChatPage() {
  const resetChat = useChatStore((s) => s.resetChat);
  const currentThreadId = useChatStore((s) => s.currentThread?._id ?? null);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isLoading = useChatStore((s) => s.isLoading);
  const messageCount = useChatStore((s) => s.messages.length);

  // /dashboard represents a fresh "new chat". If the user navigates here from
  // an open thread, reset the store so the welcome screen is shown. Never
  // reset while a message/thread creation is in flight so a freshly-created
  // chat (which momentarily has currentThread set on /dashboard right before
  // router.push to /dashboard/chat/[id] completes) keeps its streaming state.
  useEffect(() => {
    if (isStreaming || isLoading) return;
    if (messageCount > 0) return;
    if (currentThreadId) {
      resetChat();
    }
  }, [currentThreadId, isStreaming, isLoading, messageCount, resetChat]);

  return <ChatPageShell showWelcomeWhenEmpty />;
}

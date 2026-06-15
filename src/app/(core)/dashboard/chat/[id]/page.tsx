"use client";

import { ChatPageShell } from "@/modules/chat/layouts/chat/chat-page-shell";
import { useChatStore } from "@/modules/chat/store/chat-store";
import { useAuth } from "@/core/providers/auth";
import { toast } from "@/core/hooks/use-toast";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef } from "react";

type ChatThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default function ChatThreadPage({ params }: ChatThreadPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuth();
  const loadThread = useChatStore((s) => s.loadThread);
  const resetChat = useChatStore((s) => s.resetChat);
  const currentThreadId = useChatStore((s) => s.currentThread?._id ?? null);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const lastLoadedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (!token) return;
    // If we are mid-stream on this exact thread (e.g. URL was just pushed
    // by createThread), do not reset the in-progress state.
    if (isStreaming && currentThreadId === id) {
      lastLoadedIdRef.current = id;
      return;
    }
    if (lastLoadedIdRef.current === id) return;
    lastLoadedIdRef.current = id;

    let cancelled = false;
    (async () => {
      const ok = await loadThread(id);
      if (cancelled) return;
      if (!ok) {
        toast({
          title: "Chat not found",
          description:
            "We couldn't load that chat. It may have been deleted or does not belong to your account.",
        });
        resetChat();
        router.replace("/dashboard");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, token, isStreaming, currentThreadId, loadThread, resetChat, router]);

  return <ChatPageShell />;
}

"use client";

import { ChatPageShell } from "@/modules/chat/layouts/chat/chat-page-shell";

export default function BetaChatPage() {
  // Important: we do NOT reset the extraction-quiz session on mount.
  // The session persists across page revisits so that revisiting /chat
  // keeps your prior questions in view. A new session is created only
  // when the user explicitly clicks "New session" in the sidebar.
  return <ChatPageShell showWelcomeWhenEmpty />;
}

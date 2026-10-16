"use client";
import { PanelLeftClose, PanelLeftOpen, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/components/ui/button";
import { ProjectLogo } from "@/core/components/ui/logo";
import { NavUser } from "@/core/layouts/dashboard/nav/user";
import { useAuth } from "@/core/providers/auth";
import { useIsAdmin } from "@/modules/admin/hooks/use-is-admin";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";

const ChatNavHeader = () => {
  const { user } = useAuth();
  const { isChatSidebarOpen, toggleChatSidebar } = useChatSidebar();
  const { isAdmin } = useIsAdmin();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-2 border-b border-zinc-200/70 bg-[var(--background)]/85 px-2 backdrop-blur-md sm:px-4 md:px-5">
      <section className="flex min-w-0 items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleChatSidebar}
          aria-label={isChatSidebarOpen ? "Hide history" : "Show history"}
          aria-expanded={isChatSidebarOpen}
          className="h-9 gap-2 px-2 text-[var(--primary)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
        >
          {isChatSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
          <span className="hidden text-sm font-medium md:inline">History</span>
        </Button>
        <Link href="/chat" className="flex min-w-0 items-center gap-2">
          <ProjectLogo size={22} className="px-0" />
          <span className="text-lg font-semibold text-[var(--primary)]">QuizRx</span>
          <span aria-hidden className="hidden h-5 w-px bg-zinc-300 min-[420px]:block" />
          <span className="hidden truncate text-sm font-medium text-zinc-600 min-[420px]:inline">
            Calcium &amp; Bone
          </span>
        </Link>
      </section>

      <section className="flex shrink-0 items-center gap-2 sm:gap-3">
        {isAdmin && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-3 py-1 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
            title="Admin panel"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
        )}
        <span className="inline-flex items-center rounded-full bg-[var(--accent-amber,#E0B16A)]/30 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
          Beta
        </span>
        <NavUser
          user={{
            name: user?.name || "",
            avatar: user?.picture || "",
            email: user?.email || "",
          }}
        />
      </section>
    </header>
  );
};

export default ChatNavHeader;

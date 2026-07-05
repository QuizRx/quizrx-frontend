"use client";
import { Menu, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/components/ui/button";
import { ProjectLogo } from "@/core/components/ui/logo";
import { NavUser } from "@/core/layouts/dashboard/nav/user";
import { useAuth } from "@/core/providers/auth";
import { useIsAdmin } from "@/modules/admin/hooks/use-is-admin";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";

const ChatNavHeader = () => {
  const { user } = useAuth();
  const { toggleChatSidebar } = useChatSidebar();
  const { isAdmin } = useIsAdmin();

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-zinc-200/70 bg-[var(--background)]/80 px-4 backdrop-blur-md md:px-6">
      <section className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChatSidebar}
          aria-label="Toggle chat history"
          className="text-[var(--primary)]"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          href="/chat"
          className="flex items-center gap-2 text-lg font-semibold text-[var(--primary)]"
        >
          <ProjectLogo size={26} />
        </Link>
      </section>

      <section className="flex items-center gap-3">
        <Link
          href="/about-us"
          className="hidden text-sm font-medium text-zinc-700 transition-colors hover:text-[var(--primary)] md:inline-flex"
        >
          About
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-3 py-1 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
            title="Admin panel"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin
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

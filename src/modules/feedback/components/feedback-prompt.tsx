"use client";

import { Button } from "@/core/components/ui/button";
import { useAuth } from "@/core/providers/auth";
import { cn } from "@/core/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquareHeart, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedbackForm } from "./feedback-form";
import {
  ensureFeedbackPromptInitialized,
  markFeedbackPromptShown,
  markFeedbackPromptSnoozed,
  shouldShowFeedbackPrompt,
} from "../utils/prompt-storage";
import { useAnsweredCount } from "@/modules/extraction-quiz";

// Re-check cadence while the user is active.
const POLL_INTERVAL_MS = 60 * 1000;

const HIDE_ON_ROUTES = ["/auth", "/login", "/signup"];

export function FeedbackPrompt() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const answeredCount = useAnsweredCount();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isOnHiddenRoute = HIDE_ON_ROUTES.some((prefix) =>
    pathname?.startsWith(prefix)
  );
  const isOnChat = pathname?.startsWith("/chat") ?? false;
  const hasEngaged = answeredCount > 0;

  useEffect(() => {
    if (!isAuthenticated || isLoading || isOnHiddenRoute) return;
    if (!isOnChat || !hasEngaged) return;

    ensureFeedbackPromptInitialized();

    const evaluate = () => {
      if (shouldShowFeedbackPrompt()) {
        setOpen(true);
        markFeedbackPromptShown();
      }
    };

    const initial = window.setTimeout(evaluate, 1500);
    const interval = window.setInterval(evaluate, POLL_INTERVAL_MS);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [isAuthenticated, isLoading, isOnHiddenRoute, isOnChat, hasEngaged]);

  useEffect(() => {
    if (isOnHiddenRoute || !isOnChat) {
      setOpen(false);
      setExpanded(false);
    }
  }, [isOnHiddenRoute, isOnChat]);

  const handleDismiss = () => {
    markFeedbackPromptSnoozed();
    setOpen(false);
    setExpanded(false);
  };

  const handleSuccess = () => {
    setOpen(false);
    setExpanded(false);
  };

  if (!isAuthenticated || isOnHiddenRoute || !isOnChat) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className={cn(
            "fixed z-[60] bottom-4 right-4 max-w-[92vw]",
            expanded ? "w-[380px]" : "w-[320px]"
          )}
        >
          <div className="rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-300/40 overflow-hidden">
            <div className="flex items-start justify-between gap-2 px-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <MessageSquareHeart className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    Got 30 seconds?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tell us how QuizRx is doing for you.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss feedback prompt"
                className="text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!expanded ? (
              <div className="flex items-center justify-end gap-2 p-4 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                >
                  Maybe later
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setExpanded(true)}
                >
                  Give feedback
                </Button>
              </div>
            ) : (
              <div className="p-4 pt-3">
                <FeedbackForm
                  variant="compact"
                  showCancel
                  onCancel={handleDismiss}
                  onSuccess={handleSuccess}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

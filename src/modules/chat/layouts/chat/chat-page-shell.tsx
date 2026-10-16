"use client";

import { cn } from "@/core/lib/utils";
import { useChatSidebar } from "@/modules/chat/providers/chat-sidebar";
import { ModeSwitcher } from "@/modules/extraction-quiz/components/mode-switcher";
import { useExtractionQuizStore } from "@/modules/extraction-quiz/store/extraction-quiz-store";
import type { LearningExperience } from "@/modules/extraction-quiz/types";
import { PracticeStudioView } from "./practice-studio-view";
import { ReasoningView } from "./reasoning-view";
import { TutorView } from "./tutor-view";

// One compact mode switcher on top; the active mode owns the rest of the page.
// All three views stay mounted so drafts, open questions, and scroll positions
// survive switching modes.
export function ChatPageShell() {
  const { isChatSidebarOpen } = useChatSidebar();
  const experience = useExtractionQuizStore((s) => s.experience);

  const panel = (mode: LearningExperience) =>
    cn("absolute inset-0", experience !== mode && "hidden");

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-[padding] duration-300",
        isChatSidebarOpen && "lg:pl-[300px]"
      )}
    >
      <div className="flex shrink-0 justify-center px-3 pb-1 pt-3 sm:pt-4">
        <ModeSwitcher />
      </div>
      <div className="relative min-h-0 flex-1">
        <div className={panel("tutor")}>
          <TutorView active={experience === "tutor"} />
        </div>
        <div className={panel("practice_studio")}>
          <PracticeStudioView active={experience === "practice_studio"} />
        </div>
        <div className={panel("reasoning")}>
          <ReasoningView active={experience === "reasoning"} />
        </div>
      </div>
    </div>
  );
}

"use client";

// import { MovingBorders } from "@/core/components/ui/moving-borders";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Button } from "@/core/components/ui/button";
import { useStreamingAvatarContext } from "@/modules/avatars/providers/streaming-avatar";
import useStreamingAvatarSession from "@/modules/avatars/hooks/use-streaming-avatar-session";
import useChapterSelection from "@/modules/avatars/hooks/use-chapter-selection";

export default function MainMenu() {
  const { sessionState } = useStreamingAvatarContext();
  const languages = ["English"];
  const [language, setLanguage] = useState("English");
  const [isOpen, setIsOpen] = useState(false);
  const { selectedChapter, selectedKnowledgeId } = useChapterSelection();
  const { startSession } = useStreamingAvatarSession();

  const handleStartChat = () => {
    console.log("starting session");
    startSession({ 
      mode: 'chapter', 
      chapterKnowledgeId: selectedKnowledgeId 
    });
    console.log("session started");
  };

  return (
    <div className="text-white flex justify-center cursor-pointer bg-[#181731] h-auto w-fit mx-auto p-2 rounded-md border border-primary">
       <div className="mt-1.5">{selectedChapter || "No chapter selected"} </div>
      <div className="relative">
        {/* Language dropdown using shadcn Dropdown Menu */}

        <DropdownMenu onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between rounded-l-full px-4 py-2 text-sm font-medium focus:outline-none">
              <span>{language}</span>
              <ChevronDown
                className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-full min-w-[8rem] bg-card z-50"
          >
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang}
                className={cn(
                  "cursor-pointer",
                  language === lang && "bg-primary/20"
                )}
                onClick={() => setLanguage(lang)}
              >
                {lang}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button onClick={handleStartChat}>Start Session</Button>
    </div>
  );
}

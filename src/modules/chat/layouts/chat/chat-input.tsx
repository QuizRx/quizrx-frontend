"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  ArrowUp,
  Image,
  Video,
  FileAudio,
  X,
  File,
  AudioLines,
  Lightbulb,
  FileText,
  Loader2,
  Square,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { Badge } from "@/core/components/ui/badge";
import { AutoResizeTextarea } from "@/core/components/ui/auto-resize-text-area";
import { cn } from "@/core/lib/utils";
import { useChat } from "../../store/chat-store";
import { useTextToSpeech } from "../../../../core/hooks/use-tts";
import { formatQuestionForSpeech } from "../../utils/formatter/question-formatter";
import { MessageType } from "../../types/api/messages";
import { useAvatarStore } from "../../store/avatar-store";
import { UserCircle } from "lucide-react";

// Type definitions
export type ChatInputFileType = {
  id: number;
  name: string;
  type: string;
  size: string;
  icon: React.ElementType;
  file: File;
};

export type ChatInputProps = {
  placeholder?: string;
  initialValue?: string;
  className?: string;
  elevenLabsApiKey?: string; // Add API key prop
};

export function ChatInput({
  placeholder = "How Can I help you today?",
  initialValue = "",
  className = "",
  elevenLabsApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "", // Default to env variable
}: ChatInputProps) {
  const { isLoading, handleSubmit, isChatStarted, messages } = useChat();
  const {
    speak,
    stop,
    isPlaying,
    isLoading: audioLoading,
    error,
  } = useTextToSpeech();
  const { isAvatarVisible, toggleAvatar, showAvatarWithContext } =
    useAvatarStore();

  // Helper function to get current question context from messages
  const getCurrentQuestionContext = () => {
    // Find the latest question message
    const questionMessages = messages.filter(
      (message) => message.senderType === "AI" && message.questions
    );

    if (questionMessages.length === 0) return null;

    const latestQuestionMessage = questionMessages[questionMessages.length - 1];
    const qAny = latestQuestionMessage.questions as any;
    const question = Array.isArray(qAny) ? qAny[0] : qAny;
    if (!question) return null;

    // Find any review concept messages
    const reviewConceptStartIndex = messages.findIndex(
      (message) =>
        message.senderType === "USER" &&
        message.content?.includes(
          "Help me understand the question and provided feedback"
        )
    );

    const reviewContent =
      reviewConceptStartIndex !== -1
        ? messages
            .slice(reviewConceptStartIndex)
            .filter(
              (msg) => msg.senderType === "AI" && msg.messageType === "ANSWER"
            )
            .map((msg) => msg.content)
            .join(" ")
        : undefined;

    return {
      question: question.question,
      answer: question.answer,
      explanation: question.explanation,
      selectedAnswer:
        question.userChoice !== null
          ? String.fromCharCode(65 + (question.userChoice as number))
          : undefined,
      isCorrect: question.isUserAnswerCorrect,
      reviewContent,
    };
  };

  // Enhanced avatar toggle with context
  const handleAvatarToggle = () => {
    if (isAvatarVisible) {
      toggleAvatar();
    } else {
      const context = getCurrentQuestionContext();
      if (context) {
        showAvatarWithContext(context);
      } else {
        toggleAvatar();
      }
    }
  };

  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [attachedFiles, setAttachedFiles] = useState<ChatInputFileType[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("Chat GPT 4");
  const [reasoningEnabled, setReasoningEnabled] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLoadingRef = useRef<boolean>(isLoading);

  // Effect to focus textarea when response completes
  useEffect(() => {
    if (prevLoadingRef.current === true && isLoading === false) {
      // Try desktop textarea first, then mobile
      const desktopTextarea = document.getElementById(
        "chat-input-textarea"
      ) as HTMLTextAreaElement;
      const mobileTextarea = document.getElementById(
        "chat-input-textarea-mobile"
      ) as HTMLTextAreaElement;

      const textarea = desktopTextarea?.offsetParent
        ? desktopTextarea
        : mobileTextarea;
      if (textarea) {
        textarea.focus();
      }
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading]);

  // Effect to handle mobile keyboard and viewport changes
  useEffect(() => {
    const handleResize = () => {
      // Force scroll to input when keyboard appears on mobile
      if (window.innerWidth <= 768 && containerRef.current) {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 100);
      }
    };

    const handleFocus = () => {
      // Scroll the input into view when it gains focus on mobile
      if (window.innerWidth <= 768 && containerRef.current) {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 300);
      }
    };

    // Add listeners
    window.addEventListener("resize", handleResize);

    const textareas = document.querySelectorAll('[id^="chat-input-textarea"]');
    textareas.forEach((textarea) => {
      textarea.addEventListener("focus", handleFocus as any);
    });

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      textareas.forEach((textarea) => {
        textarea.removeEventListener("focus", handleFocus as any);
      });
    };
  }, []);

  // Function to find and read the most recent question
  const handleTextToSpeech = async () => {
    if (!elevenLabsApiKey) {
      console.error("ElevenLabs API key is required");
      return;
    }

    if (isPlaying) {
      stop();
      return;
    }

    // Find the most recent message with questions
    const questionMessage = [...messages]
      .reverse()
      .find(
        (message: any) =>
          message.messageType !== MessageType.ANSWER &&
          message.questions &&
          message.questions.length > 0
      );

    if (!questionMessage || !questionMessage.questions) {
      console.log("No questions found to read");
      return;
    }

    const speechText = formatQuestionForSpeech(
      Array.isArray(questionMessage.questions)
        ? questionMessage.questions
        : [questionMessage.questions]
    );

    await speak(speechText, elevenLabsApiKey, {
      voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.2,
      useSpeakerBoost: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    // Shift+Enter: allow line break
    if (e.key === "Enter" && e.shiftKey) {
      // Let the default behavior happen (new line)
      return;
    }

    // Enter without Shift: submit
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmitInternal(e);
    }
  };

  const handleSubmitInternal = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (isLoading) return;

    handleSubmit(inputValue);
    setInputValue("");
    setAttachedFiles([]);
  };

  const handleInputChange = (value: string): void => {
    setInputValue(value);
  };

  const handleFileButtonClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      const filteredFiles = selectedFiles.filter(
        (selectedFile) =>
          !attachedFiles.some(
            (attachedFile) => attachedFile.name === selectedFile.name
          )
      );

      if (filteredFiles.length === 0) {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const newFiles: ChatInputFileType[] = filteredFiles.map((file, index) => {
        const getFileIcon = (): React.ElementType => {
          const extension = file.name.split(".").pop()?.toLowerCase() || "";
          if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension))
            return Image;
          if (["mp4", "mov", "avi", "webm"].includes(extension)) return Video;
          if (["mp3", "wav", "ogg", "m4a"].includes(extension))
            return FileAudio;
          if (["pdf"].includes(extension)) return File;
          return FileText;
        };

        return {
          id: Date.now() + index,
          name: file.name,
          type: file.name.split(".").pop()?.toLowerCase() || "",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          icon: getFileIcon(),
          file: file,
        };
      });

      setAttachedFiles([...attachedFiles, ...newFiles]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAttachedFile = (id: number, e: React.MouseEvent): void => {
    e.stopPropagation();
    setAttachedFiles(attachedFiles.filter((file) => file.id !== id));
  };

  const toggleReasoning = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setReasoningEnabled(!reasoningEnabled);
  };

  const focusTextarea = (): void => {
    const textarea = document.getElementById(
      "chat-input-textarea"
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("click", focusTextarea);
    }
    return () => {
      if (container) {
        container.removeEventListener("click", focusTextarea);
      }
    };
  }, []);

  const buttonStyles =
    "rounded-full h-10 flex-shrink-0 flex items-center justify-center";
  const iconButtonStyles = cn(buttonStyles, "w-10");

  return (
    <div className={cn("w-full max-w-full overflow-x-hidden", className)}>
      {/* Display audio error if any */}
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm break-words">
          Audio Error: {error}
        </div>
      )}

      <form
        onSubmit={handleSubmitInternal}
        className="bg-card rounded-full md:rounded-xl p-1 border border-zinc-200 focus-within:ring-2 focus-within:ring-primary/10 focus-within:ring-offset-0 w-full max-w-full min-w-0"
      >
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 max-w-full overflow-x-hidden">
            {attachedFiles.map((file) => (
              <Badge
                key={file.id}
                variant="outline"
                className="flex items-center gap-1 py-1 pl-2 pr-1 max-w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <file.icon className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="text-xs truncate max-w-[80px] sm:max-w-[100px]">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleRemoveAttachedFile(file.id, e)}
                  className="h-4 w-4 ml-1 hover:bg-muted"
                  disabled={isLoading}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <div
          ref={containerRef}
          className={cn(
            "rounded-full md:rounded-lg bg-background/10 border border-muted/30 focus-within:border-primary/50 px-2 sm:px-3 md:px-3 py-1.5 sm:py-2 cursor-text max-w-full overflow-x-hidden transition-all duration-300",
            isLoading && "opacity-70"
          )}
        >
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-col w-full">
            <AutoResizeTextarea
              id="chat-input-textarea"
              placeholder={
                isLoading
                  ? "Waiting for response..."
                  : isChatStarted
                  ? "Reply...."
                  : placeholder
              }
              className="w-full max-w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none break-words mb-2 leading-6 max-h-[200px]"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1 min-h-[36px] sticky bottom-0 bg-transparent max-w-full">
              <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        iconButtonStyles,
                        "bg-card hover:bg-card/70"
                      )}
                      onClick={handleFileButtonClick}
                      disabled={isLoading}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>Add Files</TooltipContent>
                </Tooltip>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                  disabled={isLoading}
                />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={reasoningEnabled ? "default" : "outline"}
                      className={cn(
                        buttonStyles,
                        "gap-1 text-xs sm:text-sm px-2 sm:px-3",
                        reasoningEnabled
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-card hover:bg-card/70"
                      )}
                      onClick={toggleReasoning}
                      disabled={isLoading}
                    >
                      <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Recommendations</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>
                    {reasoningEnabled
                      ? "Disable Recommendations"
                      : "Enable Recommendations"}
                  </TooltipContent>
                </Tooltip>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="cursor-default flex-shrink-0"
                >
                  {/* Model selection commented out as in original */}
                </div>
              </div>

              <div className="ml-auto flex gap-1 sm:gap-2 md:gap-3 mt-2 sm:mt-0 flex-shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        iconButtonStyles,
                        "bg-card hover:bg-card/70",
                        (isPlaying || audioLoading) && "bg-primary/20"
                      )}
                      onClick={handleTextToSpeech}
                      disabled={isLoading || audioLoading || !elevenLabsApiKey}
                    >
                      {audioLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isPlaying ? (
                        <Square className="h-5 w-5" />
                      ) : (
                        <AudioLines className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>
                    {audioLoading
                      ? "Loading audio..."
                      : isPlaying
                      ? "Stop reading"
                      : "Read question aloud"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        iconButtonStyles,
                        "bg-primary hover:bg-primary/90"
                      )}
                      disabled={
                        isLoading ||
                        (!inputValue.trim() && attachedFiles.length === 0)
                      }
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                      ) : (
                        <ArrowUp className="h-5 w-5 text-primary-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>
                    {isLoading ? "Loading..." : "Submit"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        iconButtonStyles,
                        isAvatarVisible
                          ? "bg-primary text-primary-foreground"
                          : "bg-card hover:bg-card/70",
                        "rounded-full h-10 w-10 flex items-center justify-center"
                      )}
                      onClick={handleAvatarToggle}
                      aria-label={
                        isAvatarVisible ? "Hide Avatar" : "Show Avatar"
                      }
                    >
                      <UserCircle className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>
                    {isAvatarVisible ? "Hide Avatar" : "Show Avatar"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="flex md:hidden items-center gap-1 sm:gap-2">
            {/* Add Files button - always visible on the left */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center bg-card hover:bg-card/70 shrink-0"
                  onClick={handleFileButtonClick}
                  disabled={isLoading}
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={12}>Add Files</TooltipContent>
            </Tooltip>

            {/* Textarea in the center */}
            <AutoResizeTextarea
              id="chat-input-textarea-mobile"
              placeholder=""
              className="flex-1 min-w-0 bg-transparent text-foreground focus:outline-none leading-5 py-1.5 break-words max-h-[120px] text-sm"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            {/* Right side buttons - all hide when user is typing */}
            {!inputValue.trim() && (
              <>
                {/* Recommendations button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant={reasoningEnabled ? "default" : "outline"}
                      className={cn(
                        "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0",
                        reasoningEnabled
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-card hover:bg-card/70"
                      )}
                      onClick={toggleReasoning}
                      disabled={isLoading}
                    >
                      <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>
                    {reasoningEnabled ? "Disable" : "Enable"} Recommendations
                  </TooltipContent>
                </Tooltip>

                {/* Avatar button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant={isAvatarVisible ? "default" : "outline"}
                      className={cn(
                        "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0",
                        isAvatarVisible
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "bg-card hover:bg-card/70"
                      )}
                      onClick={handleAvatarToggle}
                      disabled={isLoading}
                    >
                      <UserCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>
                    {isAvatarVisible ? "Hide Avatar" : "Show Avatar"}
                  </TooltipContent>
                </Tooltip>

                {/* Audio button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shrink-0 bg-card hover:bg-card/70",
                        (isPlaying || audioLoading) && "bg-primary/20"
                      )}
                      onClick={handleTextToSpeech}
                      disabled={isLoading || audioLoading || !elevenLabsApiKey}
                    >
                      {audioLoading ? (
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      ) : isPlaying ? (
                        <Square className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      ) : (
                        <AudioLines className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={12}>
                    {audioLoading
                      ? "Loading..."
                      : isPlaying
                      ? "Stop"
                      : "Read aloud"}
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center bg-primary hover:bg-primary/90 shrink-0"
              disabled={
                isLoading || (!inputValue.trim() && attachedFiles.length === 0)
              }
              onClick={(e) => e.stopPropagation()}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground animate-spin" />
              ) : (
                <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
              )}
            </Button>

            {/* Hidden file input for mobile */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              disabled={isLoading}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

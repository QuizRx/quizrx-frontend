import Image from "next/image";
import useStreamingAvatarSession from "@/modules/avatars/hooks/use-streaming-avatar-session";
import {
  StreamingAvatarProvider,
  useStreamingAvatarContext,
} from "@/modules/avatars/providers/streaming-avatar";
import { StreamingAvatarSessionState } from "@/modules/avatars/types/streaming-avatar";

import AvatarVideo from "@/modules/avatars/components/interact-ui/avatar-video";
import { useUnmount } from "ahooks";
import Loading from "@/modules/avatars/components/loading";
import { cn } from "@/core/lib/utils";
import { useState } from "react";
import { useEffect } from "react";
import { useAvatarStore } from "../../store/avatar-store";
import { useChatStore } from "../../store/chat-store";
import { SenderType } from "../../types/api/messages";
import useVoiceChat from "@/modules/avatars/hooks/use-voice-chat";
import useTextChat from "@/modules/avatars/hooks/use-text-chat";
import { Mic, MicOff, Expand, Minimize2, X, History } from "lucide-react";
import StreamMenu from "@/modules/avatars/components/interact-ui/stream-menu";
import MainMenu from "@/modules/avatars/components/interact-ui/main-menu";

function InteractiveLayout() {
  // Use the unified useStreamingAvatarSession
  const { stopSession, startSession, speak } = useStreamingAvatarSession();
  const { sessionState, avatarRef, stream } = useStreamingAvatarContext();
  const { setTalkFunction, isAvatarVisible, hideAvatar } = useAvatarStore();
  const { messages, currentThread } = useChatStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Voice chat functionality
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    isMuted,
    unmuteVoiceChat,
    muteVoiceChat,
    startVoiceChat,
    isReceivingAudio,
  } = useVoiceChat();

  // Text chat functionality
  const { sendMessage } = useTextChat();

  // Enhanced debug logging for reliability tracking
  useEffect(() => {
    console.log("🔍 Avatar State Change:", {
      timestamp: new Date().toISOString(),
      sessionState,
      isVoiceChatActive,
      isMuted,
      isReceivingAudio,
      messagesCount: messages?.length || 0,
      currentThreadId: currentThread?._id || "none",
      avatarExists: !!avatarRef?.current,
      hasQuestions: messages?.some((m) => m.questions),
    });
  }, [
    sessionState,
    isVoiceChatActive,
    isMuted,
    isReceivingAudio,
    messages,
    currentThread,
    avatarRef,
  ]);

  // Connection health check
  useEffect(() => {
    if (sessionState === StreamingAvatarSessionState.CONNECTED) {
      // Check if avatar is responsive after 10 seconds
      const healthCheck = setTimeout(() => {
        if (!isVoiceChatActive) {
          console.log(
            "⚠️ Avatar connected but voice chat not active - attempting recovery"
          );
          startVoiceChat().catch((err) => {
            console.error("Recovery voice chat failed:", err);
          });
        }
      }, 10000);

      return () => clearTimeout(healthCheck);
    }
  }, [sessionState, isVoiceChatActive, startVoiceChat]);

  useUnmount(() => {
    console.log("🧹 Cleaning up avatar component");
    stopSession();
    setTalkFunction(null); // Clear the talk function when component unmounts
  });

  // Register the speak function with the avatar store
  useEffect(() => {
    setTalkFunction(speak);
    return () => setTalkFunction(null);
  }, [speak, setTalkFunction]); // Create comprehensive thread knowledge base with full question data
  const createThreadKnowledgeBase = () => {
    if (!messages || messages.length === 0) {
      return "You are an endocrinology expert ready to help with medical questions and explanations.";
    }

    let knowledgeBase =
      "You are an endocrinology expert. Here is the complete conversation thread with all question details:\n\n";

    messages.forEach((message, index) => {
      // Add conversation flow
      if (message.senderType === SenderType.USER) {
        knowledgeBase += `User Message: ${message.content}\n`;
      } else if (message.senderType === SenderType.AI) {
        knowledgeBase += `AI Response: ${message.content}\n`;
      }

      // Add comprehensive question data if present
      if (
        message.questions &&
        Array.isArray(message.questions) &&
        message.questions.length > 0
      ) {
        const q = message.questions[0];

        knowledgeBase += `\n=== QUESTION ${index + 1} DETAILS ===\n`;
        knowledgeBase += `Topic: ${q.topic || "General"}\n`;
        knowledgeBase += `Sub-topic: ${q.sub_topic || "N/A"}\n`;
        knowledgeBase += `Level: ${q.level || "N/A"}\n`;
        knowledgeBase += `Question Type: ${
          q.question_type || "Multiple Choice"
        }\n\n`;

        knowledgeBase += `Question: ${q.question}\n\n`;

        // Add all answer choices
        if (q.choices && q.choices.length > 0) {
          knowledgeBase += `Answer Choices:\n`;
          q.choices.forEach((choice, choiceIndex) => {
            const letter = String.fromCharCode(65 + choiceIndex); // A, B, C, D...
            knowledgeBase += `${letter}) ${choice}\n`;
          });
          knowledgeBase += `\n`;
        }

        knowledgeBase += `Correct Answer: ${q.answer}\n`;

        // User's performance
        if (q.userChoice !== undefined) {
          const userChoiceLetter =
            q.choices && q.choices.length > 0
              ? String.fromCharCode(65 + q.userChoice)
              : q.userChoice.toString();
          const userChoiceText =
            q.choices && q.choices[q.userChoice]
              ? q.choices[q.userChoice]
              : "Unknown";

          knowledgeBase += `User Selected: ${userChoiceLetter}) ${userChoiceText}\n`;
          knowledgeBase += `User Performance: ${
            q.isUserAnswerCorrect ? "CORRECT ✓" : "INCORRECT ✗"
          }\n`;

          if (q.timeSpent) {
            knowledgeBase += `Time Spent: ${q.timeSpent} seconds\n`;
          }
        }

        // Detailed explanation
        if (q.explanation) {
          let explanationText = "";
          if (typeof q.explanation === "string") {
            explanationText = q.explanation;
          } else {
            explanationText = `Correct answer: ${q.explanation.correct_answer.explanation}`;
          }
          knowledgeBase += `\nDetailed Explanation: ${explanationText}\n`;
        }

        knowledgeBase += `==============================\n\n`;
      } else {
        knowledgeBase += `\n`;
      }
    });

    // Get the most recent question for context
    const lastMessage = messages[messages.length - 1];
    const hasRecentQuestion = lastMessage?.questions;

    if (hasRecentQuestion) {
      knowledgeBase += `\n🎯 INSTRUCTION: You have access to the complete conversation history including questions, answers, and user performance. `;
      knowledgeBase += `Start with a brief greeting acknowledging that you can see their question details and performance. `;
      knowledgeBase += `Ask how you can help them understand the topic better. Be ready to explain concepts, `;
      knowledgeBase += `clarify why answers are correct/incorrect, provide additional context, or answer follow-up questions. `;
      knowledgeBase += `Be conversational and educational.`;
    } else {
      knowledgeBase += `\n🎯 INSTRUCTION: Greet the user warmly and offer to help with endocrinology questions.`;
    }

    return knowledgeBase;
  };

  // Start session with thread context
  useEffect(() => {
    // Create the thread knowledge base
    const dynamicKnowledgeBase = createThreadKnowledgeBase();

    // Also create a test version to ensure the path works
    const testKnowledgeBase = `You are an endocrinology expert. Here is a test thread:

=== QUESTION 1 DETAILS ===
Topic: Endocrinology
Question: What is the primary hormone produced by the pancreas that regulates blood glucose?
Answer Choices:
A) Insulin
B) Glucagon  
C) Cortisol
D) Thyroxine

Correct Answer: A) Insulin
User Selected: B) Glucagon
User Performance: INCORRECT ✗

Explanation: Insulin is the primary hormone produced by the pancreatic beta cells that helps regulate blood glucose by facilitating cellular glucose uptake.

🎯 INSTRUCTION: You have access to this question and the user's performance. Start with a brief greeting acknowledging you can see their question about pancreatic hormones and their incorrect answer. Ask how you can help them understand this topic better. Be ready to explain why insulin is correct and the difference between insulin and glucagon.`;

    // Use dynamic knowledge base if we have messages, otherwise use test
    const knowledgeBase =
      messages && messages.length > 0
        ? dynamicKnowledgeBase
        : testKnowledgeBase;

    // No initial greeting - just pass thread context
    const greetingPrompt = undefined;

    // Debug logging
    console.log("🧠 USING KNOWLEDGE BASE:");
    console.log(
      "- Source:",
      messages && messages.length > 0
        ? "Dynamic (real messages)"
        : "Test (hardcoded)"
    );
    console.log("- Length:", knowledgeBase.length);
    console.log("- Preview:", knowledgeBase.substring(0, 300) + "...");
    console.log("📊 Messages count:", messages?.length || 0);
    console.log("🧵 Current thread:", currentThread?._id || "none");
    console.log("📝 Thread title:", currentThread?.title || "N/A");

    // Start session with error handling and retry logic
    try {
      console.log("🚀 Starting session with config:", {
        mode: "chapter",
        knowledgeBaseLength: knowledgeBase.length,
        greetingPrompt,
        timestamp: new Date().toISOString(),
      });

      startSession(
        { mode: "chapter", explanationText: knowledgeBase },
        greetingPrompt
      );
    } catch (error) {
      console.error("❌ Session start failed:", error);

      // Retry after delay
      setTimeout(() => {
        console.log("🔄 Retrying session start...");
        try {
          startSession(
            { mode: "chapter", explanationText: knowledgeBase },
            greetingPrompt
          );
        } catch (retryError) {
          console.error("❌ Session retry also failed:", retryError);
        }
      }, 2000);
    }
  }, [messages, currentThread]);

  // Send context as user message after session connects
  useEffect(() => {
    if (sessionState === StreamingAvatarSessionState.CONNECTED) {
      console.log("🔗 Session connected - starting voice chat");

      // Start voice chat
      startVoiceChat()
        .then(() => {
          console.log("✅ Voice chat started successfully");
          // Unmute immediately for better responsiveness
          setTimeout(() => {
            unmuteVoiceChat();
            console.log("✅ Voice chat unmuted");
          }, 500);
        })
        .catch((err) => {
          console.error("❌ Voice chat failed:", err);
        });

      // Send ENTIRE thread knowledge base as a user message after a short delay
      setTimeout(() => {
        const hasQuestions = messages?.some((m) => m.questions);
        if (hasQuestions) {
          console.log(
            "📤 Sending ENTIRE thread knowledge base as user message"
          );

          // Send the complete knowledge base as a user message
          const fullKnowledgeBase = createThreadKnowledgeBase();

          // Add a brief intro to the knowledge base message
          const contextMessage = `Here is the complete context from our conversation:\n\n${fullKnowledgeBase}\n\nPlease review this and help me understand the concepts better.`;

          // Send the entire knowledge base as user message using sendMessage
          sendMessage(contextMessage);
          console.log("✅ ENTIRE knowledge base sent as user message");
          console.log("📏 Message length:", contextMessage.length);
        } else {
          console.log("📝 No questions in thread - skipping context message");
        }
      }, 2000); // Wait for voice chat to be fully established
    }
  }, [
    sessionState,
    startVoiceChat,
    unmuteVoiceChat,
    speak,
    messages,
    currentThread,
  ]);

  // Context is now passed to the avatar's knowledge base

  // The avatar now has the context in its knowledge base and will start speaking automatically

  // Handle microphone toggle
  const handleMicClick = async () => {
    if (isMuted) {
      if (!isVoiceChatActive) {
        await startVoiceChat();
      } else {
        unmuteVoiceChat();
      }
    } else {
      muteVoiceChat();
    }
  }; // Handle expand/collapse
  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  const handleClose = () => {
    hideAvatar();
  };

  // Render expanded full-screen avatar
  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="w-full h-full max-w-6xl mx-auto bg-white rounded-lg overflow-hidden">
          {/* Header with controls */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Interactive Avatar</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleCollapse}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Collapse to floating"
              >
                <Minimize2 className="size-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Close avatar"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Full avatar layout - clean without chat overlay */}
          <div className="w-full h-full rounded-lg mt-8 max-w-6xl mx-auto">
            <div className="relative w-full">
              <div className="h-[30rem] md:h-[44rem] relative w-full">
                {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                  <AvatarVideo />
                ) : (
                  <Image
                    src={"/modules/avatar/alessandra.webp"}
                    alt={"Interactive Layout"}
                    fill
                    className={cn(
                      "object-cover rounded-2xl",
                      sessionState === StreamingAvatarSessionState.CONNECTING &&
                        "blur-xs"
                    )}
                  />
                )}
              </div>

              {/* Bottom controls - keep existing functionality without chat overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full px-4">
                {sessionState === StreamingAvatarSessionState.INACTIVE && (
                  <MainMenu />
                )}
                {sessionState === StreamingAvatarSessionState.CONNECTING && (
                  <div className="flex justify-center">
                    <Loading className="size-12" />
                  </div>
                )}
                {sessionState === StreamingAvatarSessionState.CONNECTED && (
                  <StreamMenu />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render floating avatar
  return (
    <div className="w-full h-full rounded-lg max-w-6xl mx-auto">
      <div className="relative w-full h-[150px] flex items-center justify-center overflow-hidden rounded-2xl">
        {/* Control buttons */}
        <div className="absolute top-2 right-2 flex space-x-1 z-10">
          <button
            onClick={handleExpand}
            className="p-1.5 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition-all"
            title="Expand avatar"
          >
            <Expand className="size-3" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition-all"
            title="Close avatar"
          >
            <X className="size-3" />
          </button>
        </div>

        <div className="absolute inset-0 w-full h-full">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarVideo />
          ) : (
            <Image
              src={"/modules/avatar/alessandra.webp"}
              alt={"Interactive Layout"}
              fill
              className={cn(
                "object-cover rounded-2xl",
                sessionState === StreamingAvatarSessionState.CONNECTING &&
                  "blur-xs"
              )}
            />
          )}
        </div>
        <div className="md:absolute md:bottom-10 md:left-1/2 md:transform md:-translate-x-1/2 w-full px-4 md:px-10 mt-4 md:mt-0 pointer-events-none">
          {sessionState !== StreamingAvatarSessionState.CONNECTED && (
            <Loading className="size-12" />
          )}
        </div>
      </div>

      {/* Voice Chat Controls - only show when avatar is connected */}
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <div className="flex flex-col items-center mt-4 space-y-2">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMicClick}
              disabled={isVoiceChatLoading}
              className={cn(
                "p-3 rounded-full border-2 transition-all duration-200 pointer-events-auto",
                "hover:scale-105 active:scale-95",
                !isMuted
                  ? cn(
                      "bg-blue-500 border-blue-600 text-white hover:bg-blue-600 shadow-lg",
                      isReceivingAudio &&
                        "animate-pulse ring-4 ring-blue-300 ring-opacity-75 shadow-blue-500/50"
                    )
                  : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200",
                isVoiceChatLoading && "opacity-50 cursor-not-allowed"
              )}
              title={
                !isMuted
                  ? "Voice input active - click to mute"
                  : "Click to activate voice input"
              }
            >
              {isVoiceChatLoading ? (
                <Loading className="size-5" />
              ) : !isMuted ? (
                <Mic className="size-5" />
              ) : (
                <MicOff className="size-5" />
              )}
            </button>

            {/* Voice status indicator */}
            <div className="text-xs text-gray-600 font-medium">
              {isVoiceChatActive
                ? !isMuted
                  ? "Ready - speak now"
                  : "Click mic to activate"
                : "Setting up voice..."}
            </div>
          </div>

          {/* Help text */}
        </div>
      )}
    </div>
  );
}

export default function InteractiveLayoutWrapper() {
  return (
    <StreamingAvatarProvider>
      <InteractiveLayout />
    </StreamingAvatarProvider>
  );
}

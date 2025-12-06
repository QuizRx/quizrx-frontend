"use client";

import { DotPulse } from "ldrs/react";
import "ldrs/react/DotPulse.css";
import { ChevronUp, Maximize2, CheckCircle2 } from "lucide-react";
import React, { useState } from "react";
import { useChat } from "@/modules/chat/store/chat-store";
import { AgentEvent, isLLMStreamingEvent, isToolCallingEvent } from "@/modules/chat/types/api/events";
import { Stream } from "./stream";
import { ProjectLogo } from "@/core/components/ui/logo";

// Helper function to get event name
function getEventDisplayName(event: AgentEvent): string {
  if (isLLMStreamingEvent(event)) {
    return event.node.replace(/_/g, " ");
  } else if (isToolCallingEvent(event)) {
    return event.tool_name.replace(/_/g, " ");
  }
  return "Processing";
}

interface StreamingProps {
  forceShow?: boolean; // Force show even when not streaming (for completed state)
  isReviewMode?: boolean; // Indicates if questions have been answered (safe to show answers)
}

export const Streaming: React.FC<StreamingProps> = ({ forceShow = false, isReviewMode = false }) => {
  // State for thinking card expansion and selected process
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const { agentEvents, isStreaming, streamsById, streamOrder } = useChat();

  // Get unique events (by name) and their status
  const getEventsList = () => {
    // Check if we're in multi-question mode - validate streamsById exists
    const isMultiQuestionMode = streamsById && Object.keys(streamsById).length > 0;
    
    if (isMultiQuestionMode && streamOrder && streamOrder.length > 0) {
      // Multi-question mode: show progress per question
      return streamOrder.map((streamId, index) => {
        const bucket = streamsById![streamId];
        const questionNumber = index + 1;
        const subtopicTitle = bucket.subtopicTitle || bucket.macroTitle || `Question ${questionNumber}`;
        
        let statusText = "";
        let isActive = false;
        
        if (bucket.status === "done") {
          statusText = "Completed";
          isActive = false;
        } else if (bucket.status === "error") {
          statusText = "Error";
          isActive = false;
        } else if (bucket.status === "open") {
          // Get the last event from this stream
          const lastEvent = bucket.events[bucket.events.length - 1];
          if (lastEvent) {
            statusText = getEventDisplayName(lastEvent);
            isActive = true;
          } else {
            statusText = "Starting...";
            isActive = true;
          }
        }
        
        return {
          name: `Generating question ${questionNumber} → ${statusText}`,
          isActive,
        };
      });
    } else {
      // Single-question mode: use existing logic
      const eventMap = new Map<string, { name: string; isActive: boolean }>();
      
      agentEvents.forEach((event, index) => {
        const name = getEventDisplayName(event);
        const isLast = index === agentEvents.length - 1;
        
        // If event already exists, update its active status
        if (eventMap.has(name)) {
          eventMap.set(name, { name, isActive: isLast });
        } else {
          eventMap.set(name, { name, isActive: isLast });
        }
      });
      
      return Array.from(eventMap.values());
    }
  };

  const eventsList = getEventsList();

  // Determine if we should show the component
  const shouldShow = forceShow || isStreaming;
  
  // Don't render if no events and not streaming
  if (!shouldShow && eventsList.length === 0) {
    return null;
  }

  // Determine the title based on state
  const title = isStreaming ? "Thinking..." : "Thought chain processed";

  return (
    <>
      {shouldShow && (
        <div className="text-left mb-6 animate-in fade-in-0 duration-300">
          {!isThinkingExpanded ? (
            <div
              className="bg-transparent border border-gray-200 cursor-pointer hover:bg-muted/20 transition-colors rounded-2xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between w-full p-4"
                onClick={() => setIsThinkingExpanded(true)}
              >
                <div className="flex items-center gap-3">
                  <ProjectLogo size={20} className="w-fit flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {title}
                  </span>
                </div>
              </div>
              
              {/* Events List */}
              <div className="px-4 pb-4 space-y-2">
                {eventsList.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs animate-in fade-in-0 slide-in-from-left-2 duration-300"
                  >
                    {event.isActive && isStreaming ? (
                      <DotPulse size="12" speed="1.3" color="var(--primary)" />
                    ) : (
                      <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                    )}
                    <span className={`capitalize ${
                      event.isActive && isStreaming
                        ? "text-primary font-medium" 
                        : "text-muted-foreground"
                    }`}>
                      {event.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Stream
              agentEvents={agentEvents}
              isThinkingExpanded={isThinkingExpanded}
              setIsThinkingExpanded={setIsThinkingExpanded}
              active={isStreaming}
              streamsById={streamsById || {}}
              streamOrder={streamOrder || []}
              isReviewMode={isReviewMode}
            />
          )}
        </div>
      )}
    </>
  );
};

"use client";

import { DotPulse } from "ldrs/react";
import "ldrs/react/DotPulse.css";
import React, { useState, useEffect } from "react";
import {
  AgentEvent,
  isLLMStreamingEvent,
  isToolCallingEvent,
} from "@/modules/chat/types/api/events";
import { Stream } from "./stream";
import { ProjectLogo } from "@/core/components/ui/logo";
import { CheckCircle2, Maximize2, Minimize2, Clock } from "lucide-react";

// Helper function to get event name
function getEventDisplayName(event: AgentEvent): string {
  if (isLLMStreamingEvent(event)) {
    return event.node.replace(/_/g, " ");
  } else if (isToolCallingEvent(event)) {
    return event.tool_name.replace(/_/g, " ");
  }
  return "Processing";
}

export const StreamedProcess = ({
  agentEvents,
  isStreaming = false,
  autoHide = true,
  generationTime,
  isReviewMode = false,
}: {
  agentEvents: AgentEvent[];
  isStreaming?: boolean;
  autoHide?: boolean;
  generationTime?: number;
  isReviewMode?: boolean;
}) => {
  // State for thinking card expansion and selected process
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [showEventsList, setShowEventsList] = useState(true);

  // Auto-hide events list when streaming stops
  useEffect(() => {
    if (!isStreaming && autoHide) {
      // Wait 2 seconds after streaming stops, then hide events list
      const timer = setTimeout(() => {
        setShowEventsList(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else if (isStreaming) {
      // Show events list again when streaming
      setShowEventsList(true);
    }
  }, [isStreaming, autoHide]);

  // Get unique events (all completed)
  const getEventsList = () => {
    const eventMap = new Map<string, string>();

    agentEvents.forEach((event) => {
      const name = getEventDisplayName(event);
      if (!eventMap.has(name)) {
        eventMap.set(name, name);
      }
    });

    return Array.from(eventMap.values());
  };

  const eventsList = getEventsList();

  return (
    <>
      <div className="text-left mb-6 animate-in fade-in-0 duration-300">
        {!isThinkingExpanded ? (
          <div className="bg-transparent border border-gray-200 hover:bg-muted/20 transition-colors rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between w-full p-4">
              <div
                className="flex items-center gap-3 cursor-pointer hover:text-primary"
                onClick={() => setIsThinkingExpanded(true)}
              >
                <ProjectLogo size={20} className="w-fit flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  Thought chain processed
                </span>
              </div>
              <button
                onClick={() => setIsThinkingExpanded(true)}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer bg-white/90 hover:bg-gray-100 transition-colors border border-gray-200 rounded-md"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            {/* Events List - All completed (hidden after streaming ends) */}
            {showEventsList && (
              <div className="px-4 pb-4 space-y-2">
                {eventsList.map((eventName, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <CheckCircle2
                      size={14}
                      className="text-green-600 flex-shrink-0"
                    />
                    <span className="capitalize text-muted-foreground">
                      {eventName}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Generation Time - Always visible when available */}
            {generationTime !== undefined && generationTime > 0 && (
              <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={14} className="flex-shrink-0 text-blue-500" />
                  <span className="font-medium">
                    Question generated in {generationTime.toFixed(1)}s
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Stream
            agentEvents={agentEvents}
            isThinkingExpanded={isThinkingExpanded}
            setIsThinkingExpanded={setIsThinkingExpanded}
            active={false}
            isReviewMode={isReviewMode}
          />
        )}
      </div>
    </>
  );
};

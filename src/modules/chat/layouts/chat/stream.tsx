"use client";

import { DotPulse } from "ldrs/react";
import "ldrs/react/DotPulse.css";
import { ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import React, { useState } from "react";
import { useChat } from "@/modules/chat/store/chat-store";
import {
  AgentEvent,
  isLLMStreamingEvent,
  isToolCallingEvent,
  isStreamOpenedEvent,
  StreamBucket,
} from "@/modules/chat/types/api/events";
import { ProjectLogo } from "@/core/components/ui/logo";
import {
  RouterEvent,
  ExtractTopicEvent,
  GetRelevantConceptEvent,
  GenerateQuestionEvent,
  EvaluateQuestionEvent,
  FinalizeEvent,
} from "@/modules/chat/components/event-renders";
// Define the props interface for the Streaming component
interface StreamProps {
  agentEvents: AgentEvent[];
  isThinkingExpanded: boolean;
  setIsThinkingExpanded: (expanded: boolean) => void;
  active?: boolean; // Optional prop to indicate if the stream is active
  streamsById?: Record<string, StreamBucket>;
  streamOrder?: string[];
  isReviewMode?: boolean; // Indicates if questions have been answered (safe to show answers)
}

// Helper function to get event name
function getEventName(event: AgentEvent): string {
  if (isLLMStreamingEvent(event)) {
    return event.node;
  } else if (isToolCallingEvent(event)) {
    return event.tool_name;
  } else if (isStreamOpenedEvent(event)) {
    return `Creating: ${event.subtopic_title} in ${event.macro_title}`;
  } else {
    return "General Event";
  }
}

// Helper function to get event content with conditional rendering
function getEventContent(
  event: AgentEvent,
  isActive: boolean,
  isReviewMode: boolean = false
): React.ReactNode {
  if (isLLMStreamingEvent(event)) {
    return getEventComponent(event, isActive, isReviewMode);
  } else if (isToolCallingEvent(event)) {
    // Conditional rendering based on tool_name
    switch (event.tool_name) {
      case "router":
        return <RouterEvent data={event.data} isActive={isActive} />;

      case "extract_topic":
        return <ExtractTopicEvent data={event.data} isActive={isActive} />;

      case "get_relevant_concept":
        return (
          <GetRelevantConceptEvent data={event.data} isActive={isActive} />
        );

      case "generate_question":
        return <GenerateQuestionEvent data={event.data} isActive={isActive} />;

      case "evaluate_question":
        return <EvaluateQuestionEvent data={event.data} isActive={isActive} />;

      case "finalize":
        return <FinalizeEvent data={event.data} isActive={isActive} isReviewMode={isReviewMode} />;

      default:
        // Fallback for unknown tools
        return (
          <div className="whitespace-pre-line break-words">{event.data}</div>
        );
    }
  } else if (isStreamOpenedEvent(event)) {
    return (
      <div className="whitespace-pre-line break-words">
        <pre>{JSON.stringify(event, null, 2)}</pre>
      </div>
    );
  } else {
    // Fallback: show JSON if nothing else
    return (
      <div className="whitespace-pre-line break-words">
        <pre>{JSON.stringify(event, null, 2)}</pre>
      </div>
    );
  }
}

const getEventComponent = (event: any, isActive: boolean, isReviewMode: boolean = false) => {
  switch (event.node) {
    case "router":
      return <RouterEvent data={event.content} isActive={isActive} />;

    case "extract_topic":
      return <ExtractTopicEvent data={event.content} isActive={isActive} />;

    case "get_relevant_concept":
      return (
        <GetRelevantConceptEvent data={event.content} isActive={isActive} />
      );

    case "generate_question":
      return <GenerateQuestionEvent data={event.content} isActive={isActive} />;

    case "evaluate_question":
      return <EvaluateQuestionEvent data={event.content} isActive={isActive} />;

    case "finalize":
      return <FinalizeEvent data={event.content} isActive={isActive} isReviewMode={isReviewMode} />;

    default:
      return (
        <div className="whitespace-pre-wrap break-words">{event.content}</div>
      );
  }
};

export const Stream: React.FC<StreamProps> = ({
  agentEvents,
  isThinkingExpanded,
  setIsThinkingExpanded,
  active = true,
  streamsById = {},
  streamOrder = [],
  isReviewMode = false,
}) => {
  const [selectedEventIdx, setSelectedEventIdx] = useState<number>(0);
  const [selectedStreamId, setSelectedStreamId] = useState<string>(
    streamOrder.length > 0 ? streamOrder[0] : ""
  );

  // Detect multi-question mode - only when MORE than 1 question
  const isMultiQuestionMode = streamOrder.length > 1;

  // Get events based on mode
  const displayEvents = isMultiQuestionMode
    ? streamsById[selectedStreamId]?.events || []
    : agentEvents;

  // Use displayEvents for selection
  const selectedEvent = displayEvents[selectedEventIdx];
  const lastIdx = displayEvents.length - 1;

  // Update selectedStreamId if streamOrder changes and current selection is invalid
  React.useEffect(() => {
    if (isMultiQuestionMode && !streamsById[selectedStreamId] && streamOrder.length > 0) {
      setSelectedStreamId(streamOrder[0]);
      setSelectedEventIdx(0);
    }
  }, [streamOrder, selectedStreamId, streamsById, isMultiQuestionMode]);

  // Reset event index when switching streams
  React.useEffect(() => {
    setSelectedEventIdx(0);
  }, [selectedStreamId]);

  function replaceAll(arg0: string, arg1: string) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="relative border border-border rounded-xl bg-transparent overflow-hidden w-full max-w-4xl">
      {/* Mobile Layout - Vertical tabs list */}
      <div className="sm:hidden flex flex-col min-h-[400px] max-h-[600px]">
        {/* Header with Title */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-white">
          <div className="flex items-center gap-2">
            <ProjectLogo size={10} className="w-fit" />
            <h4 className="text-xs font-semibold text-foreground tracking-wide">
              Events
            </h4>
          </div>
          <button
            onClick={() => setIsThinkingExpanded(false)}
            className="flex items-center gap-1 px-2 py-1 transition-colors cursor-pointer bg-muted hover:bg-gray-200 border border-gray-200 rounded-md"
          >
            <Minimize2 size={12} />
          </button>
        </div>

        {/* Question Selector Dropdown - Mobile */}
        {isMultiQuestionMode && (
          <div className="px-3 py-2 border-b border-border bg-white">
            <select
              value={selectedStreamId}
              onChange={(e) => {
                setSelectedStreamId(e.target.value);
                setSelectedEventIdx(0);
              }}
              className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {streamOrder.map((streamId, index) => {
                const bucket = streamsById[streamId];
                const questionNumber = index + 1;
                const title = bucket.subtopicTitle || bucket.macroTitle || `Question ${questionNumber}`;
                return (
                  <option key={streamId} value={streamId}>
                    Question #{questionNumber}: {title}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Vertical Tabs List */}
        <div className="border-b border-border bg-muted/20 p-2 space-y-1">
          {displayEvents.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-2">
              No events yet
            </div>
          )}
          {displayEvents.map((ev, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedEventIdx(idx)}
              className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                selectedEventIdx === idx
                  ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                  : "hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="capitalize truncate flex-1">
                  {getEventName(ev).replaceAll("_", " ")}
                </span>
                {lastIdx === idx && active ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden bg-white">
          {selectedEvent ? (
            <div className="max-w-full">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-foreground truncate flex-1 capitalize">
                  {getEventName(selectedEvent).replaceAll("_", " ")}
                </h3>
                {lastIdx === selectedEventIdx && active && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <DotPulse size="12" speed="1.3" color="var(--primary)" />
                    <span className="text-xs text-primary">Active</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed overflow-hidden max-w-full break-words">
                {getEventContent(
                  selectedEvent,
                  lastIdx === selectedEventIdx && active,
                  isReviewMode
                )}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs">
              No event selected
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout - Sidebar left, content right */}
      <div className="hidden sm:grid grid-cols-12 h-[370px]">
        {/* Left sidebar - agentEvents list (4/12) */}
        <div className="col-span-4 border-r border-border bg-muted/20 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center mt-2 mb-4">
              <ProjectLogo size={12} className="w-fit" />
              <h4 className="text-sm font-medium text-muted-foreground tracking-wide">
                Events
              </h4>
            </div>

            {/* Question Selector Dropdown - Desktop */}
            {isMultiQuestionMode && (
              <div className="mb-4">
                <select
                  value={selectedStreamId}
                  onChange={(e) => {
                    setSelectedStreamId(e.target.value);
                    setSelectedEventIdx(0);
                  }}
                  className="w-full text-xs px-2 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {streamOrder.map((streamId, index) => {
                    const bucket = streamsById[streamId];
                    const questionNumber = index + 1;
                    const title = bucket.subtopicTitle || bucket.macroTitle || `Question ${questionNumber}`;
                    return (
                      <option key={streamId} value={streamId}>
                        Question #{questionNumber}: {title}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="space-y-1 pb-8">
              {displayEvents.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  No events yet
                </div>
              )}
              {displayEvents.map((ev, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedEventIdx(idx)}
                  className={`w-full text-left p-3 rounded-md text-sm transition-colors cursor-pointer ${
                    selectedEventIdx === idx
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {" "}
                  <div className="flex items-center justify-between">
                    <span className="truncate flex-1 mr-2 capitalize">
                      {getEventName(ev).replaceAll("_", " ")}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lastIdx === idx && active ? (
                        <>
                          <DotPulse
                            size="12"
                            speed="1.3"
                            color="var(--primary)"
                          />
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Right content area (8/12) */}
        <div className="col-span-8 p-6 overflow-y-auto bg-white">
          {selectedEvent ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl text-foreground truncate flex-1 capitalize">
                  {getEventName(selectedEvent).replaceAll("_", " ")}
                </h3>
                {lastIdx === selectedEventIdx && active && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <DotPulse size="16" speed="1.3" color="var(--primary)" />
                    <span className="text-xs text-primary">Active</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed overflow-hidden">
                {getEventContent(
                  selectedEvent,
                  lastIdx === selectedEventIdx && active,
                  isReviewMode
                )}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              No event selected
            </div>
          )}
        </div>

        {/* Minimize Button for Desktop */}
        <button
          onClick={() => setIsThinkingExpanded(false)}
          className="absolute bottom-2 left-3 flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer bg-white/90 hover:bg-gray-100 border border-gray-200 rounded-md"
        >
          <Minimize2 size={14} />
        </button>
      </div>
    </div>
  );
};
